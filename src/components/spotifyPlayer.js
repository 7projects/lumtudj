import React, { useEffect, useState, useRef, use } from "react";
import { formatTime, isMobile } from "../util";
import TrackRow from "./trackRow";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Marquee from "react-fast-marquee";
import { useLongPress } from 'use-long-press';
import useAppStore from '../AppStore';
import DeleteIcon from '@mui/icons-material/Delete';

export default function SpotifyPlayer({
  locked,
  token,
  track,
  onClick,
  onArtistClick,
  playlists,
  onNext,
  stateChanged,
  onLongPress
}) {

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const tokenRef = useRef(token);
  const onNextRef = useRef(null);

  const { dragTrack, setDragTrack } = useAppStore();

  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const trackIdRef = useRef(null);      // currently playing track
  const trackEndedFor = useRef(null);   // track for which onNext() was called

  // Keep tokenRef up to date
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    onNextRef.current = onNext;

  }, [onNext]);

  // Load Spotify SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (playerRef.current) return;

      const player = new window.Spotify.Player({
        name: "React Web Player",
        getOAuthToken: (cb) => cb(tokenRef.current),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setPlayerReady(true);

        if (track) playTrack(track.id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        setPosition(state.position);
        setDuration(state.duration);
        setPaused(state.paused);

        const trackEnded =
          state.duration > 0 && state.paused && state.position === 0;

        // Only call onNext once per track
        if (state.loading && trackEnded && trackIdRef.current && trackEndedFor.current !== trackIdRef.current) {

          trackEndedFor.current = trackIdRef.current;

          stateChanged?.(state);

          console.log(state);

          if (onNextRef.current) {
            try {

              onNextRef.current();
            } catch (err) {
              console.warn("Error in onNext()", err);
            }
          }
        }
      });

      player.connect();
      playerRef.current = player;

      // Poll state
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        if (!playerRef.current) return;
        try {
          const state = await playerRef.current.getCurrentState();
          if (!state) return;
          setPosition(state.position);
          setDuration(state.duration);
          setPaused(state.paused);
        } catch (err) {
          console.warn("Player disconnected while polling", err);
        }
      }, 1000);
    };

    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, []);

  const longPressHandler = useLongPress(
    (e) => {
      e.preventDefault();      // 👈 blocks the synthetic click after touchend
      e.stopPropagation();     // 👈 prevents bubbling
      if (isMobile() && onLongPress) {
        onLongPress(track, e);
      }
    },
    {
      // extra safety: cancel synthetic click entirely
      captureEvent: true,       // ensures we get the raw event
      cancelOnMovement: true,   // prevents misfires when finger moves
    }
  );

  // Safe helper to get current state
  const getPlayerState = async () => {
    if (!playerRef.current) return null;
    try {
      return await playerRef.current.getCurrentState();
    } catch (err) {
      console.warn("Player is disconnected", err);
      return null;
    }
  };

  // Play a track
  const playTrack = async (trackId) => {
    if (!trackId || !deviceId || !tokenRef.current) return;

    trackIdRef.current = trackId;
    trackEndedFor.current = null; // reset for new track
    setLoadingTrack(true);
    setPosition(0);

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tokenRef.current}`, "Content-Type": "application/json" },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
      });
    } catch (err) {
      console.warn("Error playing track", err);
    } finally {
      setLoadingTrack(false);
    }
  };

  const pauseTrack = async (e) => {
    e.stopPropagation();
    if (!deviceId || !tokenRef.current || locked) return;
    try {
      await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
    } catch (err) {
      console.warn("Error pausing track", err);
    }
  };

  const resumeTrack = async (e) => {
    e.stopPropagation();
    if (!deviceId || !tokenRef.current || locked) return;
    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
    } catch (err) {
      console.warn("Error resuming track", err);
    }
  };

  const seek = async (e) => {
    e.stopPropagation();
    if (!playerRef.current || !deviceId || !tokenRef.current) return;

    const progressBar = document.getElementById("progressBar");
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;

    const state = await getPlayerState();
    if (!state) return;

    const newPosition = percent * state.duration;
    setPosition(newPosition);

    try {
      await playerRef.current.seek(newPosition);
    } catch (err) {
      console.warn("Cannot seek, player disconnected", err);
    }
  };

  const next = async (e) => {
    e.stopPropagation();
    if (onNext) onNext();
  };

  const prev = async () => {
    if (locked || !deviceId || !tokenRef.current) return;
    setPosition(0);
    try {
      await playerRef.current.seek(0);
    } catch (err) {
      console.warn("Cannot seek to start, player disconnected", err);
    }
  };

  const setVolume = (vol) => {
    playerRef.current?.setVolume(vol);
  };

  // Play new track when track prop changes
  useEffect(() => {
    if (track && playerReady) playTrack(track.id);
  }, [track, playerReady]);

  // -------------------------------
  // Render mobile/desktop
  // -------------------------------
  return (
    <div style={{ width: "100%", textAlign: "center", bottom: 0, position: "absolute" }} {...longPressHandler()} onClick={onClick}>
      {isMobile() ? (
        <table style={{ width: "100%", height: "100%" }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: 5 }}>
                <div>
                  {playlists && playlists.map((p) =>
                    <span key={p.id} className='littleBulbOn'>

                    </span>
                  )
                  }
                </div>

              </td>
            </tr>
            <tr>
              <td style={{ minHeight: 30, padding: "1px 10px", paddingBottom: "1px", fontWeight: "bold" }}>
                <Marquee speed={30} style={{ fontSize: 14 }}>
                  <label>{track && track.artists && track.artists[0].name}</label>&nbsp;-&nbsp;<label>{track && track.name}</label>
                </Marquee>
                {/* <TrackRow playlists={playlists} hideImage forPlayer track={track} /> */}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "1px 10px", paddingBottom: "1px" }}>
                <div className="player-progress-bar-mobile" id="progressBar" onClick={seek}>

                  <div className="player-progress-bar-fill-empty-mobile">
                    <div className="player-progress-bar-fill-mobile" style={{ width: `${(position / duration) * 100}%` }}></div>
                  </div>
                  <div className="player-progress-bar-circle-mobile" style={{ left: `${(position / duration) * 100}%` }}></div>
                </div>
                {/* <input
                  className='range-mobile'
                  type="range"
                  min="0"
                  max={duration}
                  value={position}
                  onChange={(e) => {
                    const seekTo = Number(e.target.value);
                    setPosition(seekTo);
                    playerRef.current.seek(seekTo);
                  }}
                  style={{ width: '100%', display: 'block' }}
                /> */}
              </td>
            </tr>
            <tr>
              <td>
                <table style={{ width: "100%", tableLayout: "fixed", borderSpacing: 3 }}>
                  <tbody>
                    <tr>
                      <td className="player-button-mobile" style={{ fontSize: 12 }}>{formatTime(position)}</td>
                      <td className="player-button-mobile" style={{ height: 30 }} onClick={prev}><SkipPreviousIcon /></td>
                      {paused ?
                        <td className="player-button-mobile" onClick={resumeTrack}><PlayCircleOutlineIcon /></td> :
                        <td className="player-button-mobile" onClick={pauseTrack}><PauseCircleOutlineIcon /></td>}
                      <td className="player-button-mobile" onClick={next}><SkipNextIcon /></td>
                      <td className="player-button-mobile" style={{ fontSize: 12 }}>{formatTime(duration)}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (

        <div className="parent">
          <div className="div1">
            <img
              src={track && track.album && (track.album.images[2].url || track.album.images[1].url || track.album.images[0].url)}
              style={{ marginLeft: 20, display: "block", width: isMobile() ? 30 : 70, objectFit: 'cover', borderRadius: 8 }}
            />
          </div>
          <div className="div2" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => onArtistClick(track)} >
            {track && track.artists && track.artists.map(a => a.name).join(", ")}<br></br>
            {track && track.name}<br></br>
            {playlists && playlists.map((p) =>
              <div key={p.id} className='littleBulbOn'>

              </div>
            )
            }
          </div>
          <div className="div3">
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "right", padding: 10, width: "40px" }}>{formatTime(position)}</td>
                  <td>
                    <div className="player-progress-bar" id="progressBar" onClick={seek}>
                      <div className="player-progress-bar-fill" style={{ width: `${(position / duration) * 100}%` }}></div>
                    </div>
                  </td>
                  <td style={{ textAlign: "left", padding: 10, width: "40px" }}>{formatTime(duration)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="div4">
            <div className="player-buttons">
              <div className="player-button" onClick={prev}><SkipPreviousIcon /></div>
              {paused ?
                <div className="player-button" onClick={resumeTrack}><PlayCircleOutlineIcon /></div> :
                <div className="player-button" onClick={pauseTrack}><PauseCircleOutlineIcon /></div>}
              <div className="player-button" onClick={next}><SkipNextIcon /></div>
            </div>
          </div>
          <div className="div5"> </div>
          <div className="div6" style={{ paddingRight: 20 }}>

            {/* {dragTrack ?
              <div onDragOver={(e) => e.stopPropagation()}>
                <DeleteIcon onDragOver={(e) => e.stopPropagation()} className="player-trash" style={{ fontSize: 60 }} />
              </div> :
              <input type="range" min={0} max={100} onClick={e => e.stopPropagation()} onChange={e => { setVolume(e.target.value * 0.01); e.stopPropagation(); }} style={{ width: "100%", maxWidth: "120px" }} />
            } */}

            <input type="range" min={0} max={100} onClick={e => e.stopPropagation()} onChange={e => { setVolume(e.target.value * 0.01); e.stopPropagation(); }} style={{ width: "100%", maxWidth: "120px" }} />
          </div>

          {/* <Marquee style={{ fontSize: 73, position: "absolute", fontWeight: "bold", color: "#4545451c", zIndex: 1 }}>
            {track && track.artists && track.artists.map(a => a.name).join(", ")}
          </Marquee> */}


        </div>



      )}
    </div>
  );
}
