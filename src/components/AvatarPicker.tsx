import React, { useRef, useState } from 'react';
import { Camera, Check, X, ZoomIn, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_AVATARS, getAvatarById } from '../utils/defaultAvatars';
import { UserAvatar, AvatarCrop, DEFAULT_CROP } from './UserAvatar';

interface Props {
  googlePhotoUrl?: string;
  currentAvatarId?: string;
  useGooglePhoto: boolean;
  crop: AvatarCrop;
  onSelectDefault: (id: string) => void;
  onToggleGoogle: (v: boolean) => void;
  onCropChange: (c: AvatarCrop) => void;
}

const clamp = (v: number, m: number) => Math.min(m, Math.max(-m, v));
const maxPan = (z: number) => Math.max(0, 50 - 5000 / z);

export const AvatarPicker: React.FC<Props> = ({
  googlePhotoUrl, currentAvatarId, useGooglePhoto, crop,
  onSelectDefault, onToggleGoogle, onCropChange,
}) => {
  const [open, setOpen] = useState(false);
  const [localCrop, setLocalCrop] = useState<AvatarCrop>(crop);
  const vpRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const current = getAvatarById(currentAvatarId || '') || DEFAULT_AVATARS[0];

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: localCrop.x, oy: localCrop.y };
  };
  const cropRef = useRef(localCrop);
  cropRef.current = localCrop;

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !vpRef.current) return;
    const w = vpRef.current.clientWidth || 176;
    const dx = ((e.clientX - d.sx) / w) * 100;
    const dy = ((e.clientY - d.sy) / w) * 100;
    const m = maxPan(localCrop.zoom);
    const nx = clamp(d.ox + dx, m);
    const ny = clamp(d.oy + dy, m);
    setLocalCrop((c) => ({ ...c, x: nx, y: ny }));
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    onCropChange(cropRef.current);
  };
  const onPointerCancel = () => { drag.current = null; };

  const setZoom = (z: number) => {
    const m = maxPan(z);
    const next = { zoom: z, x: clamp(localCrop.x, m), y: clamp(localCrop.y, m) };
    setLocalCrop(next);
    onCropChange(next);
  };

  return (
    <>
      {/* ⭐ COMPACT CARD */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-lg flex items-center gap-3">
        {useGooglePhoto && googlePhotoUrl ? (
          <UserAvatar src={googlePhotoUrl} size={48} rounded="full" ring="#10B981" />
        ) : (
          <UserAvatar src={current.url} size={48} crop={crop} ring="#FBBF24" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold bn" style={{ color: '#E2E8F0' }}>প্রোফাইল ছবি</p>
          <p className="text-[9px] bn truncate" style={{ color: '#64748B' }}>
            {useGooglePhoto ? '📷 Google ছবি ব্যবহার হচ্ছে' : `🎭 Avatar ${current.label}`}
          </p>
        </div>
        <button
          onClick={() => { setLocalCrop(crop); setOpen(true); }}
          className="px-3.5 py-2.5 rounded-xl text-[11px] font-extrabold bn transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }}
        >
          বদলান
        </button>
      </div>

      {/* ⭐ PREMIUM MODAL (FB/Discord-style crop) */}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <style>{`@keyframes avPop { from { opacity:0; transform: scale(.94) translateY(12px);} to { opacity:1; transform: scale(1) translateY(0);} }`}</style>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setOpen(false)} />

          <div
            className="relative w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[88vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(170deg,#17141F 0%,#0D0B12 100%)',
              border: '1px solid rgba(251,191,36,0.22)',
              boxShadow: '0 40px 90px -30px rgba(0,0,0,0.9)',
              animation: 'avPop .35s cubic-bezier(.16,1,.3,1)',
            }}
          >
            {/* header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)' }}>
                  <ImageIcon className="w-4 h-4 text-[#0F111A]" />
                </div>
                <h3 className="text-sm font-black bn" style={{ color: '#F8FAFC' }}>ছবি সম্পাদনা</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl transition-colors hover:text-white" style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => googlePhotoUrl && onToggleGoogle(true)}
                disabled={!googlePhotoUrl}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-extrabold bn transition-all"
                style={useGooglePhoto
                  ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: googlePhotoUrl ? '#94A3B8' : '#475569', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Camera className="w-4 h-4" /> Google ছবি
              </button>
              <button
                onClick={() => onToggleGoogle(false)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-extrabold bn transition-all"
                style={!useGooglePhoto
                  ? { background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ImageIcon className="w-4 h-4" /> আমার Avatar
              </button>
            </div>

            {!useGooglePhoto && (
              <>
                {/* ⭐ CROP AREA (Discord-style) */}
                <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div
                    ref={vpRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                    onTouchEnd={onPointerUp}
                    onTouchCancel={onPointerCancel}
                    className="relative mx-auto w-44 h-44 rounded-2xl overflow-hidden cursor-move touch-none select-none"
                    style={{ border: '2px solid rgba(251,191,36,0.6)', boxShadow: '0 0 0 4px rgba(251,191,36,0.12)' }}
                  >
                    <img
                      src={current.url}
                      alt=""
                      draggable={false}
                      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transform: `translate(${localCrop.x}%, ${localCrop.y}%) scale(${localCrop.zoom / 100})`,
                      }}
                    />
                    {/* rule-of-thirds grid */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)',
                        backgroundSize: '33.33% 33.33%',
                      }}
                    />
                  </div>

                  {/* zoom row */}
                  <div className="flex items-center gap-3">
                    <ZoomIn className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
                    <input
                      type="range" min={100} max={250} step={5} value={localCrop.zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-[#FBBF24]"
                    />
                    <span className="text-[10px] font-mono w-10 text-right" style={{ color: '#FBBF24' }}>{localCrop.zoom}%</span>
                    <button
                      onClick={() => { setLocalCrop(DEFAULT_CROP); onCropChange(DEFAULT_CROP); }}
                      className="p-2 rounded-lg transition-colors hover:text-white"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[9px] bn text-center" style={{ color: '#64748B' }}>
                    ছবিটি টেনে ধরে সরান + slider দিয়ে zoom করুন
                  </p>
                </div>

                {/* ⭐ LIVE PREVIEW */}
                <div className="flex items-center gap-3 px-1">
                  <span className="text-[9px] font-bold bn" style={{ color: '#64748B' }}>Preview:</span>
                  <UserAvatar src={current.url} size={44} rounded="full" crop={localCrop} />
                  <UserAvatar src={current.url} size={44} crop={localCrop} />
                  <UserAvatar src={current.url} size={30} rounded="full" crop={localCrop} />
                </div>

                {/* ⭐ 18 AVATAR GRID */}
                <div className="grid grid-cols-6 gap-2">
                  {DEFAULT_AVATARS.map((av) => {
                    const sel = currentAvatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        onClick={() => onSelectDefault(av.id)}
                        className="relative aspect-square rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                        style={{
                          border: sel ? '2px solid #FBBF24' : '2px solid rgba(255,255,255,0.08)',
                          boxShadow: sel ? '0 0 0 3px rgba(251,191,36,0.25)' : '0 4px 12px rgba(0,0,0,0.35)',
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <img
                          src={av.url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                        />
                        {sel && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <Check className="w-4 h-4 text-gold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl text-xs font-extrabold bn transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#D97706)', color: '#0F111A' }}
            >
              ✅ সেভ করুন
            </button>
          </div>
        </div>
      )}
    </>
  );
};