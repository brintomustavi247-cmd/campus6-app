import React, { useState, useRef } from 'react';
import { LogOut, Key } from 'lucide-react';
import { auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';

interface ProfileSectionProps {
  displayName: string;
  currentFocus: string;
  username: string;
  mobileNumber: string;
  academicLevel: 'SSC' | 'HSC';
  onSave: (name: string, focus: string, username: string, mobileNumber: string, academicLevel: 'SSC' | 'HSC') => void;
  onLogout: () => void;
  onPhotoUpdate?: (url: string) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  displayName,
  currentFocus,
  username,
  mobileNumber,
  academicLevel,
  onSave,
  onLogout,
  onPhotoUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(displayName);
  const [tempFocus, setTempFocus] = useState(currentFocus);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempLevel, setTempLevel] = useState(academicLevel || 'SSC');
  // Split mobile into code and number
  const initialMobileStr = mobileNumber || '';
  const initialCode = initialMobileStr.startsWith('+') ? initialMobileStr.substring(0, 4) : '+880';
  const initialNum = initialMobileStr.startsWith('+') ? initialMobileStr.substring(4) : initialMobileStr;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || '');
  const [countryCode, setCountryCode] = useState(initialCode);
  const [tempMobile, setTempMobile] = useState(initialNum);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    try {
      const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile_picture_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotoURL(downloadURL);
      onPhotoUpdate?.(downloadURL);
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (error) {
      console.warn("Error updating profile picture", error);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onSave(tempName, tempFocus, tempUsername, `${countryCode}${tempMobile}`, tempLevel as 'SSC' | 'HSC');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(displayName);
    setTempFocus(currentFocus);
    setTempUsername(username);
    const initialCode = mobileNumber.startsWith('+') ? mobileNumber.substring(0, 4) : '+880';
    const initialNum = mobileNumber.startsWith('+') ? mobileNumber.substring(4) : mobileNumber;
    setCountryCode(initialCode);
    setTempMobile(initialNum);
    setTempLevel(academicLevel || 'SSC');
    setCurrentPassword('');
    setNewPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    const user = auth.currentUser;
    if (!user || !user.email) {
      setPasswordError('User not logged in.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  const initials = tempName.slice(0, 2).toUpperCase() || 'AP';

  return (
    <div id="pcs-profile-card" className="bg-surface rounded-xl border border-white/5 p-6 shadow-md hover:border-white/10 transition-all duration-300 flex flex-col h-full justify-between relative overflow-y-auto">
      <button
        onClick={onLogout}
        className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-gold hover:text-text-muted rounded-lg border border-red-500/10 transition-all cursor-pointer flex items-center gap-2"
        title="Sign out of system"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Logout</span>
        <LogOut className="w-4 h-4" />
      </button>

      {!isEditing ? (
        <div className="flex flex-col h-full justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-slate-500 bg-surface flex items-center justify-center text-text-primary font-extrabold text-2xl tracking-wider shadow-sm cursor-pointer overflow-hidden relative">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                    <span className="text-[10px] uppercase font-bold text-text-primary tracking-widest text-center">Change<br/>Picture</span>
                  </div>
                </div>
              </div>
              <div className="w-full text-left max-w-full min-w-0 pr-4">
                <span className="text-[10px] font-bold text-text-primary/50 uppercase tracking-widest block">Scholar profile</span>
                <h3 className="text-base font-bold text-text-primary tracking-tight truncate mt-0.5">{displayName}</h3>
                <p className="text-xs text-text-primary/60 break-words whitespace-normal mt-1 max-w-full">Focusing on {currentFocus || 'Academic Excellence'}</p>
                
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 pt-3 border-t border-white/5 text-left">
                  <div>
                    <span className="text-[9px] font-bold text-text-primary/40 uppercase tracking-wider block">Username</span>
                    <span className="text-xs text-text-primary font-mono font-semibold">@{username}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-text-primary/40 uppercase tracking-wider block">Mobile</span>
                    <span className="text-xs text-text-primary font-mono font-semibold">{mobileNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-text-primary/40">Status: Active scholar ({academicLevel})</span>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 bg-white/[0.03] hover:bg-white/10 text-text-primary text-xs font-bold rounded-lg border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer"
            >
              Edit profile
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4 text-left">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-text-primary tracking-tight">Refine scholar profile</h3>
          </div>
          
          <form id="profile-form" onSubmit={handleSave} className="space-y-3.5">
            {/* Display Name Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-primary/50 uppercase tracking-wider block">Display name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name..."
                required
                maxLength={30}
                className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all placeholder-white/20"
              />
            </div>

            {/* Username Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-primary/50 uppercase tracking-wider block">Username</label>
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Enter your username..."
                required
                maxLength={20}
                className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all placeholder-white/20 font-mono"
              />
            </div>

            {/* Mobile Number Input with Country Code */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-primary/50 uppercase tracking-wider block">Mobile number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-2 py-2.5 outline-none transition-all cursor-pointer font-mono shrink-0"
                >
                  <option value="+880">+880 (BD)</option>
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+92">+92 (PK)</option>
                  <option value="+61">+61 (AU)</option>
                </select>
                <input
                  type="text"
                  value={tempMobile}
                  onChange={(e) => setTempMobile(e.target.value)}
                  placeholder="Enter mobile number..."
                  required
                  maxLength={15}
                  className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all placeholder-white/20 font-mono"
                />
              </div>
            </div>

                        {/* Academic Level Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-primary/50 uppercase tracking-wider block">Academic Level</label>
              <select
                value={tempLevel}
                onChange={(e) => setTempLevel(e.target.value as "SSC" | "HSC")}
                className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all cursor-pointer font-mono"
              >
                <option value="SSC">SSC</option>
                <option value="HSC">HSC</option>
              </select>
            </div>

            {/* Current Focus Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-text-primary/50 uppercase tracking-wider block">Current focus target</label>
              <input
                type="text"
                value={tempFocus}
                onChange={(e) => setTempFocus(e.target.value)}
                placeholder="e.g. Calculus, Quantum Mechanics..."
                maxLength={40}
                className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all placeholder-white/20"
              />
            </div>
          </form>

          {/* Change Password Section */}
          <div className="pt-4 border-t border-white/5 space-y-3.5">
            <h4 className="text-[11px] font-bold text-text-primary flex items-center gap-2">
              <Key className="w-3 h-3 text-gold" />
              Change Password
            </h4>
            
            {passwordError && <p className="text-[10px] text-gold font-medium">{passwordError}</p>}
            {passwordSuccess && <p className="text-[10px] text-gold font-medium">{passwordSuccess}</p>}

            <div className="space-y-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all placeholder-white/20"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full bg-surface text-text-primary text-xs border border-white/5 focus:border-[#6366F1] rounded-lg px-3.5 py-2.5 outline-none transition-all placeholder-white/20"
              />
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={!currentPassword || !newPassword}
                className="w-full px-3 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-gold text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-transparent hover:bg-white/5 text-text-primary/70 hover:text-text-primary text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              form="profile-form"
              type="submit"
              className="px-4 py-2 bg-[#6366F1] hover:bg-[#5053D4] text-text-primary text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
