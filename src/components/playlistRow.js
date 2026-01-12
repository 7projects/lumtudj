
import React, { useEffect, useState, useRef } from 'react';
import { formatTime, isMobile } from '../util';
import { AssistWalker, ShuffleOn } from '@mui/icons-material';
import { Shuffle } from '@mui/icons-material';
import { useLongPress } from 'use-long-press';
import { useSwipeable } from 'react-swipeable';
import useAppStore from '../AppStore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import api from '../Api';

const PlaylistRow = ({ onContextMenu, liked, showLiked, id, draggable, source, shuffleButton, index, playlist, onClick, onDoubleClick, bulbOn, onBulbClick, selected, bulbCheckOn, onBulbCheckClick, icon, onLongPress, onSwipedLeft, onDrop, onSwipedRight }) => {

  const { library, setLibrary, deleteFromLibrary, setSelectedLibraryIndex, selectedLibraryIndex, dragTrack, setDragTrack, setDragSourceIndex, setDragSource, dragSource } = useAppStore();

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


  const onLikedClick = async (e) => {

    if (liked) {
      let res = await api.unfollowAlbum(playlist);
      if (res.ok) {
        let pls = [...library];
        pls = pls.filter(x => x.id != playlist.id);
        setLibrary(pls);
        await deleteFromLibrary(playlist);
      }
    }
    else {
      let res = await api.followAlbum(playlist);
      if (res.ok) {
        let pls = [...library];
        pls.unshift(playlist);
        setLibrary(pls);
      }
    }
  }

  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0);

  return (
    playlist &&
    <div
      onContextMenu={(e) => { e.preventDefault(); onContextMenu?.(e, playlist, index) }} id={id} {...longPressHandler()} {...swipeHandler} onClick={() => { onClick && onClick(playlist.id) }} onDoubleClick={() => onDoubleClick && onDoubleClick(playlist.id)}
      draggable={draggable}

      onDragStart={(e) => {
        e.dataTransfer.setData("source", source);
        setDragSource(source);
        setDragSourceIndex(index);
      }}

      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;

        const src = e.dataTransfer.getData("source");
        if (src !== "library" && playlist.type === "playlist") {
          setIsDragOver(true);
        }
      }}

      onDragLeave={() => {
        dragCounter.current--;
        if (dragCounter.current === 0) {
          setIsDragOver(false);
        }
      }}

      onDragOver={(e) => {
        e.preventDefault(); // REQUIRED for drop
      }}

      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragOver(false);
        onDrop?.(playlist);
      }}

      className={`${selected ? 'item-row-selected' : 'item-row'} ${isDragOver ? 'drag-over' : ''}`}
    >

      <table style={{ width: "100%" }}>
        <tbody>
          <tr>

            {playlist.type != "featured" ?
              <td style={{ width: 20, textAlign: "center", verticalAlign: "middle" }}>
                {icon ? icon :
                  <div>
                    <img className="playlists-image" src={playlist?.images?.[2]?.url || playlist?.images?.[0]?.url} />
                  </div>
                }
              </td> : null}
            <td style={{ width: "70%" }}>
              <table style={{ width: "100%", padding: 4 }}>
                <tbody>
                  <tr>
                    <td>
                      <div className={isMobile() ? "playlists-name-mobile" : "playlist-name"} style={{ fontWeight: "bold" }}>
                        {playlist.name}
                      </div>
                    </td>
                    <td>

                    </td>
                  </tr>

                  <tr>
                    {playlist.type != "featured" ?
                      <td colSpan={2}>
                        {playlist.type == "album" ?
                          <div className="playlists-count" style={{ fontStyle: "italic", fontSize: 12 }}>
                            {playlist.artists[0].name} {playlist.release_date?.substring(0, 4)} ({playlist.count || playlist.total_tracks} tracks)
                          </div> :
                          <div className="playlists-count">
                            {/* {(playlist.count ? playlist.count : playlist.tracks?.total || playlist.total_tracks)} tracks {playlist.tracks && ("(" + playlist.tracks.filter(x => x.datePlayed).length + " played)")} */}
                            ({(playlist.count ? playlist.count : playlist.tracks?.total || playlist.total_tracks)} tracks)

                          </div>}
                      </td> : null}
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

            {/* <td className="playlists-bulb-container" onClick={onLikedClick}  >
              {showLiked ?
                <ThumbUpIcon className={liked ? "bulbOnColor" : "bulbOffColor"}></ThumbUpIcon> : null}
            </td> */}

            {/* <td className="playlists-bulb-container" onClick={onLikedClick}  >
              {true ?
                <div className={"bulbOffColor"} style={{color:"gray", fontSize:10}}>follow</div> : null}
            </td> */}

            {playlist.type != "featured" ?
              <td className="playlists-bulb-container" onClick={(e) => { e.stopPropagation(); onBulbClick(playlist, bulbOn); }}>
                {/* {bulbOn ? <ShuffleOn className="bulbOn"  onClick={(e) => { e.stopPropagation(); onBulbClick(playlist, bulbOn); }}></ShuffleOn> :
                <Shuffle  className="bulbOff"  onClick={(e) => { e.stopPropagation(); onBulbClick(playlist, bulbOn); }}></Shuffle>} */}
                {shuffleButton ?
                  <svg className={bulbOn ? "bulbOnColor" : "bulbOffColor"} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path d="M237.66 178.34a8 8 0 0 1 0 11.32l-24 24a8 8 0 0 1-11.32-11.32L212.69 192h-11.75a72.12 72.12 0 0 1-58.59-30.15l-41.72-58.4A56.1 56.1 0 0 0 55.06 80H32a8 8 0 0 1 0-16h23.06a72.12 72.12 0 0 1 58.59 30.15l41.72 58.4A56.1 56.1 0 0 0 200.94 176h11.75l-10.35-10.34a8 8 0 0 1 11.32-11.32ZM143 107a8 8 0 0 0 11.16-1.86l1.2-1.67A56.1 56.1 0 0 1 200.94 80h11.75l-10.35 10.34a8 8 0 0 0 11.32 11.32l24-24a8 8 0 0 0 0-11.32l-24-24a8 8 0 0 0-11.32 11.32L212.69 64h-11.75a72.12 72.12 0 0 0-58.59 30.15l-1.2 1.67A8 8 0 0 0 143 107Zm-30 42a8 8 0 0 0-11.16 1.86l-1.2 1.67A56.1 56.1 0 0 1 55.06 176H32a8 8 0 0 0 0 16h23.06a72.12 72.12 0 0 0 58.59-30.15l1.2-1.67A8 8 0 0 0 113 149Z" />
                  </svg> : null}

                {/* <svg fill="#000000" className={bulbOn ? "bulbOnColor" : "bulbOffColor"} height="32px" width="32px" version="1.1" id="Layer_1"
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
              </svg> */}


              </td> : null}

          </tr>
        </tbody>
      </table>


    </div>
  )
}
export default PlaylistRow;