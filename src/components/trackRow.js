import React, { useEffect, useState, useRef } from 'react';
import { formatTime, isMobile } from '../util';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { useLongPress } from 'use-long-press';
import { useSwipeable } from 'react-swipeable';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import Marquee from 'react-fast-marquee';

const TrackRow = ({ track, forInfo, onClick, onArtistClick, onDoubleClick, onMouseDown, index, onDrop, selected, onContextMenu, playlists, forPlayer, hideImage, playing, onPlClick, id, onAddToPlaylistButton, onLongPress, onSwipedLeft, onSwipedRight }) => {

    const getTrackRowClass = () => {
        let clss = isMobile() ? 'item-row-mobile' : 'item-row';

        // if (playing)
        //     clss = 'track-row-selected track-row-playing'

        if (selected)
            clss = isMobile() ? 'item-row-selected-mobile' : "item-row-selected"

        if (forPlayer)
            clss = clss + " for-player";

        return clss;
    }

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

    const swipeHandler = useSwipeable({
        onSwipedLeft: () => { if (onSwipedLeft) onSwipedLeft() },
        onSwipedRight: () => { if (onSwipedRight) onSwipedRight() },
        // onSwipedUp: () => alert('Swiped up!'),
        // onSwipedDown: () => alert('Swiped down!'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    return (
        track &&
        <div id={id} {...swipeHandler} {...longPressHandler()} draggable={isMobile() ? false : true} onContextMenu={onContextMenu} onDrop={(e) => { e.stopPropagation(); onDrop && onDrop(index) }} className={getTrackRowClass()} key={track.id} onClick={(e) => { onClick && onClick(track) }} onDoubleClick={() => { onDoubleClick && onDoubleClick(track) }} onMouseDown={(e) => { onMouseDown && onMouseDown(track) }}>

            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        {!hideImage && forPlayer && <td style={{ width: 60, padding: 5 }}>
                            <img
                                src={track && track.album && track.album.images[2].url}
                                alt={`${track.name} album cover`}
                                style={{ display: "block", width: isMobile() ? 30 : 70, objectFit: 'cover', borderRadius: 8 }}
                            />
                        </td>}
                        <td>
                            {isMobile() ?

                                <table style={{ width: "100%" }}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table style={{ width: "100%" }}>
                                                    <tbody>
                                                        <tr>
                                                            <td>

                                                                <div className="song-artist-mobile">
                                                                    {track && track.artists && track.artists.map(a => a.name).join(", ")}
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: "right", paddingRight: 5 }}>
                                                                {forPlayer && playlists && playlists.map((p) =>
                                                                    <div key={p.id} className='littleBulbOn'>

                                                                    </div>
                                                                )
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div className="song-name-mobile" style={forPlayer ? { fontSize: 12 } : {}}>
                                                                    {track.name}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}  >
                                                                <div className="song-time-mobile">
                                                                    {!forPlayer && formatTime(track.duration_ms)}

                                                                    {!forPlayer && <>&nbsp;</>}

                                                                    {!forPlayer && playlists && playlists.map((p) =>
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
                                            </td>
                                            {onPlClick ?
                                                <td style={{ width: 40 }} onClick={(e) => { e.stopPropagation(); onPlClick(track) }}>
                                                    <PlaylistAddIcon></PlaylistAddIcon>
                                                </td> : null}
                                        </tr>
                                    </tbody>
                                </table>


                                :
                                <table style={{ width: "100%", padding: 5 }}>
                                    <tbody>

                                        <tr>
                                            <td>

                                                <span className="song-artist" onClick={(e) => { onArtistClick && onArtistClick(track); e.stopPropagation(); e.preventDefault(); }}>
                                                    {forInfo ? track && track.name :
                                                        track && track.artists && track.artists.map(a => a.name).join(", ")
                                                    }
                                                </span>
                                            </td>
                                            {onAddToPlaylistButton ?
                                                <td className='song-add-to-playlist' onClick={(e) => { e.stopPropagation(); onAddToPlaylistButton(track); }}>


                                                    <PlaylistAddIcon ></PlaylistAddIcon>

                                                </td> : null}
                                        </tr>
                                        {!forInfo ?
                                            <tr>
                                                <td colSpan={2}>
                                                    <span className="song-name">
                                                        {/* {forPlayer ?
                                                            <Marquee>{track.name}</Marquee>
                                                            :
                                                            track.name} */}
                                                        {track.name}
                                                    </span>
                                                </td>
                                            </tr> : null}
                                        {!forInfo ?
                                            <tr>
                                                <td colSpan={2}>
                                                    <div className="song-release-date">
                                                        {track.album && track.album.release_date ? track.album.name : "Unknown album"}&nbsp;
                                                        ({track.album && track.album.release_date ? new Date(track.album.release_date).getFullYear() : "Unknown Release Date"})
                                                    </div>
                                                </td>
                                            </tr> : null}

                                        <tr>
                                            <td colSpan={2}  >
                                                <div className="song-release-date">
                                                    {!forPlayer && formatTime(track.duration_ms)}

                                                    {!forPlayer && <>&nbsp;</>}
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