import logo from './logo.svg';

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Player from './components/player';
import TrackRow from './components/trackRow';
import api from './Api';
import PlaylistRow from './components/playlistRow';
import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid } from './util';
import { faL, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';
import { savePlaylists, loadPlaylists, saveBackgroundPlaylists, loadBackgroundPlaylists, addToHistory, getHistory, saveAlbums, loadAlbums, clearDatabase } from './database';

import Settings from '@mui/icons-material/Settings';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from './components/snackbar';
import { AddAlertRounded, AlignVerticalCenterTwoTone, Timelapse } from '@mui/icons-material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import HistoryIcon from '@mui/icons-material/History';
import { Virtuoso } from 'react-virtuoso';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import PlaylistPicker from './components/playlistPicker';
import AlbumIcon from '@mui/icons-material/Album';
import SwipeRightIcon from '@mui/icons-material/SwipeRight';
import SpotifyPlayer from './components/spotifyPlayer';
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import Moveable from "react-moveable";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useLongPress } from 'use-long-press';

// import { unstable_Activity, Activity as ActivityStable } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

function useConstructor(callback) {
  const hasRun = useRef(false);
  if (!hasRun.current) {
    callback();
    hasRun.current = true;
  }

}

const ReorderableTrack = ({ track, forInfo, onClick, onArtistClick, onDoubleClick, onMouseDown, index, onDrop, selected, onContextMenu, playlists, forPlayer, hideImage, playing, onPlClick, id, onAddToPlaylistButton, onLongPress, onSwipedLeft, onSwipedRight }) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={track}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.05 }}
      layout="position"
      className="p-3 bg-white rounded-lg shadow flex justify-between items-center"
    >
      <table style={{ width: "100%" }} className={isMobile() ? "item-row-mobile" : "item-row"}>
        <tbody>
          <tr>
            {/* Main content cell */}
            <td style={{ width: "auto" }}>
              <TrackRow
                track={track}
                forInfo={forInfo}
                onClick={onClick}
                onArtistClick={onArtistClick}
                onDoubleClick={onDoubleClick}
                onMouseDown={onMouseDown}
                index={index}
                onDrop={onDrop}
                selected={selected}
                onContextMenu={onContextMenu}
                playlists={playlists}
                forPlaylist
                forPlayer={forPlayer}
                hideImage={hideImage}
                playing={playing}
                onPlClick={onPlClick}
                id={id}
                onAddToPlaylistButton={onAddToPlaylistButton}
                onLongPress={onLongPress}
                onSwipedLeft={onSwipedLeft}
                onSwipedRight={onSwipedRight}
              />
            </td>

            {/* Drag handle cell */}
            <td
              style={{
                width: 40,
                textAlign: "right",
                verticalAlign: "middle",
                display: isMobile() ? "table-cell" : "none",
              }}
            >

            </td>
          </tr>
        </tbody>
      </table>

    </Reorder.Item>
  );
};

