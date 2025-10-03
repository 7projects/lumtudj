import React, { useEffect, useState, useRef } from "react";

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

  const formatTime = ms => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={playTrack}
        className="px-4 py-2 rounded-2xl bg-green-500 text-white shadow-md"
      >
        ▶ Play
      </button>
      <button
        onClick={pauseTrack}
        className="px-4 py-2 rounded-2xl bg-red-500 text-white shadow-md"
      >
        ⏸ Pause
      </button>
      <div className="text-sm text-gray-700">
        {formatTime(position)} / {formatTime(duration)}
      </div>
    </div>
  );
}
