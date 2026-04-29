## Music Application (Spotify-like PWA)

### What’s included
- **Frontend**: React + Vite + Tailwind CSS (PWA + Media Session)
- **Backend**: Node.js + Express
- **Audio**: `yt-dlp` (must be installed on the machine running the backend)

### Prereqs
- Node.js (you have it)
- Python (you have it)
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

