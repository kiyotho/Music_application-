const API_BASE = import.meta.env.VITE_API_URL?.toString().trim() || ''

function buildApiUrl(path: string) {
  const base = API_BASE || (import.meta.env.DEV ? 'http://localhost:5174' : '')
  if (!base) {
    throw new Error('Missing VITE_API_URL. Set it to your Railway backend URL in Vercel.')
  }
  return new URL(path, base)
}

export type YouTubeSearchResult = {
  title: string
  videoId: string
  thumbnail: string | null
  duration: number | null
  channel: string | null
}

export async function searchYouTube(q: string): Promise<YouTubeSearchResult[]> {
  const url = buildApiUrl('/search')
  url.searchParams.set('q', q)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return (await res.json()) as YouTubeSearchResult[]
}

export async function getStreamUrl(params: {
  videoId: string
  quality: 'low' | 'high'
}): Promise<{ url: string }> {
  const url = buildApiUrl('/stream')
  url.searchParams.set('videoId', params.videoId)
  url.searchParams.set('quality', params.quality)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Stream failed: ${res.status}`)
  return (await res.json()) as { url: string }
}
