import React, { useEffect, useState, useRef } from "react";
import { formatTime } from '../util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faForward, faBackward, faRepeat } from '@fortawesome/free-solid-svg-icons';
import TrackRow from './trackRow';
import { text } from '@fortawesome/fontawesome-svg-core';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { isMobile } from '../util';

export default function SpotifyPlayer({ token, trackId }) {
  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const interval = setInterval(async () => {
      const state = await playerRef.current.getCurrentState();
      if (state) {
        setPosition(state.position);
        setDuration(state.duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerRef.current]);

  useEffect(() => {

  }, [])

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: "React Web Player",
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.warn("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", state => {
        if (!state) return;
        setPosition(state.position);
        setDuration(state.duration);
      });

      player.connect();
      playerRef.current = player;
    };

    return () => {
      if (window.Spotify && window.Spotify.Player) {
        window.Spotify.Player.disconnect?.();
      }
    };
  }, [token]);

  useEffect(() => {
    if (!trackId) return;

    playTrack();
  }, [trackId]);

  const playTrack = async () => {
    if (!deviceId || !token || !trackId) return;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const pauseTrack = async () => {
    if (!deviceId || !token) return;
    await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
        <div style={{ width: '100%', textAlign: 'center', bottom: 0, position: "absolute" }} onClick={onClick}>
            <div id="universe">
                <div id='stars'></div>
                <div id='stars2'></div>
                <div id='stars3'></div>
            </div>
            {isMobile() ?
                <>
                    <table style={{ width: '100%', height: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ minHeight: 30 }}>
                                    <TrackRow playlists={playlists} hideImage forPlayer track={track} />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ paddingTop: 1, paddingRight: '5px', paddingLeft: '5px', paddingBottom: '1px' }}>
                                    <div className='player-progress-bar-mobile' id="progressBar" onClick={seek}>
                                        <div className='player-progress-bar-fill-mobile' style={{ width: `${(position / duration) * 100}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table style={{ width: "100%", tableLayout: "fixed", borderSpacing: 3 }}>
                                        <tbody>
                                            <tr>
                                                <td className='player-button-mobile' style={{ fontSize: 12 }}>
                                                    {formatTime(position)}
                                                </td>
                                                <td className={3 == 1 ? 'tab-selected' : 'player-button-mobile'} style={{ height: 30 }} onClick={prev}>
                                                    <SkipPreviousIcon></SkipPreviousIcon>
                                                </td>
                                                {playerState != "playing" ?
                                                    <td className={1 == 2 ? 'tab-selected' : 'player-button-mobile'} onClick={resumeTrack}>
                                                        <PlayCircleOutlineIcon></PlayCircleOutlineIcon>
                                                    </td> :
                                                    <td className={1 == 2 ? 'tab-selected' : 'player-button-mobile'} onClick={pauseTrack}>
                                                        <PauseCircleOutlineIcon></PauseCircleOutlineIcon>
                                                    </td>}
                                                <td className={1 == 3 ? 'tab-selected' : 'player-button-mobile'} onClick={next}>
                                                    <SkipNextIcon></SkipNextIcon>
                                                </td>
                                                <td className='player-button-mobile' style={{ fontSize: 12 }}>
                                                    {formatTime(duration)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>

                :

                <div style={{ textAlign: "center", width: "100%", display: "inline-block" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', justifyItems: 'middle', marginTop: -10 }}>

                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: "30%", textAlign: "left" }}>
                                        <TrackRow playlists={playlists} hideImage forPlayer track={track} />
                                    </td>
                                    <td>
                                        <table style={{ width: '100%' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ textAlign: "right", padding: 10, width: "40px" }}>
                                                        <span>{formatTime(position)}</span>
                                                    </td>
                                                    <td>
                                                        {/* <input
                                                            type="range"
                                                            min="0"
                                                            max={duration}
                                                            value={position}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                if (locked) return;
                                                                const seekTo = Number(e.target.value);
                                                                setPosition(seekTo);
                                                                playerRef.current.seek(seekTo);
                                                                e.stopPropagation();
                                                            }}
                                                            style={{ width: '100%' }}
                                                        /> */}

                                                        <div className='player-progress-bar' id="progressBar" onClick={seek}>
                                                            <div className='player-progress-bar-fill' style={{ width: `${(position / duration) * 100}%` }}></div>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: "left", padding: 10, width: "40px" }}>
                                                        <span>{formatTime(duration)}</span>

                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>

                                                    </td>
                                                    <td>
                                                        <div className='player-buttons'>
                                                            <div className='player-button' onClick={prev}><SkipPreviousIcon /></div>
                                                            {playerState != "playing" ? <div className='player-button' onClick={resumeTrack}><PlayCircleOutlineIcon /></div> : null}
                                                            {playerState == "playing" ? <div className='player-button' onClick={pauseTrack}><PauseCircleOutlineIcon /></div> : null}
                                                            <div className='player-button' onClick={next}><SkipNextIcon /></div>
                                                            {/* <br></br>
                                                            player state: {playerState} */}
                                                            {/* <button className='player-button' onClick={resumeTrack}><RepeatIcon /></button>
                                                        <button className='player-button' onClick={resumeTrack}><ShuffleIcon /></button>
                                                        <button className='player-button' onClick={resumeTrack}><AutoFixHighIcon /></button> */}

                                                        </div>


                                                    </td>
                                                    <td>

                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td style={{ width: "30%", textAlign: "right", paddingRight: 20 }}>

                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                setVolume(e.target.value * 0.01);
                                                e.stopPropagation();
                                            }}
                                            style={{ width: '100%', maxWidth: '120px' }}
                                        />

                                    </td>
                                </tr>
                            </tbody>
                        </table>



                    </div>
                </div>}
        </div>
  );
}
