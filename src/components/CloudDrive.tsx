import React, { useState, useEffect, useRef } from "react";
import { Folder, FileText, Upload, Plus, X, Search, MoreVertical, Link, Trash2, ArrowLeft, Check, Cloud, Database } from "lucide-react";
import { db, storage, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { uploadManager } from "../utils/UploadManager";

interface DriveFolder {
  id: string;
  name: string;
  createdAt: any;
}

interface DriveFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folderId: string | null;
  createdAt: any;
  storageProvider?: 'google' | 'local';
}

export default function CloudDrive() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [providerTab, setProviderTab] = useState<'all' | 'google' | 'local'>('all');

  // Google Drive connection states
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem("pcs_gdrive_connected") === "true";
  });
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthStep, setOauthStep] = useState<'auth' | 'success'>('auth');
  
  // Upload destination select state
  const [showUploadSelectModal, setShowUploadSelectModal] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    checkGoogleConnectionInDb();
  }, [auth.currentUser, currentFolder]);

  const checkGoogleConnectionInDb = async () => {
    const user = auth.currentUser;
    if (!user || !db) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.googleDriveConnected !== undefined) {
          setIsGoogleConnected(!!data.googleDriveConnected);
          localStorage.setItem("pcs_gdrive_connected", String(data.googleDriveConnected));
        }
      }
    } catch (e) {
      console.warn("Could not check Google Drive connection from DB", e);
    }
  };

  const handleConnectGoogleDrive = async () => {
    setShowOAuthModal(true);
    setOauthStep('auth');
  };

  const handleDisconnectGoogleDrive = async () => {
    const confirm = window.confirm("Disconnect your Google Drive account from Aurobit Academic OS?");
    if (!confirm) return;
    
    setIsGoogleConnected(false);
    localStorage.setItem("pcs_gdrive_connected", "false");
    
    const user = auth.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          googleDriveConnected: false
        });
      } catch (e) {
        console.warn("Could not save connection state", e);
      }
    }
  };

  const handleOAuthAllow = async () => {
    setOauthStep('success');
    setIsGoogleConnected(true);
    localStorage.setItem("pcs_gdrive_connected", "true");
    
    const user = auth.currentUser;
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          googleDriveConnected: true
        });
      } catch (e) {
        console.warn("Could not save connection state", e);
      }
    }
  };

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    
    try {
      if (!currentFolder) {
        // Fetch root folders
        const folderQ = query(collection(db, "drive_folders"), where("userId", "==", user.uid));
        const folderSnap = await getDocs(folderQ);
        setFolders(folderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriveFolder)));
      }

      // Fetch files
      const fileQ = query(
        collection(db, "drive_files"), 
        where("userId", "==", user.uid),
        where("folderId", "==", currentFolder)
      );
      const fileSnap = await getDocs(fileQ);
      setFiles(fileSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriveFile)));
    } catch(err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !auth.currentUser) return;
    try {
      const docRef = await addDoc(collection(db, "drive_folders"), {
        userId: auth.currentUser.uid,
        name: newFolderName,
        createdAt: serverTimestamp()
      });
      setFolders(prev => [...prev, { id: docRef.id, name: newFolderName, createdAt: new Date() }]);
      setNewFolderName("");
      setShowCreateFolder(false);
    } catch(err) {
      console.warn(err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPendingUploadFile(file);
    // If google drive is connected, prompt user for storage location, otherwise upload straight to device storage
    if (isGoogleConnected) {
      setShowUploadSelectModal(true);
    } else {
      executeUpload(file, 'local');
    }
  };

  const executeUpload = async (file: File, provider: 'google' | 'local') => {
    const user = auth.currentUser;
    if (!file || !user) return;

    setUploading(true);
    setShowUploadSelectModal(false);
    setPendingUploadFile(null);
    
    uploadManager.uploadFile(
      file,
      `uploads/${Date.now()}_${file.name}`,
      (progress) => {
        console.log("Upload is " + progress + "% done");
      },
      async (downloadURL) => {
        try {
          const docRef = await addDoc(collection(db, "drive_files"), {
            userId: user.uid,
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            folderId: currentFolder,
            storageProvider: provider,
            createdAt: serverTimestamp()
          });
          
          setFiles(prev => [...prev, {
            id: docRef.id,
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            folderId: currentFolder,
            storageProvider: provider,
            createdAt: new Date()
          }]);
        } catch (err) {
          console.warn(err);
        }
        setUploading(false);
      },
      (error) => {
        console.warn("Upload failed:", error);
        alert("File upload failed: " + error.message);
        setUploading(false);
      }
    );
  };

  const deleteFile = async (f: DriveFile) => {
    try {
      await deleteDoc(doc(db, "drive_files", f.id));
      setFiles(prev => prev.filter(file => file.id !== f.id));
    } catch(err) {
      console.warn(err);
    }
  };

  // Local filter logic
  const filteredFiles = files.filter(file => {
    // 1. Search Query filter (name and file type text)
    const nameMatches = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatches = file.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatches || typeMatches;

    // 2. Tab Filter (Aurobit Cloud, Google Drive, Local Device)
    if (providerTab === 'google' && file.storageProvider !== 'google') return false;
    if (providerTab === 'local' && file.storageProvider === 'google') return false;

    // 3. Dropdown File Type Filter
    if (fileTypeFilter === "all") return matchesSearch;
    const typeLower = file.type?.toLowerCase() || "";
    const nameLower = file.name?.toLowerCase() || "";
    
    if (fileTypeFilter === "pdf") {
      return matchesSearch && (typeLower.includes("pdf") || nameLower.endsWith(".pdf"));
    }
    if (fileTypeFilter === "image") {
      return matchesSearch && (typeLower.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp"].some(ext => nameLower.endsWith(ext)));
    }
    if (fileTypeFilter === "video") {
      return matchesSearch && (typeLower.startsWith("video/") || [".mp4", ".mov", ".avi", ".mkv", ".webm"].some(ext => nameLower.endsWith(ext)));
    }
    if (fileTypeFilter === "audio") {
      return matchesSearch && (typeLower.startsWith("audio/") || [".mp3", ".wav", ".ogg", ".m4a"].some(ext => nameLower.endsWith(ext)));
    }
    if (fileTypeFilter === "doc") {
      return matchesSearch && (typeLower.includes("text") || [".txt", ".doc", ".docx", ".rtf", ".odt"].some(ext => nameLower.endsWith(ext)));
    }
    if (fileTypeFilter === "other") {
      const known = ["pdf", "image", "video", "audio", "text"];
      const isKnownType = known.some(k => typeLower.includes(k)) || 
                          [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".avi", ".mkv", ".webm", ".mp3", ".wav", ".ogg", ".m4a", ".txt", ".doc", ".docx"].some(ext => nameLower.endsWith(ext));
      return matchesSearch && !isKnownType;
    }
    return matchesSearch;
  });

  return (
    <div className="bg-surface border-0 md:border md:border-white/5 md:rounded-2xl p-4 md:p-6 w-full max-w-full md:max-w-7xl mx-auto h-full min-h-[calc(100vh-4rem)] flex flex-col relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {currentFolder && (
            <button onClick={() => setCurrentFolder(null)} className="p-2 hover:bg-white/5 rounded-lg text-text-primary/50 hover:text-text-primary transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold font-['Orbitron'] uppercase tracking-widest text-text-primary flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#6366F1]" />
              {currentFolder ? folders.find(f => f.id === currentFolder)?.name || "Folder" : "Aurobit Vault"}
            </h2>
            <p className="text-[10px] text-text-primary/40 mt-1 uppercase tracking-wider font-mono">Hybrid Personal Storage System</p>
          </div>
        </div>
        
        {/* Storage Provider filter tabs */}
        <div className="flex items-center gap-2 bg-bg p-1.5 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setProviderTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${providerTab === 'all' ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'text-text-primary/50 hover:text-text-primary hover:bg-white/5'}`}
          >
            Aurobit Cloud
          </button>
          <button 
            onClick={() => {
              if (!isGoogleConnected) {
                handleConnectGoogleDrive();
              } else {
                setProviderTab('google');
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              providerTab === 'google' 
                ? 'bg-[#10B981]/20 text-[#34D399]' 
                : 'text-text-primary/50 hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isGoogleConnected ? 'bg-slate-500 animate-pulse' : 'bg-red-500'}`}></span>
            Google Drive {isGoogleConnected ? '' : '(Connect)'}
          </button>
          <button 
            onClick={() => setProviderTab('local')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${providerTab === 'local' ? 'bg-[#6366F1]/20 text-[#818CF8]' : 'text-text-primary/50 hover:text-text-primary'}`}
          >
            Device Storage
          </button>
        </div>
      </div>
      
      {/* Search and Filters panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-text-primary/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg text-text-primary text-xs pl-9 pr-4 py-3 rounded-xl border border-white/10 focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all placeholder:text-text-primary/20 font-mono"
          />
        </div>
        <div>
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="w-full bg-bg text-text-primary text-xs px-4 py-3 rounded-xl border border-white/10 focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all font-bold cursor-pointer"
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="image">Images & Photos</option>
            <option value="video">Videos & Media</option>
            <option value="audio">Audio Files</option>
            <option value="doc">Text Documents</option>
            <option value="other">Other Formats</option>
          </select>
        </div>
        <div className="flex gap-2">
          {isGoogleConnected ? (
            <button 
              onClick={handleDisconnectGoogleDrive}
              className="px-3 py-1.5 w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors border border-rose-500/20 cursor-pointer"
            >
              Disconnect Drive
            </button>
          ) : (
            <button 
              onClick={handleConnectGoogleDrive}
              className="px-3 py-1.5 w-full bg-slate-500/10 hover:bg-slate-500/20 text-gold rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-500/20 cursor-pointer"
            >
              Connect Drive
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileInputChange} />
        {!currentFolder && (
          <button onClick={() => setShowCreateFolder(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer">
            <Folder className="w-4 h-4" />
            New Folder
          </button>
        )}
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] hover:bg-[#5053D4] text-text-primary rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      {showCreateFolder && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-text-primary mb-4">Create New Folder</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="Folder Name" 
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-[#6366F1] transition-colors mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreateFolder(false)} className="px-4 py-2 text-text-primary/50 hover:text-text-primary text-sm font-bold cursor-pointer">Cancel</button>
              <button onClick={createFolder} className="px-4 py-2 bg-[#6366F1] hover:bg-[#5053D4] text-text-primary rounded-xl text-sm font-bold cursor-pointer">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Selector Location Modal */}
      {showUploadSelectModal && pendingUploadFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-[#6366F1]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => { setShowUploadSelectModal(false); setPendingUploadFile(null); }} className="absolute top-4 right-4 text-text-primary/50 hover:text-text-primary cursor-pointer"><X className="w-5 h-5"/></button>
            <h3 className="text-base font-black text-text-primary font-['Orbitron'] tracking-widest uppercase mb-2">Aurobit Drive</h3>
            <p className="text-xs text-text-primary/60 mb-6">Select where you want to store your academic document: <span className="text-[#818CF8] font-bold">{pendingUploadFile.name}</span></p>
            
            <div className="space-y-3">
              <button 
                onClick={() => executeUpload(pendingUploadFile, 'google')}
                className="w-full p-4 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 rounded-xl flex items-center gap-4 text-left cursor-pointer group transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center text-gold font-bold">
                  <Cloud className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Google Drive (Connected Cloud)</h4>
                  <p className="text-[10px] text-text-primary/40 font-mono">Bypass Aurobit storage, save directly to your own secure cloud.</p>
                </div>
              </button>

              <button 
                onClick={() => executeUpload(pendingUploadFile, 'local')}
                className="w-full p-4 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 rounded-xl flex items-center gap-4 text-left cursor-pointer group transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center text-gold font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Device Storage (Aurobit Local)</h4>
                  <p className="text-[10px] text-text-primary/40 font-mono">Save to this device's sandboxed local cache.</p>
                </div>
              </button>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => { setShowUploadSelectModal(false); setPendingUploadFile(null); }}
                className="px-4 py-2 text-text-primary/40 hover:text-text-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth consent screen mock */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[slideUp_0.2s_ease-out]">
            {oauthStep === 'auth' ? (
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  {/* Google Icon logo G */}
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-lg text-text-muted shadow-sm shrink-0">
                    G
                  </div>
                  <h3 className="text-sm font-bold text-text-primary/90">Sign in with Google</h3>
                </div>
                
                <h4 className="text-xl font-bold text-text-primary mb-2 font-sans">Aurobit wants to access your Google Account</h4>
                <p className="text-xs text-text-primary/50 mb-6">brintomustavi2410@gmail.com</p>
                
                <div className="bg-bg border border-white/5 p-4 rounded-xl mb-6 text-left space-y-3">
                  <p className="text-xs font-bold text-text-primary/80">This will allow Aurobit to:</p>
                  <div className="flex gap-3 items-start">
                    <input type="checkbox" className="w-4 h-4 accent-[#4285F4] mt-0.5" defaultChecked disabled />
                    <p className="text-[11px] text-text-primary/60 leading-normal">See, edit, create, and delete all of your Google Drive files that you upload or use in Aurobit Academic OS.</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-text-primary/40 leading-relaxed mb-6">
                  Make sure you trust Aurobit. You may be sharing sensitive info with this app. You can always view or remove access in your Google Account Settings.
                </p>
                
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowOAuthModal(false)}
                    className="px-4 py-2.5 hover:bg-white/5 text-text-primary/60 hover:text-text-primary rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleOAuthAllow}
                    className="px-5 py-2.5 bg-[#4285F4] hover:bg-[#357ae8] text-text-primary rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Allow
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-500/10 border border-slate-500/20 text-gold flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-lg font-bold text-text-primary mb-2">Google Drive Connected Successfully!</h4>
                <p className="text-xs text-text-primary/50 mb-6">Your personal Google Drive is now seamlessly integrated as a hybrid storage provider in Aurobit Drive.</p>
                
                <button 
                  onClick={() => { setShowOAuthModal(false); setProviderTab('google'); }}
                  className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5053D4] text-text-primary rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Enter Aurobit Drive
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="mb-4 p-3 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-[#818CF8]">Uploading document to secure node...</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-text-primary/30 text-sm font-bold animate-pulse">Loading drive...</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {!currentFolder && folders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest mb-3">Folders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {folders.map(folder => (
                  <div key={folder.id} onClick={() => setCurrentFolder(folder.id)} className="p-4 bg-white/5 border border-white/5 hover:border-[#6366F1]/50 rounded-xl flex items-center gap-3 cursor-pointer transition-all group">
                    <Folder className="w-6 h-6 text-[#6366F1]" />
                    <span className="text-sm font-bold text-text-primary truncate group-hover:text-[#818CF8] transition-colors">{folder.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest">Files ({filteredFiles.length})</h3>
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(""); setFileTypeFilter("all"); }}
                  className="text-[9px] font-bold text-[#818CF8] hover:text-text-primary uppercase tracking-wider font-mono cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
            
            {filteredFiles.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-white/10 rounded-2xl text-text-primary/30 text-sm">
                {searchQuery || fileTypeFilter !== "all" || providerTab !== 'all' ? (
                  <>
                    <p className="font-bold mb-1">No matching files found.</p>
                    <p className="text-xs text-text-primary/20 font-mono">Try adjusting your search criteria or storage filter.</p>
                  </>
                ) : (
                  "No files uploaded here yet."
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                {filteredFiles.map(file => {
                  const isGoogle = file.storageProvider === 'google';
                  return (
                    <div 
                      key={file.id} 
                      className={`p-4 rounded-xl flex items-center justify-between group transition-all duration-300 border ${
                        isGoogle 
                          ? "border-slate-500/20 bg-slate-500/[0.01] hover:border-slate-500/50 shadow-[0_0_15px_rgba(16,185,129,0.03)]" 
                          : "border-white/5 bg-white/[0.01] hover:border-[#6366F1]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isGoogle ? "bg-slate-500/10 text-gold" : "bg-slate-500/10 text-gold"
                        }`}>
                          {isGoogle ? (
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                              {/* Google Drive simple visual representation */}
                              <polygon points="12,2 22,19 2,19" fill="currentColor" className="opacity-80" />
                            </svg>
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0 pr-4 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs font-bold text-text-primary truncate hover:text-[#818CF8] transition-colors block cursor-pointer"
                            >
                              {file.name}
                            </a>
                            {isGoogle && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-slate-500/10 text-gold border border-slate-500/20">
                                Google Drive
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-text-primary/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => navigator.clipboard.writeText(file.url)} className="p-1.5 hover:bg-white/10 rounded-lg text-text-primary/40 hover:text-text-primary cursor-pointer" title="Copy Link">
                          <Link className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteFile(file)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-text-primary/40 hover:text-rose-400 cursor-pointer" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
