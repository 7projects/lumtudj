// Player.js
import React, { useEffect, useState, useRef } from 'react';
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

function useConstructor(callback) {
    const hasRun = useRef(false);
    if (!hasRun.current) {
        callback();
        hasRun.current = true;
    }
}

const Player = ({ locked, token, trackid, onClick, playlists, stateChanged, onError, onNext }) => {

    const [track, setTrack] = useState(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(100);
    const [isReady, setIsReady] = useState(false);
    const playerRef = useRef(null);
    const tickRef = useRef(null);
    const [playerState, setPlayerState] = useState("trackEnded");
    const playerStateRef = useRef(playerState);
    playerStateRef.current = playerState;


    const stateChangedRef = useRef(stateChanged);
    stateChangedRef.current = stateChanged;

    const tick = async () => {

        // console.log("tick");
        // console.log("playerStateRef.current: " + playerStateRef.current);

        if (playerRef.current) {
            const state = await playerRef.current.getCurrentState();
            if (playerStateRef.current == "playing") {
                if (state) {
                    setPosition(state.position);
                    setDuration(state.duration);
                }
            }

            //provjera da li je kraj pjesme
            if (playerStateRef.current == "playing") {
                console.log("provjera kraj pjesme");
                const positionMs = state.position;
                const positionSec = Math.floor(positionMs / 1000);

                const durationMs = state.duration;
                const durationSec = Math.floor(durationMs / 1000);

                if (state && (positionSec > durationSec - 5 || positionMs > durationSec * 1000)) {
                    // Optional: check if the same track is still playing
                    // or if there is no track at all
                    if (playerStateRef.current !== "trackEnded") {
                        setPlayerState("trackEnded")
                        stopUniverse();
                        playerStateRef.current = "trackEnded"
                        if (stateChangedRef) {
                            stateChangedRef.current("trackEnded");
                        }
                    }
                }
            }
        }

        if (tickRef.current) {
            clearTimeout(tickRef.current);
        }

        tickRef.current = setTimeout(() => {
            tick();
        }, 1000);


    }

    useConstructor(async () => {
        //start Tick
        tick();
    });


    const tokenRef = useRef(token);


    // Load the SDK script ONCE
    useEffect(() => {

        alert("token channged u playeru:");

        tokenRef.current = token;

        if (playerRef.current) {
            //dobili smo novi refresh token 
            alert("update token");
            playerRef.current._options.getOAuthToken = cb => cb(token);
            
        }
        else {
            initializePlayer();
        }
    }, [token]);


    const initializePlayer = () => {

        const player = new window.Spotify.Player({
            name: 'My Spotify Player',
            getOAuthToken: cb => cb(tokenRef.current),
            volume: 0.5,
        });

        if (!player) {
            alert("Player not found");
        }



        // Store player in ref (not state)
        playerRef.current = player;

        player.addListener('ready', async ({ device_id }) => {
            setIsReady(true);
            // 🔥 Transfer playback here
            await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    device_ids: [device_id],
                    play: false, // set to true to start playback
                }),
            });
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.warn('Player device went offline', device_id);
            setIsReady(false);
        });

        // Playback status updates
        player.addListener('player_state_changed', state => {
            if (!state) {
                console.error('No state received');
                return;
            }

            const {
                paused,
                position,
                duration,
                track_window: { current_track }
            } = state;



            if (paused == false) {
                if (playerState !== "playing") {
                    setPlayerState("playing");
                    startUniverse();
                    playerStateRef.current = "playing";
                    if (stateChanged) {
                        // stateChanged("playing");
                    }
                }
            }

            if (paused == true) {
                if (playerState !== "paused") {
                    setPlayerState("paused");
                    stopUniverse();
                    playerStateRef.current = "paused";
                    if (stateChanged) {
                        // stateChanged("paused");
                    }
                }
            }


        });

        player.addListener('initialization_error', e => console.error(e));
        player.addListener('authentication_error', e => console.error(e));
        player.addListener('account_error', e => console.error(e));
        player.addListener('playback_error', e => console.error(e));

        player.connect();
    }

    useEffect(() => {
        if (!token)
            pauseTrack();

        const interval = setInterval(async () => {

        }, 1000);

        return () => clearInterval(interval); // cleanup
    });


    useEffect(() => {
        const player = playerRef.current;

        if (isReady && player) {
            setTrack(trackid);

            if (trackid && trackid.id)
                playTrack(trackid.id);
        } else {
            initializePlayer();
        }
    }, [trackid]);

    const resumeTrack = async (e) => {
        e.stopPropagation();
        if (locked) return;
        const player = playerRef.current;
        if (isReady && player) {
            try {
                await player.resume();
                console.log('Playback resumed');
            } catch (err) {
                console.error('Failed to resume', err);
            }
        } else {
            console.warn('Player not ready');
        }
    }

    const pauseTrack = (e) => {
        if (e)
            e.stopPropagation();

        if (locked) return;
        fetch('https://api.spotify.com/v1/me/player/pause', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        setPlayerState("paused");
        playerStateRef.current = "paused";
        stopUniverse();
    };

    const setVolume = (vol) => {
        playerRef.current.setVolume(vol).then(() => { });
    }


    const FADE_INTERVAL = 100; // milliseconds
    const FADE_STEP = 0.02;    // volume step (max is 1.0)
    const TARGET_VOLUME = 1.0; // max volume

    const fadeVolume = (player, from, to, callback) => {
        let volume = from;
        const step = (to > from ? FADE_STEP : -FADE_STEP);

        const interval = setInterval(() => {
            volume = Math.max(0, Math.min(1, volume + step));
            player.setVolume(volume);

            if ((step > 0 && volume >= to) || (step < 0 && volume <= to)) {
                clearInterval(interval);
                player.setVolume(to);
                if (callback) callback();
            }

        }, FADE_INTERVAL);
    };

    const playSpotify = async (id, currentVolume) => {

        try {
            const player = playerRef.current;

            if (!player) {
                alert('Player not ready');
            }

            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: ['spotify:track:' + id]
                })
            })


            // if (!response.ok) {
            //     if (onError) {
            //         onError(response);
            //     }
            // }

            // if (currentVolume)
            //     player.setVolume(currentVolume);


            // setPlayerState("playing");
            // Then fade back in
            // fadeVolume(player, 0, TARGET_VOLUME);

        } catch (e) {
            initializePlayer();
            alert("err-" + JSON.stringify(e));
            if (onError) {
                // onError(e);
            }
        }
    }

    const playTrack = async (id) => {

        if (!id) id = track.id;
        const player = playerRef.current;

        setPosition(0);
        setDuration(1);

        try {

            if (playerState === "playing") {
                // Start by fading out
                setPlayerState("fadingOut");
                playerStateRef.current = "fadingOut";
                setDuration(1);
                setPosition(0);
                player.getVolume().then(currentVolume => {
                    fadeVolume(player, currentVolume, 0, () => {
                        // After fade out, start new track

                        fetch('https://api.spotify.com/v1/me/player/pause', {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }).then(() => {


                            playSpotify(id).then(() => {

                                if (isMobile())
                                    player.setVolume(1);
                                else
                                    player.setVolume(currentVolume);

                                setPlayerState("playing");
                                playerStateRef.current = "playing";
                                startUniverse();
                                // Then fade back in
                                // fadeVolume(player, 0, TARGET_VOLUME);
                            });

                        }
                        )


                    });
                });
            } else {
                playSpotify(id);
            }
        } catch (e) {
            alert("err-" + JSON.stringify(e));
        }
    };

    // When the user clicks the progress bar
    const seek = async (e) => {

        e.stopPropagation();
        const progressBar = document.getElementById('progressBar');
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;

        // Get current track duration from Spotify SDK
        const state = await playerRef.current.getCurrentState();
        if (!state) return;

        const duration = state.duration;
        const newPosition = percent * duration;

        setPosition(newPosition)
        // Seek to the new position
        playerRef.current.seek(newPosition);
    }

    const next = (e) => {
        e.stopPropagation();

        if (onNext) {
            onNext();
        }
    }

    const prev = (e) => {
        e.stopPropagation();
        if (locked) return;
        setPosition(0)
        // Seek to the new position
        playerRef.current.seek(0);
    }

    const startUniverse = () => {
        return;
        const box = document.querySelector('#universe');
        box.style.animation = 'fadeIn 5s forwards';
    }

    const stopUniverse = () => {
        const box = document.querySelector('#universe');
        if (box)
            box.style.animation = 'fadeOut 5s forwards';
    }

    return (
        <div style={{ width: '100%', textAlign: 'center', bottom: 0, position: "absolute" }} onClick={onClick}>
            {/* <div className='player-artist'>{track && track.artists && track.artists.map(a => a.name).join(", ").toString().toUpperCase()}</div>
            <div className='player-song'>{track && track.name && track.name.toUpperCase()}</div> */}
            <div id="universe">
                <div id='stars'></div>
                <div id='stars2'></div>
                <div id='stars3'></div>
            </div>

            {/* <div className='universe'>
                <div className="stars"></div>
                <div className="stars"></div>
                <div className="stars"></div>
            </div> */}

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
                                        style={{ width: '100%' , display: 'block' }}
                                    /> */}
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

                                    {/* <button className='player-button-mobile' onClick={prev}><SkipPreviousIcon className='player-button-mobile-icon' /></button>
                                    {playerState != "playing" ? <button className='player-button-mobile' onClick={resumeTrack}><PlayCircleOutlineIcon className='player-button-mobile-icon'  /></button> : null}
                                    {playerState == "playing" ? <button className='player-button-mobile' onClick={pauseTrack}><PauseCircleOutlineIcon className='player-button-mobile-icon'  /></button> : null}
                                    <button className='player-button-mobile' onClick={next}><SkipNextIcon className='player-button-mobile-icon'  /></button> */}


                                    {/* <button className='player-button' onClick={resumeTrack}><RepeatIcon /></button>
                                    <button className='player-button' onClick={resumeTrack}><ShuffleIcon /></button>
                                    <button className='player-button' onClick={resumeTrack}><AutoFixHighIcon /></button> */}
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
};

export default Player;
