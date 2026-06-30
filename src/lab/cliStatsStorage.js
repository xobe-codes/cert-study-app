import { STORAGE_KEYS } from '../storageKeys.js'

export async function loadCliStats() {
  return (await window.storage.getItem(STORAGE_KEYS.cliStats)) || {}
}
