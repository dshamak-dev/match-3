const storage = localStorage;
const storageKey = "combo-journey_record";

export function loadGame() {
  try {
    const payload = storage.getItem(storageKey);

    if (payload) {
      return JSON.parse(payload) || {};
    }
  } catch (err) {
    return {};
  }
}

export function saveGame(payload) {
  storage.setItem(storageKey, JSON.stringify(payload));
}
