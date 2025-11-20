import logo from './logo.svg';

import React, { useEffect, useState, useRef, cache } from "react";
import axios from "axios";
import Player from './components/player';
import TrackRow from './components/trackRow';
import api from './Api';
import PlaylistRow from './components/playlistRow';
import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid, flyToPlayer, flyToPlaylist, changeTheme, myShazamTracksPl, lastListenedPl } from './util';
import { faL, faLeaf, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';
import { loadLibray, saveLibrary, savePlaylists, loadPlaylists, saveBackgroundPlaylists, loadBackgroundPlaylists, addToHistory, getHistory, saveAlbums, loadAlbums, clearDatabase } from './database';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Settings from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
import SortableItem from './components/sortableItem';
import ReordableTrackList from './components/reordableTrackList';
import DeleteIcon from '@mui/icons-material/Delete';
import PanelLibrary from './components/panelLibrary';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Dialog from './components/dialog';
import PlaylistInfo from './components/playlistInfo';
import useAppStore from './AppStore';


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

function useConstructor(callback) {
  const hasRun = useRef(false);
  if (!hasRun.current) {
    callback();
    hasRun.current = true;
  }
}

function App() {
  const { menuAnchor, setMenuAnchor, locked, setLocked, selectedLibraryIndex, setSelectedLibraryIndex, dragTrack, setDragTrack, dragSourceIndex, setDragSourceIndex, dragSource, setDragSource, library, filteredLibrary, setFilteredLibrary, selectedLibraryItem, setSelectedLibraryItem, setLibrary, loadingLibrary, setLoadingLibrary, menuPosition, selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex, setMenuPosition, selectedTrack, setSelectedTrack, selectedTrackIndex, setSelectedTrackIndex } = useAppStore();

  const Activity = React.Activity ?? React.unstable_Activity ?? (() => null);

  const urlParams = new URLSearchParams(window.location.search);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [albums, setAlbums] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);

  const [tracks, setTracks] = useState([]);

  const [showPickerButtons, setShowPickerButtons] = useState(true);

  const [selectedPlaylistTrack, setSelectedPlaylistTrack] = useState([]);

  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);

  const [trackCounts, setTrackCounts] = useState({});
  const [track, setTrack] = useState({});
  const [searchText, setSearchText] = useState();
  const [playlistsFilterText, setPlaylistsFilterText] = useState();

  const [loadingTracks, setLoadingTracks] = useState(false);

  const [loadingToken, setLoadingToken] = useState(urlParams.get('code') ? true : false);

  const [showplaylistPicker, setShowPlaylistPicker] = useState(false);

  const [playPosition, setPlayPosition] = useState(null);
  const [playIndex, setPlayIndex] = useState(null);
  const [playState, setPlayState] = useState(null);

  const [mode, setMode] = useState(localStorage.getItem("mode") ? localStorage.getItem("mode") : "normal");

  const [code, setCode] = useState(null);

  const [tab, setTab] = useState("1");

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleLockKeyDownRef = useRef(null);

  const [showingPlaylistPicker, setShowingPlaylistPicker] = useState(false);

  const [showPlaylistInfo, setShowPlaylistInfo] = useState(false);

  const inputBuffer = useRef();

  const [time, setTime] = useState();

  const intervalRef = useRef();

  let timer = null;


  const open = Boolean(menuAnchor);
  const handleClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setMenuAnchor(null);
  };

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

    let cacheLibrary = await loadLibray();


    if (cacheLibrary && cacheLibrary.length > 0) {
      cacheLibrary = [myShazamTracksPl, lastListenedPl, ...cacheLibrary];
      setLibrary(cacheLibrary);
      setFilteredLibrary(cacheLibrary);
    } else {
      updateLibrary();
    }


    return;

    // const cachedPlaylists = await loadPlaylists(); // Load back
    // const cachedAlbums = await loadAlbums(); // Load back

    // if (!cached.some(playlist => playlist.name == "lastlistened")) {
    //   cached.unshift({
    //     id: "lastlistened",
    //     name: "last listened",
    //     tracks: []
    //   })
    // }


    // if (cachedPlaylists && cachedPlaylists.length > 0) {
    //   setLibrary([...cachedPlaylists]);
    //   setFilteredLibrary([...cachedPlaylists]);
    // }

    // if (cachedAlbums && cachedAlbums.length > 0) {
    //   setAlbums(cachedAlbums);
    // }

    // if (cachedPlaylists == null || cachedPlaylists.length == 0) {
    //   updateLibrary();
    //   return;
    // }

    // if (cachedAlbums == null || cachedAlbums.length == 0) {
    //   updateLibrary();
    //   return;
    // }

  };


  const getBackgroundPlaylists = async () => {

    const cached = await loadBackgroundPlaylists(); // Load back

    if (cached && cached.length > 0) {

      return cached;
    }

    return [];
  };

  useConstructor(async () => {


    // alert("constructor");

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

    if (library.length == 0) {
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


    console.log("hlkd");

    if (localStorage.getItem("locked") != "true") return; // ignore input if already unlocked


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

  const nextTheme = () => {
    changeTheme();
  };

  const handleContextMenu = (e) => {
    //get htlm attribute data-source from e.currentTarget
    setMenuAnchor(e.currentTarget);
    e.preventDefault();
  };

  const closeMenu = () => {
    setMenuPosition(null);
  };

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


      let lckd = localStorage.getItem("lockpass")
      if (lckd == null || lckd == undefined || lckd == "") {
        localStorage.setItem("lockpass", "dinamo");
      }

      if (!handleLockKeyDownRef.current) {
        handleLockKeyDownRef.current = handleLockKeyDown;
      }

      if (localStorage.getItem("locked") === "true") {
        setLocked(true);
        // Initialize the function once
        document.removeEventListener('keydown', handleLockKeyDownRef.current);
        document.addEventListener('keydown', handleLockKeyDownRef.current);
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
          if (library.length == 0) {

            getPlaylistsAndAlbums();
            getBackgroundPlaylists();
          }
        }
      }
      else {
        if (access_token) {
          if (library.length == 0) {

            getPlaylistsAndAlbums();
            getBackgroundPlaylists();
          }
        }
      }
    }

    handle();

  }, [code]);




  const handleKeyDown = async (e) => {


    //check if e.key is alphanumeric or space
    let st = searchText;

    if (e.key === 'Backspace') {
      st = st.slice(0, -1);
    }

    if (st != undefined && st.trim() == "") {
      setSearchText("");
      setSelectedPlaylistTracks([]);
      return;
    }

    if (e.key.match(/^[a-zA-Z0-9 ]$/) && e.key !== 'Enter') {
      st += e.key;
    }

    setSelectedLibraryItem(null);
    setSelectedLibraryIndex(-1);
    if (e.key === 'Enter' && searchText.trim()) {
      search(searchText);
      e.preventDefault();
      if (inputRef && inputRef.current)
        inputRef.current.blur();
    } else {

      //filter all tracks from library (each playlist in libray contains tracks) whose name contains st
      let allTracks = [];
      library.forEach(pl => {
        allTracks = allTracks.concat(pl.tracks);
      });

      let filtered = allTracks.filter(tr => tr.name.toLowerCase().includes(st.toLowerCase()) || tr.artists && tr.artists.length > 1 && tr.artists[0].name.toLowerCase().includes(st.toLowerCase()));

      const distinct = [...new Map(filtered.map(item => [item.id, item])).values()];

      setSelectedPlaylistTracks(distinct);

    }
  };

  const search = async (query) => {

    setPlaylistChanged(false);
    setLoadingTracks(true);
    const data = await api.search(query);
    setSelectedPlaylistTracks(data);
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


  const updateLibrary = async () => {

    setLoadingLibrary("LOADING LIBRARY...")

    try {

      const albms = await api.getFullAlbums((i, l) => setLoadingLibrary("LOADING ALBUMS " + i + "/" + l));

      const plsts = await api.getFullPlaylists((i, l) => setLoadingLibrary("LOADING PLAYLISTS " + i + "/" + l));

      albms.forEach(alb => { alb.type = "album"; });
      plsts.forEach(pl => { pl.type = "playlist"; });

      const lib = [myShazamTracksPl, lastListenedPl, ...plsts, ...albms];

      saveLibrary(lib);
      setLibrary(lib);
      setFilteredLibrary(lib);

      setLoadingLibrary(null);

    }
    catch {
      //go to login page
      setToken("");
    }

  }

  // const updateLibrary = async () => {

  //   setLoadingLibrary("LOADING LIBRARY...")

  //   try {
  //     const plsts = await api.getFullPlaylists((i, l) => setLoadingLibrary("LOADING PLAYLISTS " + i + "/" + l));
  //     savePlaylists(plsts);
  //     setLibrary(plsts);
  //     setFilteredLibrary(plsts);

  //     const albms = await api.getFullAlbums((i, l) => setLoadingLibrary("LOADING ALBUMS " + i + "/" + l));
  //     saveAlbums(albms);
  //     setAlbums(albms);

  //     setLoadingLibrary(null);

  //   }
  //   catch {
  //     //go to login page
  //     setToken("");
  //   }

  // }

  const checkForUpdates = async () => {
    const cached = (await loadLibray()).filter(x => x.type != "featured"); // Load back

    let fresh = [];
    const playlists = await api.getPlaylists();
    const albums = await api.getAlbums();

    fresh = [...playlists, ...albums];

    let { updated, deleted, metaChanged } = getPlaylistsToUpdate(cached, fresh);

    if (updated.length > 0) {
      // alert("Playlists to update: " + updated.map(p => p.name).join(", "));

      //ipnut box to confirm update
      // const confirmUpdate = window.confirm("Playlists to update: " + updated.map(p => p.name).join(", ") + ". Do you want to update the playlists?");
      // const confirmDelete = window.confirm("Playlists to delete: " + deleted.map(p => p.name).join(", ") + ". Do you want to delete the playlists?");

      if (true) {
        setLoadingLibrary("UPDATING PLAYLISTS...");
        const updatedPlaylists = await api.updateLibrary(updated, (i, l) => setLoadingLibrary("UPDATING PLAYLISTS " + i + "/" + l));

        // Update the cached playlists with the new data from browser
        for (const pl of library) {
          // const renamed = metaChanged.find(p => p.id === pl.id);
          // if (renamed) {
          //   pl.name = renamed.name;
          //   pl.description = renamed.description;
          // };

          const updatedPl = updatedPlaylists.find(p => p.id === pl.id);

          if (updatedPl) {
            pl.images = updatedPl.images;
            pl.count = updatedPl.tracks.length;
            pl.name = updatedPl.name;
            pl.description = updatedPl.description;
            pl.type = "playlist";
            updatedPl.type = "playlist";

            debugger;
            for (const tr of updatedPl.tracks) {
              const oldtr = pl.tracks.find(t => t.id === tr.id);
              if (oldtr) {
                tr.datePlayed = oldtr.datePlayed; // Preserve datePlayed
              }
            }
          }
        }

        saveLibrary(updatedPlaylists);

        await getPlaylistsAndAlbums(); // Reload playlists from IndexedDB
        setLoadingLibrary(null);
      }

    } else {
      alert("All playlists are up to date");
    }

    if (deleted.length > 0) {

      alert("Playlists deleted: " + deleted.map(p => p.name).join(", "));

      let newLibrary = [myShazamTracksPl, lastListenedPl, ...library];
      newLibrary = newLibrary.filter(pl => !deleted.some(d => d.id === pl.id));
      setLibrary(newLibrary);
      setFilteredLibrary(newLibrary);
      saveLibrary(newLibrary);

    }
  }

  function getPlaylistsToUpdate(cached, fresh) {
    const cachedMap = new Map();
    cached.forEach(p => cachedMap.set(p.id, p));

    const freshMap = new Map();
    fresh.forEach(p => freshMap.set(p.id, p));

    const updated = [];
    const deleted = [];
    const metaChanged = [];

    // Detect new or changed playlists
    for (const p of fresh) {
      const cachedPlaylist = cachedMap.get(p.id);

      const isNew = !cachedPlaylist;
      const nameChanged = cachedPlaylist?.name !== p.name;
      const descriptionChanged = cachedPlaylist?.description !== p.description;

      if (descriptionChanged || nameChanged) {
        metaChanged.push(p);
      }

      if (cachedPlaylist?.snapshot_id != p.snapshot_id || isNew) {
        updated.push(p);
      }

      if (cachedPlaylist.name == "Klinci") {
        debugger;
      }
    }




    // Detect deleted playlists
    for (const cachedItem of cached) {
      if (!freshMap.has(cachedItem.id)) {
        deleted.push(cachedItem);
      }
    }

    return { updated, deleted, metaChanged };
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
    const pl = library.find(p => p.id === playlistID);
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

  const addToPlaylist = (track, position, id) => {

    let newTrack = { ...track };

    if (isMobile())
      flyToPlaylist(id);

    let pl = [...playlistTracks];

    // if (dragSource == "playlist") {
    //   if (locked) {
    //     return
    //   } else {
    //     pl.splice(dragSourceIndex, 1);
    //   }
    // }

    if (dragSource == "library" && !locked) {
      const selPl = filteredLibrary[dragSourceIndex];
      pl = [...playlistTracks, ...selPl.tracks];
      setPlaylistTracks(pl);
      return;
    }

    // newTrack.uid = newGuid();

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
      flyToPlaylist("pl" + pl.id);

    // pl.tracks.map(x => x.uid = newGuid());

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

    let tr = dragTrack || selectedTrack;

    let res = null;

    if (pl.id && tr) {
      if (bulbOn) {
        await api.removeTrackFromPlaylist(pl, tr);
        pl.tracks = pl.tracks.filter(x => x.id != tr.id);
      } else {
        res = await api.addTrackToPlaylist(pl, tr);
        pl.tracks.push(tr);
      }

      let pls = [...library];
      let p = pls.find(x => x.id == pl.id);
      pl.count = pl.tracks.length;
      pl.snapshot_id = res.snapshot_id;
      p = pl;
      setLibrary(pls);
      // setFilteredLibrary(pls);
      saveLibrary(pls);
    }
  }

  const removeTrackFromSpotifyPlaylist = async () => {

    if (dragSource == "plprev") {
      if (selectedLibraryIndex) {

        let pl = library[selectedLibraryIndex];
        const tr = pl.tracks[dragSourceIndex];
        pl.tracks.splice(dragSourceIndex, 1);
        setSelectedTrackIndex(-1);
        const res = await api.removeTrackFromPlaylist(pl, tr);

        let pls = [...library];
        pls[selectedLibraryIndex] = pl;
        pl.count = pl.tracks.length;
        pl.snapshot_id = res.snapshot_id;
        setSelectedPlaylistTracks(pl.tracks);
        setLibrary(pls);
        setFilteredLibrary(pls);
        saveLibrary([pl]);
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

      if (dragSource == "tracks" && selectedLibraryIndex >= 0) {
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
    const btn = document.getElementById("lockButton");

    if (l) {
      // Add class only if not already blinking
      if (!btn.classList.contains("blinking")) {
        btn.classList.add("blinking");
        // Remove blinking class automatically when animation ends
        btn.addEventListener("animationend", () => {
          btn.classList.remove("blinking");
        });
      }
    }


    setLocked(l);
    return l;
  }

  const lock = () => {

    if (!handleLockKeyDownRef.current) {
      handleLockKeyDownRef.current = handleLockKeyDown;
    }

    document.removeEventListener('keydown', handleLockKeyDownRef.current);
    document.addEventListener('keydown', handleLockKeyDownRef.current);

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

    startUniverse();
    addToHistory(track);
    setTrack(track);
    setSelectedTrack(track);
    let pls = library.filter(x => x.tracks.some(x => x.id == track.id));
    for (const pl of pls) {
      const trs = pl.tracks.filter(x => x.id == track.id);
      for (const tr of trs) {
        tr.datePlayed = new Date();
      }
    }

    await saveLibrary(pls);
    getPlaylistsAndAlbums();

  }

  const nextTrack = async (cached) => {
    // if (playPosition == "playlist") {
    //   setPlayIndex(playIndex + 1);
    //   play(playlist[playIndex + 1]);
    // }

    const bpl = cached ? cached : await loadBackgroundPlaylists();


    if (playlistTracks.length > 0) {
      let pl = [...playlistTracks];


      flyToPlayer("pl0-" + pl[0].id);


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


  const myShazamTracksPlIcon = <svg className='icon-color' width="30px" height="30px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
  </svg>;

  const myShazamTracksPlIconMobile = <svg className='icon-color' width="24px" height="24px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
  </svg>;

  const lastListenedPlIcon = <svg className='icon-color' width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,24C5.4,24,0,18.6,0,12h2c0,5.5,4.5,10,10,10s10-4.5,10-10S17.5,2,12,2C8.4,2,5.1,3.9,3.3,7H8v2H0V1h2v4.4
     C4.2,2.1,8,0,12,0c6.6,0,12,5.4,12,12S18.6,24,12,24z M15.3,17.8L11,13.4V6h2v6.6l3.7,3.8L15.3,17.8z"/>
  </svg>;

  const onLongPress = (pl, onof) => {

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
    let allPlaylists = [myShazamTracksPl, lastListenedPl, ...library];
    if (text.trim() == "") {
      setFilteredLibrary(allPlaylists);
    } else {
      const filtered = allPlaylists.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredLibrary(filtered);
    }
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

  const getTracksPanel = () => {
    return loadingTracks ? <div className='loader'></div> : <>
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={selectedPlaylistTracks.length}
        itemContent={(index) => {
          const tr = selectedPlaylistTracks[index];
          if (!tr) return null;

          return isMobile() ?
            <TrackRow id={tr.id} key={tr.id} value={tr.name} onSwipedRight={() => { addToPlaylist(tr, null, tr.id) }} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => { onPlaylistTrackDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
            <TrackRow id={tr.id} key={tr.id} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragSourceIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />
        }}
      />
    </>
  }

  function handleSelectedPlaylistDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = selectedPlaylistTracks.findIndex((i, index) => "spl" + index + "-" + i.id === active.id);
      const newIndex = selectedPlaylistTracks.findIndex((i, index) => "spl" + index + "-" + i.id === over.id);

      if (selectedLibraryItem && selectedLibraryItem.type == "playlist") {
        api.changeTrackPosition(selectedLibraryItem.id, oldIndex, newIndex);
      }

      setSelectedPlaylistTracks((prev) => arrayMove(prev, oldIndex, newIndex));
      setPlaylistChanged(true);
    }
  }

  function handlePlaylistDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = playlistTracks.findIndex((i, index) => "pl" + index + "-" + i.id === active.id);
      const newIndex = playlistTracks.findIndex((i, index) => "pl" + index + "-" + i.id === over.id);
      setPlaylistTracks((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  }

  const onPlaylistSwipedRight = (tr, id, index) => {
    removeTrackFromPlaylist(index);
  }

  const onTracksSwipedRight = (tr, id, index) => {
    addToPlaylist(tr, null, id);
  }

  // const getReordableTrackList = (trackList, dragEndHandler, key, onSwipedRight) => {
  //   return (
  //     <>
  //       <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEndHandler} modifiers={[restrictToVerticalAxis]}>
  //         <SortableContext items={(trackList || []).map((i, index) => key + index + "-" + i.id)} strategy={rectSortingStrategy}>
  //           <Virtuoso
  //             style={{ height: '100%' }}
  //             totalCount={trackList.length}
  //             itemContent={(index) => {
  //               const tr = trackList[index];
  //               if (!tr) return null;

  //               return isMobile() ?
  //                 <SortableItem id={key + index + "-" + tr.id} value={tr.name} key={key + index + "-" + tr.id} onSwipedRight={() => { onSwipedRight(tr, key + index + "-" + tr.id, index) }} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragSourceIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => { onPlaylistTrackDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
  //                 <SortableItem id={key + index + "-" + tr.id} value={tr.name} key={key + index + "-" + tr.id} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragSourceIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />
  //             }}
  //           />
  //         </SortableContext>
  //       </DndContext>
  //     </>
  //   );
  // };

  const getLastListened = async () => {

    let lastTracks = await getHistory();

    lastTracks.sort((a, b) => {
      return b.datePlayed - a.datePlayed;
    });


    return lastTracks;

    // setTracks(lastTracks);


    // let lastTracks = [];
    // for (const pl of library) {
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

    setLoadingTracks(false);
    return tracks;
    // if (tracks)
    //   setTracks(tracks);

    // setLoadingTracks(false);
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
    // pl.tracks.map((tr) => tr.uid = newGuid());

    setLoadingTracks(true);

    if (pl.id == "MyShazamedTracks") {
      pl.tracks = await getMyShazamTracks();
    }

    if (pl.id == "LastListened") {
      pl.tracks = await getLastListened();
    }

    setSearchText(pl.name);
    setSelectedLibraryItem(pl);
    setPlaylistChanged(false);
    setSelectedPlaylistTracks(pl.tracks);

    setLoadingTracks(false);
  }

  const [playlistChanged, setPlaylistChanged] = useState();

  const onSearchTextChanged = (e) => {
    setSearchText(e.target.value);
    if (selectedLibraryIndex && selectedLibraryIndex > -1) {
      setPlaylistChanged(true);
    }
  }

  const saveSelectedPlaylist = () => {

    setPlaylistChanged(false);
  }

  const onLibrayRowDrop = (playlist) => {
    if (playlist.type == "playlist") {
      addToSpotifyPlaylist(playlist);
    }
  }

  const onTrash = () => {
    if (dragSource == "playlist") {
      removeTrackFromPlaylist();
    }

    if (dragSource == "plprev") {
      removeTrackFromSpotifyPlaylist();
    }

    setDragTrack(null);
    setDragSourceIndex(-1);
  }

  return (
    <>


      {menuAnchor &&
        <Menu
          anchorEl={menuAnchor}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >

          {menuAnchor.getAttribute("menu-target") == "library" ?
            <MenuItem onClick={logout}>
              New playlist
            </MenuItem> : null}

          {menuAnchor.getAttribute("menu-target") == "library" ?
            <MenuItem onClick={checkForUpdates}>
              Update library
            </MenuItem> : null}

          {menuAnchor.getAttribute("menu-target") == "settings" ?
            <MenuItem onClick={logout}>
              Log out
            </MenuItem> : null}

          {menuAnchor.getAttribute("menu-target") == "library-item" ?
            <MenuItem onClick={() => setShowPlaylistInfo(true)}>
              Edit playlist
            </MenuItem> : null}

        </Menu>
      }

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

      {showPlaylistInfo ?
        <PlaylistInfo playlist={selectedLibraryItem}></PlaylistInfo> : null}

      {dragTrack ?
        <div className='trash-container' onDragOver={(e) => { e.currentTarget.classList.add('drag-over'); e.preventDefault() }} onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }} onDrop={onTrash}>
          <DeleteIcon className="trash-icon" style={{ fontSize: 60 }} />
        </div> : null}

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
                    return <TrackRow forInfo id={"atr" + tr.id} onAddToPlaylistButton={() => { addToPlaylist(tr) }} onContextMenu={handleContextMenu} index={index} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setDragSourceIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { if (isLocked()) { return; } setPlayIndex(index); setPlayPosition("main"); play(tr) }} />
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
                  <PlaylistPicker onClick={addToSpotifyPlaylist} track={selectedTrack} onSwipedLeft={() => setShowPlaylistPicker(false)} onClose={() => setShowPlaylistPicker(false)} playlists={library} />


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
                  {/* <td className='tab' onClick={() => { getLastListened(); setCurrentTab(2); setSearchText("Last listened tracks") }}>
                    <HistoryIcon></HistoryIcon>
                  </td>
                  <td className='tab' {...longPressHandler()} onClick={() => { getMyShazamTracks(); setCurrentTab(2); setSearchText("My Shazam Tracks") }}>
                    {myShazamTracksPlIconMobile}
                  </td> */}
                  <td className={tab == 3 ? 'tab-selected' : 'tab'} onClick={() => { setCurrentTab(3) }} id="playlistButton">
                    <PlaylistPlayIcon></PlaylistPlayIcon>
                  </td>
                  <td className={tab == 4 ? 'tab-selected' : 'tab'} style={{ width: 40 }} onClick={() => { setCurrentTab(4) }}>
                    <Settings></Settings>
                  </td>
                </tr>
                <tr>
                  {tab != 4 ? <td colSpan={4} className='tab-panel'>
                    <Activity mode={tab == "1" ? "visible" : "hidden"}>
                      <PanelLibrary onMenuClick={handleContextMenu} onClick={(p) => { loadPlaylistPrev(p) }}></PanelLibrary>
                    </Activity>
                    <Activity mode={tab == "plprev" ? "visible" : "hidden"}>
                      <div className="toolbar-wrapper">
                        <input ref={inputRef} className="toolbar-input-search" placeholder="filter library..." onFocus={(e) => e.target.select()} value={selectedLibraryItem && selectedLibraryItem.name} onChange={(e) => onPlaylistFilterChange(e.target.value)} />
                      </div>
                      <div className='panel-playlist-mobile'>
                        {false ?
                          <>
                            <div className="loader-text">{loadingLibrary}</div>
                            <div className='loader'>

                            </div>
                          </>
                          :
                          <>
                            <ReordableTrackList enableDrag={selectedLibraryItem && selectedLibraryItem.type == "playlist"} source="plprev" onClick={onPlaylistTrackDoubleClick} trackList={selectedPlaylistTracks} dragEndHandler={handleSelectedPlaylistDragEnd} key={"spl"} onSwipedRight={onTracksSwipedRight} onDrop={addToPlaylist}></ReordableTrackList>
                          </>}
                      </div>
                    </Activity>
                    {/* <Activity mode={tab == "1.5" ? "visible" : "hidden"}>
                      <div className='panel-playlists-mobile'>
                        {loadingLibrary ?
                          <>
                            <div className="loader-text">{loadingLibrary}</div>
                            <div className='loader'>

                            </div>
                          </>
                          :
                          <>
                            {getAlbumsPanel()}
                          </>}
                      </div>
                    </Activity> */}

                    <Activity mode={tab == "2" ? "visible" : "hidden"}>
                      <div className="toolbar-wrapper">
                        <SearchIcon className="search-icon" />
                        <input ref={inputRef} className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />
                      </div>
                      <div className="panel-search-mobile">
                        {getTracksPanel()}
                      </div>
                    </Activity>

                    <Activity mode={tab == "3" ? "visible" : "hidden"}>

                      {
                        playlistTracks.length > 0 ?
                          <div className='panel-playlist-mobile'>
                            <ReordableTrackList enableDrag={true} onClick={onPlaylistTrackDoubleClick} trackList={playlistTracks} dragEndHandler={handlePlaylistDragEnd} key={"pl"} onSwipedRight={onPlaylistSwipedRight} onDrop={addToPlaylist} ></ReordableTrackList>
                          </div>
                          :
                          <div className='QueueMusicIcon' style={{ marginTop: "50%" }}>
                            <SwipeRightIcon style={{ fontSize: 50 }}></SwipeRightIcon>

                            <div style={{ fontSize: 20 }}>swipe right song<br></br> to add to queue</div>
                          </div>
                      }

                    </Activity>
                  </td> : null}
                  {tab == 4 ? <td colSpan={4} className='tab-panel'>
                    <button style={{ float: "right" }}>{time}</button>
                    <button style={{ float: "right" }} onClick={logout}>Logout</button>
                    <button style={{ float: "right" }} onClick={nextTheme}>Change theme</button>
                    <button style={{ float: "right" }} onClick={fullscreen}><FullscreenIcon></FullscreenIcon> </button>
                    <button onClick={checkForUpdates}>Check for updates</button>
                    {/* <button onClick={refreshAccessToken}>refresh at</button> */}
                    <button onClick={() => { api.getFullAlbums(); }}>get albums</button>
                    <button onClick={() => { setToken(crypto.randomUUID()) }}>change token</button>
                  </td> : null}
                </tr>

              </tbody>
            </table >

            <div className='footer-mobile player'>

              {token ?
                // <Player onNext={() => nextTrack()} onError={playerError} stateChanged={playerStateChanged} token={token} trackid={track} onClick={(e) => { e.stopPropagation(); setSelectedTrack(track); setShowPlaylistPicker(true) }} playlists={library.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />
                <SpotifyPlayer onNext={nextTrack} onError={playerError} stateChanged={playerStateChanged} token={token} track={track} onClick={() => loadArtistInfo(track)} onLongPress={(track, e) => { e.stopPropagation(); setSelectedTrack(track); setShowPlaylistPicker(true) }} playlists={library.length > 0 && library.length > 0 && library.filter((pl) => pl.tracks && pl.tracks.some((t) => t.id == track.id))} ></SpotifyPlayer>

                : null}
            </div>
          </div >
          :
          <div className='layout' >

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
                <div onMouseDown={(e) => { removeTrackFromPlaylist(); e.stopPropagation() }} >Remove from playlist2</div>
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
                          <div className="toolbar-wrapper">
                            {/* <SearchIcon className="search-icon" /> */}
                            <input className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />
                          </div> : null}
                        {/* <button onClick={updateLibrary}>Update playlists</button>*/}
                        {/* <button onClick={checkForUpdates}>Check for updates</button> */}
                        {/* <button onClick={checkForUpdates}>Check for updates</button> */}
                        {/* <button onClick={refreshAccessToken}>refresh at</button> */}
                        {/* <button onClick={startUniverse}>start</button> */}

                        {/* <button className='header-button-small' onClick={() => loadPlaylistPrev(lastListenedPl)}><HistoryIcon></HistoryIcon></button> */}
                        <button className='header-button-small' onClick={toggleMode}><PlaylistAddCheckIcon></PlaylistAddCheckIcon></button>


                        {/* <button className='header-button-small' style={{ width: 100, padding: 5 }} onClick={() => loadPlaylistPrev(myShazamTracksPl)}>{myShazamTracksPlIcon}</button> */}
                        {/* <button className='header-button-small' style={{ width: 100 }} onClick={playerError}>Token</button> */}
                      </div>
                    </td>
                    {mode == "normal" ?
                      <td style={{ display: "flex", textAlign: "center", justifyContent: "center", padding: 5 }}>
                        {/* <button onClick={getTopTracks}>Top tracks</button>*/}
                        {/* <button onClick={getRecommendations}>Recommendations</button> */}

                        {/* <div className="toolbar-wrapper">
                          <SearchIcon className="search-icon" />
                          <input className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={(e) => setSearchText(e.target.value)} />
                        </div> */}
                        {/* <button onClick={getRecentTracks}>Recently played</button> */}
                      </td> : null}
                    <td>
                      <div onContextMenu={handleContextMenu} className='app-title'>
                        {mode == "compact" ? <span>QUEUE</span> : null}
                        {/* <span style={{ opacity: 0.5 }} className='app-title-dj'>DJ</span><br></br> */}
                        {/* <span style={{fontSize:9, marginTop:-10}}>since 2001</span> */}
                      </div>

                      <button style={{ float: "right" }} menu-target="settings" onMouseDown={handleContextMenu}><MoreVertIcon></MoreVertIcon></button>

                      <button style={{ float: "right" }} onClick={fullscreen}><FullscreenIcon></FullscreenIcon></button>

                      {locked ?
                        <button id="lockButton" style={{ color: "red", float: "right" }} onClick={lock}><LockOutlineIcon id="lockIcon" /></button>
                        : <button id="lockButton" style={{ float: "right" }} onClick={lock}><LockOpenIcon id="lockIcon" /></button>}

                      <button style={{ float: "right" }} onClick={nextTheme}><ColorLensIcon></ColorLensIcon></button>

                      <button
                        style={{ height: 40, float: "right" }}
                        onClick={() => window.open('https://buymeacoffee.com/vsprojects5', '_blank')}>
                        🍺 Buy me a beer
                      </button>

                      {/* <button style={{ float: "right" }} onClick={checkForUpdates}>update</button> */}
                      {/* <button style={{ float: "right" }} onClick={logout}>Logout</button> */}
                      {/* <button style={{ float: "right" }}>{time}</button> */}

                    </td>
                  </tr>
                </tbody>
              </table>
              {mode == "normal" && showPickerButtons ?
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
                        {library.filter(l => l.type == "playlist").map(p => selectedTrack && p.tracks && p.tracks.some(t => t.id == selectedTrack.id) ? <span onClick={() => { addToSpotifyPlaylist(p, true) }} className='selected-track-bulb-on' key={p.id}>{p.name}</span> : <span onClick={() => { addToSpotifyPlaylist(p, false) }} className='selected-track-bulb-off' key={p.id}>{p.name}</span>)}
                      </td>
                    </tr>
                  </tbody>
                </table> : null}
            </div>
            <div className="main">
              {mode == "normal" ?
                <div className={'panel'}>
                  <PanelLibrary onDrop={onLibrayRowDrop} onMenuClick={handleContextMenu} onClick={(p) => { loadPlaylistPrev(p) }}></PanelLibrary>
                </div>
                : null}
              <div id="panel-main" className="panel-main">
                {/* <img src="https://mosaic.scdn.co/640/ab67616d00001e0204508fa56b3746ca1f90f73cab67616d00001e024206814685e7f97a78670cc9ab67616d00001e027b2ed55c469487b2be37cac0ab67616d00001e028e7da55a612d5dda4e2d6663" alt="Search" className="panel-image" /> */}

                {/* <img src={track && track.album && track.album.images && track.album.images[0].url} alt="Search" className="panel-image" />  */}
                {!isMobile() || true ? <div className="toolbar-wrapper">

                  {/* {selectedLibraryItem ?
                    <img className="" style={{ width: 20 }} src={selectedLibraryItem && selectedLibraryItem.images && selectedLibraryItem.images[2] ? selectedLibraryItem.images[2].url : selectedLibraryItem && selectedLibraryItem.images && selectedLibraryItem.images[0].url} />
                    :
                    <SearchIcon></SearchIcon>
                  } */}

                  {mode == "normal" ?
                    <>
                      <div className='toolbar-search'>
                        <SearchIcon className='toolbar-button' style={{ cursor: "pointer" }} onClick={() => { setSearchText(""); setSelectedLibraryItem(null); setSelectedLibraryIndex(-1); inputRef.current.focus(); }}></SearchIcon>
                        {selectedLibraryItem ? <img className="" style={{ width: 20 }} src={selectedLibraryItem && selectedLibraryItem.images && selectedLibraryItem.images[2] ? selectedLibraryItem.images[2].url : selectedLibraryItem && selectedLibraryItem.images && selectedLibraryItem.images[0].url} />

                          : null}

                        <input ref={inputRef} className="toolbar-input-search" placeholder="Search songs, artists, albums" onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />
                      </div>

                      {playlistChanged ? <SaveIcon onClick={saveSelectedPlaylist} className='toolbar-button'></SaveIcon> : null}

                      <div className='toolbar-icons'>
                        <SwapVertIcon className='toolbar-button'></SwapVertIcon>
                        <MoreVertIcon className='toolbar-button'></MoreVertIcon>
                      </div>
                    </> : null}



                </div> : null}
                {
                  loadingTracks ? <div className='loader'></div> :
                    <ReordableTrackList enableDrag={selectedLibraryItem && selectedLibraryItem.type == "playlist"} source="plprev" onDoubleClick={onPlaylistTrackDoubleClick} trackList={selectedPlaylistTracks} dragEndHandler={handleSelectedPlaylistDragEnd} keys={"spl"} onSwipedRight={onTracksSwipedRight} onDrop={addToPlaylist}></ReordableTrackList>

                  // getTracksPanel()
                }
              </div>
              <div className="panel" onDragOver={allowDrop} onDrop={() => { addToPlaylist(dragTrack) }}>
                {
                  playlistTracks.length > 0 ?
                    <ReordableTrackList enableDrag source="playlist" onDoubleClick={onPlaylistTrackDoubleClick} trackList={playlistTracks} dragEndHandler={handlePlaylistDragEnd} keys={"pl"} onSwipedRight={onTracksSwipedRight} onDrop={addToPlaylist}></ReordableTrackList>

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
                <Player locked={locked} onNext={() => { if (isLocked()) { return; } nextTrack() }} onError={playerError} stateChanged={playerStateChanged} token={token} trackid={track} onClick={() => setSelectedTrack(track)} playlists={library.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />


                : null} */}
              <SpotifyPlayer onNext={nextTrack} onArtistClick={(tr) => loadArtistInfo(tr)} locked={locked} onError={playerError} stateChanged={playerStateChanged} token={token} track={track} onClick={() => { setSelectedTrack(track) }} playlists={library.filter((pl) => pl.tracks && pl.tracks.some((t) => t.id == track.id))} ></SpotifyPlayer>
            </div>
          </div>
      )
      }
    </>

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
