const express = require('express')
const cors = require('cors')
const { spawn } = require('node:child_process')

const PORT = Number(process.env.PORT || 5174)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

const SEARCH_TTL_MS = 10 * 60 * 1000
const SEARCH_CACHE_MAX = 100
const searchCache = new Map()

function getCachedSearch(key) {
  const hit = searchCache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) {
    searchCache.delete(key)
    return null
  }
  return hit.value
}

function setCachedSearch(key, value) {
  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const firstKey = searchCache.keys().next().value
    if (firstKey) searchCache.delete(firstKey)
  }
  searchCache.set(key, { value, expiresAt: Date.now() + SEARCH_TTL_MS })
}

function runYtDlp(args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...opts,
    })

    let out = ''
    let err = ''

    child.stdout.on('data', (d) => (out += d.toString()))
    child.stderr.on('data', (d) => (err += d.toString()))

    child.on('error', (e) => {
      if (e && e.code === 'ENOENT') {
        reject(new Error('yt-dlp not found. Install it first (e.g. `pipx install yt-dlp` or `pip install -U yt-dlp`).'))
        return
      }
      reject(e)
    })

    child.on('close', (code) => {
      if (code === 0) resolve({ out, err })
      else reject(new Error(err || `yt-dlp exited with code ${code}`))
    })
  })
}

const app = express()

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  }),
)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (!q) return res.status(400).json({ error: 'Missing q' })

  try {
    const cacheKey = q.toLowerCase()
    const cached = getCachedSearch(cacheKey)
    if (cached) return res.json(cached)

    // Use a faster "flat" extraction for quicker results.
    const query = `ytsearch10:${q}`
    const { out } = await runYtDlp([
      '--no-warnings',
      '--ignore-errors',
      '--skip-download',
      '--flat-playlist',
      '--dump-json',
      '--no-playlist',
      query,
    ])

    const results = out
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .map((j) => {
        const videoId = j.id || j.display_id || null
        const thumb = j.thumbnail || null
        return {
          title: j.title || 'Unknown title',
          videoId,
          thumbnail: thumb,
          duration: typeof j.duration === 'number' ? j.duration : null,
          channel: j.uploader || j.channel || j.creator || null,
        }
      })
      .filter((r) => Boolean(r.videoId))

    setCachedSearch(cacheKey, results)
    res.json(results)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Search failed' })
  }
})

app.get('/stream', async (req, res) => {
  const videoId = String(req.query.videoId || '').trim()
  const quality = String(req.query.quality || 'high').trim()
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' })
  if (quality !== 'low' && quality !== 'high')
    return res.status(400).json({ error: 'quality must be low|high' })

  const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`

  const format =
    quality === 'low'
      ? 'worstaudio[abr<=64]/worstaudio'
      : 'bestaudio[ext=m4a]/bestaudio/best'

  try {
    const { out } = await runYtDlp([
      '--no-warnings',
      '--no-playlist',
      '-f',
      format,
      '--get-url',
      url,
    ])

    const streamUrl = out.trim().split('\n').filter(Boolean)[0]
    if (!streamUrl) return res.status(500).json({ error: 'No stream URL returned' })
    res.json({ url: streamUrl })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Stream failed' })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`)
})

