const fs = require('fs');

let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');
headerCode = headerCode.replace(
  "  onOpenProfile: () => void;\n  onSyncNow?: () => void;\n}",
  "  onOpenProfile: () => void;\n  onSyncNow?: () => void;\n  onOpenNotification: () => void;\n}"
);
headerCode = headerCode.replace(
  "  onOpenProfile,\n  onSyncNow\n}) => {",
  "  onOpenProfile,\n  onSyncNow,\n  onOpenNotification\n}) => {"
);
headerCode = headerCode.replace(
  "  const toggleNotificationPanel = () => {\n    console.log(\"Notification bell clicked - Panel to be implemented\");\n  };",
  ""
);
headerCode = headerCode.replace(
  "onClick={toggleNotificationPanel}",
  "onClick={onOpenNotification}"
);
fs.writeFileSync('src/components/Header.tsx', headerCode);

let appShellCode = fs.readFileSync('src/components/AppShell.tsx', 'utf8');
appShellCode = appShellCode.replace(
  "import React from 'react';",
  "import React, { useState } from 'react';\nimport { X, Bell } from 'lucide-react';"
);
appShellCode = appShellCode.replace(
  "export const AppShell: React.FC<AppShellProps> = ({",
  "export const AppShell: React.FC<AppShellProps> = ({"
);
const bodyStart = `}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans selection:bg-red-600 selection:text-text-primary">
      {/* Top Fixed Header */}
      <Header
        profile={profile}
        isOnline={isOnline}
        isPendingSync={isPendingSync}
        onOpenProfile={onOpenProfile}
        onSyncNow={onSyncNow}
        onOpenNotification={() => setIsNotificationOpen(true)}
      />`;
appShellCode = appShellCode.replace(/}\) => \{\s*return \(\s*<div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans selection:bg-red-600 selection:text-text-primary">\s*{\/\* Top Fixed Header \*\/}\s*<Header\s*profile=\{profile\}\s*isOnline=\{isOnline\}\s*isPendingSync=\{isPendingSync\}\s*onOpenProfile=\{onOpenProfile\}\s*onSyncNow=\{onSyncNow\}\s*\/>/, bodyStart);

const notificationPanel = `
      {/* Notification Drawer */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsNotificationOpen(false)} />
          <div className="relative w-80 bg-[#1E2030]/95 backdrop-blur-xl border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-gold"/> Notifications</h3>
              <button onClick={() => setIsNotificationOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="text-center text-sm text-gray-400 mt-10">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                No new notifications.
              </div>
            </div>
          </div>
        </div>
      )}
`;
appShellCode = appShellCode.replace(
  "{/* Toast Notification Container */}",
  notificationPanel + "\n      {/* Toast Notification Container */}"
);
fs.writeFileSync('src/components/AppShell.tsx', appShellCode);