function App() {
  const Activity = React.Activity ?? React.unstable_Activity ?? (() => null);

  const urlParams = new URLSearchParams(window.location.search)
  const [token, setToken] = useState(localStorage.getItem("token"));
  // const [token, setToken] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const [albums, setAlbums] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);

  const [selectedTrack, setSelectedTrack] = useState();
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(-1);

  const [selectedPlaylistTrack, setSelectedPlaylistTrack] = useState([]);
  const [selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex] = useState(-1);

  const [selectedPlaylist, setSelectedPlaylist] = useState({ name: "pl", tracks: [] });
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(-1);

  const [dragTrack, setDragTrack] = useState([]);
  const [dragTrackIndex, setDragTrackIndex] = useState();
  const [dragSource, setDragSource] = useState();

  const [trackCounts, setTrackCounts] = useState({});
  const [track, setTrack] = useState({});
  const [searchText, setSearchText] = useState();
  const [playlistsFilterText, setPlaylistsFilterText] = useState();

  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingPlaylistsText, setLoadingPlaylistsText] = useState(false);
  const [loadingToken, setLoadingToken] = useState(urlParams.get('code') ? true : false);

  const [showplaylistPicker, setShowPlaylistPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const [playPosition, setPlayPosition] = useState(null);
  const [playIndex, setPlayIndex] = useState(null);
  const [playState, setPlayState] = useState(null);

  const [backgroundPlaylists, setBackgroundPlaylists] = useState([]);

  const [mode, setMode] = useState(localStorage.getItem("mode") ? localStorage.getItem("mode") : "normal");

  const [code, setCode] = useState(null);

  const [tab, setTab] = useState("1");

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [locked, setLocked] = useState(false);

  const [showingPlaylistPicker, setShowingPlaylistPicker] = useState(false);

  // const [albumsScrollTop, setAlbumsScrollTop] = useState(0);

  // const [tracksScrollTop, setTracksScrollTop] = useState(0);

  // const [playlistsScrollTop, setPlaylistsScrollTop] = useState(0);

  // const [playlistScrollTop, setPlaylistscrollTop] = useState(0);

  const inputBuffer = useRef();

  const [time, setTime] = useState();

  const intervalRef = useRef();

  let timer = null;

  const TIME_LIMIT = 5000; // 5 seconds

  const longPressHandler = useLongPress(
    (e) => {
      e.preventDefault();      // 👈 blocks the synthetic click after touchend
      e.stopPropagation();     // 👈 prevents bubbling
      window.location.href = 'intent://#Intent;package=com.shazam.android;scheme=shazam;end';
    },
    {
      // extra safety: cancel synthetic click entirely
      captureEvent: true,       // ensures we get the raw event
      cancelOnMovement: true,   // prevents misfires when finger moves
    }
  );

  function formatTime(ms) {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function startTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);

    let user = localStorage.getItem("userId");
    let token = localStorage.getItem("token");

    intervalRef.current = setInterval(async () => {
      setTime(formatTime(api.tokenExpirationTimeLeft()));
      if (api.shouldRefreshToken() && token && user) {
        clearInterval(intervalRef.current);
        // alert("Token is about to expire, refreshing...1");
        await refreshAccessToken();
        startTimer();
      }
    }, 1000);
  }

  useEffect(() => {
    // cleanup on unmount
    return () => clearInterval(intervalRef.current);
  }, []);


  useEffect(() => {
    if (!intervalRef.current)
      startTimer();

  }, [token]);

  const getPlaylistsAndAlbums = async () => {


    const cachedPlaylists = await loadPlaylists(); // Load back
    const cachedAlbums = await loadAlbums(); // Load back

    // if (!cached.some(playlist => playlist.name == "lastlistened")) {
    //   cached.unshift({
    //     id: "lastlistened",
    //     name: "last listened",
    //     tracks: []
    //   })
    // }

    if (cachedPlaylists && cachedPlaylists.length > 0) {
      setPlaylists([...cachedPlaylists]);
      setFilteredPlaylists([...cachedPlaylists]);
    }

    if (cachedAlbums && cachedAlbums.length > 0) {
      setAlbums(cachedAlbums);
    }

    if (cachedPlaylists == null || cachedPlaylists.length == 0) {
      updatePlaylists();
      return;
    }

    if (cachedAlbums == null || cachedAlbums.length == 0) {
      updatePlaylists();
      return;
    }

  };


  const getBackgroundPlaylists = async () => {

    const cached = await loadBackgroundPlaylists(); // Load back

    if (cached && cached.length > 0) {
      setBackgroundPlaylists(cached);

      return cached;
    }

    return [];
  };

  useConstructor(async () => {

    // Handle back/forward navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash == "tab1") {
        setTab("1");
      }

      if (hash == "tab2") {
        setTab("2");
      }
      if (hash == "tab3") {
        setTab("3");
      }
    });

    if (playlists.length == 0) {
      getPlaylistsAndAlbums();
    }

    document.addEventListener('keydown', function (e) {
      // F5 key
      if (e.key === 'F5') {
        e.preventDefault();
      }

      // F11 key
      if (e.key === 'F11') {
        e.preventDefault();
      }

      // Ctrl+R (or Cmd+R on macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
      }
    });

    getBackgroundPlaylists();

  });

  const playerError = async (error) => {
    alert("Player error: ");
  }


  const [reconnecting, setReconnecting] = useState(false);

  const refreshAccessToken = async () => {
    setReconnecting(true);
    let data = await api.refreshAccessToken();
    setReconnecting(false);
    if (data.access_token) {
      setToken(data.access_token);
    }
  }

  const handleLockKeyDown = (event) => {

    if (!isLocked()) return; // ignore input if already unlocked

    // Start timer on first keypressdin
    if (!timer) {
      timer = setTimeout(() => {
        console.log('Timeout: incorrect or incomplete password');
        resetInput();
      }, TIME_LIMIT);
    }

    let ib = inputBuffer.current;
    if (ib) {
      ib += event.key;
    }
    else {
      ib = event.key;
    }

    inputBuffer.current = ib;
    let pass = localStorage.getItem("lockpass");

    console.log(ib);
    if (ib.includes(pass)) {

      inputBuffer.current = "";
      unlock();
    }
  }

  function resetInput() {
    inputBuffer.current = "";
    clearTimeout(timer);
    timer = null;
  }

  const changeTheme = () => {
    if (localStorage.getItem("theme") == "blue") {
      localStorage.setItem("theme", "light");
      loadThemeCSS("light");
      return;
    }

    if (localStorage.getItem("theme") == "light") {
      localStorage.setItem("theme", "spotify");
      loadThemeCSS("spotify");
      return;
    }

    if (localStorage.getItem("theme") == "spotify") {
      localStorage.setItem("theme", "mono");
      loadThemeCSS("mono");
      return;
    }

    if (localStorage.getItem("theme") == "mono") {
      localStorage.setItem("theme", "slate");
      loadThemeCSS("slate");
      return;
    }

    if (localStorage.getItem("theme") == "slate") {
      localStorage.setItem("theme", "blue");
      loadThemeCSS("blue");
      return;
    }

    loadThemeCSS("spotify");
    localStorage.setItem("theme", "spotify");

  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.pageX, y: e.pageY });
  };

  const closeMenu = () => {
    setMenuPosition(null);
  };

  // const fetchTokens = async (code) => {

  //   const verifier = localStorage.getItem('code_verifier');

  //   const redirectUri = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://lumtudj.net';

  //   const body = new URLSearchParams({
  //     grant_type: 'authorization_code',
  //     code,
  //     redirect_uri: redirectUri,
  //     client_id: clientId,
  //     code_verifier: verifier
  //   });

  //   const response = await fetch('https://accounts.spotify.com/api/token', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     body
  //   });

  //   const data = await api.getAccessTokenByAuthorizationCode

  //   if (data.access_token) {
  //     console.log('New ccess token:', data.access_token);
  //     setToken(data.access_token);
  //     localStorage.setItem('token', data.access_token);
  //     localStorage.setItem('refresh_token', data.refresh_token);
  //     localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
  //     window.history.replaceState({}, document.title, '/');

  //     return data;
  //   }

  //   return null
  // };

  const toggleMode = () => {
    let m = mode === "normal" ? "compact" : "normal";
    localStorage.setItem("mode", m);
    setMode(m);
  }

  useEffect(() => {
    if (inputRef && inputRef.current) {
      // inputRef.current.focus();
    }
  }, [tab])


  const handleStorage = (e) => {
    if (e.key === "refreshTokenTrigger") {
      // re-run your refresh logic
      alert("storage");
    }
  };

  useEffect(() => {

    //prvi
    const handle = async () => {


      // const existingScript = document.getElementById('spotify-player');
      // if (!existingScript) {
      //   const script = document.createElement('script');
      //   script.id = 'spotify-player';
      //   script.src = 'https://sdk.scdn.co/spotify-player.js';
      //   script.async = true;
      //   document.body.appendChild(script);
      // }
      // alert("use effect app");
      // window.onSpotifyWebPlaybackSDKReady = () => {
      //   alert("init player");
      //   setPlaybackSDKReady(true);
      // };

      document.removeEventListener('keydown', handleLockKeyDown);
      document.addEventListener('keydown', handleLockKeyDown);

      let lckd = localStorage.getItem("lockpass")
      if (lckd == null || lckd == undefined || lckd == "") {
        localStorage.setItem("lockpass", "dinamo");
      }

      const theme = localStorage.getItem("theme");
      if (theme) {

        loadThemeCSS(theme);
      } else {

        loadThemeCSS("mono");
      }

      const oldCode = localStorage.getItem('code');
      const newCode = urlParams.get('code');
      let data = {};
      if (newCode)
        if (oldCode && oldCode == newCode) {
          return;
        }

      if (!newCode)
        return;

      localStorage.setItem('code', newCode);

      if (newCode) {

        if (newCode != code) {

          setCode(newCode);
          data = await api.getAccessTokenByAuthorizationCode(newCode);
          const oldUserId = localStorage.getItem('userId');
          if (data.userId && oldUserId != data.userId) {
            localStorage.setItem('userId', data.userId);
            // new user, clear local cache
            await clearDatabase();
          }


          //brišemo iz adress url /?code=wr4ri489f9334....
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location = "/#tab1";
          setToken(data.access_token)
          setLoadingToken(false);
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }
          ;
        }
      } else {

        const expiresAt = localStorage.getItem('token_expiry');
        if (expiresAt && Date.now() > expiresAt) {

          // let data = await api.refreshAccessToken();
          // if (data.access_token)
          //   setToken(data.access_token);

        } else {

          setToken(localStorage.getItem("token"));
        }
      }

      let access_token = localStorage.getItem("token");

      // Parse URL hash manually
      const hash = window.location.hash;
      if (hash && hash !== "#tab1") {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');

        if (accessToken) {
          setToken(accessToken);
          window.localStorage.setItem("token", accessToken);
          window.history.replaceState({}, document.title, '/'); // Clean URL
          if (playlists.length == 0) {

            getPlaylistsAndAlbums();
            getBackgroundPlaylists();
          }
        }
      }
      else {
        if (access_token) {
          if (playlists.length == 0) {

            getPlaylistsAndAlbums();
            getBackgroundPlaylists();
          }
        }
      }
    }

    handle();

  }, [code]);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && searchText.trim()) {


      search(searchText);
      e.preventDefault();
      if (inputRef && inputRef.current)
        inputRef.current.blur();
    }
  };

  const search = async (query) => {
    setSelectedPlaylistIndex(null);
    setLoadingTracks(true);
    const data = await api.search(query);
    setTracks(data);
    setLoadingTracks(false);
  };

  const handleLogin = async () => {
    setLoadingToken(true);
    window.location = await api.getAuthUrl();
  };

  const logout = () => {
    setToken("");
    if (intervalRef.current) clearInterval(intervalRef.current);
    window.localStorage.clear();
  };

  const updatePlaylists = async () => {

    setLoadingPlaylists(true);

    try {
      const plsts = await api.getFullPlaylists((i, l) => setLoadingPlaylistsText("LOADING PLAYLISTS " + i + "/" + l));
      savePlaylists(plsts);
      setPlaylists(plsts);
      setFilteredPlaylists(plsts);

      const albms = await api.getFullAlbums((i, l) => setLoadingPlaylistsText("LOADING ALBUMS " + i + "/" + l));
      saveAlbums(albms);
      setAlbums(albms);

      setLoadingPlaylistsText("LOADING PLAYLISTS...")
      setLoadingPlaylists(false);
    }
    catch {
      //go to login page
      setToken("");
    }

  }

  const checkForUpdates = async () => {
    const cached = await loadPlaylists(); // Load back
    const fresh = await api.getPlaylists();

    let { toUpdate, deleted } = getPlaylistsToUpdate(cached, fresh);

    if (toUpdate.length > 0) {
      // alert("Playlists to update: " + toUpdate.map(p => p.name).join(", "));

      //ipnut box to confirm update
      const confirmUpdate = window.confirm("Playlists to update: " + toUpdate.map(p => p.name).join(", ") + ". Do you want to update the playlists?");
      if (confirmUpdate) {
        setLoadingPlaylists(true);
        setLoadingPlaylistsText("UPDATING PLAYLISTS...");
        const updatedPlaylists = await api.updatePlaylists(toUpdate, (i, l) => setLoadingPlaylistsText("UPDATING PLAYLISTS " + i + "/" + l));

        // Update the cached playlists with the new data from browser
        for (const pl of playlists) {
          const updatedPl = updatedPlaylists.find(p => p.id === pl.id);
          if (updatedPl) {
            pl.images = updatedPl.images;
            pl.count = updatedPl.tracks.length;
            pl.name = updatedPl.name;
            for (const tr of updatedPl.tracks) {
              const oldtr = pl.tracks.find(t => t.id === tr.id);
              if (oldtr) {
                tr.datePlayed = oldtr.datePlayed; // Preserve datePlayed
              }
            }
          }
        }

        savePlaylists(updatedPlaylists);

        await getPlaylistsAndAlbums(); // Reload playlists from IndexedDB

        setLoadingPlaylists(false);
      }

    } else {
      alert("All playlists are up to date");
    }

    if (deleted.length > 0) {
      alert("Playlists deleted: " + deleted.map(p => p.name).join(", "));
    }


  }

  function getPlaylistsToUpdate(cached, fresh) {
    const cachedMap = new Map();
    cached.forEach(p => cachedMap.set(p.id, p));

    const freshMap = new Map();
    fresh.forEach(p => freshMap.set(p.id, p));

    const toUpdate = [];
    const deleted = [];

    // Detect new or changed playlists
    for (const p of fresh) {
      const cachedPlaylist = cachedMap.get(p.id);

      const isNew = !cachedPlaylist;
      const nameChanged = cachedPlaylist?.name !== p.name;
      const countChanged = cachedPlaylist?.count !== p.count;

      if (isNew || nameChanged || countChanged) {
        toUpdate.push(p);
      }
    }

    // Detect deleted playlists
    for (const cachedItem of cached) {
      if (!freshMap.has(cachedItem.id)) {
        toUpdate.push(cachedItem);
      }
    }

    return { toUpdate, deleted };
  }

  const getTracks = async (playlistID) => {
    setLoadingTracks(true);
    setSelectedTrackIndex(-1);
    setTracks([]);

    setTimeout(() => {
      loadTracksFromState(playlistID);
    }, 200);
  }

  const loadTracksFromState = async (playlistID) => {
    const pl = playlists.find(p => p.id === playlistID);
    if (pl && pl.tracks.length) {
      setTracks(pl.tracks);
      setLoadingTracks(false);
    } else {
      ;
      const albs = albums.find(p => p.id === playlistID);
      setTracks(albs.tracks);
      setLoadingTracks(false);
    }
  }

  const getTopTracks = async () => {
    setLoadingTracks(true);
    const tracks = await api.getTopTracks();
    setTracks(tracks);
    setLoadingTracks(false);
  };

  const getRecommendations = async () => {
    setLoadingTracks(true);
    const tracks = await api.getRecommendations(track);
    setTracks(tracks);
    setLoadingTracks(false);
  };

  const getRecentTracks = async () => {
    setLoadingTracks(true);
    const tracks = await api.getRecentTracks();
    setTracks(tracks);
    setLoadingTracks(false);
  }

  const allowDrop = (e) => e.preventDefault();

  const addToPlaylist = (track, position) => {

    let newTrack = { ...track };

    if (isMobile())
      flyToPlaylist(newTrack);

    let pl = [...playlistTracks];
    if (dragSource == "playlist") {
      if (locked) {
        return
      } else {
        pl.splice(dragTrackIndex, 1);
      }
    }

    newTrack.uid = newGuid();

    if (position || position == 0) {
      pl.splice(position, 0, newTrack);
      setPlaylistTracks(pl);
    }
    else {
      pl.push(newTrack);
      setPlaylistTracks(pl);
    }

    // if (isMobile()) {
    //   setSnackbarMessage("Added to  queue");
    // }

    console.log(pl);
  };

  const addPlaylistToToPlaylist = (pl) => {
    if (isMobile())
      flyToPlaylist(pl);



    pl.tracks.map(x => x.uid = newGuid());

    let pls = [...playlistTracks, ...pl.tracks];
    setPlaylistTracks(pls);
  };

  const addToSpotifyPlaylist = async (pl, bulbOn) => {

    if (showingPlaylistPicker) {
      setShowingPlaylistPicker(false);
      return;
    }
    // console.log(pl);
    // console.log(selectedTrack);
    // console.log(bulbOn);
    if (pl.id && selectedTrack) {
      if (bulbOn) {
        await api.removeTrackFromPlaylist(pl, selectedTrack);
        pl.tracks = pl.tracks.filter(x => x.id != selectedTrack.id);
      } else {
        await api.addTrackToPlaylist(pl, selectedTrack);
        pl.tracks.push(selectedTrack);
      }

      let pls = [...playlists];
      let p = pls.find(x => x.id == pl.id);
      pl.count = pl.tracks.length;
      p = pl;
      setPlaylists(pls);
      savePlaylists(pls);
    }
  }

  const addToBackgroundPlaylists = async (pl, bulbOn) => {
    let pls = [...backgroundPlaylists];
    if (bulbOn) {
      pls = pls.filter(x => x.id != pl.id);
    } else {
      if (pls.find(x => x.id == pl.id)) {
        return;
      }
      pls.push(pl);
    }
    setBackgroundPlaylists(pls);
    saveBackgroundPlaylists(pls);
  }

  const removeTrackFromSpotifyPlaylist = async () => {
    if (dragSource == "tracks") {
      if (selectedPlaylistIndex) {
        let pl = playlists[selectedPlaylistIndex];
        const tr = pl.tracks[selectedTrackIndex]
        pl.tracks.splice(selectedTrackIndex, 1);
        setSelectedTrackIndex(-1);
        await api.removeTrackFromPlaylist(pl, tr);
        let pls = [...playlists];
        pls[selectedPlaylistIndex] = pl;
        pl.count = pl.tracks.length;
        setPlaylists(pls);
        savePlaylists([pl]);
        closeMenu();
      }

    }
  }


  const removeTrackFromPlaylist = async (index, tr) => {

    if (isLocked()) return;
    //remove selectedPlaylistTrackindex from playlist


    if (isMobile()) {
      flyToPlaylist(tr);
      setTimeout(() => {
        let pl = [...playlistTracks];
        pl.splice(index, 1);
        setPlaylistTracks(pl);
        closeMenu();
      }, 250);
    } else {
      if (dragSource == "playlist") {
        let pl = [...playlistTracks];
        pl.splice(selectedPlaylistTrackIndex, 1);
        setPlaylistTracks(pl);
        closeMenu();
        return;
      }

      if (dragSource == "tracks" && selectedPlaylistIndex >= 0) {
        removeTrackFromSpotifyPlaylist();
      }

    }
  }

  //   //remove selectedPlaylistTrackindex from playlist
  // if (!isMobile() && dragSource == "playlist") {
  //   let pl = [...playlist];
  //   pl.splice(selectedPlaylistTrackIndex, 1);
  //   setPlaylistTracks(pl);
  //   closeMenu();
  // }

  const isLocked = () => {
    let l = localStorage.getItem("locked") == "true";
    setLocked(l);
    return l;
  }

  const lock = () => {
    localStorage.setItem("locked", true);
    setLocked(true);
  }

  const unlock = () => {

    localStorage.setItem("locked", false);
    setLocked(false);
  }

  const onPlaylistTrackDoubleClick = (tr, index) => {

    if (isLocked()) { return; }

    play(tr);
    setPlayPosition("playlist");
    setPlayIndex(index);
  }

  const playerStateChanged = (state) => {


    if (playState != state) {
      setPlayState(state);
    }

    // if (state == "trackEnded") {
    //   nextTrack();
    // }
  }

  const play = async (track) => {

    // alert("play");

    console.log(track);
    if (api.shouldRefreshToken()) {
      await refreshAccessToken();
    }

    // startUniverse();
    addToHistory(track);
    setTrack(track);
    setSelectedTrack(track);
    let pls = playlists.filter(x => x.tracks.some(x => x.id == track.id));
    for (const pl of pls) {
      const trs = pl.tracks.filter(x => x.id == track.id);
      for (const tr of trs) {
        tr.datePlayed = new Date();
      }
    }

    if (backgroundPlaylists && backgroundPlaylists.length > 0) {
      pls = backgroundPlaylists.filter(x => x.tracks.some(x => x.id == track.id));
      for (const pl of pls) {
        const trs = pl.tracks.filter(x => x.id == track.id);
        for (const tr of trs) {
          tr.datePlayed = new Date();
        }
      }
    }


    await savePlaylists(pls);
    getPlaylistsAndAlbums();

  }

  function flyToPlaylist(track) {
    requestAnimationFrame(() => {
      let element = document.getElementById("tr" + track.id);


      debugger;
      if (!element)
        element = document.getElementById("tr" + track.uid);

      if (!element)
        element = document.getElementById(track.uid);

      if (!element) return;

      const clone = element.cloneNode(true);
      const rectStart = element.getBoundingClientRect();
      const player = document.getElementById('playlistButton');
      const rectEnd = player.getBoundingClientRect();

      clone.style.position = 'fixed';
      clone.style.left = rectStart.left + 'px';
      clone.style.top = rectStart.top + 'px';
      clone.style.width = rectStart.width + 'px';
      clone.style.height = rectStart.height + 'px';
      clone.style.zIndex = 9000;
      clone.style.transition = 'all 1s ease-out';

      document.body.appendChild(clone);

      requestAnimationFrame(() => {
        clone.style.left = rectEnd.left + 'px';
        clone.style.top = rectEnd.top + 'px';
        clone.style.opacity = 0;
        clone.style.transform = 'scale(0.5)';
      });

      clone.addEventListener('transitionend', () => {
        clone.remove();
      });
    });
  }


  function flyToPlayer(track) {

    let element = document.getElementById(track.id + "0");
    if (!element)
      return;

    const clone = element.cloneNode(true);
    const rectStart = element.getBoundingClientRect();
    const player = document.querySelector('.player');
    const rectEnd = player.getBoundingClientRect();

    clone.style.position = 'fixed';
    clone.style.left = rectStart.left + 'px';
    clone.style.top = rectStart.top + 'px';
    clone.style.width = rectStart.width + 'px';
    clone.style.height = rectStart.height + 'px';

    clone.style.zIndex = 1000;
    clone.style.transition = 'all 1s ease-out';
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = rectEnd.left + 'px';
      clone.style.top = rectEnd.top + 'px';
      clone.style.opacity = 0;
      clone.style.transform = 'scale(0.5)';
    });

    clone.addEventListener('transitionend', () => {
      clone.remove();
      // Optional: trigger player update here
    });
  }

  const nextTrack = async (cached) => {
    // if (playPosition == "playlist") {
    //   setPlayIndex(playIndex + 1);
    //   play(playlist[playIndex + 1]);
    // }

    const bpl = cached ? cached : await loadBackgroundPlaylists();


    if (playlistTracks.length > 0) {
      let pl = [...playlistTracks];


      flyToPlayer(pl[0]);


      play(pl[0]);

      pl.shift();
      setPlaylistTracks(pl);
      return;
    }



    if (bpl.length == 0) {
      // alert("random Playlist is empty");
      return;
    }


    //const plsDB = await loadPlaylists();
    const plsDB = bpl;
    const pls = plsDB.filter(x => bpl.some(y => y.id == x.id));

    // if(pls.length == 0){
    //   const albDB = await loadAlbums();
    //   pls = plsDB.filter(x => bpl.some(y => y.id == x.id));
    // }


    const randomPlIndex = Math.floor(Math.random() * pls.length);
    const pl = pls[randomPlIndex];

    if (pl.tracks.length == 0) {
      // alert("random Playlist is empty");
      return;
    }


    let randomTrIndex = Math.floor(Math.random() * pl.tracks.length);
    let tr = pl.tracks[randomTrIndex];
    const notPlayed = pl.tracks.filter(x => !x.datePlayed);
    if (notPlayed.length > 0) {
      randomTrIndex = Math.floor(Math.random() * notPlayed.length);
      tr = notPlayed[randomTrIndex];
    } else {
      const orderedTracks = pl.tracks.sort((a, b) => new Date(a.datePlayed) - new Date(b.datePlayed));
      //set randomIndex from first half of orderedTracks
      randomTrIndex = Math.floor(Math.random() * orderedTracks.length / 2);
      tr = orderedTracks[randomTrIndex];
    }


    randomTrIndex = pl.tracks.indexOf(tr);



    play(pl.tracks[randomTrIndex]);
  }


  const myShazamTracksPlIcon = <svg fill="white" width="30px" height="30px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
  </svg>;

  const myShazamTracksPlIconMobile = <svg fill="white" width="24px" height="24px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
  </svg>;

  const lastListenedPlIcon = <svg fill="white" width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,24C5.4,24,0,18.6,0,12h2c0,5.5,4.5,10,10,10s10-4.5,10-10S17.5,2,12,2C8.4,2,5.1,3.9,3.3,7H8v2H0V1h2v4.4
     C4.2,2.1,8,0,12,0c6.6,0,12,5.4,12,12S18.6,24,12,24z M15.3,17.8L11,13.4V6h2v6.6l3.7,3.8L15.3,17.8z"/>
  </svg>;

  const myShazamTracksPl = {
    id: "MyShazamedTracks",
    count: 0,
    name: "My shazamed tracks",
    total: 0,
    tracks: []
  }

  const lastListenedPl = {
    id: "LastListened",
    count: 0,
    name: "Last listened",
    total: 0,
    tracks: []
  }

  const onLongPress = (pl, onof) => {
    setBackgroundPlaylists([pl]);
    saveBackgroundPlaylists([pl]);
    setTimeout(() => {
      nextTrack([pl]);
    }, 400);
  }

  const setCurrentTab = (t) => {
    window.location.hash = "tab" + t;
    setTab(t);
  }

  const onPlaylistFilterChange = async (text) => {
    setPlaylistsFilterText(text);
    //filter playlists by text
    let allPlaylists = [...playlists];
    if (text.trim() == "") {
      setFilteredPlaylists(allPlaylists);
    } else {
      const filtered = allPlaylists.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredPlaylists(filtered);
    }
  }

  const getPlaylistsPanel = () => {
    return <>
      {isMobile() && false ?
        <>
          <PlaylistRow icon={myShazamTracksPlIcon} playlist={myShazamTracksPl} onClick={() => { getMyShazamTracks(); setCurrentTab(2); setSearchText("My Shazam Tracks") }} />
          <PlaylistRow icon={lastListenedPlIcon} playlist={lastListenedPl} onClick={() => { getLastListened(); setCurrentTab(2); setSearchText("Last listened tracks") }} />
          {/* <div className='playlist-divider-playlists'>PLAYLISTS</div> */}
        </> : null}

      {!isMobile() || true ? <div className="input-search-wrapper">

        <input ref={inputRef} className="panel-input-search" placeholder="filter library..." onFocus={(e) => e.target.select()} value={playlistsFilterText} onChange={(e) => onPlaylistFilterChange(e.target.value)} />
      </div> : null}

      <Virtuoso
        className={isMobile() ? 'panel-playlists-mobile' : "panel-playlists"}
        style={{ marginTop: 5 }}
        totalCount={filteredPlaylists.length}
        // initialTopMostItemIndex={playlistsScrollTop}
        // rangeChanged={(range) => {
        //   setPlaylistsScrollTop(range.startIndex);
        // }}
        itemContent={(index) => {
          const p = filteredPlaylists[index];
          return isMobile() ?
            <PlaylistRow onSwipedRight={() => { addPlaylistToToPlaylist(p) }} id={"tr" + p.id} onBulbCheckClick={addToSpotifyPlaylist} onLongPress={(pl, onof) => { onLongPress(pl, onof) }} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { loadPlaylistPrev(p); setSelectedPlaylistIndex(index) }} />
            :
            <PlaylistRow onSwipedRight={() => { addPlaylistToToPlaylist(p) }} id={"tr" + p.id} onBulbCheckClick={addToSpotifyPlaylist} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { getTracks(p.id); setSelectedPlaylistIndex(index); setSelectedTrack(null); }} />
        }}
      />


      {/* {playlists.map((p, index) => (
        <div key={"pl" + index}>
          {
            isMobile() ?
              <PlaylistRow onBulbCheckClick={addToSpotifyPlaylist} onLongPressShuffle={(pl, onof) => { onLongPressShuffle(pl, onof) }} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { setCurrentTab("2"); getTracks(p.id); setSearchText(p.name); setSelectedPlaylistIndex(index) }} />
              :
              <PlaylistRow onBulbCheckClick={addToSpotifyPlaylist} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { getTracks(p.id); setSelectedPlaylistIndex(index); setSelectedTrack(null); }} />
          }

        </div>
      ))}
      <div className='playlist-divider-albums'>ALBUMS</div> */}
    </>
  }

  const getAlbumsPanel = () => {
    return <Virtuoso
      className={isMobile() ? 'hideScrollbar' : ""}
      style={{ height: '100%' }}
      totalCount={albums.length}
      // initialTopMostItemIndex={albumsScrollTop}
      // rangeChanged={(range) => {
      //   setAlbumsScrollTop(range.startIndex);
      // }}
      itemContent={(index) => {
        const p = albums[index];
        return isMobile() ?
          <PlaylistRow id={"tr" + p.id} onSwipedRight={() => addPlaylistToToPlaylist(p)} album onBulbCheckClick={addToSpotifyPlaylist} onLongPress={(pl, onof) => { onLongPress(pl, onof) }} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { setCurrentTab("2"); getTracks(p.id); setSearchText(p.name); setSelectedPlaylistIndex(index) }} />
          :
          <PlaylistRow id={"tr" + p.id} onSwipedRight={() => addPlaylistToToPlaylist(p)} album onBulbCheckClick={addToSpotifyPlaylist} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { getTracks(p.id); setSelectedPlaylistIndex(index); setSelectedTrack(null); }} />

      }}
    />
  }

  const onTrackLongPress = (track, e) => {
    setSelectedTrack(track)
    setShowingPlaylistPicker(true);
    setShowPlaylistPicker(true);
    e.stopPropagation();
    e.preventDefault();
    setTimeout(() => {
      setShowingPlaylistPicker(false);
    }, 400);
  }

  const onTrackSwippedRight = (track) => {
    setSelectedTrack(track)
    setShowPlaylistPicker(true);
  }

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = tracks.findIndex((i) => i.id === active.id);
      const newIndex = tracks.findIndex((i) => i.id === over.id);
      setTracks((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  }

  const getTracksPanel = () => {
    return loadingTracks ? <div className='loader'></div> : <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={(tracks || []).map((i) => i.id)} strategy={rectSortingStrategy}>
          <Virtuoso
            style={{ height: '100%' }}
            totalCount={tracks.length}
            itemContent={(index) => {
              const tr = tracks[index];
              if (!tr) return null;

              return isMobile() ?
                <SortableItem id={tr.id} key={tr.id} value={tr.name} onSwipedRight={() => { addToPlaylist(tr) }} playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => { onPlaylistTrackDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
                <SortableItem id={tr.id} key={tr.id} playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />

            }}
          />
        </SortableContext>
      </DndContext>
    </>
  }

  function handleDragEnd2(event) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = playlistTracks.findIndex((i) => i.id === active.id);
      const newIndex = playlistTracks.findIndex((i) => i.id === over.id);
      setTracks((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  }

  const getPlaylistPanel = (pl, callback) => {
    return (
      <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd2} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={(playlistTracks || []).map((i) => i.id)} strategy={rectSortingStrategy}>
            <Virtuoso
              style={{ height: '100%' }}
              totalCount={playlistTracks.length}
              itemContent={(index) => {
                const tr = playlistTracks[index];
                if (!tr) return null;

                return isMobile() ?
                  <SortableItem id={tr.id} value={tr.name} key={tr.id} onSwipedRight={() => { addToPlaylist(tr) }} playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => { onPlaylistTrackDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
                  <SortableItem id={tr.id} value={tr.name} key={tr.id} playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />
              }}
            />
          </SortableContext>
        </DndContext>
      </>

    );
  };

  const getLastListened = async () => {

    let lastTracks = await getHistory();

    lastTracks.sort((a, b) => {
      return b.datePlayed - a.datePlayed;
    });


    setTracks(lastTracks);


    // let lastTracks = [];
    // for (const pl of playlists) {
    //   for (const tr of pl.tracks) {
    //     if (tr.datePlayed) {
    //       lastTracks.push(tr);
    //     }
    //   }
    // }

    // lastTracks.sort((a, b) => {
    //   return b.datePlayed - a.datePlayed;
    // });

    // const distinctTracks = Array.from(
    //   new Map(lastTracks.map(obj => [obj.id, obj])).values()
    // );

    // setTracks([...new Set(distinctTracks)]);

    const element = document.getElementById('panel-main');
    if (element && element.scrollTop)
      element.scrollTop = 0;
  }

  const getMyShazamTracks = async () => {

    setLoadingTracks(true);
    const id = localStorage.getItem("myShazamTracksID");
    if (!id) {
      alert("Cant find My Shazam tracks id");
      return;
    }

    const tracks = await api.getTracks(id, 50);

    if (tracks)
      setTracks(tracks);

    setLoadingTracks(false);
  }

  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loadingArtistInfo, setLoadingArtistInfo] = useState(false);

  const loadArtistInfo = async (track) => {

    setLoadingArtistInfo(true);
    setSelectedArtist(null);
    const artistId = track?.artists?.[0]?.id;
    if (!artistId) return;

    const info = await api.getArtistInfo(artistId);
    const tracks = await api.getArtistTopTracks(artistId);
    const albums = await api.getArtistAlbums(artistId);

    const artist = {
      id: info.id,
      images: info.images,
      name: info.name,
      tracks: tracks,
      albums: albums
    };

    setSelectedArtist(artist);
    setLoadingArtistInfo(false);
  }

  useEffect(() => {
    if (selectedTrack) {
      // loadArtistInfo(selectedTrack);
    }
  }, [selectedTrack]);

  const inputRef = useRef(null);


  const onAlbumClick = async (album) => {
    setLoadingTracks(true);
    let tracks = await api.getAlbumTracks(album.id);
    setLoadingTracks(false);
    setTracks(tracks);
  }

  const loadPlaylistPrev = async (pl) => {
    setCurrentTab("plprev");
    pl.tracks.map((tr) => tr.uid = newGuid());
    setSelectedPlaylist(pl);
    setSelectedPlaylistTracks(pl.tracks);
  }

  return (
    <>
      <Moveable
        target={document.querySelector("#artist-info")}
        draggable={true}
        edge={false}

        edgeDraggable={false}
        startDragRotate={0}
        throttleDragRotate={0}
        renderDirections={[]}

        onDrag={e => {
          e.target.style.transform = e.transform;
        }}
      />

      {selectedArtist || loadingArtistInfo ?
        <div className='panel-dialog target' id="artist-info">
          <div className="close-btn" onClick={() => { setSelectedArtist(null); setLoadingArtistInfo(false) }}>x</div>

          {loadingArtistInfo ? <div className='loader' style={{ position: "absolute" }}></div> :
            <>
              <img className='artist-info-img' src={selectedArtist && selectedArtist.images && selectedArtist.images.length > 0 && selectedArtist.images[0].url} />
              <div className='artist-info-name'>{selectedArtist && selectedArtist.name}</div>
              <Tabs style={{ width: "100%" }}>
                <TabList className="custom-tablist">
                  <Tab className="custom-tab">
                    Top Tracks
                  </Tab>
                  <Tab className="custom-tab">
                    Albums
                  </Tab>
                </TabList>

                <TabPanel>
                  {selectedArtist && selectedArtist.tracks.map((tr, index) => {
                    return <TrackRow forInfo id={"atr" + tr.id} onAddToPlaylistButton={() => { addToPlaylist(tr) }} playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrack(tr); }} onDoubleClick={() => { if (isLocked()) { return; } setPlayIndex(index); setPlayPosition("main"); play(tr) }} />
                  })}
                </TabPanel>
                <TabPanel>
                  {selectedArtist && selectedArtist.albums.map((a, index) => {
                    return <div className="artist-info-album-row" key={"a" + a.id} onClick={() => { onAlbumClick(a) }}>
                      <img

                        className="artist-info-album-img"
                        src={a.images && a.images[2] && a.images[2].url}
                        alt={a.name}
                      />
                      <div className="artist-info-album-details">
                        <div className="artist-info-album-name">{a.name}</div>
                        <div className="artist-info-album-tracks">{a.total_tracks} tracks</div>
                        <div className="artist-info-album-year">{a.release_date}</div> {/* assuming a.year exists */}
                      </div>
                    </div>
                  })}
                </TabPanel>
              </Tabs></>}

        </div> : null}

      <Snackbar
        message={snackbarMessage}
        show={snackbarMessage}
        onClose={() => setSnackbarMessage("")}
      />

      <div
        className="reconnecting-container"
        style={{ zIndex: 99999, display: reconnecting ? "flex" : "none" }}
      >
        <div className="reconnecting-dots">
          reconnecting<span>.</span><span>.</span><span>.</span>
        </div>
      </div>

      <canvas id="field" className="universe"></canvas>

      {!token ? (

        loadingToken ?
          <div className='menu-container' style={{ height: "100vh", width: "100vw", top: "0", left: "0", position: "absolute" }}>
            <div className='loader' style={{ position: "absolute" }}></div>
          </div>
          :
          <div className='menu-container' style={{ height: "100vh" }}>
            <button style={{ fontSize: 20 }} onClick={handleLogin}>Login with Spotify</button>
          </div>

      ) : (

        isMobile() ?
          <div className='layout' onMouseDown={closeMenu}>

            <AnimatePresence>
              {showplaylistPicker ?

                <motion.div
                  key="playlistPicker"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  style={{ zIndex: 9999 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="fixed top-0 left-0 w-72 h-full bg-gray-900 text-white shadow-lg"
                >
                  <PlaylistPicker onClick={addToSpotifyPlaylist} track={selectedTrack} onSwipedLeft={() => setShowPlaylistPicker(false)} onClose={() => setShowPlaylistPicker(false)} playlists={playlists} />


                </motion.div>

                : null}
            </AnimatePresence>
            <table style={{ width: "100%", tableLayout: "fixed", borderSpacing: 3 }}>
              <tbody>
                <tr>
                  <td className={tab == 1 ? 'tab-selected' : 'tab'} onClick={() => { setCurrentTab(1) }}>
                    <PlaylistAddCheckIcon></PlaylistAddCheckIcon>
                  </td>
                  {/* <td className={tab == 1.5 ? 'tab-selected' : 'tab'} onClick={() => { setCurrentTab(1.5) }}>
                    <AlbumIcon></AlbumIcon>
                  </td> */}
                  <td className={tab == 2 ? 'tab-selected' : 'tab'} onClick={() => { setCurrentTab(2) }}>
                    <SearchIcon></SearchIcon>
                  </td>
                  {/* <td className='tab' onClick={() => { getLastListened(); setCurrentTab(2); setSearchText("Last listened tracks") }}>
                    <HistoryIcon></HistoryIcon>
                  </td>
                  <td className='tab' onClick={() => { getMyShazamTracks(); setCurrentTab(2); setSearchText("My Shazam Tracks") }}>
                    SHZM
                  </td> */}
                  <td className='tab' onClick={() => { getLastListened(); setCurrentTab(2); setSearchText("Last listened tracks") }}>
                    <HistoryIcon></HistoryIcon>
                  </td>
                  <td className='tab' {...longPressHandler()} onClick={() => { getMyShazamTracks(); setCurrentTab(2); setSearchText("My Shazam Tracks") }}>
                    {myShazamTracksPlIconMobile}
                  </td>
                  <td className={tab == 3 ? 'tab-selected' : 'tab'} onClick={() => { setCurrentTab(3) }} id="playlistButton">
                    <PlaylistPlayIcon></PlaylistPlayIcon>
                  </td>
                  <td className={tab == 4 ? 'tab-selected' : 'tab'} style={{ width: 40 }} onClick={() => { setCurrentTab(4) }}>
                    <Settings style={{ color: "white" }}></Settings>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className='tab-panel'>
                    <Activity mode={tab == "1" ? "visible" : "hidden"}>
                      <div className='panel-playlists-mobile'>
                        {loadingPlaylists ?
                          <>
                            <div className="loader-text">{loadingPlaylistsText}</div>
                            <div className='loader'>

                            </div>
                          </>
                          :
                          <>
                            {getPlaylistsPanel()}
                            {/* {getAlbumsPanel()} */}
                          </>}
                      </div>
                    </Activity>
                    <Activity mode={tab == "plprev" ? "visible" : "hidden"}>
                      <div className="input-search-wrapper">
                        <input ref={inputRef} className="panel-input-search" placeholder="filter library..." onFocus={(e) => e.target.select()} value={selectedPlaylist.name} onChange={(e) => onPlaylistFilterChange(e.target.value)} />
                      </div>
                      <div className='panel-playlist-mobile'>
                        {false ?
                          <>
                            <div className="loader-text">{loadingPlaylistsText}</div>
                            <div className='loader'>

                            </div>
                          </>
                          :
                          <>
                            {getPlaylistPanel(selectedPlaylistTracks, setSelectedPlaylistTracks)}
                            {/* {getAlbumsPanel()} */}
                          </>}
                      </div>
                    </Activity>
                    <Activity mode={tab == "1.5" ? "visible" : "hidden"}>
                      <div className='panel-playlists-mobile'>
                        {loadingPlaylists ?
                          <>
                            <div className="loader-text">{loadingPlaylistsText}</div>
                            <div className='loader'>

                            </div>
                          </>
                          :
                          <>
                            {getAlbumsPanel()}
                          </>}
                      </div>
                    </Activity>

                    <Activity mode={tab == "2" ? "visible" : "hidden"}>
                      <div className="input-search-wrapper">
                        <SearchIcon className="search-icon" />
                        <input ref={inputRef} className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={(e) => setSearchText(e.target.value)} />
                      </div>
                      <div className="panel-search-mobile">
                        {getTracksPanel()}
                      </div>
                    </Activity>

                    <Activity mode={tab == "3" ? "visible" : "hidden"}>

                      {
                        playlistTracks.length > 0 ?
                          <div className='panel-playlist-mobile'>
                            {getPlaylistPanel(playlistTracks, setPlaylistTracks)}
                          </div>
                          :
                          <div className='QueueMusicIcon' style={{ marginTop: "50%" }}>
                            <SwipeRightIcon style={{ fontSize: 50 }}></SwipeRightIcon>

                            <div style={{ fontSize: 20 }}>swipe right song<br></br> to add to queue</div>
                          </div>
                      }

                    </Activity>
                  </td>
                  {tab == 4 ? <td colSpan={6} className='tab-panel'>
                    <button style={{ float: "right" }}>{time}</button>
                    <button style={{ float: "right" }} onClick={logout}>Logout</button>
                    <button style={{ float: "right" }} onClick={changeTheme}>Change theme</button>
                    <button style={{ float: "right" }} onClick={fullscreen}>Fullscreen</button>
                    <button onClick={checkForUpdates}>Check for updates</button>
                    <button onClick={refreshAccessToken}>refresh at</button>
                    <button onClick={() => { api.getFullAlbums(); }}>get albums</button>
                    <button onClick={() => { setToken(crypto.randomUUID()) }}>change token</button>
                  </td> : null}
                </tr>

              </tbody>
            </table >

            <div className='footer-mobile player'>

              {token ?
                // <Player onNext={() => nextTrack()} onError={playerError} stateChanged={playerStateChanged} token={token} trackid={track} onClick={(e) => { e.stopPropagation(); setSelectedTrack(track); setShowPlaylistPicker(true) }} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />
                <SpotifyPlayer onNext={nextTrack} onError={playerError} stateChanged={playerStateChanged} token={token} track={track} onClick={() => loadArtistInfo(track)} onLongPress={(track, e) => { e.stopPropagation(); setSelectedTrack(track); setShowPlaylistPicker(true) }} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == track.id))} ></SpotifyPlayer>

                : null}
            </div>
          </div >
          :
          <div className='layout' onMouseDown={closeMenu}>

            {menuPosition && (
              <div className="context-menu"
                style={{
                  top: menuPosition.y,
                  left: menuPosition.x,
                }}
              >
                {/* <div>Copy</div>
                <div>Paste</div> */}
                <div onMouseDown={(e) => { removeTrackFromPlaylist(); e.stopPropagation() }} >Remove from playlist</div>
              </div>
            )}

            <div className="header">
              <table style={{ width: "100%", tableLayout: "fixed" }}>
                <tbody>
                  <tr>
                    <td >
                      <div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>
                        <div onContextMenu={handleContextMenu} className='app-title'>
                          <span>LUMTU</span>
                          <span style={{ opacity: 0.5 }} className='app-title-dj'>DJ</span><br></br>
                          {/* <span style={{fontSize:9, marginTop:-10}}>since 2001</span> */}
                        </div>
                        {mode == "compact" ?
                          <div className="input-search-wrapper">
                            <SearchIcon className="search-icon" />
                            <input className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={(e) => setSearchText(e.target.value)} />
                          </div> : null}
                        {/* <button onClick={updatePlaylists}>Update playlists</button>*/}
                        {/* <button onClick={checkForUpdates}>Check for updates</button> */}
                        {/* <button onClick={checkForUpdates}>Check for updates</button> */}
                        <button onClick={refreshAccessToken}>refresh at</button>
                        {/* <button onClick={startUniverse}>start</button> */}

                        <button className='header-button-small' onClick={getLastListened}><HistoryIcon></HistoryIcon></button>
                        <button className='header-button-small' onClick={toggleMode}><PlaylistAddCheckIcon></PlaylistAddCheckIcon></button>
                        {locked ?
                          <button className='header-button-small' ><LockOutlineIcon style={{ color: "red" }} /></button>
                          : <button className='header-button-small' onClick={lock}><LockOpenIcon /></button>}

                        <button className='header-button-small' style={{ width: 100, padding: 5 }} onClick={getMyShazamTracks}>{myShazamTracksPlIcon}</button>
                        {/* <button className='header-button-small' style={{ width: 100 }} onClick={playerError}>Token</button> */}
                      </div>
                    </td>
                    {mode == "normal" ?
                      <td style={{ display: "flex", textAlign: "center", justifyContent: "center", padding: 5 }}>
                        {/* <button onClick={getTopTracks}>Top tracks</button>*/}
                        {/* <button onClick={getRecommendations}>Recommendations</button> */}

                        <div className="input-search-wrapper">
                          <SearchIcon className="search-icon" />
                          <input className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={(e) => setSearchText(e.target.value)} />
                        </div>
                        {/* <button onClick={getRecentTracks}>Recently played</button> */}
                      </td> : null}
                    <td>
                      <div onContextMenu={handleContextMenu} className='app-title'>
                        {mode == "compact" ? <span>PLAYLIST</span> : null}
                        {/* <span style={{ opacity: 0.5 }} className='app-title-dj'>DJ</span><br></br> */}
                        {/* <span style={{fontSize:9, marginTop:-10}}>since 2001</span> */}
                      </div>
                      <button style={{ float: "right" }} onClick={fullscreen}>Fullscreen</button>
                      <button style={{ float: "right" }} onClick={changeTheme}>Change theme</button>
                      <button style={{ float: "right" }} onClick={logout}>Logout</button>
                      <button style={{ float: "right" }}>{time}</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              {mode == "normal" ?
                <table style={{ width: "100%", display: "inline-block" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: 30, padding: 5 }}>
                        <img
                          src={selectedTrack && selectedTrack.album && selectedTrack.album.images[2].url}
                          style={{ display: "block", width: isMobile() ? 30 : 35, objectFit: 'cover', borderRadius: 8 }}
                        />
                      </td>
                      <td className='selected-track-container'>
                        {playlists.map(p => selectedTrack && p.tracks && p.tracks.some(t => t.id == selectedTrack.id) ? <span onClick={() => { addToSpotifyPlaylist(p, true) }} className='selected-track-bulb-on' key={p.id}>{p.name}</span> : <span onClick={() => { addToSpotifyPlaylist(p, false) }} className='selected-track-bulb-off' key={p.id}>{p.name}</span>)}
                      </td>
                    </tr>
                  </tbody>
                </table> : null}
            </div>
            <div className="main">
              {mode == "normal" ?
                <div className="panel">


                  {loadingPlaylists ?
                    <>
                      <div className="loader-text">{loadingPlaylistsText}</div>
                      <div className='loader'>

                      </div>
                    </>
                    :
                    <>
                      {getPlaylistsPanel()}

                      {/* {getAlbumsPanel()} */}
                    </>}

                </div> : null}
              <div id="panel-main" className="panel-main">
                {/* <img src="https://mosaic.scdn.co/640/ab67616d00001e0204508fa56b3746ca1f90f73cab67616d00001e024206814685e7f97a78670cc9ab67616d00001e027b2ed55c469487b2be37cac0ab67616d00001e028e7da55a612d5dda4e2d6663" alt="Search" className="panel-image" /> */}

                {/* <img src={track && track.album && track.album.images && track.album.images[0].url} alt="Search" className="panel-image" />  */}

                {
                  getTracksPanel()
                }
              </div>
              <div className="panel" onDragOver={allowDrop} onDrop={() => { addToPlaylist(dragTrack) }}>

                {
                  playlistTracks.length > 0 ?
                    <div>
                      {getPlaylistPanel(playlistTracks, setPlaylistTracks)}
                    </div>
                    :
                    <div className='QueueMusicIcon'>
                      <QueueMusicIcon style={{ fontSize: 50 }}></QueueMusicIcon>

                      <div style={{ fontSize: 20 }}>drag to queue</div>
                    </div>

                }
              </div>
            </div>
            <div className="footer player">
              {/* {playbackSDKReady && token ?
                <Player locked={locked} onNext={() => { if (isLocked()) { return; } nextTrack() }} onError={playerError} stateChanged={playerStateChanged} token={token} trackid={track} onClick={() => setSelectedTrack(track)} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />


                : null} */}
              <SpotifyPlayer onNext={nextTrack} onArtistClick={(tr) => loadArtistInfo(tr)} locked={locked} onError={playerError} stateChanged={playerStateChanged} token={token} track={track} onClick={() => { setSelectedTrack(track) }} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == track.id))} ></SpotifyPlayer>
            </div>
          </div>
      )
      }
    </>

  );
}

