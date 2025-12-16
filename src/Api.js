
import { time } from 'framer-motion';
import { generateRandomString, generateCodeChallenge } from './pkceUtils';

const BASE_URL = 'https://api.spotify.com/v1';
const FIREBASE_FUNCTIONS_URL = 'https://us-central1-lumtudj-dfd38.cloudfunctions.net/api'; //samo produkcija

const REDIRECT_URI = process.env.NODE_ENV === 'development' ? 'https://localhost:3000' : 'https://lumtu.net';
const CLIENT_ID = '6b690613cc6d481d97a3b75c2c0cf947';

const getToken = async () => {
  await validateToken();
  return localStorage.getItem('token');
}

function shouldRefreshToken() {
  if (tokenExpirationTimeLeft() <= 300000) { // 5min prije isteka refreshaj token! 
    return true;
  }
  return false;
}

function tokenExpirationTimeLeft() {
  const expiration = parseInt(localStorage.getItem("token_expiry"), 10);
  if (!expiration) return 0;
  const now = Date.now();
  const timeLeft = expiration - now;
  return timeLeft;
}

async function validateToken() {
  if (shouldRefreshToken()) {
    let token = localStorage.getItem('token');
    if (!token) return;
    // alert("Token is expired or about to expire. Please refresh the page to re-authenticate.");
    await refreshAccessToken();
  }
}

const errorHandler = async (response) => {

}

async function request(endpoint, options = {}) {
  let accessToken = await getToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    errorHandler();
  }

  return response.json();
}

let codeVerifierGlobal = '';

const getAuthUrl = async () => {

  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  codeVerifierGlobal = codeVerifier;
  localStorage.setItem('code_verifier', codeVerifier);

  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-top-read',
    'user-read-recently-played',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-modify',

  ];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes.join(' '),
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

const playTrack = async (id) => {
  const deviceId = localStorage.getItem('deviceId');
  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: ['spotify:track:' + id]
    })
  })

  if (!response.ok) {
    errorHandler();
  }

  return response;
}

const search = async (query) => {
  let data = await request(`/search?q=${query}&type=track`);

  return data.tracks.items;
};

const simplifiPlaylist = (item) => {

  debugger;
  return {
    id: item.id,
    name: item.name,
    count: item.tracks.total,     // total number of tracks
    images: item.images,          // array of image objects
    tracks: [],                   // you can fill this later with actual track data
    uri: item.uri,
    snapshot_id: item.snapshot_id,
    collaborative: item.collaborative,
    public: item.public,
    owner_id: item.owner.id,
    shuffle: 0,
    type: "playlist"
  };
};

const getPlaylists = async () => {
  // let data = await request('/me/playlists');

  let playlists = [];

  let url = 'https://api.spotify.com/v1/me/playlists?limit=50';

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${await getToken()}` }
    });

    if (!response.ok) {
      errorHandler();
      return;
    }

    const data = await response.json();

    const simplified = data.items.map(item => simplifiPlaylist(item));

    playlists.push(...simplified);
    url = data.next; // Spotify gives the next page URL, or null
  }

  const myShazamTracks = playlists.filter(p => p.name == "My Shazam Tracks");

  if (myShazamTracks && myShazamTracks.length > 0) {
    localStorage.setItem("myShazamTracksID", myShazamTracks[0].id);
  }

  //remove from playlists where name = 'My Shazam Tracks'
  playlists = playlists.filter(playlist => playlist.name !== 'My Shazam Tracks');

  return playlists;
};

const searchAlbums = async (query) => {
  let data = await request(`/search?q=${query}&type=album`);
  const simplified = data.albums.items.map(item => simplifiAlbum(item));
  return simplified;
};

const getAlbums = async () => {
  // let data = await request('/me/playlists');

  let albums = [];

  let url = 'https://api.spotify.com/v1/me/albums?limit=50';

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${await getToken()}` }
    });

    if (!response.ok) {
      errorHandler();
      return;
    }

    const data = await response.json();

    debugger;
    const simplified = data.items.map(item => simplifiAlbum(item));
    debugger;
    albums.push(...simplified);

    url = data.next; // Spotify gives the next page URL, or null
  }

  return albums;
};

const simplifiAlbum = (item) => {
  return {
    id: item.id || item.album?.id,
    addedAt: item.added_at || item.album?.added_at,
    name: item.name || item.album?.name,
    artists: item.artists || item.album?.artists,
    release_date: item.release_date || item.album?.release_date,
    count: item.total_tracks || item.album?.total_tracks,
    albumUrl: item.external_urls?.spotify || item.album?.external_urls?.spotify,
    images: item.images || item.album?.images,
    tracks: [],
    uri: item.uri || item.album?.uri,
    snapshot_id: item.snapshot_id || item.album?.snapshot_id,
    shuffle: 0,
    type: "album"
  };
}


const getTracks = async (playlistID, limit) => {
  let tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=` + (limit || "100");

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${await getToken()}` }
    });

    if (!response.ok) {
      errorHandler();
      return;
    }

    const data = await response.json();
    tracks.push(...data.items.map(item => item.track));

    if (limit)
      return tracks;

    url = data.next;
  }

  return tracks;
};

