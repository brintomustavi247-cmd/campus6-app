import React, { useState } from 'react';
import { ExternalLink, Link as LinkIcon, Save, Trash2 } from 'lucide-react';
import {
  clearPhLink,
  getPhLink,
  PH_DEFAULT_URL,
  savePhLink,
} from '../utils/phLink';

export const PhysicsHunterLinkCard: React.FC = () => {
  const [courseUrl, setCourseUrl] = useState(() => getPhLink()?.courseUrl || '');
  const [saved, setSaved] = useState(Boolean(courseUrl));

  const handleSave = () => {
    const normalizedUrl = courseUrl.trim();
    if (!normalizedUrl) return;

    savePhLink(normalizedUrl);
    setCourseUrl(normalizedUrl);
    setSaved(true);
  };

  const handleClear = () => {
    clearPhLink();
    setCourseUrl('');
    setSaved(false);
  };

  return (
    <section className="p-5 rounded-2xl bg-surface border border-border shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-text-primary bn">Physics Hunter Link</h3>
            <p className="text-[11px] text-text-muted bn">ক্লাস ও পরীক্ষা দ্রুত খুলতে আপনার course link রাখুন</p>
          </div>
        </div>
        {saved && <span className="text-[10px] font-bold text-success bn">সেভ হয়েছে</span>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={courseUrl}
          onChange={(event) => setCourseUrl(event.target.value)}
          placeholder={PH_DEFAULT_URL}
          type="url"
          className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-primary outline-none focus:border-primary"
          aria-label="Physics Hunter course URL"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!courseUrl.trim()}
          className="px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={() => window.open(courseUrl.trim() || PH_DEFAULT_URL, '_blank', 'noopener,noreferrer')}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Physics Hunter
        </button>
        {saved && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-danger hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </section>
  );
};