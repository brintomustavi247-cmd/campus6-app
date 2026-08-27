const fs = require('fs');

// 1. Update Header.tsx
let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Replace imports
headerCode = headerCode.replace(
  "import { Moon, Sun, Wifi, WifiOff, Sparkles, User, RefreshCw } from 'lucide-react';",
  "import { Bell, Wifi, WifiOff, Sparkles, User, RefreshCw } from 'lucide-react';"
);

// Remove onToggleTheme from interface
headerCode = headerCode.replace(
  "  onToggleTheme: () => void;\n",
  ""
);

// Remove onToggleTheme from props destructuring
headerCode = headerCode.replace(
  "  onToggleTheme,\n",
  ""
);

// Add toggleNotificationPanel
const toggleNotificationPanel = "  const toggleNotificationPanel = () => {\n    // Placeholder for future notification drawer/modal\n    console.log('Notification bell clicked');\n  };\n\n  return (";
headerCode = headerCode.replace(
  "  return (",
  toggleNotificationPanel
);

// Replace button
const oldButton = `          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-surface-muted hover:bg-surface-hover border border-border text-text-secondary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle theme"
            title="থিম পরিবর্তন"
          >
            {profile.theme === 'light' ? (
              <Sun className="w-5 h-5 text-gold" />
            ) : (
              <Moon className="w-5 h-5 text-text-muted" />
            )}
          </button>`;

const newButton = `          <button
            onClick={toggleNotificationPanel}
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#1E2030] border border-white/10 hover:bg-white/5 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-300 group-hover:text-white" />
            <span className="absolute top-[8px] right-[10px] w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          </button>`;

headerCode = headerCode.replace(oldButton, newButton);

fs.writeFileSync('src/components/Header.tsx', headerCode);

// 2. Update AppShell.tsx
let appShellCode = fs.readFileSync('src/components/AppShell.tsx', 'utf8');
appShellCode = appShellCode.replace(
  "        onToggleTheme={onToggleTheme}\n",
  ""
);
fs.writeFileSync('src/components/AppShell.tsx', appShellCode);

console.log("Updated Header.tsx and AppShell.tsx");
