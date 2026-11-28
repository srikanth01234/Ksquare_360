export function buildDailyUpdatePayload(update, siteId) {
  return {
    siteId,
    title: update.title,
    description: update.description,
    workPhase: update.workPhase,
    workersCount: update.workersCount,
    materialsUsed: update.materialsUsed,
    progress: update.progress,
    notes: update.notes,
    date: update.date,
  };
}
