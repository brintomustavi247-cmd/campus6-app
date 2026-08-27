import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PresenceProvider } from './contexts/PresenceContext';
import { TimerProvider } from './contexts/TimerContext';
import { supabase } from './supabaseClient';

// DEBUG: exposes Supabase client in the browser console so we can run
// one-liner diagnostics even in the production build.
// (Can remove these 2 lines after the sync bug is fixed.)
(window as any).supabase = supabase;

console.log('[CAMPUS] ✅ engine v11 deployed — timer writes ACTIVE');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PresenceProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </PresenceProvider>
  </StrictMode>,
);