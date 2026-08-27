const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.profile-premium')) {
  css += `
/* ═══════════════════════════════════════════════════════════
   ZENO LEAGUE — PROFILE PREMIUM v3.0 (Auth Layout)
   Esports-Grade Dark UI
   ═══════════════════════════════════════════════════════════ */

.profile-premium {
  --p-bg: #0F111A;
  --p-card: #1E2030;
  --p-card-border: rgba(255, 255, 255, 0.06);
  --p-card-top: rgba(255, 255, 255, 0.12);
  --p-nested: #161825;
  --p-text: #E5E1E4;
  --p-muted: #889299;
  
  --p-red: #DC2626;
  --p-red-light: #EF4444;
  --p-yellow: #FACC15;
  --p-yellow-glow: rgba(250, 204, 21, 0.4);
  
  --p-radius-xl: 24px;
  --p-radius-lg: 16px;
  --p-radius-md: 14px;
  --p-radius-full: 9999px;
  --p-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  --p-font-display: 'Orbitron', 'Rajdhani', sans-serif;
  --p-font-body: 'Plus Jakarta Sans', sans-serif;
  --p-font-mono: 'JetBrains Mono', monospace;

  background-color: var(--p-bg);
  background-image:
    radial-gradient(circle at 15% 50%, rgba(220, 38, 38, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(250, 204, 21, 0.08) 0%, transparent 50%);
  color: var(--p-text);
  font-family: var(--p-font-body);
  min-height: 100dvh;
  position: relative;
  overflow-x: hidden;
  padding: 40px 16px;
}

.profile-premium ::selection {
  background: var(--p-red);
  color: white;
}

.profile-premium::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
  opacity: 0.4;
}

.p-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 17, 26, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.p-btn {
  height: 48px;
  border-radius: var(--p-radius-lg);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  font-family: var(--p-font-display);
  letter-spacing: 1px;
}

.p-btn-primary {
  background: linear-gradient(135deg, var(--p-red), var(--p-yellow));
  color: #0F111A;
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
}

.p-btn-primary:hover {
  box-shadow: 0 0 25px rgba(250, 204, 21, 0.5);
  transform: translateY(-2px);
}

.p-edit-field {
  margin-bottom: 16px;
  position: relative;
}

.p-edit-field label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--p-yellow);
  margin-bottom: 6px;
  font-family: var(--p-font-display);
}

.p-edit-field input, .p-edit-field select {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: white;
  font-family: var(--p-font-body);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.p-edit-field input:focus, .p-edit-field select:focus {
  border-color: var(--p-red);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 15px rgba(220, 38, 38, 0.2);
}

.profile-premium .p-container {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.profile-premium .p-card {
  background: var(--p-card);
  border: 1px solid var(--p-card-border);
  border-top: 1px solid var(--p-card-top);
  border-radius: var(--p-radius-xl);
  padding: 32px;
  box-shadow: var(--p-shadow);
  backdrop-filter: blur(10px);
}

@media (min-width: 768px) {
  .profile-premium .p-container.register-mode {
    max-width: 800px;
  }
}
`;
  fs.writeFileSync('src/index.css', css, 'utf8');
}
