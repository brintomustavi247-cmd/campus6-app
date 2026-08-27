# RankPush

RankPush is a premium competitive progress platform where users complete challenges, earn XP, unlock achievements, improve their rank, and compete through privacy-aware leaderboards. Designed with an esports-inspired "Crimson Minimal" aesthetic and optimized for beautiful Bengali typography.

## Features
- **Crimson Minimal Design**: A refined 80/10/5/5 ratio design system for calm yet competitive progression.
- **Premium Bengali Typography**: Seamlessly blends Noto Sans Bengali with Lexend and JetBrains Mono.
- **Daily Focus & XP**: Built-in Pomodoro engine, checklist tracking, and XP progression.
- **Leaderboards**: Friendly global/friends competition.
- **Demo Mode**: Works instantly without a backend for testing and previewing layout.

## Framework and Dependencies
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS v4**

## Requirements
- Node.js 18+
- npm or pnpm

## Installation
```bash
# Clone repository
git clone https://github.com/your-repo/rankpush.git

# Enter project folder
cd rankpush

# Install dependencies
npm install
```

## Environment variables
```bash
# Copy .env.example to .env
cp .env.example .env
```
Fill in the `VITE_FIREBASE_*` credentials if you wish to use live data persistence.

## Demo Mode
Out of the box, RankPush runs in **Demo Mode** if Firebase variables are omitted. It will use local memory/localStorage schemas to mock progression, letting you preview the UI.

## Local Development
```bash
# Start development server
npm run dev

# Run typecheck
npm run lint
```

## Production Build
```bash
# Build production version
npm run build

# Preview production build
npm run preview
```

## Firebase Setup
1. Create a Firebase project.
2. Enable Firestore and Authentication.
3. Add a Web App to get your SDK configuration.
4. Copy these into `.env`.

## Contribution Workflow
1. Branch from `main`.
2. Ensure you run `npm run lint` before committing.
3. Submit a PR!

## Known Limitations
- The leaderboard currently scales using local/mock limits or single-document aggregates. A true 10,000+ user deployment requires setting up a Firebase Cloud Function to handle distributed bucket aggregation.
