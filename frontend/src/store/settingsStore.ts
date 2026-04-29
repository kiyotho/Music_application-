import { create } from 'zustand'
import { loadSettings, saveSettings, type Settings } from '../lib/storage'

type SettingsState = Settings & {
  setDataSaver: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => {
  const initial = loadSettings()

  return {
    dataSaver: initial.dataSaver,
    setDataSaver: (value) =>
      set(() => {
        const next: Settings = { dataSaver: value }
        saveSettings(next)
        return next
      }),
  }
})

