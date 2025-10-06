
import React, { useEffect, useState, useRef } from 'react';
import { formatTime, isMobile } from '../util';
import { AssistWalker, ShuffleOn } from '@mui/icons-material';
import { Shuffle } from '@mui/icons-material';
import { useLongPress } from 'use-long-press';
import { useSwipeable } from 'react-swipeable';

const PlaylistRow = ({id, playlist, onClick, onDoubleClick, bulbOn, onBulbClick, selected, bulbCheckOn, onBulbCheckClick, icon, onLongPress, onSwipedLeft, onSwipedRight, album = false }) => {

  const swipeHandler = useSwipeable({
    onSwipedLeft: () => { if (onSwipedLeft) onSwipedLeft() },
    onSwipedRight: () => { if (onSwipedRight) onSwipedRight() },
    // onSwipedUp: () => alert('Swiped up!'),
    // onSwipedDown: () => alert('Swiped down!'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const longPressHandler = useLongPress(
    (e) => {
      e.preventDefault();      // 👈 blocks the synthetic click after touchend
      e.stopPropagation();     // 👈 prevents bubbling

      if (isMobile() && onLongPress) {
        onLongPress(playlist, bulbOn);
      }
    },
    {
      // extra safety: cancel synthetic click entirely
      captureEvent: true,       // ensures we get the raw event
      cancelOnMovement: true,   // prevents misfires when finger moves
    }
  );
 
  return (
    playlist &&
    <div id={id} {...longPressHandler()} {...swipeHandler} className={selected ? 'item-row-selected' : 'item-row'} key={playlist.id} onClick={() => onClick && onClick(playlist.id)} onDoubleClick={() => onDoubleClick && onDoubleClick(playlist.id)}>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ width: 20 }}>
              {icon ? icon :
                <div>
                  <img className="playlists-image" src={playlist.images && playlist.images[2] ? playlist.images[2].url : playlist.images && playlist.images[0].url} />
                </div>
              }
            </td>
            <td style={{ width: "70%" }}>
              <table style={{ width: "100%", padding: 4 }}>
                <tbody>
                  <tr>
                    <td>
                      <div className={isMobile() ? "playlists-name-mobile" : "playlist-name"}>
                        {playlist.name}
                      </div>
                    </td>
                    <td>

                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      {album ?
                        <div className="playlists-count" style={{ fontStyle: "italic", fontSize: 12 }}>
                          {playlist.artists[0].name}
                        </div> :
                        <div className="playlists-count">
                          {(playlist.count ? playlist.count : playlist.tracks.total) + " songs (" + playlist.tracks.filter(x => x.datePlayed).length + " played)"}
                        </div>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>


            {/* {isMobile() ?
              <td>
                {true ?
                  <div className={bulbCheckOn ? "check" : "bulbOff"} onClick={(e) => { e.stopPropagation(); onBulbCheckClick(playlist, bulbCheckOn) }}></div> :
                  null}
              </td> : null} */}

            <td className="playlists-bulb-container" onClick={(e) => { e.stopPropagation(); onBulbClick(playlist, bulbOn); }}>
              {/* {bulbOn ? <ShuffleOn className="bulbOn"  onClick={(e) => { e.stopPropagation(); onBulbClick(playlist, bulbOn); }}></ShuffleOn> :
                <Shuffle  className="bulbOff"  onClick={(e) => { e.stopPropagation(); onBulbClick(playlist, bulbOn); }}></Shuffle>} */}

              <svg fill="#000000" className={bulbOn ? "bulbOnColor" : "bulbOffColor"} height="32px" width="32px" version="1.1" id="Layer_1"
                viewBox="0 0 512.107 512.107"  >
                <g>
                  <g>
                    <path d="M384,133.338c-59.2,0-98.773,62.187-136.96,122.24c-35.2,55.253-71.573,112.427-119.04,112.427
        c-58.88,0-106.667-47.787-106.667-106.667S69.12,154.671,128,154.671c46.827,0,75.2,39.467,83.733,53.333h-62.08
        c-5.333,0-10.133,3.84-10.88,9.067c-0.96,6.613,4.16,12.267,10.56,12.267h85.333c5.867,0,10.667-4.8,10.667-10.667v-85.013
        c0-5.333-3.84-10.133-9.067-10.88c-6.613-0.96-12.267,4.16-12.267,10.56v54.507c-14.613-20.587-46.293-54.613-96-54.613
        C57.28,133.338,0,190.618,0,261.338s57.28,128,128,128c59.2,0,98.773-62.187,136.96-122.24
        c35.2-55.253,71.467-112.427,119.04-112.427c58.88,0,106.667,47.787,106.667,106.667S442.88,368.005,384,368.005
        c-56.96,0-85.653-46.187-86.827-48.107c-2.987-5.013-9.6-6.72-14.613-3.627c-5.013,3.093-6.72,9.6-3.627,14.613
        c1.387,2.347,35.84,58.56,105.173,58.56c70.72,0,128-57.28,128-128C512.107,190.725,454.72,133.338,384,133.338z"/>
                  </g>
                </g>
              </svg>
            </td>
          </tr>
        </tbody>
      </table>


    </div>
  )
}
export default PlaylistRow;