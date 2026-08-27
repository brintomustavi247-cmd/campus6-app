import React, { useState } from 'react';
import { 
  Database, 
  Trash2, 
  Calendar, 
  WifiOff, 
  AlertTriangle, 
  Bell, 
  RefreshCw, 
  CheckCircle2, 
  Code 
} from 'lucide-react';
import { seedDemoData, clearAllLocalData, flushPendingSyncs } from '../utils/storageEngine';
import { ALL_ROUTINE_DATES } from '../data/routineData';

interface DevTestPanelProps {
  onJumpToDate: (dateKey: string) => void;
  onRefreshAppState: () => void;
  onAddToast: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

export const DevTestPanel: React.FC<DevTestPanelProps> = ({
  onJumpToDate,
  onRefreshAppState,
  onAddToast
}) => {
  const [selectedJumpDate, setSelectedJumpDate] = useState('2026-08-21');

  const handleSeed = () => {
    seedDemoData();
    onRefreshAppState();
    onAddToast('success', 'ডেমো ডেটা সফলভাবে রিলোড করা হয়েছে!');
  };

  const handleClear = () => {
    if (confirm('সব লোকাল ডেটা মুছে ফেলা হবে। আপনি কি নিশ্চিত?')) {
      clearAllLocalData();
      onRefreshAppState();
      onAddToast('warning', 'সব ডেটা ক্লিয়ার করা হয়েছে!');
    }
  };

  const handleJump = () => {
    onJumpToDate(selectedJumpDate);
    onAddToast('info', `রুটিন তারিখ ${selectedJumpDate} এ জাম্প করা হয়েছে!`);
  };

  const handleTestNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          new Notification('Campus 6.0 Test Notification', {
            body: 'নোটিফিকেশন ইঞ্জিন সঠিকভাবে কাজ করছে!'
          });
          onAddToast('success', 'টেস্ট নোটিফিকেশন পাঠানো হয়েছে!');
        } else {
          onAddToast('error', 'নোটিফিকেশন পারমিশন মেলেনি!');
        }
      });
    } else {
      onAddToast('error', 'এই ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই');
    }
  };

  const handleForceSync = async () => {
    const count = await flushPendingSyncs();
    onRefreshAppState();
    onAddToast('info', `${count} টি পেন্ডিং পরিবর্তন সিঙ্ক করা হয়েছে!`);
  };

  return (
    <div className="p-6 rounded-3xl bg-bg border border-amber-500/40 shadow-2xl text-text-primary max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-amber-500/30">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-gold border border-amber-500/40">
          <Code className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-text-primary">ডেভেলপার ও টেস্ট প্যানেল (Dev Test Suite)</h2>
          <p className="text-xs text-amber-300/80">অ্যাপের বিভিন্ন অবস্থা পরীক্ষা, ডেমো ডেটা জেনারেট ও সিমুলেশন টুলস</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seed & Reset */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Database className="w-4 h-4" />
            ডেমো ডেটা কন্ট্রোল
          </h3>
          <p className="text-xs text-text-muted">
            নমুনা ক্লাস রুটিন, সম্পন্ন চেকক্লিস্ট, স্ট্রিক ও সাবজেক্ট পরিসংখ্যান লোড করুন।
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSeed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm border border-transparent text-text-primary text-xs font-bold transition-all min-h-[44px]"
            >
              <Database className="w-4 h-4 text-gold" />
              Seed Demo Data
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs font-bold transition-all min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              Clear Local Storage
            </button>
          </div>
        </div>

        {/* Date Jump */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            যেকোনো তারিখের রুটিনে জাম্প
          </h3>
          <p className="text-xs text-text-muted">
            আগস্ট ২১ থেকে অক্টোবর ৫ পর্যন্ত মাস্টার রুটিনের যেকোনো তারিখে সরাসরি যান।
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="date"
              value={selectedJumpDate}
              onChange={e => setSelectedJumpDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-muted border border-border text-text-primary text-xs focus:outline-none focus:border-gold"
            />
            <button
              onClick={handleJump}
              className="px-4 py-2 rounded-xl bg-gold hover:bg-[#b88e22] text-[#0F111A] text-xs font-bold transition-all min-h-[44px]"
            >
              Go to Date
            </button>
          </div>
        </div>

        {/* Sync & Simulation */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            অফলাইন ও সিঙ্ক টুলস
          </h3>
          <p className="text-xs text-text-muted">
            অফলাইনে সেভ হওয়া পরিবর্তনগুলো ফায়ারবেসে ম্যানুয়ালি সিঙ্ক করার ট্রাই করুন।
          </p>

          <button
            onClick={handleForceSync}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-900 hover:bg-red-800 text-text-primary text-xs font-bold transition-all min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4 text-gold" />
            Force Sync Pending Items
          </button>
        </div>

        {/* Browser Notifications */}
        <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-3">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            নোটিফিকেশন পারমিশন টেস্ট
          </h3>
          <p className="text-xs text-text-muted">
            ব্রাউজার ও PWA নোটিফিকেশন সঠিকভাবে কাজ করছে কিনা টেস্ট করুন।
          </p>

          <button
            onClick={handleTestNotification}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-text-primary text-xs font-bold transition-all min-h-[44px]"
          >
            <Bell className="w-4 h-4" />
            Test Browser Notification
          </button>
        </div>
      </div>
    </div>
  );
};
