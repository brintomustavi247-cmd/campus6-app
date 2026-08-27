# Deployment

RankPush can be deployed anywhere that serves static files.
- Firebase Hosting
- Vercel
- Cloudflare Pages
- Google Cloud Run (containerized)

For Cloud Run:
A Dockerfile is required, compiling via `npm run build` and serving the `dist/` directory via nginx or the bundled express `server.ts`.
