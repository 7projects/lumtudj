import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Player from './components/player';
import TrackRow from './components/trackRow';
import api from './Api';
import PlaylistRow from './components/playlistRow';
import { loadThemeCSS, isMobile } from './util';
import { faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';
import { savePlaylists, loadPlaylists, saveBackgroundPlaylists, loadBackgroundPlaylists, addToHistory, getHistory } from './database';

import Settings from '@mui/icons-material/Settings';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from './components/snackbar';
import { AddAlertRounded, AlignVerticalCenterTwoTone } from '@mui/icons-material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import HistoryIcon from '@mui/icons-material/History';
import { Virtuoso } from 'react-virtuoso';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';


function App() {


  const [token, setToken] = useState(window.localStorage.getItem("token"));
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [tracks, setTracks] = useState([]);

  const [selectedTrack, setSelectedTrack] = useState([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(-1);

  const [selectedPlaylistTrack, setSelectedPlaylistTrack] = useState([]);
  const [selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex] = useState(-1);

  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(-1);

  const [dragTrack, setDragTrack] = useState([]);
  const [dragTrackIndex, setDragTrackIndex] = useState();
  const [dragSource, setDragSource] = useState();

  const [trackCounts, setTrackCounts] = useState({});
  const [track, setTrack] = useState({});
  const [searchText, setSearchText] = useState();
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingPlaylistsText, setLoadingPlaylistsText] = useState(false);

  const [menuPosition, setMenuPosition] = useState(null);

  const [playPosition, setPlayPosition] = useState(null);
  const [playIndex, setPlayIndex] = useState(null);
  const [playState, setPlayState] = useState(null);

  const [backgroundPlaylists, setBackgroundPlaylists] = useState([]);

  const [mode, setMode] = useState("normal");

  const [code, setCode] = useState(null);

  const [tab, setTab] = useState("1");

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [locked, setLocked] = useState(false);

  const inputBuffer = useRef();

  let timer = null;

  const TIME_LIMIT = 5000; // 5 seconds

  //constructor
  useEffect(() => {

    const init = async () => {
      try {

        alert("constructor");

        if (playlists.length == 0) {
          await getPlaylists();
        }
    
        if (backgroundPlaylists.length == 0) {
          await getBackgroundPlaylists();
        }
    
        isLocked();
    
        document.removeEventListener('keydown', handleLockKeyDown);
        document.addEventListener('keydown', handleLockKeyDown);
      } catch (err) {
        console.error("Error in getPlaylists", err);
      }
    };

    init();

  }, [])

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

  const fetchTokens = async (code) => {
    const verifier = localStorage.getItem('code_verifier');
    const clientId = '6b690613cc6d481d97a3b75c2c0cf947';
    const redirectUri = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://vsprojects.net';

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier
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
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
      window.history.replaceState({}, document.title, '/');
    }
  };

  const toggleMode = () => {
    setMode(mode === "normal" ? "compact" : "normal");
  }

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {

      loadThemeCSS(theme);
    } else {

      loadThemeCSS("spotify");
    }


    const urlParams = new URLSearchParams(window.location.search);
    const newCode = urlParams.get('code');

    if (newCode) {

      if (newCode != code) {

        setCode(newCode);
        fetchTokens(newCode);

      }
    } else {

      const expiresAt = localStorage.getItem('token_expiry');
      if (expiresAt && Date.now() > expiresAt) {
        api.refreshAccessToken();

      } else {

        setToken(localStorage.getItem("token"));
      }
    }

    // Parse URL hash manually
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        setToken(accessToken);
        window.localStorage.setItem("token", accessToken);
        window.history.replaceState({}, document.title, '/'); // Clean URL
        if (playlists.length == 0) {
          getPlaylists();
          getBackgroundPlaylists();
        }
      }
    }



  }, [code]);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      search(searchText);
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
    window.location = await api.getAuthUrl();
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const getPlaylists = async () => {

    console.log("getPlaylists2");
    const cached = await loadPlaylists(); // Load back

    // if (!cached.some(playlist => playlist.name == "lastlistened")) {
    //   cached.unshift({
    //     id: "lastlistened",
    //     name: "last listened",
    //     tracks: []
    //   })
    // }

    if (cached && cached.length > 0) {
      setPlaylists(cached);
      setLoadingPlaylists(false);
      return;
    }

    updatePlaylists();
  };

  const getBackgroundPlaylists = async () => {

    const cached = await loadBackgroundPlaylists(); // Load back

    if (cached && cached.length > 0) {
      setBackgroundPlaylists(cached);

      return;
    }

    updatePlaylists();
  };



  const updatePlaylists = async () => {
    setLoadingPlaylists(true);
    const data = await api.getFullPlaylists((i, l) => setLoadingPlaylistsText("LOADING PLAYLISTS " + i + "/" + l));
    savePlaylists(data);
    setPlaylists(data);
    setLoadingPlaylistsText("LOADING PLAYLISTS...")
    setLoadingPlaylists(false);
  }

  const refreshAccessTokenucted = async () => {

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

        await getPlaylists(); // Reload playlists from IndexedDB

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
    setSelectedTrack(null);
    setSelectedTrackIndex(-1);
    setTracks([]);

    setTimeout(() => {
      loadTracksFromState(playlistID);
    }, 200);
  }

  const loadTracksFromState = async (playlistID) => {
    const pl = playlists.find(p => p.id === playlistID);
    if (pl.tracks.length) {
      setTracks(pl.tracks);
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

    let pl = [...playlist];
    if (dragSource == "playlist") {
      if (locked) {
        return
      } else {
        pl.splice(dragTrackIndex, 1);
      }

    }

    if (position || position == 0) {
      pl.splice(position, 0, track);
      setPlaylist(pl);
    }
    else {
      pl.push(track);
      setPlaylist(pl);
    }

    if (isMobile()) {
      setSnackbarMessage("Added to  queue");
    }
  };

  const addToSpotifyPlaylist = async (pl, bulbOn) => {
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

  const removeTrackFromPlaylist = async () => {

    //remove selectedPlaylistTrackindex from playlist
    if (dragSource == "playlist") {
      let pl = [...playlist];
      pl.splice(selectedPlaylistTrackIndex, 1);
      setPlaylist(pl);
      closeMenu();
    }

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

    if (state == "trackEnded") {
      nextTrack();
    }
  }

  const play = async (track) => {
    addToHistory(track);
    setTrack(track);
    setSelectedTrack(track);
    const pls = playlists.filter(x => x.tracks.some(x => x.id == track.id));
    for (const pl of pls) {
      const trs = pl.tracks.filter(x => x.id == track.id);
      for (const tr of trs) {
        tr.datePlayed = new Date();
      }
    }

    await savePlaylists(pls);
    getPlaylists();

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

  const nextTrack = async () => {
    // if (playPosition == "playlist") {
    //   setPlayIndex(playIndex + 1);
    //   play(playlist[playIndex + 1]);
    // }

    if (playlist.length > 0) {
      let pl = [...playlist];
      play(pl[0]);
      flyToPlayer(pl[0]);
      pl.shift();
      setPlaylist(pl);
      return;
    }

    if (backgroundPlaylists.length == 0) {
      alert("random Playlist is empty");
      return;
    }



    const plsDB = await loadPlaylists();
    const pls = plsDB.filter(x => backgroundPlaylists.some(y => y.id == x.id));

    const randomPlIndex = Math.floor(Math.random() * pls.length);
    const pl = pls[randomPlIndex];

    if (pl.tracks.length == 0) {
      alert("random Playlist is empty");
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

  const getPlaylistsPanel = () => {
    return loadingPlaylists ?
      <>
        <div className="loader-text">{loadingPlaylistsText}</div>
        <div className='loader'>

        </div>
      </>
      :
      playlists.map((p, index) => (
        <div key={"pl" + index}>
          {/* {
            isMobile() ?
              <PlaylistRow selected={selectedPlaylistIndex == index} showBulb={selectedTrack} onBulbClick={addToSpotifyPlaylist} bulbOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} playlist={p} onClick={() => { setTab("2"); getTracks(p.id); setSearchText(p.name); setSelectedPlaylistIndex(index) }} />
              :
              <PlaylistRow selected={selectedPlaylistIndex == index} showBulb={selectedTrack} onBulbClick={addToSpotifyPlaylist} bulbOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} playlist={p} onClick={() => { getTracks(p.id); setSelectedPlaylistIndex(index) }} />
          } */}
          {
            isMobile() ?
              <PlaylistRow selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { setTab("2"); getTracks(p.id); setSearchText(p.name); setSelectedPlaylistIndex(index) }} />
              :
              <PlaylistRow selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { getTracks(p.id); setSelectedPlaylistIndex(index) }} />
          }

        </div>
      ))
  }

  const getTracksPanel = () => {
    return loadingTracks ? <div className='loader'></div> :

      <Virtuoso
        style={{ height: '100%' }}
        totalCount={tracks.length}
        itemContent={(index) => {
          const tr = tracks[index];
          return <TrackRow onAddToPlaylistButton={() => { addToPlaylist(tr) }} playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} selected={index == selectedTrackIndex} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrackIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { if (isLocked()) { return; } setPlayIndex(index); setPlayPosition("main"); play(tr) }} />

        }}
      />
  }

  const getTracksPanel2 = () => {
    return loadingTracks ? <div className='loader'></div> :
      tracks && tracks.map((tr, index) => (
        <div key={"track" + index}>

          {/* <TrackRow onContextMenu={handleContextMenu} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == tr.id))} index={index} selected={index == selectedTrackIndex} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrackIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => play(tr)} /> */}
          {/* <TrackRow playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} onContextMenu={handleContextMenu} index={index} selected={index == selectedTrackIndex} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrackIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => play(tr)} /> */}
          {
            isMobile() ?
              <TrackRow onPlClick={() => addToPlaylist(tr)} onContextMenu={handleContextMenu} index={index} selected={index == selectedTrackIndex} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrackIndex(index); setSelectedTrack(tr); }} onClick={() => { setPlayIndex(index); setPlayPosition("main"); play(tr) }} />
              :
              <TrackRow onContextMenu={handleContextMenu} index={index} selected={index == selectedTrackIndex} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrackIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { setPlayIndex(index); setPlayPosition("main"); play(tr) }} />

          }
          {/* <TrackRow hideImage onContextMenu={handleContextMenu} index={index} selected={index == selectedTrackIndex} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setSelectedTrackIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { setPlayPosition("main"); play(tr) }} /> */}
        </div>
      ))
  }

  const getPlaylistPanel = () => {
    return playlist && playlist.map((tr, index) => (
      <div key={"pltrack" + index}>
        {isMobile() ?
          // <TrackRow hideImage playing={playPosition == "playlist" && playIndex == index && playState != "stopped"} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => onPlaylistTrackDoubleClick(tr, index)} /> :
          // <TrackRow playing={playPosition == "playlist" && playIndex == index && playState != "stopped"} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />

          <TrackRow playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} id={tr.id + index} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, index)} track={tr} onClick={() => { onPlaylistTrackDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
          <TrackRow playlists={playlists.filter(x => x.tracks.some(t => t.id == tr.id))} id={tr.id + index} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => addToPlaylist(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onPlaylistTrackDoubleClick(tr, index)} />

        }
      </div>
    ))
  }

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
    element.scrollTop = 0;
  }

  return (
    <>
      <Snackbar
        message={snackbarMessage}
        show={snackbarMessage}
        onClose={() => setSnackbarMessage("")}
      />
      {!token ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (

        isMobile() ?
          <div className='layout' onMouseDown={closeMenu}>

            <table style={{ width: "100%", tableLayout: "fixed", borderSpacing: 3 }}>
              <tbody>
                <tr>
                  <td className={tab == 1 ? 'tab-selected' : 'tab'} onClick={() => { setTab(1) }}>
                    <PlaylistAddCheckIcon></PlaylistAddCheckIcon>
                  </td>
                  <td className={tab == 2 ? 'tab-selected' : 'tab'} onClick={() => { setTab(2) }}>
                    <SearchIcon></SearchIcon>
                  </td>
                  <td className={tab == 3 ? 'tab-selected' : 'tab'} onClick={() => { setTab(3) }}>
                    <PlaylistPlayIcon></PlaylistPlayIcon>
                  </td>
                  <td className={tab == 4 ? 'tab-selected' : 'tab'} style={{ width: 40 }} onClick={() => { setTab(4) }}>
                    <Settings style={{ color: "white" }}></Settings>
                  </td>
                </tr>
                <tr>
                  {tab == 1 ? <td colSpan={4} className='tab-panel'>
                    <div className='panel-playlists-mobile'>
                      {getPlaylistsPanel()}
                    </div>
                  </td> : null}

                  {tab == 2 ? <td colSpan={4} className='tab-panel'>
                    <div className="custom_input" style={{ width: "100%" }}>
                      {/* <svg xmlns="http://www.w3.org/2000/svg" className="svg_icon bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path></svg> */}
                      <input className="input" onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={(e) => setSearchText(e.target.value)} type="text" style={{ margin: 20, padding: 10 }} placeholder="Search"></input>
                    </div>
                    <div className="panel-search-mobile">
                      {getTracksPanel()}
                    </div>
                  </td> : null}

                  {tab == 3 ? <td colSpan={4} className='tab-panel'>
                    {

                      playlist.length > 0 ?
                        getPlaylistPanel() :
                        <div className='QueueMusicIcon' style={{ marginTop: "50%" }}>
                          <QueueMusicIcon style={{ fontSize: 50 }}></QueueMusicIcon>

                          <div style={{ fontSize: 20 }}>add to queue</div>
                        </div>


                    }
                  </td> : null}

                  {tab == 4 ? <td colSpan={4} className='tab-panel'>
                    <button style={{ float: "right" }} onClick={logout}>Logout</button>
                    <button style={{ float: "right" }} onClick={changeTheme}>Change theme</button>
                    <button onClick={checkForUpdates}>Check for updates</button>
                    <button onClick={() => { api.refreshAccessToken(); }}>refresh at</button>
                  </td> : null}
                </tr>

              </tbody>
            </table>

            <div className='footer-mobile player'>
              <Player onNext={() => nextTrack()} onError={(err) => alert(JSON.stringify(err))} stateChanged={playerStateChanged} token={token} trackid={track} onClick={() => setSelectedTrack(track)} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />
            </div>
          </div >
          :
          <div className='layout' onMouseDown={closeMenu}>

            {/* <div className='background-logo'>LUMTUDJ</div> */}

            {/* <svg className='background-logo'
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="-6.03 -6.03 72.38 72.38"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0" />
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
              <g id="SVGRepo_iconCarrier">
                <g>
                  <g>
                    <path

                      d="M27.038,22.108c0.103,0.133,0.213,0.244,0.326,0.346c0.11,3.194-0.193,8.194-0.337,9.745
               l8.946-0.057c0.016-0.164,0.264-2.842,0.359-5.912c0.566,0.49,1.137,0.978,1.699,1.475c1.887,1.664,4.256,0.003,3.935-2.29
               c-0.289-2.061-0.36-4.154-0.919-6.169c-0.744-2.681-4.618-1.851-4.624,0.569c-0.052-0.056-0.104-0.106-0.154-0.163
               c-0.101-0.113-0.203-0.202-0.308-0.289c-0.709-1.79-2.521-2.985-4.541-2.822c-0.758,0.061-1.456,0.31-2.056,0.693
               c-1.919-2.946-3.326-6.131-4.316-9.556c-0.844-2.914-5.238-1.223-4.399,1.676C21.984,13.973,24.097,18.295,27.038,22.108z"
                    />
                    <ellipse cx="11.113" cy="37.41" rx="2.772" ry="0.744" />
                    <ellipse cx="27.263" cy="37.41" rx="2.773" ry="0.744" />
                    <path

                      d="M59.56,33.174l-59.049-0.03L0,42.607l60.314,0.029L59.56,33.174z M11.389,39.1
               c-3.265,0-5.912-0.711-5.912-1.59c0-0.877,2.647-1.588,5.912-1.588c3.266,0,5.913,0.711,5.913,1.588
               C17.302,38.389,14.655,39.1,11.389,39.1z M27.263,39.1c-3.266,0-5.913-0.711-5.913-1.59c0-0.877,2.647-1.588,5.913-1.588
               c3.265,0,5.913,0.711,5.913,1.588C33.176,38.389,30.528,39.1,27.263,39.1z M37.793,39.832h-1.139v-5.163h1.139V39.832z
               M40.955,39.832h-1.14v-5.163h1.14V39.832z M44.371,39.832h-1.137v-5.163h1.137V39.832z M47.662,39.832h-1.14v-5.163h1.14V39.832z
               M50.827,39.832h-1.14v-5.163h1.14V39.832z M53.799,39.832H52.66v-5.163h1.139V39.832z"
                    />
                    <polygon points="0.002,43.181 0.509,54.721 59.556,54.721 60.316,43.181" />
                    <rect x="36.858" y="35.372" width="0.715" height="1.202" style={{ fill: 'transparent' }} />
                    <rect x="40.035" y="37.743" width="0.711" height="1.202" style={{ fill: 'transparent' }} />
                    <rect x="43.438" y="35.056" width="0.715" height="1.203" style={{ fill: 'transparent' }} />
                    <rect x="46.737" y="36.542" width="0.715" height="1.201" style={{ fill: 'transparent' }} />
                    <rect x="49.86" y="35.056" width="0.715" height="1.203" style={{ fill: 'transparent' }} />
                    <rect x="52.832" y="34.897" width="0.715" height="1.201" style={{ fill: 'transparent' }} />
                    <path

                      d="M28.756,14.262v0.041c0,0.558,0.454,1.011,1.013,1.011c0.545,0,0.986-0.432,1.009-0.97
               c0.783,1.562,2.506,2.519,4.328,2.247c1.391-0.206,2.516-1.082,3.102-2.25c0.021,0.54,0.465,0.973,1.012,0.973
               c0.561,0,1.012-0.453,1.012-1.011v-0.041c0.365,0,0.661-0.295,0.661-0.661v-2.645c0-0.364-0.296-0.662-0.661-0.662v-0.04
               c0-0.383-0.217-0.712-0.527-0.884c-0.723-2.189-2.779-3.775-5.207-3.775c-2.426,0-4.486,1.586-5.208,3.775
               c-0.313,0.172-0.53,0.501-0.53,0.884v0.04c-0.364,0-0.661,0.297-0.661,0.662v2.645C28.095,13.966,28.391,14.262,28.756,14.262z
               M34.493,6.607c1.881,0,3.49,1.168,4.15,2.814c-0.266,0.183-0.438,0.487-0.438,0.832v0.352c-0.787-1.558-2.504-2.512-4.324-2.241
               c-1.389,0.207-2.512,1.078-3.1,2.242v-0.353c0-0.345-0.175-0.649-0.438-0.832C31.002,7.775,32.614,6.607,34.493,6.607z"
                    />
                  </g>
                </g>
              </g>
            </svg> */}

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
                        {/* <button onClick={async () => { await api.refreshAccessToken(); setToken(localStorage.getItem("token")) }}>refresh at</button> */}
                        <button className='header-button-small' onClick={getLastListened}><HistoryIcon></HistoryIcon></button>
                        <button className='header-button-small' onClick={toggleMode}><PlaylistAddCheckIcon></PlaylistAddCheckIcon></button>
                        {locked ?
                          <button className='header-button-small' ><LockOutlineIcon style={{ color: "red" }} /></button>
                          : <button className='header-button-small' onClick={lock}><LockOpenIcon /></button>}


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
                      <button style={{ float: "right" }} onClick={changeTheme}>Change theme</button>
                      <button style={{ float: "right" }} onClick={logout}>Logout</button>
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
                  {
                    getPlaylistsPanel()
                  }
                </div> : null}
              <div id="panel-main" className="panel-main">
                {
                  getTracksPanel()
                }
              </div>
              <div className="panel" onDragOver={allowDrop} onDrop={() => { addToPlaylist(dragTrack) }}>

                {
                  playlist.length > 0 ?
                    getPlaylistPanel() :
                    <div className='QueueMusicIcon'>
                      <QueueMusicIcon style={{ fontSize: 50 }}></QueueMusicIcon>

                      <div style={{ fontSize: 20 }}>drag to queue</div>
                    </div>

                }
              </div>
            </div>
            <div className="footer player">
              <Player locked={locked} onNext={() => { if (isLocked()) { return; } nextTrack() }} onError={(e) => alert(JSON.stringify(e))} stateChanged={playerStateChanged} token={token} trackid={track} onClick={() => setSelectedTrack(track)} playlists={playlists.filter((pl) => pl.tracks.some((t) => t.id == track.id))} />
              {/* <Player token={token} trackid={track} onClick={() => setSelectedTrack(track)} /> */}
            </div>
          </div>
      )
      }
    </>

  );
}

export default App;
