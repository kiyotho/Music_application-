export type TrackId = string

export type TrackSource =
  | { type: 'youtube'; videoId: string }
  | { type: 'local'; localId: string }

export type Track = {
  id: TrackId
  title: string
  artist?: string
  albumArtUrl?: string
  source: TrackSource
  durationSec?: number
}

