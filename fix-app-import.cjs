const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('ProfilePremiumView =')) {
  app = app.replace(
    /const RedGoldThemeView = lazy\([^)]+\)\)\);/g,
    "const RedGoldThemeView = lazy(() => import('./views/RedGoldThemeView').then(m => ({ default: m.RedGoldThemeView })));\nconst ProfilePremiumView = lazy(() => import('./views/ProfilePremiumView').then(m => ({ default: m.ProfilePremiumView })));"
  );
  fs.writeFileSync('src/App.tsx', app, 'utf8');
}
