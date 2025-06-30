import React, { useEffect, useState, useRef } from 'react';
import { formatTime, isMobile } from '../util';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';

const TrackRow = ({ track, onClick, onDoubleClick, onMouseDown, index, onDrop, selected, onContextMenu, playlists, forPlayer, hideImage, playing, onPlClick, id, onAddToPlaylistButton }) => {

    const getTrackRowClass = () => {
        let clss = 'track-row';

        if (playing)
            clss = 'track-row-selected track-row-playing'

        if (selected)
            clss = 'track-row-selected'

        if (forPlayer)
            clss = clss + " for-player";

        return clss;
    }

    return (
        track &&
        <div id={id} draggable onContextMenu={onContextMenu} onDrop={(e) => { e.stopPropagation(); onDrop && onDrop(index) }} className={getTrackRowClass()} key={track.id} onClick={() => onClick && onClick(track)} onDoubleClick={() => { onDoubleClick && onDoubleClick(track) }} onMouseDown={() => { onMouseDown && onMouseDown(track) }}>

            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        {!hideImage && <td style={{ width: 30 }}>
                            <img
                                src={track && track.album && track.album.images[2].url}
                                alt={`${track.name} album cover`}
                                style={{ display: "block", width: isMobile() ? 30 : 50, objectFit: 'cover', borderRadius: 8 }}
                            />
                        </td>}
                        <td>
                            {isMobile() ?

                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table>
                                                    <tr>
                                                        <td>
                                                            <div className="song-name-mobile">
                                                                {track.name}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <div className="song-artist-mobile">
                                                                {track && track.artists && track.artists.map(a => a.name).join(", ")}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            {onPlClick ?
                                                <td style={{ width: 40 }} onClick={(e) => { e.stopPropagation(); onPlClick(track) }}>
                                                    <PlaylistPlayIcon></PlaylistPlayIcon>
                                                </td> : null}
                                        </tr>
                                    </tbody>
                                </table>


                                :
                                <table style={{ width: "100%", padding: 5 }}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="song-name">
                                                    {track.name}
                                                </div>
                                            </td>
                                            {onAddToPlaylistButton ?
                                                <td className='song-add-to-playlist' onClick={(e) => {e.stopPropagation(); onAddToPlaylistButton(track); }}>


                                                    <PlaylistAddIcon ></PlaylistAddIcon>

                                                </td> : null}
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>
                                                <div className="song-artist">
                                                    {track && track.artists && track.artists.map(a => a.name).join(", ")}
                                                    <br />
                                                    <div className="song-release-date">

                                                        {track.album && track.album.release_date ? track.album.name : "Unknown album"}&nbsp;
                                                        ({track.album && track.album.release_date ? new Date(track.album.release_date).getFullYear() : "Unknown Release Date"})
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}  >
                                                <div className="song-artist">
                                                    {!forPlayer && formatTime(track.duration_ms)} &nbsp;
                                                    {playlists && playlists.map((p) =>
                                                        <div key={p.id} className='littleBulbOn'>

                                                        </div>
                                                    )
                                                    }
                                                    {/* {playlists && playlists.map((p) =>
                                                    <span key={"trackpname-" + p.id} style={{ fontSize: 10, marginLeft: 5, color: "gray" }} >
                                                        {p.name.toUpperCase()},
                                                    </span>
                                                )
                                                } */}
                                                </div>

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            }
                        </td>
                    </tr>
                </tbody>
            </table>



        </div>
    )
}
export default TrackRow;