import { STORAGE_KEYS } from '../storageKeys.js'

export async function loadLabDone() {
  return (await window.storage.getItem(STORAGE_KEYS.labDone)) || []
}

export async function markLabDone(labId) {
  const done = await loadLabDone()
  if (!done.includes(labId)) {
    done.push(labId)
    await window.storage.setItem(STORAGE_KEYS.labDone, done)
  }
  return done
}
