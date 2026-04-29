import { openDB } from 'idb'

export type LocalTrackRecord = {
  id: string
  name: string
  artist?: string
  addedAt: number
  mimeType: string
  sizeBytes: number
  blob: Blob
}

const DB_NAME = 'music_app_db_v1'
const STORE = 'local_tracks'

async function db() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore(STORE, { keyPath: 'id' })
    },
  })
}

export async function addLocalTrack(file: File): Promise<LocalTrackRecord> {
  const id = crypto.randomUUID()
  const record: LocalTrackRecord = {
    id,
    name: file.name.replace(/\.[^.]+$/, ''),
    addedAt: Date.now(),
    mimeType: file.type || 'audio/mpeg',
    sizeBytes: file.size,
    blob: file,
  }
  const database = await db()
  await database.put(STORE, record)
  return record
}

export async function listLocalTracks(): Promise<LocalTrackRecord[]> {
  const database = await db()
  const all = await database.getAll(STORE)
  return all.sort((a, b) => b.addedAt - a.addedAt)
}

export async function getLocalTrackBlob(id: string): Promise<Blob | null> {
  const database = await db()
  const record = (await database.get(STORE, id)) as LocalTrackRecord | undefined
  return record?.blob ?? null
}

export async function removeLocalTrack(id: string) {
  const database = await db()
  await database.delete(STORE, id)
}

