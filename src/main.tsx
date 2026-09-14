import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PresenceProvider } from './contexts/PresenceContext';
import { TimerProvider } from './contexts/TimerContext';
import { supabase } from './supabaseClient';
import { applyPerfMode } from './utils/perfMode';

// DEBUG: exposes Supabase client in the browser console so we can run
// one-liner diagnostics even in the production build.
// (Can remove these 2 lines after the sync bug is fixed.)
(window as any).supabase = supabase;

console.log('[CAMPUS] ✅ engine v11 deployed — timer writes ACTIVE');

// ⚡ Low-end device detector — lite mode (blur/animation off) before first paint
applyPerfMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PresenceProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </PresenceProvider>
  </StrictMode>,
);

// ⭐ TEMP DEBUG — font loading verification (remove after fix confirmed)
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('[FONT-DEBUG] status:', document.fonts.status);
    console.log('[FONT-DEBUG] Anek Bangla 700:', document.fonts.check('700 16px "Anek Bangla"'));
    console.log('[FONT-DEBUG] Lexend 800:', document.fonts.check('800 16px "Lexend"'));
    console.log('[FONT-DEBUG] Orbitron 700:', document.fonts.check('700 16px "Orbitron"'));
  }, 1500);
});