// database.js
const DB_NAME = 'SpotifyPlaylistsDB';
const DB_VERSION = 3.3;
const PLAYLISTS_STORE_NAME = 'playlists';
const BACKGROUND_PLAYLISTS_STORE_NAME = 'backgroundPlaylists';
const HISTORY_STORE_NAME = 'history';

/**
 * Open or create the IndexedDB database.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {

       const db = event.target.result;
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE_NAME)) {
        db.createObjectStore(PLAYLISTS_STORE_NAME, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(BACKGROUND_PLAYLISTS_STORE_NAME)) {
        db.createObjectStore(BACKGROUND_PLAYLISTS_STORE_NAME, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        db.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'datePlayed' });
      }

    };



    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an array of playlist objects to IndexedDB.
 * Each playlist must have a unique `id` property.
 * @param {Array<Object>} playlists
 */
export async function savePlaylists(playlists) {
  const db = await openDB();
  const tx = db.transaction(PLAYLISTS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PLAYLISTS_STORE_NAME);

  for (const playlist of playlists) {
    await new Promise((resolve, reject) => {
      const request = store.put(playlist);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  db.close();
}

export async function loadBackgroundPlaylists() {
  const db = await openDB();
  const tx = db.transaction(BACKGROUND_PLAYLISTS_STORE_NAME, 'readonly');
  const store = tx.objectStore(BACKGROUND_PLAYLISTS_STORE_NAME);

  const playlists = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return playlists;
}

export async function saveBackgroundPlaylists(playlists) {
  const db = await openDB();
  const tx = db.transaction(BACKGROUND_PLAYLISTS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(BACKGROUND_PLAYLISTS_STORE_NAME);
  // Clear all records in the store
  const clearRequest = store.clear();
  debugger;
  for (const playlist of playlists) {
    await new Promise((resolve, reject) => {
      const request = store.put(playlist);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  }

  db.close();
}

export async function addToHistory(track) {
  const db = await openDB();
  const tx = db.transaction(HISTORY_STORE_NAME, 'readwrite');
  const store = tx.objectStore(HISTORY_STORE_NAME);
  // Clear all records in the store
  track.datePlayed = new Date();

  const addRequest = store.add(track);

  debugger;
  db.close();
}

/**
 * Load all playlists from IndexedDB.
 * @returns {Promise<Array<Object>>}
 */
export async function loadPlaylists() {
  const db = await openDB();
  const tx = db.transaction(PLAYLISTS_STORE_NAME, 'readonly');
  const store = tx.objectStore(PLAYLISTS_STORE_NAME);

  const playlists = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return playlists;
}

export async function loadPlaylistById(id) {
  const db = await openDB();
  const tx = db.transaction(PLAYLISTS_STORE_NAME, 'readonly');
  const store = tx.objectStore(PLAYLISTS_STORE_NAME);

  const playlist = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const result = request.result.find(p => p.id === id); // match by field
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });

  db.close();
  return playlist;
}

export async function getHistory() {
  const db = await openDB();
  const tx = db.transaction(HISTORY_STORE_NAME, 'readonly');
  const store = tx.objectStore(HISTORY_STORE_NAME);

  const tracks = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return tracks;
}
/**
 * Delete all playlists from IndexedDB.
 */
export async function clearPlaylists() {
  const db = await openDB();
  const tx = db.transaction(PLAYLISTS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PLAYLISTS_STORE_NAME);
  await store.clear();
  db.close();
}
