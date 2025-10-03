
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
    <div id={id} {...longPressHandler()} {...swipeHandler} className={selected && !isMobile() ? 'playlists-row-selected' : 'playlists-row'} key={playlist.id} onClick={() => onClick && onClick(playlist.id)} onDoubleClick={() => onDoubleClick && onDoubleClick(playlist.id)}>
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

              {/* <svg className={bulbOn ? "bulbOnColor" : "bulbOffColor"}  width="40px" height="40px" viewBox="0 0 104 104" version="1.1" >
                <g id="3.Multimedia" stroke="none" stroke-width="1" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                  <g id="Multimedia-(Color)" transform="translate(-1898.000000, -903.000000)" stroke="#263238" stroke-width="3.5">
                    <g id="50-multimeda-shuffle-mix" transform="translate(1900.000000, 905.000000)">
                      <circle id="Layer-1"  cx="50" cy="50" r="50">

                      </circle>
                      <path d="M50.315918,50.9160156 L47.6176758,42.5 C46.2752571,38.3578644 40.7110735,35 35.1870117,35 L22,35" id="Layer-2">

                      </path>
                      <path d="M50,50 L52.4306641,57.5 C53.7730828,61.6421356 59.3372663,65 64.8613281,65 L74.8613281,65" id="Layer-3">

                      </path>
                      <path d="M46.4071159,60 C44.122084,62.9883429 39.6694969,65.1447465 35.2426757,65.1447465 L22,65.1447465" id="Layer-4">

                      </path>
                      <path d="M54,39.9039153 C56.3357877,37.0412346 60.6671632,35 64.9741488,35 L74.9741488,35" id="Layer-5">

                      </path>
                      <polyline id="Layer-6" points="70 59 80 65 70 71">

                      </polyline>
                      <polyline id="Layer-7" points="70 29 80 35 70 41">

                      </polyline>
                    </g>
                  </g>
                </g>
              </svg> */}






            </td>
          </tr>
        </tbody>
      </table>


    </div>
  )
}
export default PlaylistRow;