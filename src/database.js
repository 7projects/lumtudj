// database.js
const DB_NAME = 'SpotifyPlaylistsDB';
const DB_VERSION = 4
const PLAYLISTS_STORE_NAME = 'playlists';
const ALBUMS_STORE_NAME = 'albums';
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

      if (!db.objectStoreNames.contains(ALBUMS_STORE_NAME)) {
        db.createObjectStore(ALBUMS_STORE_NAME, { keyPath: 'id' });
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

export async function saveAlbums(albums) {
  const db = await openDB();
  const tx = db.transaction(ALBUMS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(ALBUMS_STORE_NAME);

  for (const album of albums) {
    await new Promise((resolve, reject) => {
      const request = store.put(album);
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

export async function loadAlbums() {
  const db = await openDB();
  const tx = db.transaction(ALBUMS_STORE_NAME, 'readonly');
  const store = tx.objectStore(ALBUMS_STORE_NAME);

  const albums = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return albums;
}

export async function loadAlbumById(id) {
  const db = await openDB();
  const tx = db.transaction(ALBUMS_STORE_NAME, 'readonly');
  const store = tx.objectStore(ALBUMS_STORE_NAME);

  const album = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const result = request.result.find(a => a.id === id); // match by field
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });

  db.close();
  return album;
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
export async function clearDatabase() {
  const db = await openDB();

  const tx = db.transaction(PLAYLISTS_STORE_NAME, 'readwrite');
  const store = tx.objectStore(PLAYLISTS_STORE_NAME);
  await store.clear();

  const tx2 = db.transaction(ALBUMS_STORE_NAME, 'readwrite');
  const store2 = tx2.objectStore(ALBUMS_STORE_NAME);
  await store2.clear();

  const tx3 = db.transaction(BACKGROUND_PLAYLISTS_STORE_NAME, 'readwrite');
  const store3 = tx3.objectStore(BACKGROUND_PLAYLISTS_STORE_NAME);
  await store3.clear();

  const tx4 = db.transaction(HISTORY_STORE_NAME, 'readwrite');
  const store4 = tx4.objectStore(HISTORY_STORE_NAME);
  await store4.clear();

  db.close();
}


