## Music Application (Spotify-like PWA)

### What’s included
- **Frontend**: React + Vite + Tailwind CSS (PWA + Media Session)
- **Backend**: Node.js + Express
- **Audio**: `yt-dlp` (must be installed on the machine running the backend)

### Prereqs
- Node.js
- Python
- `yt-dlp`:

```bash
pipx install yt-dlp
# or
python3 -m pip install -U yt-dlp
```

### Run (dev)

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5174`

### Backend API
- `GET /search?q=query` → YouTube results
- `GET /stream?videoId=xxx&quality=low|high` → stream URL (expires)

### Deploy

#### Railway backend

Deploy the backend service and confirm these URLs work in a browser:

```bash
https://YOUR-RAILWAY-DOMAIN.up.railway.app/
https://YOUR-RAILWAY-DOMAIN.up.railway.app/health
https://YOUR-RAILWAY-DOMAIN.up.railway.app/search?q=test
```

If Railway returns `Application not found` or an `x-railway-fallback: true` header, the domain is not attached to the running backend service. Copy the current public domain from Railway's service settings.

Set this Railway environment variable to your Vercel frontend origin:

```bash
FRONTEND_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

Use `*` only for quick testing.

#### Vercel frontend

Set this Vercel environment variable before building:

```bash
VITE_API_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
```

After changing `VITE_API_URL`, redeploy the Vercel frontend. Vite bakes this value into the production build, so changing it in Vercel without redeploying will not update the app.