const getArtistTopTracks = async (id) => {
  let tracks = [];
  let url = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });

  if (!response.ok) {
    errorHandler();
    return;
  }

  const data = await response.json();
  tracks.push(...data.tracks);

  return tracks;
};

const getArtistInfo = async (id) => {
  const url = `https://api.spotify.com/v1/artists/${id}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });

  if (!response.ok) {
    errorHandler();
    return;
  }

  const data = await response.json();
  return data;
};

const getArtistAlbums = async (id) => {
  let albums = [];
  let url = `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&market=US&limit=50`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });

  if (!response.ok) {
    errorHandler();
    return;
  }

  const data = await response.json();
  albums.push(...data.items);

  return albums;
};

const getAlbumTracks = async (albumId) => {
  let tracks = [];
  let url = `https://api.spotify.com/v1/albums/${albumId}/tracks?market=US&limit=50`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getToken()}` }
  });

  if (!response.ok) {
    errorHandler();
    return;
  }

  const data = await response.json();
  tracks.push(...data.items);

  return tracks;
};

const getFullPlaylists = async (callback) => {
  const playlists = await getPlaylists();
  return await updateLibrary(playlists, callback);
};

const updateLibrary = async (playlists, callback) => {
  const fullPlaylists = [];

  let index = 0;
  if (callback)
    callback(index, playlists.length);

  for (const playlist of playlists) {
    const tracks = await getTracks(playlist.id);
    index += 1;
    if (callback)
      callback(index, playlists.length);

    fullPlaylists.push({ ...playlist, tracks });
  }

  return fullPlaylists;
}

const getFullAlbums = async (callback) => {
  const albums = await getAlbums();
  return await updateAlbums(albums, callback);
};

const updateAlbums = async (albums, callback) => {
  const fullAlbums = [];

  let index = 0;
  if (callback)
    callback(index, albums.length);

  for (const album of albums) {
    const tracks = await getAlbumTracks(album.id);
    index += 1;
    if (callback)
      callback(index, albums.length);

    fullAlbums.push({ ...album, tracks });
  }

  ;
  return fullAlbums;
}




const getTopTracks = async () => {
  let data = await request('/me/top/tracks?limit=30&time_range=long_term');
  return data.items;
};

const getRecentTracks = async () => {
  let data = await request('/me/player/recently-played?limit=30');
  return data.items.map(item => item.track);
};


const getRecommendations = async (track) => {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };
  const limit = 10; // Number of recommendations to return
  async function fetchJSON(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      errorHandler();
      return;
    }
    return res.json();
  }

  const artistId = track.artists[0]?.id;
  if (!artistId) throw new Error("No artist found for this track");

  // Step 2: Get genres from the artist
  const artist = await fetchJSON(`https://api.spotify.com/v1/artists/${artistId}`);
  const genres = artist.genres.slice(0, 3);
  if (genres.length === 0) throw new Error("No genres found for the track's artist");

  // Step 3: Search for artists in the same genres
  const discoveredArtists = {};
  for (const genre of genres) {
    const query = encodeURIComponent(`genre:"${genre}"`);
    const result = await fetchJSON(
      `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=10`
    );
    result.artists.items.forEach(a => {
      if (a.id !== artistId) discoveredArtists[a.id] = a;
    });
  }

  // Step 4: Get top tracks from discovered artists
  const tracks = [];
  for (const aId of Object.keys(discoveredArtists).slice(0, 10)) {
    const topTracks = await fetchJSON(
      `https://api.spotify.com/v1/artists/${aId}/top-tracks?market=US`
    );
    topTracks.tracks.slice(0, 2).forEach(t => tracks.push(t));
  }

  // Step 5: Deduplicate and limit
  const seen = new Set();
  const uniqueTracks = tracks.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  return uniqueTracks.slice(0, limit);
};

const fetchPlaylistsAndTracks = async () => {
  const playlists = await request("https://api.spotify.com/v1/me/playlists")

  const trackMap = {};

  for (const playlist of playlists.data.items) {
    const playlistId = playlist.id;
    let next = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    const seenTracks = new Set(); // Pjesme koje su već zabilježene u ovoj playlisti

    while (next) {
      const res = await request(next);

      for (const item of res.data.items) {
        const track = item.track;
        if (!track) continue;

        const key = `${track.name} – ${track.artists.map(a => a.name).join(", ")}`;

        if (!seenTracks.has(key)) {
          seenTracks.add(key);
          trackMap[key] = (trackMap[key] || 0) + 1;
        }
      }

      next = res.data.next;
    }
  }

  return trackMap;
};

const addTrackToPlaylist = async (playlist, track) => {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [track.uri], // example: ['spotify:track:4uLU6hMCjMI75M1A2tKUQC']
    }),
  });

  if (!response.ok) {
    errorHandler();

    const error = await response.json();
    console.error('Failed to add track:', error);
  } else {
    return await response.json();
    console.log('Track added successfully!');
  }
};