const SortableItem = ({ track, forInfo, onClick, onArtistClick, onDoubleClick, onMouseDown, index, onDrop, selected, onContextMenu, playlists, forPlayer, hideImage, playing, onPlClick, id, onAddToPlaylistButton, onLongPress, onSwipedLeft, onSwipedRight }) => {

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <li ref={setNodeRef} style={style} className={`list-item ${isDragging ? "dragging" : ""}`}>
      <table style={{ width: "100%" }} className={isMobile() ? "item-row-mobile" : "item-row"}>
        <tbody>
          <tr>
            {/* Main content cell */}
            <td style={{ width: "auto" }}>
              <TrackRow
                track={track}
                forInfo={forInfo}
                onClick={onClick}
                onArtistClick={onArtistClick}
                onDoubleClick={onDoubleClick}
                onMouseDown={onMouseDown}
                index={index}
                onDrop={onDrop}
                selected={selected}
                onContextMenu={onContextMenu}
                playlists={playlists}
                forPlaylist
                forPlayer={forPlayer}
                hideImage={hideImage}
                playing={playing}
                onPlClick={onPlClick}
                id={id}
                onAddToPlaylistButton={onAddToPlaylistButton}
                onLongPress={onLongPress}
                onSwipedLeft={onSwipedLeft}
                onSwipedRight={onSwipedRight}
              />
            </td>

            {/* Drag handle cell */}
            <td
              style={{
                touchAction: "none",
                width: 40,
                textAlign: "right",
                verticalAlign: "middle",
                display: isMobile() || true ? "table-cell" : "none",

              }}
              {...attributes}
              {...listeners}
            >
              <GripIcon />
            </td>
          </tr>
        </tbody>
      </table>

    </li>
  );
}

function GripIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="grip-icon"
      aria-hidden
    >
      <path
        d="M7 6h.01M7 10h.01M7 14h.01M13 6h.01M13 10h.01M13 14h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default App;
