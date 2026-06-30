export async function importCcnaJsonFromFile(file, onImport) {
  const parsed = JSON.parse(await file.text())
  if (!parsed || typeof parsed !== 'object' || (!parsed.progress && !parsed.quizBank && !parsed.missed)) {
    return { ok: false, message: 'That file does not look like a CCNA data export.' }
  }
  await onImport(parsed)
  return { ok: true, message: 'Imported and merged ✓' }
}