const addTracksToPlaylist = async (playlist, tracks) => {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: tracks.map(t => t.uri), // example: ['spotify:track:4uLU6hMCjMI75M1A2tKUQC']
    }),
  });

  if (!response.ok) {
    errorHandler();

    const error = await response.json();
    console.error('Failed to add track:', error);
  } else {
    return await response.json();
    console.log('Track added successfully!');
  }
};

const changeTrackPosition = async (playlistId, oldIndex, newIndex) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  const body = {
    range_start: oldIndex,
    insert_before: newIndex
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${await getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to reorder track: ${error}`);
  }

  return await res.json(); // will include snapshot_id
};

const removeTrackFromPlaylist = async (playlist, track) => {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tracks: [
        {
          uri: track.uri // Example: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC'
        }
      ]
    })
  });

  if (!response.ok) {
    errorHandler();
    const error = await response.json();
  } else {
    return await response.json();
  }
};

const refreshAccessToken = async () => {

  let token = localStorage.getItem('token');
  if (!token) return;

  // alert("Refreshing token...");

  const refreshToken = localStorage.getItem('refresh_token');
  const userId = localStorage.getItem('userId');
  const timeLeft = tokenExpirationTimeLeft();

  const response = await fetch(
    FIREBASE_FUNCTIONS_URL + '/refresh_token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken, userId: userId })
    }
  );
  ;
  const data = await response.json();

  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    // alert("Token refreshed successfully!");

    if (timeLeft < 1) {
      // window.location.reload();
    }

  } else {
    console.error("Failed to refresh token:", data);
    alert("Failed to refresh token. See console for details.");
  }

  return data;
};

const getAccessTokenByAuthorizationCode = async (code) => {

  const response = await fetch(
    FIREBASE_FUNCTIONS_URL + '/access_token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        code: code,
        code_verifier: localStorage.getItem('code_verifier'),
        redirect_uri: REDIRECT_URI
      })
    }
  );

  ;
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);

    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }

  } else {
    console.error("Failed to refresh token:", data);
    alert("Failed to refresh token. See console for details.");
  }
  return data;
}

const savePlaylistInfo = async (playlist, name, description, isPublic = true, isCollaborative = true) => {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}`;
 debugger;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      description: description,

    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update playlist: ${errorData.error.message}`);
  }

  return response;
};


const createPlaylist = async (name, description) => {
  const userId = localStorage.getItem('userId');
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      description: description,
      public: false,
    }),
  });

  var data = await response.json();

  let newPl = {
    id: data.id,
    name: name,
    description: description,
    tracks: [],
    type: "playlist",
    images: data.images,
    snapshot_id: data.snapshot_id,
    count: 0,
    uri: data.uri,
    type: "playlist",
    owner_id: userId,
    public: data.public,
    collaborative: data.collaborative,
    shuffle: 0
  }

  if (response.ok) {
    return newPl;
  } else {
    return null;
  }

};



const deletePlaylist = async (playlist) => {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/followers`;

  debugger;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json"
    }
  });

  debugger;
  if (!response.ok) {
    errorHandler();
    const error = await response.json();
    console.error("Failed to delete/unfollow playlist:", error);
    return null;
  }

  return { ok: true };
};

const unfollowAlbum = async (album) => {
  const url = `https://api.spotify.com/v1/me/albums?ids=${album.id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    errorHandler();
    const error = await response.json();
    console.error("Failed to unfollow album:", error);
    return null;
  }

  return { ok: true };
};

const followAlbum = async (album) => {
  const url = `https://api.spotify.com/v1/me/albums?ids=${album.id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    errorHandler();
    const error = await response.json();
    console.error("Failed to follow album:", error);
    return null;
  }

  return { ok: true };
};



const unfollowArtist = async (artist) => {
  const url = `https://api.spotify.com/v1/me/following?type=artist&ids=${artist.id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    errorHandler();
    const error = await response.json();
    console.error("Failed to unfollow artist:", error);
    return null;
  }

  return { ok: true };
};



export default {
  getToken,
  shouldRefreshToken,
  tokenExpirationTimeLeft,
  getAuthUrl,
  search,
  playTrack,
  getPlaylists,
  getTracks,
  getRecentTracks,
  getTopTracks,
  getRecommendations,
  fetchPlaylistsAndTracks,
  getFullPlaylists,
  updateLibrary,
  addTrackToPlaylist,
  addTracksToPlaylist,
  removeTrackFromPlaylist,
  refreshAccessToken,
  getAccessTokenByAuthorizationCode,
  getAlbums,
  getFullAlbums,
  getArtistTopTracks,
  getArtistAlbums,
  getAlbumTracks,
  getArtistInfo,
  changeTrackPosition,
  savePlaylistInfo,
  createPlaylist,
  deletePlaylist,
  unfollowAlbum,
  unfollowArtist,
  searchAlbums,
  followAlbum,
  simplifiPlaylist,
  simplifiAlbum,
};


