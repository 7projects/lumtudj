
import { generateRandomString, generateCodeChallenge } from './pkceUtils';

const BASE_URL = 'https://api.spotify.com/v1';

const getToken = () => {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  let accessToken = getToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });

  debugger;
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Spotify API error');
  }

  return response.json();
}

let codeVerifierGlobal = '';

const getAuthUrl = async () => {
  const clientId = '6b690613cc6d481d97a3b75c2c0cf947';
  const redirectUri = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://vsprojects.net';

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

  ];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};


const search = async (query) => {
  let data = await request(`/search?q=${query}&type=track`);
  return data.tracks.items;
};

const getPlaylists = async () => {
  // let data = await request('/me/playlists');

  let playlists = [];

  let url = 'https://api.spotify.com/v1/me/playlists?limit=50';

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (!response.ok) throw new Error('Failed to fetch playlists');

    const data = await response.json();

    const simplified = data.items.map(item => ({
      id: item.id,
      name: item.name,
      count: item.tracks.total,     // total number of tracks
      images: item.images,          // array of image objects
      tracks: [],                   // you can fill this later with actual track data
      uri: item.uri
    }));

    playlists.push(...simplified);

    url = data.next; // Spotify gives the next page URL, or null
  }

  //remove from playlists where name = 'My Shazam Tracks'
  // playlists = playlists.filter(playlist => playlist.name !== 'My Shazam Tracks');

  return playlists;
};

const getTracks = async (playlistID) => {
  let tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?limit=100`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (!response.ok) throw new Error(`Failed to fetch tracks for playlist ${playlistID}`);

    const data = await response.json();
    tracks.push(...data.items.map(item => item.track));
    url = data.next;
  }

  return tracks;
};

const getFullPlaylists = async (callback) => {
  const playlists = await getPlaylists();
  return await updatePlaylists(playlists, callback);
};

const updatePlaylists = async (playlists, callback) => {
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


const getTopTracks = async () => {
  let data = await request('/me/top/tracks?limit=30&time_range=long_term');
  return data.items;
};

const getRecentTracks = async () => {
  let data = await request('/me/player/recently-played?limit=30');
  return data.items.map(item => item.track);
};

const getRecommendations = async (track) => {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  const limit = 10; // Number of recommendations to return
  async function fetchJSON(url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} for ${url}`);
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
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [track.uri], // example: ['spotify:track:4uLU6hMCjMI75M1A2tKUQC']
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to add track:', error);
  } else {
    console.log('Track added successfully!');
  }
};

const removeTrackFromPlaylist = async (playlist, track) => {
  const url = `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
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
    const error = await response.json();
    console.error('Failed to add track:', error);
  } else {
    console.log('Track removed successfully!');
  }
};

const refreshAccessToken = async () => {
  alert("Refreshing token...");

  const refreshToken = localStorage.getItem('refresh_token');
  const clientId = '6b690613cc6d481d97a3b75c2c0cf947';

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const data = await response.json();

  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    alert("Token refreshed successfully!");
  } else {
    console.error("Failed to refresh token:", data);
    alert("Failed to refresh token. See console for details.");
  }
};

export default {
  getToken,
  getAuthUrl,
  search,
  getPlaylists,
  getTracks,
  getRecentTracks,
  getTopTracks,
  getRecommendations,
  fetchPlaylistsAndTracks,
  getFullPlaylists,
  updatePlaylists,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  refreshAccessToken
};


