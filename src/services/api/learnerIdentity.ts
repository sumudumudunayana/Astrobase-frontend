const LEARNER_ID_STORAGE_KEY = 'astrobase_learner_id';

/**
 * Retrieves the persisted learner ID from localStorage, or generates a new unique UUID.
 * Ensures the learner identity is unique per browser session and not globally shared.
 */
export function getOrCreateLearnerId(): string {
  try {
    const existingId = localStorage.getItem(LEARNER_ID_STORAGE_KEY);
    if (existingId && isValidUUID(existingId)) {
      return existingId;
    }

    const newId = generateUUID();
    localStorage.setItem(LEARNER_ID_STORAGE_KEY, newId);
    return newId;
  } catch {
    // Fallback if localStorage is disabled
    return '00000000-0000-0000-0000-000000000001';
  }
}

/**
 * Resets the learner identity, allowing testing fresh progression from 0%.
 */
export function resetLearnerId(): string {
  const newId = generateUUID();
  try {
    localStorage.setItem(LEARNER_ID_STORAGE_KEY, newId);
  } catch {
    // ignored
  }
  return newId;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

