const API_BASE =
  import.meta.env.VITE_API_URL?.toString() || 'https://music-application-prod.up.railway.app'

export type YouTubeSearchResult = {
  title: string
  videoId: string
  thumbnail: string | null
  duration: number | null
  channel: string | null
}

export async function searchYouTube(q: string): Promise<YouTubeSearchResult[]> {
  const url = new URL('/search', API_BASE)
  url.searchParams.set('q', q)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return (await res.json()) as YouTubeSearchResult[]
}

export async function getStreamUrl(params: {
  videoId: string
  quality: 'low' | 'high'
}): Promise<{ url: string }> {
  const url = new URL('/stream', API_BASE)
  url.searchParams.set('videoId', params.videoId)
  url.searchParams.set('quality', params.quality)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Stream failed: ${res.status}`)
  return (await res.json()) as { url: string }
}

