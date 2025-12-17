import logo from './logo.svg';

import React, { useEffect, useState, useRef, cache } from "react";
import axios from "axios";
import Player from './components/player';
import TrackRow from './components/trackRow';
import api from './Api';
import PlaylistRow from './components/playlistRow';
import { getTour, sendMsgToDesktop, isDesktop, loadThemeCSS, isMobile, fullscreen, startUniverse, getTotalDurationString, flyToPlayer, flyToPlaylist, changeTheme, myShazamTracksPl, lastListenedPl } from './util';
import { faL, faLeaf, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';
import { loadLibray, deleteFromLibrary, saveLibrary, savePlaylists, loadPlaylists, saveBackgroundPlaylists, loadBackgroundPlaylists, addToHistory, getHistory, saveAlbums, loadAlbums, clearDatabase } from './database';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Tooltip from '@mui/material/Tooltip';
import Marquee from "react-fast-marquee";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import PreviewIcon from '@mui/icons-material/Preview';

import FavoriteIcon from '@mui/icons-material/Favorite';

import { Menu as CtxMenu, Item as CtxItem, Submenu as CtxSubmenu, MenuProvider as CtxMenuProvider, contextMenu as CtxContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import { ContextMenu } from 'primereact/contextmenu';

import Settings from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from './components/snackbar';
import { AddAlertRounded, AlignVerticalCenterTwoTone, Favorite, PlaylistAdd, Timelapse } from '@mui/icons-material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

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

import PanelLibrary from './components/panelLibrary';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Dialog from './components/dialog';
import PlaylistInfo from './components/playlistInfo';
import useAppStore from './AppStore';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LiquorIcon from '@mui/icons-material/Liquor';
import ArtistInfo from './components/artistInfo';

import UserAgreement from './components/userAgreement';


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
import { icon } from '@fortawesome/fontawesome-svg-core';

function useConstructor(callback) {
  const hasRun = useRef(false);
  if (!hasRun.current) {
    callback();
    hasRun.current = true;
  }
}


function App() {
  const { menuAnchor, playedFrom, setSelectedArtistTrackIndex, selectedArtistTrackIndex, setSelectedArtistAlbumIndex, setPlayedFrom, setMenuAnchor, setArtistInfoPosition, selectedArtist, setSelectedArtist, loadingArtistInfo, setLoadingArtistInfo, locked, setLocked, selectedLibraryIndex, setSelectedLibraryIndex, dragTrack, setDragTrack, dragSourceIndex, setDragSourceIndex, dragSource, setDragSource, library, filteredLibrary, setFilteredLibrary, selectedLibraryItem, setSelectedLibraryItem, setLibrary, loadingLibrary, setLoadingLibrary, menuPosition, selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex, setMenuPosition, selectedTrack, setSelectedTrack, selectedTrackIndex, setSelectedTrackIndex, playlistIndex, setPlaylistIndex } = useAppStore();
  const [contextMenu, setContextMenu] = useState(null);

  const [pickerPosition, setPickerPosition] = useState(JSON.parse(localStorage.getItem("pickerPosition")) || { x: 100, y: 100 });
  const Activity = React.Activity ?? React.unstable_Activity ?? (() => null);

  const [shufflePlaylist, setShufflePlaylist] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [albums, setAlbums] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);

  const [tracks, setTracks] = useState([]);

  const [selectedPlaylistTrack, setSelectedPlaylistTrack] = useState([]);

  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);

  const [plcMode, setPLCMode] = useState("tagger"); // or "edit"
  const [plcSelected, setPLCSelected] = useState([]);

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

  const [showPlaylistSaveAs, setShowPlaylistSaveAs] = useState(false);

  const [showNewPlaylistInfo, setShowNewPlaylistInfo] = useState(false);

  const [plcFilter, setPlcFilter] = useState("");


  const inputBuffer = useRef();

  const [time, setTime] = useState();

  const intervalRef = useRef();

  let timer = null;

  const tour = getTour();

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
    const init = async () => {
      const user = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (api.shouldRefreshToken() && token && user) {
        setReconnecting(true);
        await refreshAccessToken();
        window.location.reload();
        setReconnecting(false);
      }

      if (!intervalRef.current) startTimer();

      // tour.start();
    };

    init();

    // cleanup on unmount
    return () => clearInterval(intervalRef.current);
  }, []);



  useEffect(() => {

  }, [token]);

  const getPlaylistsAndAlbums = async () => {

    let cacheLibrary = await loadLibray();

    if (cacheLibrary && cacheLibrary.length > 0) {
      cacheLibrary = [...cacheLibrary];
      setLibrary(cacheLibrary);
      // setFilteredLibrary([myShazamTracksPl, lastListenedPl, ...cacheLibrary]);
    } else {

      let token = localStorage.getItem("token");
      if (!token) return;

      await updateLibrary();
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
      await getPlaylistsAndAlbums();
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

    debugger;
    let data = await api.refreshAccessToken();
    if (data.access_token) {
      setToken(data.access_token);
    }
  }

  const handleLockKeyDown = (event) => {

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

  const handleMenu = (e) => {
    //get htlm attribute data-source from e.currentTarget
    setMenuAnchor(e.currentTarget);
    e.preventDefault();
  };

  const toggleMode = () => {
    let m = mode === "normal" ? "compact" : "normal";
    localStorage.setItem("mode", m);
    setMode(m);
  }

  const togglePickers = () => {
    localStorage.setItem("showPickers", !showPickers);
    setShowPickers(!showPickers);
  }

  const [showPickers, setShowPickers] = useState(localStorage.getItem("showPickers") == "true");

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


      if (localStorage.getItem("showPickers") == "true") {
        setShowPickers(true);
      } else {
        setShowPickers(false);
      }

      let aiposition = localStorage.getItem("artistInfoPosition");
      if (aiposition) {
        setArtistInfoPosition(JSON.parse(aiposition));
      }


      const theme = localStorage.getItem("theme");
      if (theme) {

        await loadThemeCSS(theme);
      } else {

        await loadThemeCSS("bluescreen");
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
          window.localStorage.setItem("token", data.access_token);
          getPlaylistsAndAlbums();
          setLoadingToken(false);
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }

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
            // await getBackgroundPlaylists();
          }
        }
      }
      else {
        if (access_token) {
          if (library.length == 0) {
            // getPlaylistsAndAlbums();
            // getBackgroundPlaylists();
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
      let filtered = [];

      library.forEach(pl => {

        if (pl.name.toLowerCase().includes(st.toLowerCase())) {
          filtered.push(...pl.tracks);
        }

        allTracks = allTracks.concat(pl.tracks);
      });

      filtered.push(...allTracks.filter(tr => tr.name.toLowerCase().includes(st.toLowerCase()) || tr.artists?.[0]?.name.toLowerCase().includes(st.toLowerCase())));

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

      const lib = [...plsts, ...albms];

      saveLibrary(lib);
      setLibrary(lib);
      // setFilteredLibrary(lib);

      setLoadingLibrary(null);

    }
    catch (e) {
      alert("Error loading library: " + e.message);
      //go to login page
      setToken("");
    }

  }

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

      let newLibrary = [...library];
      newLibrary = newLibrary.filter(pl => !deleted.some(d => d.id === pl.id));
      setLibrary(newLibrary);
      // setFilteredLibrary(newLibrary);
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

      if (cachedPlaylist?.name == "Klinci") {

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

  const addToPlaylist = async (track, position, id) => {


    debugger;

    // if(dragSource == "playlist") 
    //   return;
    setDragSource(null);
    setDragTrack(null);

    let newTrack = { ...track };

    if (isMobile())
      flyToPlaylist(id);

    let pl = [...playlistTracks];

    if (dragSource == "playlist") {
      if (isLocked()) {
        return;
      } else {
        pl.splice(dragSourceIndex, 1);
      }
    }

    if (dragSource == "library") {
      const selPl = filteredLibrary[dragSourceIndex];

      if (selPl.tracks?.length == 0) {
        selPl.tracks = await api.getAlbumTracks(selPl.id);
        pl = [...playlistTracks, ...selPl.tracks]
        setPlaylistTracks(pl);
        return;

      }
      else {
        pl = [...playlistTracks, ...selPl.tracks];
        setPlaylistTracks(pl);
        return;
      }

    }



    if (dragSource == "artist-info-album" && !locked) {
      const selPl = selectedArtist.albums[dragSourceIndex];
      const trcks = await api.getAlbumTracks(selPl.id);
      pl = [...playlistTracks, ...trcks];
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


  const addToPLCSelected = (pl, selected) => {
    let sel = [...plcSelected];
    if (selected) {
      sel.push(pl);
    } else {
      sel = sel.filter(x => x != pl);
    }

    setPLCSelected(sel);
    //need all tracks from library that are in every playlist in plcSelected
    const result = getCommonTracks(sel);
    debugger;

    setSelectedPlaylistTracks(result);

  }

  function getCommonTracks(selectedPlaylists = []) {
    // normalize to IDs
    const selIds = selectedPlaylists.map(p => (typeof p === 'string' ? p : p.id));

    // find matching playlists in library
    const selected = library.filter(p => selIds.includes(p.id));
    if (selected.length === 0) return [];
    if (selected.length === 1) return Array.from(selected[0].tracks);

    // make sets of track IDs (handle tracks that may be objects or primitives)
    const trackIdSets = selected.map(p =>
      new Set(p.tracks.map(t => (t && typeof t === 'object') ? t.id ?? t : t))
    );

    // intersection of track ids
    const commonIds = [...trackIdSets[0]].filter(id =>
      trackIdSets.every(s => s.has(id))
    );

    // try to return full track objects where available (search first playlist that contains the object)
    const idToTrackObj = new Map();
    for (const p of selected) {
      for (const t of p.tracks) {
        const tid = (t && typeof t === 'object') ? t.id ?? t : t;
        if (!idToTrackObj.has(tid)) idToTrackObj.set(tid, t);
      }
    }

    // build result array preferring full objects when we discovered them
    return commonIds.map(id => idToTrackObj.get(id) ?? id);
  }



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
        res = await api.removeTrackFromPlaylist(pl, tr);
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


    debugger;
    if (dragSource == "plprev") {


      if (selectedLibraryItem && selectedLibraryItem.id == "LastListened" || selectedLibraryItem.id == "MyShazamedTracks" || selectedLibraryItem.type == "album")
        return;


      if (selectedLibraryIndex) {

        let pl = filteredLibrary[selectedLibraryIndex];
        const tr = pl.tracks[dragSourceIndex];
        pl.tracks.splice(dragSourceIndex, 1);
        setSelectedTrackIndex(-1);
        const res = await api.removeTrackFromPlaylist(pl, tr);

        let pls = [...library];
        let oldPl = pls.find(x => x.id == pl.id);
        oldPl = pl;
        oldPl.count = pl.tracks.length;
        oldPl.snapshot_id = res.snapshot_id;
        setSelectedPlaylistTracks(pl.tracks);
        setLibrary(pls);
        // setFilteredLibrary(pls);
        saveLibrary([pl]);
        closeContextMenu();
      }
    }
  }


  const removeTrackFromPlaylist = async (index, tr) => {

    if (isLocked()) return;
    //remove selectedPlaylistTrackindex from playlist


    debugger;
    if (isMobile()) {
      flyToPlaylist(tr);
      setTimeout(() => {
        let pl = [...playlistTracks];
        pl.splice(index, 1);
        setPlaylistTracks(pl);
        closeContextMenu();
      }, 250);
    } else {

      if (dragSource == "tracks" && selectedLibraryIndex >= 0) {
        removeTrackFromSpotifyPlaylist();
      } else {
        let pl = [...playlistTracks];
        pl.splice(selectedPlaylistTrackIndex, 1);
        setPlaylistTracks(pl);
        setSelectedPlaylistTrackIndex(null);
        setSelectedPlaylistTrack(null);
        setPlaylistIndex(-1);
        closeContextMenu();

      }

    }
  }

  //   //remove selectedPlaylistTrackindex from playlist
  // if (!isMobile() && dragSource == "playlist") {
  //   let pl = [...playlist];
  //   pl.splice(selectedPlaylistTrackIndex, 1);
  //   setPlaylistTracks(pl);
  //   closeContextMenu();
  // }

  const isLocked = () => {
    let l = localStorage.getItem("locked") == "true";
    const btn = document.getElementById("button-lock");

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
    //remove this tr from playlistTracks and flyto player
    let pl = [...playlistTracks];
    pl.splice(index, 1);
    setPlaylistTracks(pl);
    flyToPlayer("pl" + index + "-" + tr.id);


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

  const play = async (track, plFrom) => {

    setPlayedFrom(plFrom);
    // alert("play");

    console.log(track);
    if (api.shouldRefreshToken()) {
      await refreshAccessToken();
    }

    startUniverse();
    addToHistory(track);
    setTrack(track);
    setSelectedTrack(track);
    let pls = library.filter(x => x.tracks?.some(x => x.id == track.id));
    for (const pl of pls) {
      const trs = pl.tracks.filter(x => x.id == track.id);
      for (const tr of trs) {
        tr.datePlayed = new Date();
      }
    }

    await saveLibrary(pls);

    getPlaylistsAndAlbums();

  }

  const nextTrack = async (cached, newPlaylist) => {
    setPlayedFrom("");
    // if (playPosition == "playlist") {
    //   setPlayIndex(playIndex + 1);
    //   play(playlist[playIndex + 1]);
    // }


    if (newPlaylist?.type == "album") {
      if (newPlaylist.tracks == undefined || newPlaylist.tracks?.length == 0) {
        newPlaylist.tracks = await api.getAlbumTracks(newPlaylist.id);
      }
    }

    if (newPlaylist) {
      let pl = [...newPlaylist.tracks];


      if (shufflePlaylist) {
        const randomIndex = Math.floor(Math.random() * pl.length);
        play(pl[randomIndex], "dynamic playlist");
        flyToPlayer("pl" + randomIndex + "-" + pl[randomIndex].id);
        pl.splice(randomIndex, 1);
        setPlaylistTracks(pl);
        return;
      } else {
        flyToPlayer("pl0-" + pl[0].id);
        play(pl[0], "dynamic playlist");
        pl.shift();
        setPlaylistTracks(pl);
        return;
      }
    }

    const bpl = cached ? cached : await loadBackgroundPlaylists();


    if (playlistTracks.length > 0) {
      let pl = [...playlistTracks];

      if (shufflePlaylist) {
        const randomIndex = Math.floor(Math.random() * pl.length);
        play(pl[randomIndex]);
        flyToPlayer("pl" + randomIndex + "-" + pl[randomIndex].id);
        pl.splice(randomIndex, 1);
        setPlaylistTracks(pl);
        return;
      } else {
        flyToPlayer("pl0-" + pl[0].id);
        play(pl[0]);
        pl.shift();
        setPlaylistTracks(pl);
        return;
      }
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

    play(pl.tracks[randomTrIndex], pl.name);
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
    // setPlaylistsFilterText(text);
    // //filter playlists by text
    // let allPlaylists = [...library];
    // if (text.trim() == "") {
    //   setFilteredLibrary(allPlaylists);
    // } else {
    //   const filtered = allPlaylists.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
    //   setFilteredLibrary(filtered);
    // }
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
            <TrackRow id={tr.id} key={tr.id} value={tr.name} onSwipedRight={() => { addToPlaylist(tr, null, tr.id) }} onContextMenu={handleMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => { onPlaylistTrackDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
            <TrackRow id={tr.id} key={tr.id} onContextMenu={handleMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragSourceIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />
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


  const getLastListened = async () => {

    let lastTracks = await getHistory();

    lastTracks.sort((a, b) => {
      return b.datePlayed - a.datePlayed;
    });

    return lastTracks;
  }

  const getMyShazamTracks = async () => {

    setLoadingTracks(true);
    const id = localStorage.getItem("myShazamTracksID");
    if (!id) {
      alert("Cant find My Shazam tracks id");
      return [];
    }

    const tracks = await api.getTracks(id, 50);

    setLoadingTracks(false);
    return tracks;
  }

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

      if (selectedArtist?.id != selectedTrack?.artists?.[0]?.id) {
        if (showArtistInfo) { }
        // loadArtistInfo(selectedTrack);
      }

    }
  }, [selectedTrack]);

  const inputRef = useRef(null);

  const onAlbumClick = async (album) => {
    setSelectedLibraryItem(album);
    setSearchText(album.name);
    setLoadingTracks(true);
    let tracks = await api.getAlbumTracks(album.id);
    setLoadingTracks(false);
    setSelectedPlaylistTracks(tracks);
  }

  const tracksRef = useRef(null);

  const loadPlaylistPrev = async (pl) => {
    setCurrentTab("plprev");
    // pl.tracks.map((tr) => tr.uid = newGuid());

    if (tracksRef.current) {
      tracksRef.current.scrollToIndex({
        index: 0,
        align: 'start',
        behavior: 'auto', // or 'smooth'
      });
    }

    setLoadingTracks(true);

    if (pl.id == "MyShazamedTracks") {
      setSelectedLibraryItem(null);
      setSelectedLibraryIndex(-1);

      pl.tracks = await getMyShazamTracks();
    }

    if (pl.id == "LastListened") {
      setSelectedLibraryItem(null);
      setSelectedLibraryIndex(-1);
      pl.tracks = await getLastListened();
    }

    if (pl.tracks?.length == 0 && pl.type == "album") {
      pl.tracks = await api.getAlbumTracks(pl.id);
    }

    setSearchText(pl.name);
    setSelectedLibraryItem(pl);
    setPlaylistChanged(false);
    setSelectedPlaylistTracks(pl.tracks || []);

    setSelectedPlaylistTrackIndex(-1);
    setSelectedTrackIndex(-1);
    setSelectedPlaylistTrack(null);

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

  const onPlaylistInfoSave = async (playlist, name, description, isPublic, collaborative) => {
    const result = await api.savePlaylistInfo(playlist, name, description, isPublic, collaborative);
    if (result.ok) {
      let pls = [...library];
      let pl = pls.find(x => x.id == playlist.id);
      pl.name = name;
      pl.description = description;
      pl.public = isPublic;
      pl.collaborative = collaborative;

      setLibrary(pls);
      // setFilteredLibrary(pls);
      saveLibrary(pls);
      setSelectedLibraryItem(playlist);
    }
  }

  const onNewPlaylistInfoSave = async (playlist, name, description) => {

    const newPl = await api.createPlaylist(name, description);
    if (newPl) {
      let pls = [...library];
      pls.unshift(newPl);
      setLibrary(pls);
      // setFilteredLibrary(pls);
      saveLibrary(pls);
      setSelectedLibraryItem(newPl);
    }
  }

  const savePlaylistAs = async (pl, name, description, isPublic, collaborative) => {
    debugger;
    const newPl = await api.createPlaylist(name, description, isPublic, collaborative);
    const result = await api.addTracksToPlaylist(newPl, playlistTracks);
    if (result) {
      newPl.snapshot_id = result.snapshot_id;
      newPl.count = playlistTracks.length;
      newPl.tracks = [...playlistTracks];
      let pls = [...library];
      pls.unshift(newPl);
      setLibrary(pls);
      setFilteredLibrary(myShazamTracksPl, lastListenedPl, pls);
      saveLibrary(pls);
    }
  }

  const [contextMenuItems, setContextMenuItems] = useState([]);

  const handleContextMenu = (e) => {


    // CtxContextMenu.show({
    //   id: MENU_ID,
    //   event: e
    // });

    e.preventDefault();
    setMenuPosition({ x: e.pageX, y: e.pageY });
  };


  const deletePlaylist = async (pl) => {

    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      closeContextMenu();
      return;
    }


    if (pl) {
      await api.deletePlaylist(pl);
      let pls = [...library];
      pls = pls.filter(x => x.id != pl.id);
      setLibrary(pls);
      // setFilteredLibrary(pls);
      await deleteFromLibrary(pl);
      setSelectedLibraryItem(null);
      closeContextMenu();
    }
  }

  const unfollowAlbum = async (album) => {
    await api.unfollowAlbum(album);
    let pls = [...library];
    pls = pls.filter(x => x.id != album.id);
    setLibrary(pls);
    // setFilteredLibrary(pls);
    await deleteFromLibrary(album);
    setSelectedLibraryItem(null);
    closeContextMenu();
  }

  const followAlbum = async (album) => {
    debugger;
    const newAlbum = await api.followAlbum(album);
    if (newAlbum.ok) {
      let simplifiedAlbum = api.simplifiAlbum(album);
      // await updateLibrary([simplifiedAlbum]);
      let pls = [...library];
      pls.unshift(simplifiedAlbum);
      setLibrary(pls);
      // setFilteredLibrary(pls);
      saveLibrary([simplifiedAlbum]);
      setSelectedLibraryItem(simplifiedAlbum);
      closeContextMenu();
    }
  }

  const onArtistAlbumContextMenu = (e, album, index) => {
    let items = [];
    if (library.some(p => p.id == album.id))
      items.push({ label: "Unfollow album", onClick: () => unfollowAlbum(album), icon: <BlockIcon /> });
    if (!library.some(p => p.id == album.id))
      items.push({ label: "Follow album", onClick: () => followAlbum(album), icon: <FavoriteIcon /> });

    if (album.type != "featured")
      items.push({ label: "Play in queue", onClick: () => { if (!isLocked()) nextTrack(null, album) }, icon: <PlayCircleIcon /> });

    setSelectedArtistAlbumIndex(index);
    setContextMenuItems(items);
    handleContextMenu(e);
  }

  const onArtistTrackContextMenu = (e, track, index) => {
    debugger;
    let items = [];
    items.push({ label: "Add to queue", onClick: () => { addToPlaylist(track, null, 0) }, icon: <PlaylistAddIcon /> });
    setContextMenuItems(items);
    setSelectedArtistTrackIndex(index);
    setSelectedTrack(track);
    handleContextMenu(e);
  }


  const addLibrayItemToQueue = async (playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      setPlaylistTracks([...playlist.tracks]);
    } else {
      if (playlist.type == "album") {
        let tracks = await api.getAlbumTracks(playlist.id)
        setPlaylistTracks(tracks);
      }
    }
  }


  const onLibraryItemContextMenu = (e, playlist, index) => {

    if (index) //ako je index nedefiniran onda je iz PLC
      loadPlaylistPrev(playlist);

    let items = [];

    let userID = localStorage.getItem("userId");


    if (playlist.type != "featured" && !index)
      items.push({ label: "Preview", onClick: () => { loadPlaylistPrev(playlist) }, icon: <PreviewIcon /> });

    if (playlist.owner_id == userID)
      items.push({ label: "Edit playlist", onClick: () => setShowPlaylistInfo(true), icon: <EditIcon /> });

    if (playlist.type == "album" && library.some(p => p.id == playlist.id))
      items.push({ label: "Unfollow album", onClick: () => unfollowAlbum(playlist), icon: <BlockIcon /> });

    if (playlist.type == "album" && !library.some(p => p.id == playlist.id))
      items.push({ label: "Follow album", onClick: () => followAlbum(playlist), icon: <FavoriteIcon /> });

    if (playlist.type != "featured")
      items.push({ label: "Add to queue", onClick: () => { if (!isLocked()) addPlaylistToToPlaylist(playlist) }, icon: <PlaylistAddIcon /> });

    if (playlist.type != "featured")
      items.push({ label: "Play in queue", onClick: () => { if (!isLocked()) nextTrack(null, playlist) }, icon: <PlayCircleIcon /> });
    // selectedLibraryItem.type == "artist" &&
    //   items.push({ label: "Unfollow artist", onClick: () => removeArtistFromLibrary(selectedLibraryItem) });
    items.push({ label: "-" });

    if (playlist.type == "playlist")
      items.push({ label: "Delete playlist", onClick: () => deletePlaylist(playlist), icon: <DeleteIcon /> });


    setContextMenuItems(items);

    if (index)
      setSelectedLibraryIndex(index);

    if (index)
      setSelectedLibraryItem(playlist);

    handleContextMenu(e);
  }

  const closeContextMenu = () => {
    setMenuPosition(null);
  };


  const [ctxAlbums, setCtxAlbums] = useState([]);


  const loadCtxAlbums = () => async () => {


    console.log("Loading albums for track");

    const artistId = selectedTrack?.artists?.[0]?.id;
    if (!artistId) return;
    const albums = await api.getArtistAlbums(artistId);
    let items = albums.map(album => ({
      label: album.name,
      onClick: () => { onAlbumClick(album); }
    }));
    setCtxAlbums(items);
  }

  const onTrackContextMenu = (e, track, index) => {
    let items = [];
    items.push({ label: "Add to queue", onClick: () => { addToPlaylist(track, null, 0) }, icon: <PlaylistAddIcon /> });
    items.push({ label: "Artist info", onClick: () => { setSelectedTrack(track); loadArtistInfo(track); setShowArtistInfo(true) }, icon: <PersonIcon /> });

    // items[1].items = [
    //   { label: "Top tracks", onClick: () => { loadArtistInfo(track); } },
    //   { label: "Albums", onClick: async () => { }, onEnter: (track) => loadCtxAlbums(track) }
    // ];

    // items[1].items[1].items = ctxAlbums;

    setContextMenuItems(items);

    setSelectedTrackIndex(index);
    setSelectedTrack(track);
    handleContextMenu(e);
  }

  const onPlaylistContextMenu = (e, track, index) => {
    setDragSource("playlist");
    let items = [];
    // items.push({ label: "Remove from queue", onClick: () => { removeTrackFromPlaylist(); } });
    items.push({ label: "Artist info", onClick: () => { setSelectedTrack(track); loadArtistInfo(track); setShowArtistInfo(true) }, icon: <PersonIcon /> });
    items.push({ label: "Remove from queue", onClick: () => { removeTrackFromPlaylist() }, icon: <PlaylistRemoveIcon /> });

    setContextMenuItems(items);
    setPlaylistIndex(index);
    setSelectedTrack(track);
    handleContextMenu(e);
  }



  let loading = false;
  let subItems = ["Option 1", "Option 2", "Option 3"];
  const MENU_ID = "my-context-menu";

  const getSelectedTrack = () => {
    return selectedTrack;
  }

  const [showArtistInfo, setShowArtistInfo] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);


  const steps = [{
    target: '#tour1',
    content: 'This is my awesome feature!',
  }];

  const handleDownloadDesktopApp = () => {
    const link = document.createElement("a");
    link.href = "https://lumtu.net/setupX64.zip"; // file URL
    link.setAttribute("download", "setupX64.zip");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (

    localStorage.getItem("userAgreementAccepted") != "true" ? <UserAgreement></UserAgreement>
      :
      <>

        {/* <CtxMenu id={MENU_ID}>
        <CtxItem >Refresh</CtxItem>

        <CtxSubmenu label="More Options">
          {loading && <CtxItem disabled>Loading...</CtxItem>}

          {!loading && subItems.map(i => (
            <CtxItem key={i}>{i}</CtxItem>
          ))}
        </CtxSubmenu>

        <CtxItem>Settings</CtxItem>
      </CtxMenu > */}

        {/* <CtxMenu id={MENU_ID}>
        {contextMenuItems.map((item, index) => (
          item.items ?
            <CtxSubmenu key={index} label={item.label}>


              {item.items.map((subItem, subIndex) => (
                subItem.items ?


                  <CtxSubmenu key={subIndex}

                    label={
                      <div
                        onMouseEnter={() => subItem.onEnter && subItem.onEnter()(getSelectedTrack())}
                      >
                        {subItem.label}
                      </div>
                    }
                  >

                    {subItem.label == "Albums" ?

                      ctxAlbums.map((subSubItem, subSubIndex) => (
                        <CtxItem key={subSubIndex}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", item);
                          }}
                          onMouseDown={(e) => { subSubItem.onClick(); e.stopPropagation(); closeContextMenu(); }}

                        >{subSubIndex}</CtxItem>

                      )) :
                      subItem.items.map((subSubItem, subSubIndex) => (
                        <CtxItem key={subSubIndex}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", item);
                          }}
                          onMouseDown={(e) => { subSubItem.onClick(); e.stopPropagation(); closeContextMenu(); }}

                        >{subSubItem.label}</CtxItem>

                      ))
                    }

                  </CtxSubmenu>

                  :
                  <CtxItem key={subIndex}
                    draggable

                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item);
                    }}
                    onMouseDown={(e) => { subItem.onClick(); e.stopPropagation(); closeContextMenu(); }}

                  >{subItem.label}

                  </CtxItem>

              ))}




            </CtxSubmenu>
            :
            <CtxItem
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", item);
              }}
              onMouseDown={(e) => { item.onClick(); e.stopPropagation(); closeContextMenu(); }} >{item.label}</CtxItem>

        ))}
      </CtxMenu > */}

        {menuPosition && (
          <div className="context-menu"
            style={{
              top: menuPosition.y,
              left: menuPosition.x,
            }}
          >
            {contextMenuItems.map((item, index) => (

              item.label == "-" ?
                <span key={index}></span> :
                <div style={{ display: "flex", alignItems: "center", gap: 6 }} key={index} onMouseDown={(e) => { item.onClick(); e.stopPropagation(); closeContextMenu(); }} >
                  {item.icon ? item.icon : null} {item.label}
                </div>
            ))}
          </div>
        )
        }

        {
          menuAnchor &&
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
              <MenuItem onClick={() => setShowNewPlaylistInfo(true)}>
                New playlist
              </MenuItem> : null}

            {menuAnchor.getAttribute("menu-target") == "library" ?
              <MenuItem onClick={checkForUpdates}>
                Update library
              </MenuItem> : null}

            {/* {menuAnchor.getAttribute("menu-target") == "settings" ?
              <MenuItem onClick={toggleMode}>
                {mode == "normal" ? "Party mode" : "Standard mode"}
              </MenuItem> : null} */}

            {menuAnchor.getAttribute("menu-target") == "settings" && !isDesktop() ?
              <MenuItem onClick={handleDownloadDesktopApp}>
                Download desktop app
              </MenuItem> : null}

            {menuAnchor.getAttribute("menu-target") == "settings" ?
              <MenuItem onClick={() => tour.start()}>
                Take a tour
              </MenuItem> : null}

            {menuAnchor.getAttribute("menu-target") == "settings" ?
              <MenuItem onClick={logout}>
                Log out
              </MenuItem> : null}

            {menuAnchor.getAttribute("menu-target") == "library-item" ?
              <MenuItem onClick={() => setShowPlaylistInfo(true)}>
                Edit playlist
              </MenuItem> : null}

            {/* {menuAnchor.getAttribute("menu-target") == "tracks" ?
              <MenuItem onClick={() => setPlaylistTracks([])}>
                Something
              </MenuItem> : null} */}

            {menuAnchor.getAttribute("menu-target") == "playlist" ?
              <MenuItem onClick={() => { if (!isLocked()) setPlaylistTracks([]) }}>
                Clear playlist
              </MenuItem> : null}

            {menuAnchor.getAttribute("menu-target") == "playlist" ?
              <MenuItem onClick={() => setShowPlaylistSaveAs(true)}>
                Save as
              </MenuItem> : null}


          </Menu>
        }

        {/* <Moveable
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
      /> */}

        {
          showPlaylistInfo ?
            <PlaylistInfo onSave={onPlaylistInfoSave} onClose={(() => setShowPlaylistInfo(false))} playlist={selectedLibraryItem}></PlaylistInfo> : null
        }

        {
          showNewPlaylistInfo ?
            <PlaylistInfo title="New playlist" onSave={onNewPlaylistInfoSave} onClose={(() => setShowNewPlaylistInfo(false))}></PlaylistInfo> : null
        }

        {
          showPlaylistSaveAs ?
            <PlaylistInfo title="New playlist" onSave={savePlaylistAs} onClose={(() => setShowPlaylistSaveAs(false))}></PlaylistInfo> : null
        }

        {
          dragTrack && dragSource != "artist-info-track" && dragSource != "artist-info-album" && dragSource != "player" && selectedLibraryItem?.type != "album" && selectedLibraryItem?.type != "featured" ?
            <div className='trash-container' onDragOver={(e) => { e.currentTarget.classList.add('drag-over'); e.preventDefault() }} onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }} onDrop={onTrash}>
              <DeleteIcon className="trash-icon" style={{ fontSize: 60 }} />
            </div> : null
        }


        {showArtistInfo ?
          <ArtistInfo onArtistAlbumContextMenu={onArtistAlbumContextMenu} onArtistTrackContextMenu={onArtistTrackContextMenu} onAlbumClick={onAlbumClick} onTrackDoubleClick={(tr) => play(tr)} onClose={() => setShowArtistInfo(false)}></ArtistInfo> : null
        }

        {
          // selectedArtist || loadingArtistInfo ?
          //   <div className='panel-dialog target' id="artist-info">
          //     <div className="close-btn" onClick={() => { setSelectedArtist(null); setLoadingArtistInfo(false) }}>x</div>

          //     {loadingArtistInfo ? <div className='loader' style={{ position: "absolute" }}></div> :
          //       <>
          //         <img className='artist-info-img' src={selectedArtist && selectedArtist.images && selectedArtist.images.length > 0 && selectedArtist.images[0].url} />
          //         <div className='artist-info-name'>{selectedArtist && selectedArtist.name}</div>
          //         <Tabs style={{ width: "100%" }}>
          //           <TabList className="custom-tablist">
          //             <Tab className="custom-tab">
          //               Top Tracks
          //             </Tab>
          //             <Tab className="custom-tab">
          //               Albums
          //             </Tab>
          //           </TabList>

          //           <TabPanel>
          //             {selectedArtist && selectedArtist.tracks.map((tr, index) => {
          //               return <TrackRow id={"atr" + tr.id} onAddToPlaylistButton={() => { addToPlaylist(tr) }} onContextMenu={handleMenu} index={index} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setDragSourceIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { if (isLocked()) { return; } setPlayIndex(index); setPlayPosition("main"); play(tr) }} />
          //             })}
          //           </TabPanel>
          //           <TabPanel>
          //             {selectedArtist && selectedArtist.albums.map((a, index) => {
          //               return <div className="artist-info-album-row" key={"a" + a.id} onClick={() => { onAlbumClick(a) }}>
          //                 <img

          //                   className="artist-info-album-img"
          //                   src={a.images && a.images[2] && a.images[2].url}
          //                   alt={a.name}
          //                 />
          //                 <div className="artist-info-album-details">
          //                   <div className="artist-info-album-name">{a.name}</div>
          //                   <div className="artist-info-album-tracks">{a.total_tracks} tracks</div>
          //                   <div className="artist-info-album-year">{a.release_date}</div> {/* assuming a.year exists */}
          //                 </div>
          //               </div>
          //             })}
          //           </TabPanel>
          //         </Tabs></>}

          //   </div> : null
        }

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
            <img
              src={process.env.PUBLIC_URL + '/logo.png'}
              style={{ display: "block", width: isMobile() ? 100 : 270, objectFit: 'cover' }}
            />
            connecting to Spotify<span>.</span><span>.</span><span>.</span>
          </div>
        </div>

        <canvas id="field" className="universe"></canvas>

        {
          !token ? (

            loadingToken ?
              <div className='menu-container' style={{ height: "100vh", width: "100vw", top: "0", left: "0", position: "absolute" }}>
                <div className='loader' style={{ position: "absolute" }}></div>
              </div>
              :
              <div className='menu-container' style={{ height: "100vh" }}>
                <img
                  src={process.env.PUBLIC_URL + '/logo.png'}
                  style={{ display: "block", width: isMobile() ? 100 : 270, objectFit: 'cover' }}
                />
                {/* <div className='app-title' style={{fontSize:40}}>
                  <span>LUMTU</span>
                  <span style={{ opacity: 0.5 }} className='app-title-dj'>MANAGER</span><br></br>
                  
                </div> */}
                <button style={{ fontSize: 20, padding: 10, border: "2px solid white", padding: 20 }} onClick={handleLogin}>Login with Spotify</button>
              </div>

          ) : (

            isMobile() ?
              <div className='layout' id="layout">

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
                          <PanelLibrary onMenuClick={handleMenu} onClick={(p) => { loadPlaylistPrev(p) }}></PanelLibrary>
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
                            {/* <SearchIcon className="search-icon" /> */}
                            <input ref={inputRef} className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />
                          </div>
                          <div className="panel-search-mobile">
                            <ReordableTrackList onClick={(tr, index) => { setSelectedTrack(tr); setSelectedTrackIndex(index) }} ref={tracksRef} selectedIndex={selectedTrackIndex} onContextMenu={onTrackContextMenu} enableDrag={selectedLibraryItem && selectedLibraryItem.type == "playlist"} source="plprev" onDoubleClick={onPlaylistTrackDoubleClick} trackList={selectedPlaylistTracks} dragEndHandler={handleSelectedPlaylistDragEnd} keys={"spl"} onSwipedRight={onTracksSwipedRight} onDrop={addToPlaylist}></ReordableTrackList>


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
                        <button style={{ float: "right" }} onClick={() => setIsFullscreen(fullscreen())}>

                          {isFullscreen ? <FullscreenExitIcon></FullscreenExitIcon> :
                            <FullscreenIcon></FullscreenIcon>}

                        </button>

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
                    <SpotifyPlayer onNext={nextTrack} onClick={() => { showArtistInfo(true); loadArtistInfo(track) }} onError={playerError} stateChanged={playerStateChanged} token={token} track={track} onLongPress={(track, e) => { e.stopPropagation(); setSelectedTrack(track); setShowPlaylistPicker(true) }} playlists={library.length > 0 && library.length > 0 && library.filter((pl) => pl.tracks && pl.tracks.some((t) => t.id == track.id))} ></SpotifyPlayer>

                    : null}
                </div>
              </div >
              :

              <div className='layout' id="layout" onContextMenu={(e) => e.preventDefault()} onMouseDown={closeContextMenu} >
                <div className="header" onMouseDown={(e) => sendMsgToDesktop("ondragwindow")}>
                  <table style={{ width: "100%", tableLayout: "fixed" }}>
                    <tbody>
                      <tr>
                        <td >
                          <div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>


                            {mode != "compact" ?
                              <div onContextMenu={handleMenu} className='app-title'>
                                <span>LUMTU</span>
                                <span style={{ opacity: 0.5 }} className='app-title-dj'>MANAGER</span><br></br>
                                {/* <span style={{fontSize:9, marginTop:-10}}>since 2001</span> */}
                              </div> : null}


                            {mode == "compact" ?
                              <div className="toolbar-wrapper" style={{ paddingLeft: 0 }}>
                                {/* <SearchIcon className="search-icon" /> */}
                                <input className="input-search" placeholder="Search..." onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />
                              </div> : null}

                            {/* <button onClick={checkForUpdates}>Check for updates</button> */}
                            {/* <button onClick={checkForUpdates}>Check for updates</button> */}
                            {/* <button onClick={refreshAccessToken}>refresh at</button> */}
                            {/* <button onClick={startUniverse}>start</button> */}

                            {/* <button className='header-button-small' onClick={() => loadPlaylistPrev(lastListenedPl)}><HistoryIcon></HistoryIcon></button> */}


                            {/* <button className='header-button-small' onClick={toggleMode}><LiquorIcon></LiquorIcon></button> */}

                            {/* <button className='header-button-small' style={{ width: 100, padding: 5 }} onClick={() => loadPlaylistPrev(myShazamTracksPl)}>{myShazamTracksPlIcon}</button> */}
                            {/* <button className='header-button-small' style={{ width: 100 }} onClick={playerError}>Token</button> */}
                          </div>
                        </td>
                        {mode == "ne prikazuj trenutno" ?
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
                          <div onContextMenu={handleMenu} className='app-title2'>
                            {/* {mode == "compact" ? <span>QUEUE</span> : null} */}
                            {/* <span style={{ opacity: 0.5 }} className='app-title-dj'>DJ</span><br></br> */}
                            {/* <span style={{fontSize:9, marginTop:-10}}>since 2001</span> */}
                          </div>



                          {isDesktop() && <>
                            <Tooltip enterDelay={500} title="Exit">
                              <button style={{ float: "right" }} onMouseDown={e => e.stopPropagation()} onClick={() => { sendMsgToDesktop("onclose") }}>
                                <DisabledByDefaultIcon></DisabledByDefaultIcon>
                              </button>
                            </Tooltip>

                            <Tooltip enterDelay={500} title="Maximize window">
                              <button style={{ float: "right" }} onMouseDown={e => e.stopPropagation()} onClick={() => { sendMsgToDesktop("onmaximize") }}>
                                <MaximizeIcon></MaximizeIcon>
                              </button>
                            </Tooltip>

                            <Tooltip enterDelay={500} title="Minimize window">
                              <button style={{ float: "right" }} onMouseDown={e => e.stopPropagation()} onClick={() => { sendMsgToDesktop("onminimize") }}>
                                <MinimizeIcon></MinimizeIcon>
                              </button>
                            </Tooltip>
                          </>}

                          <Tooltip enterDelay={500} title="Toggle fullscreen mode">
                            <button style={{ float: "right" }} onMouseDown={e => e.stopPropagation()} onClick={() => isDesktop() ? sendMsgToDesktop("onfullscreen") : setIsFullscreen(fullscreen())}>
                              {isFullscreen ? <FullscreenExitIcon></FullscreenExitIcon> :
                                <FullscreenIcon></FullscreenIcon>}
                            </button>
                          </Tooltip>

                          <button onMouseDown={e => e.stopPropagation()} style={{ float: "right", marginRight: "30px" }} menu-target="settings" onClick={handleMenu}><MoreVertIcon></MoreVertIcon></button>

                          <Tooltip enterDelay={500} title="Toggle lock mode">
                            {locked ?
                              <button id="button-lock" onMouseDown={e => e.stopPropagation()} style={{ color: "red", float: "right" }} onClick={lock}><LockOutlineIcon id="lockIcon" /></button>
                              : <button id="button-lock" onMouseDown={e => e.stopPropagation()} style={{ float: "right" }} onClick={lock}><LockOpenIcon id="lockIcon" /></button>}
                          </Tooltip>

                          <Tooltip enterDelay={500} title="Change theme">
                            <button id="button-theme" onMouseDown={e => e.stopPropagation()} style={{ float: "right" }} onClick={nextTheme}><ColorLensIcon></ColorLensIcon></button>
                          </Tooltip>

                          <Tooltip enterDelay={500} title="Toggle playlist controller">
                            <button id="button-plc" onMouseDown={e => e.stopPropagation()} className='header-button-small' style={{ float: "right" }} onClick={togglePickers}><ChecklistIcon></ChecklistIcon></button>
                          </Tooltip>

                          <Tooltip enterDelay={500} title="Toggle library">
                            <button id="button-library" onMouseDown={e => e.stopPropagation()} className='header-button-small' style={{ float: "right" }} onClick={toggleMode}><LibraryMusicIcon></LibraryMusicIcon></button>
                          </Tooltip>

                          {/* <button
                            onMouseDown={e => e.stopPropagation()}
                            style={{ height: 40, float: "right" }}
                            onClick={() => window.open('https://buymeacoffee.com/vsprojects5', '_blank')}>
                            🍺 Buy me a beer
                          </button> */}

                          {/* <button style={{ float: "right" }} onClick={checkForUpdates}>update</button> */}
                          {/* <button style={{ float: "right" }} onClick={logout}>Logout</button> */}
                          {/* <button style={{ float: "right" }}>{time}</button> */}

                        </td>
                      </tr>
                    </tbody>
                  </table>

                </div>
                <div className="main">
                  {mode == "normal" ?
                    <div className="panel" id="library">
                      <PanelLibrary onContextMenu={onLibraryItemContextMenu} onDrop={onLibrayRowDrop} onMenuClick={handleMenu} onClick={(p) => { loadPlaylistPrev(p) }}></PanelLibrary>
                    </div>
                    : null}
                  <div id="panel-main" className="panel-main">
                    {/* <img src="https://mosaic.scdn.co/640/ab67616d00001e0204508fa56b3746ca1f90f73cab67616d00001e024206814685e7f97a78670cc9ab67616d00001e027b2ed55c469487b2be37cac0ab67616d00001e028e7da55a612d5dda4e2d6663" alt="Search" className="panel-image" /> */}

                    {/* <img src={track && track.album && track.album.images && track.album.images[0].url} alt="Search" className="panel-image" />  */}
                    {true ? <div className="toolbar-wrapper">

                      {mode == "normal" ?
                        <>
                          <div className='toolbar-search'>
                            <SearchIcon className='toolbar-button' style={{ cursor: "pointer" }} onClick={() => { setSearchText(""); setSelectedLibraryItem(null); setSelectedLibraryIndex(-1); inputRef.current.focus(); }}></SearchIcon>
                            {selectedLibraryItem ? <img className="" style={{ width: 20 }} src={selectedLibraryItem?.images?.[2]?.url || selectedLibraryItem?.images?.[0]?.url} />

                              : null}

                            <input ref={inputRef} className="toolbar-input-search" placeholder="Search" onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />
                          </div>

                          {/* {playlistChanged ? <SaveIcon onClick={saveSelectedPlaylist} className='toolbar-button'></SaveIcon> : null} */}

                          <div className='toolbar-icons'>
                            {/* <SwapVertIcon className='toolbar-button'></SwapVertIcon> */}
                            <HistoryIcon className='toolbar-button' onClick={() => loadPlaylistPrev(lastListenedPl)}></HistoryIcon>

                            <svg onClick={() => loadPlaylistPrev(myShazamTracksPl)} class='toolbar-button' width="22" height="22" viewBox="0 0 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg">
                              <g transform="translate(1, 1)" class='toolbar-button' >
                                <path class='toolbar-button' d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
                              </g>
                            </svg>

                            <MoreVertIcon onClick={handleMenu} menu-target="tracks" className='toolbar-button'></MoreVertIcon>
                          </div>
                        </> : null}
                    </div> : null}
                    {
                      loadingTracks ? <div className='loader'></div> :
                        <ReordableTrackList onClick={(tr, index) => { setSelectedTrack(tr); setSelectedTrackIndex(index) }} ref={tracksRef} selectedIndex={selectedTrackIndex} onContextMenu={onTrackContextMenu} enableDrag={selectedLibraryItem && selectedLibraryItem.type == "playlist"} source="plprev" onDoubleClick={(tr) => { if (!isLocked()) play(tr); }} trackList={selectedPlaylistTracks} dragEndHandler={handleSelectedPlaylistDragEnd} keys={"spl"} onSwipedRight={onTracksSwipedRight} onDrop={addToPlaylist}></ReordableTrackList>

                      // getTracksPanel()
                    }
                  </div>
                  <div className="panel" onDragOver={allowDrop} onDrop={() => { addToPlaylist(dragTrack) }} id="playlist">

                    <div className="toolbar-wrapper">
                      <div className='toolbar-search'>
                        <div>QUEUE</div> {playlistTracks?.length || 0}/{getTotalDurationString(playlistTracks)}
                      </div>
                      <div className='toolbar-icons'>
                        {/* <SwapVertIcon className='toolbar-button'></SwapVertIcon> */}
                        <svg onClick={() => setShufflePlaylist(!shufflePlaylist)} className={shufflePlaylist ? "bulbOnColor" : "bulbOffColor"} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path d="M237.66 178.34a8 8 0 0 1 0 11.32l-24 24a8 8 0 0 1-11.32-11.32L212.69 192h-11.75a72.12 72.12 0 0 1-58.59-30.15l-41.72-58.4A56.1 56.1 0 0 0 55.06 80H32a8 8 0 0 1 0-16h23.06a72.12 72.12 0 0 1 58.59 30.15l41.72 58.4A56.1 56.1 0 0 0 200.94 176h11.75l-10.35-10.34a8 8 0 0 1 11.32-11.32ZM143 107a8 8 0 0 0 11.16-1.86l1.2-1.67A56.1 56.1 0 0 1 200.94 80h11.75l-10.35 10.34a8 8 0 0 0 11.32 11.32l24-24a8 8 0 0 0 0-11.32l-24-24a8 8 0 0 0-11.32 11.32L212.69 64h-11.75a72.12 72.12 0 0 0-58.59 30.15l-1.2 1.67A8 8 0 0 0 143 107Zm-30 42a8 8 0 0 0-11.16 1.86l-1.2 1.67A56.1 56.1 0 0 1 55.06 176H32a8 8 0 0 0 0 16h23.06a72.12 72.12 0 0 0 58.59-30.15l1.2-1.67A8 8 0 0 0 113 149Z" />
                        </svg>
                        <MoreVertIcon onClick={handleMenu} menu-target="playlist" className='toolbar-button'></MoreVertIcon>
                      </div>
                    </div>

                    {
                      playlistTracks.length > 0 ?
                        <ReordableTrackList enableDrag={!locked} onClick={(tr, index) => { setSelectedTrack(tr); setPlaylistIndex(index) }} onContextMenu={onPlaylistContextMenu} selectedIndex={playlistIndex} source="playlist" onDoubleClick={onPlaylistTrackDoubleClick} trackList={playlistTracks} dragEndHandler={handlePlaylistDragEnd} keys={"pl"} onSwipedRight={onTracksSwipedRight} onDrop={addToPlaylist}></ReordableTrackList>

                        :
                        <div className='QueueMusicIcon'>
                          <QueueMusicIcon style={{ fontSize: 50 }}></QueueMusicIcon>
                          <div style={{ fontSize: 20 }}>drag to queue</div>
                        </div>
                    }
                  </div>
                </div>

                <Dialog
                  onMouseDown={() => setMenuPosition(null)}
                  position={pickerPosition}
                  onDragEnd={(pos) => { setPickerPosition(pos); localStorage.setItem("pickerPosition", JSON.stringify(pos)); }}
                  open={showPickers}
                  onClose={() => { setShowPickers(false); localStorage.setItem("showPickers", "false"); }}
                  title={<table onMouseDown={() => setMenuPosition(null)} style={{ width: "100%", textAlign: "center" }}>
                    <tbody style={{ width: "100%" }}>
                      <tr>
                        <td style={{ width: "80%", padding: 5, textAlign: "left" }}>
                          {plcMode == "tagger" ? <>
                            <Marquee speed={0} style={{ fontSize: 11, width: "100%" }}>
                              {selectedTrack ? (selectedTrack?.artists?.map(a => a.name).join(", ") + " - " + selectedTrack?.name) : null}
                            </Marquee>

                          </> :
                            <Marquee speed={0} style={{ fontSize: 11, width: "100%" }}>
                              Combine playlists
                            </Marquee>
                          }
                        </td>
                        <td style={{ width: "20%", padding: 5 }}>
                          <input value={plcFilter} placeholder='filter...' onChange={(e) => setPlcFilter(e.target.value)} type='text'></input>
                          {/* <Tooltip style={{ zIndex: 9999 }} enterDelay={500} title={"Combine playlists and tag tracks for more precise control! Select playlists below to filter tracks that exist in all chosen playlists."} >
                            <span onClick={() => { setPLCMode(plcMode == "and" ? "tagger" : "and") }} style={{ float: "right" }} className={plcMode == "and" ? "plc-button-on" : "plc-button-off"}><ManageSearchIcon></ManageSearchIcon></span>
                          </Tooltip> */}
                        </td>
                      </tr>
                    </tbody>
                  </table>}
                  header={null}
                  style={{ textAlign: "center" }}
                  blockBackground={false}
                  buttons={[]}
                  onMouseUp={() => { setDragTrack(null); setDragSource(null); setDragSourceIndex(null); }}
                >

                  <table style={{ width: "100%", display: "inline-block", maxHeight: "50vh" }}>
                    <tbody>
                      <tr>
                        {/* <td style={{ width: 30, padding: 5 }}>
                          <img
                            src={selectedTrack && selectedTrack.album && selectedTrack.album.images[2].url}
                            style={{ display: "block", width: isMobile() ? 30 : 35, objectFit: 'cover', borderRadius: "50%" }}
                          />
                        </td> */}
                        {plcMode == "tagger" ?
                          <td className='selected-track-container'>
                            {library.filter(l => l.type == "playlist" && l.name?.toLowerCase().includes(plcFilter.toLowerCase())).map((p, index) => selectedTrack && p.tracks && p.tracks.some(t => t.id == selectedTrack.id) ?
                              <span onContextMenu={(e) => onLibraryItemContextMenu(e, p)} onClick={() => { addToSpotifyPlaylist(p, true) }} className='selected-track-bulb-on' key={p.id}>{p.name}</span> :
                              <span onContextMenu={(e) => onLibraryItemContextMenu(e, p)} onClick={() => { addToSpotifyPlaylist(p, false) }} className='selected-track-bulb-off' key={p.id}>{p.name}</span>)}
                          </td> : null}

                        {plcMode == "and" ?
                          <td className='selected-track-container'>
                            {library.filter(l => l.type == "playlist").map(p => plcSelected.some(s => s == p.id) ? <span onClick={() => { addToPLCSelected(p.id, false) }} className='plc-button-on' key={p.id}>{p.name}</span> : <span onClick={() => { addToPLCSelected(p.id, true) }} className='plc-button-off' key={p.id}>{p.name}</span>)}
                          </td> : null}

                      </tr>
                    </tbody>
                  </table>

                </Dialog>

























                <div className="footer player">
                  {/* {playbackSDKReady && token ?
                <Player locked={locked} onNext={() => { if (isLocked()) { return; } nextTrack() }} onError={playerError} stateChanged={playerStateChanged} token={token} trackid={track} onClick={() => setSelectedTrack(track)} playlists={library.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />


                : null} */}
                  <SpotifyPlayer isLocked={isLocked} onNext={nextTrack} onArtistClick={(tr) => { loadArtistInfo(tr); setShowArtistInfo(true); }} locked={locked} onError={playerError} stateChanged={playerStateChanged} token={token} track={track} onClick={() => { setSelectedTrack(track); }} playlists={library.filter((pl) => pl.tracks && pl.tracks.some((t) => t.id == track.id))} ></SpotifyPlayer>
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
