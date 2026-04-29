import { useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getStreamUrl } from '../api'
import { getLocalTrackBlob } from '../localLibrary'
import { usePlayerStore, getCurrentTrack } from '../../store/playerStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useHistoryStore } from '../../store/historyStore'

function formatArtistChannelFallback(title: string) {
  return title
}

export function PlayerController() {
  const audio = useMemo(() => new Audio(), [])
  const objectUrlRef = useRef<string | null>(null)

  const { queue, currentIndex, isPlaying, volume, positionSec } = usePlayerStore(
    useShallow((s) => ({
      queue: s.queue,
      currentIndex: s.currentIndex,
      isPlaying: s.isPlaying,
      volume: s.volume,
      positionSec: s.positionSec,
    })),
  )
  const { setIsPlaying, setDurationSec, setPositionSec, next, setError } = usePlayerStore()
  const dataSaver = useSettingsStore((s) => s.dataSaver)
  const addPlayed = useHistoryStore((s) => s.addPlayed)

  const currentTrack = getCurrentTrack({ queue, currentIndex })

  useEffect(() => {
    audio.preload = 'none'
    audio.volume = volume

    const onTime = () => setPositionSec(audio.currentTime || 0)
    const onDuration = () => setDurationSec(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => next()
    const onError = () => setError('Audio playback failed. Try another track or quality setting.')

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDuration)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDuration)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [audio, next, setDurationSec, setError, setIsPlaying, setPositionSec, volume])

  useEffect(() => {
    audio.volume = volume
  }, [audio, volume])

  useEffect(() => {
    if (!Number.isFinite(positionSec)) return
    const delta = Math.abs((audio.currentTime || 0) - positionSec)
    if (delta > 1.0) audio.currentTime = positionSec
  }, [audio, positionSec])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      if (!currentTrack) {
        audio.pause()
        audio.src = ''
        return
      }

      try {
        if (currentTrack.source.type === 'local') {
          const blob = await getLocalTrackBlob(currentTrack.source.localId)
          if (!blob) throw new Error('Missing local file')
          const objectUrl = URL.createObjectURL(blob)
          objectUrlRef.current = objectUrl
          if (cancelled) return
          audio.src = objectUrl
        } else {
          const quality = dataSaver ? 'low' : 'high'
          const { url } = await getStreamUrl({
            videoId: currentTrack.source.videoId,
            quality,
          })
          if (cancelled) return
          audio.src = url
        }

        if ('mediaSession' in navigator && 'MediaMetadata' in window) {
          const meta = new window.MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist || formatArtistChannelFallback(currentTrack.title),
            artwork: currentTrack.albumArtUrl
              ? [{ src: currentTrack.albumArtUrl, sizes: '512x512', type: 'image/jpeg' }]
              : undefined,
          })
          navigator.mediaSession.metadata = meta
        }

        if (isPlaying) await audio.play()
      } catch (e) {
        audio.pause()
        audio.src = ''
        setError(e instanceof Error ? e.message : 'Failed to load track')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [audio, currentTrack, dataSaver, isPlaying, setError])

  useEffect(() => {
    if (!currentTrack) return
    if (!isPlaying) return
    addPlayed(currentTrack.id)
  }, [addPlayed, currentTrack, isPlaying])

  useEffect(() => {
    if (!currentTrack) return
    if (isPlaying) void audio.play()
    else audio.pause()
  }, [audio, currentTrack, isPlaying])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    // Some browsers throw if an action isn't supported; never let it crash the app.
    try {
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true))
    } catch {}
    try {
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false))
    } catch {}
    try {
      navigator.mediaSession.setActionHandler('previoustrack', () =>
        usePlayerStore.getState().previous(),
      )
    } catch {}
    try {
      navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().next())
    } catch {}
  }, [setIsPlaying])

  return null
}
