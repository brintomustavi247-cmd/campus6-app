import React, { useState } from 'react';
import { feedbackNotif } from '../utils/alertFeedback';
import { Bell, Clock, Save, Zap, BookOpen } from 'lucide-react';
import {
  getNotifPrefs, saveNotifPrefs, NotificationPreferences,
  sendTestNotification,
} from '../utils/studyNotifications';

export const NotificationSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotifPrefs());
  const [saved, setSaved] = useState(false);
    const [testSent, setTestSent] = useState(false);

  const handleTest = async () => {
    if (!('Notification' in window)) {
      alert('এই browser-এ notification support নেই।');
      return;
    }
    if (Notification.permission === 'default') {
      const r = await Notification.requestPermission();
      if (r !== 'granted') {
        alert('Permission দেওয়া হয়নি — তাই notification আসেনি।');
        return;
      }
    }
    if (Notification.permission !== 'granted') {
      alert('⚠️ Notification BLOCK করা আছে। Browser Settings → Site Settings → Notifications → Allow করুন।');
      return;
    }
    sendTestNotification();
    feedbackNotif();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  const handleSave = async () => {
    if (prefs.enabled && 'Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      if (result !== 'granted') {
        alert('Notification permission দরকার — browser settings থেকে enable করুন।');
        return;
      }
    }
    saveNotifPrefs(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 bn">
          <Bell className="w-4 h-4 text-gold" />
          Daily Study Notifications
        </h3>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) => setPrefs({ ...prefs, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-surface-muted peer-checked:bg-gold rounded-full transition-colors relative">
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${prefs.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      <p className="text-[11px] text-text-muted bn leading-relaxed">
        দিনে ৩টা strategic সময়ে premium study tips আপনার phone-এ push হবে।
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted">
          <span className="text-lg">🌅</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-text-primary bn">সকালের Tip</p>
            <p className="text-[10px] text-text-muted bn">দিন শুরু করার motivation</p>
          </div>
          <input
            type="time"
            value={prefs.morningTime}
            onChange={(e) => setPrefs({ ...prefs, morningTime: e.target.value })}
            className="px-2 py-1 rounded-lg bg-surface border border-border text-text-primary text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted">
          <span className="text-lg">☀️</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-text-primary bn">দুপুরের Tip</p>
            <p className="text-[10px] text-text-muted bn">Focus maintain করার জন্য</p>
          </div>
          <input
            type="time"
            value={prefs.afternoonTime}
            onChange={(e) => setPrefs({ ...prefs, afternoonTime: e.target.value })}
            className="px-2 py-1 rounded-lg bg-surface border border-border text-text-primary text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted">
          <span className="text-lg">🌙</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-text-primary bn">সন্ধ্যার Tip</p>
            <p className="text-[10px] text-text-muted bn">দিনের recall ও reflection</p>
          </div>
          <input
            type="time"
            value={prefs.eveningTime}
            onChange={(e) => setPrefs({ ...prefs, eveningTime: e.target.value })}
            className="px-2 py-1 rounded-lg bg-surface border border-border text-text-primary text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleTest}
          className="flex-1 px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-text-secondary text-xs font-bold flex items-center justify-center gap-1.5 bn hover:border-gold/50 transition-all"
          style={testSent ? { borderColor: 'rgba(16,185,129,0.6)', color: '#6EE7B7' } : undefined}
        >
          <Zap className="w-3.5 h-3.5" />
          {testSent ? '✅ Sent!' : 'Test Send'}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 bn transition-all"
          style={{
            background: saved ? '#10B981' : 'linear-gradient(135deg,#FBBF24,#D97706)',
            color: saved ? '#fff' : '#0F111A',
          }}
        >
          {saved ? <BookOpen className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};