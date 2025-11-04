

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";


import api from '../Api';
import PlaylistRow from '../components/playlistRow';
import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid } from '../util';
import { faL, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';
import { savePlaylists, loadPlaylists, saveBackgroundPlaylists, loadBackgroundPlaylists, addToHistory, getHistory, saveAlbums, loadAlbums, clearDatabase } from '../database';

import Settings from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import SearchIcon from '@mui/icons-material/Search';
import { AddAlertRounded, AlignVerticalCenterTwoTone, Timelapse } from '@mui/icons-material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import HistoryIcon from '@mui/icons-material/History';
import { Virtuoso } from 'react-virtuoso';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import PlaylistPicker from '../components/playlistPicker';
import AlbumIcon from '@mui/icons-material/Album';
import SwipeRightIcon from '@mui/icons-material/SwipeRight';
 
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import Moveable from "react-moveable";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useLongPress } from 'use-long-press';

// import { unstable_Activity, Activity as ActivityStable } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";


import useAppStore from '../AppStore';

const myShazamTracksPlIcon = <svg className='icon-color' width="30px" height="30px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
</svg>;

const myShazamTracksPlIconMobile = <svg className='icon-color' width="24px" height="24px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
</svg>;

const lastListenedPlIcon = <svg className='icon-color' width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M12,24C5.4,24,0,18.6,0,12h2c0,5.5,4.5,10,10,10s10-4.5,10-10S17.5,2,12,2C8.4,2,5.1,3.9,3.3,7H8v2H0V1h2v4.4
 C4.2,2.1,8,0,12,0c6.6,0,12,5.4,12,12S18.6,24,12,24z M15.3,17.8L11,13.4V6h2v6.6l3.7,3.8L15.3,17.8z"/>
</svg>;

const myShazamTracksPl = {
    id: "MyShazamedTracks",
    count: 0,
    name: "My shazamed tracks",
    total: 0,
    tracks: []
}

const lastListenedPl = {
    id: "LastListened",
    count: 0,
    name: "Last listened",
    total: 0,
    tracks: []
}

const PanelLibrary = ({onClick, onSwipedRight, onBulbClick, onBulbCheckClick, onLongPress, onShuffleClick}) => {

    const [filter, setFilter] = useState();
  
    const {library, loadingLibrary, selectedLibraryIndex, setSelectedLibraryIndex, backgroundPlaylists, setBackgroundPlaylists, selectedTrack, setSelectedTrack, selectedTrackIndex, setSelectedTrackIndex} = useAppStore();

    const [filteredLibrary, setFilteredLibrary] = useState([...library]);

    useEffect(()=>{
        if(filteredLibrary.length == 0 ){
            setFilteredLibrary([...library]);
        }
    }, [library])

    const onFilterChange = async (text) => {
        setFilter(text);
        //filter playlists by text
        let allPlaylists = [...library];
        if (text.trim() == "") {
            setFilteredLibrary(allPlaylists);
        } else {
            const filtered = allPlaylists.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
            setFilteredLibrary(filtered);
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

    const inputRef = useRef(null);

    if (1 == 1) return (
        <>
            {loadingLibrary ?
                <>
                    <div className="loader-text">{loadingLibrary}</div>
                    <div className='loader'>

                    </div>
                </>
                :
                <>
                    <>
                        {isMobile() ?
                            <>
                                <PlaylistRow icon={myShazamTracksPlIcon} playlist={myShazamTracksPl} onClick={() => { onClick(myShazamTracksPl) }} />
                                <PlaylistRow icon={lastListenedPlIcon} playlist={lastListenedPl} onClick={() => { onClick(lastListenedPl) }} />
                                {/* <div className='playlist-divider-playlists'>PLAYLISTS</div> */}
                            </> : null}

                        {!isMobile() || true ? <div className="toolbar-wrapper">

                            <input ref={inputRef} className="toolbar-input-search" placeholder="filter library..." onFocus={(e) => e.target.select()} value={filter} onChange={(e) => onFilterChange(e.target.value)} />
                            <MoreVertIcon className='toolbar-button'></MoreVertIcon>
                        </div> : null}

                        <Virtuoso
                            className={isMobile() ? 'panel-playlists-mobile' : "panel-playlists"}
                            style={{ marginTop: 5 }}
                            totalCount={filteredLibrary.length}
                            itemContent={(index) => {
                                const p = filteredLibrary[index];
                                return isMobile() ?
                                    <PlaylistRow onSwipedRight={onSwipedRight} id={"pl" + p.id} onBulbCheckClick={onBulbCheckClick} onLongPress={onLongPress} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedLibraryIndex == index} onBulbClick={onBulbClick} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { onClick(p); setSelectedLibraryIndex(index) }} />
                                    :
                                    <PlaylistRow onSwipedRight={onSwipedRight} id={"pl" + p.id} onBulbCheckClick={onBulbCheckClick} selected={selectedLibraryIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { if (onClick) onClick(p); setSelectedLibraryIndex(index); }} />
                            }}
                        />
                    </>
                </>}
        </>
    )
}

export default PanelLibrary;

{/* <Virtuoso
className={isMobile() ? 'panel-playlists-mobile' : "panel-playlists"}
style={{ marginTop: 5 }}
totalCount={filteredLibrary.length}
itemContent={(index) => {
    const p = filteredLibrary[index];
    return isMobile() ?
        <PlaylistRow onSwipedRight={() => { addPlaylistToToPlaylist(p) }} id={"pl" + p.id} onBulbCheckClick={addToSpotifyPlaylist} onLongPress={(pl, onof) => { onLongPress(pl, onof) }} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { loadPlaylistPrev(p); setSelectedPlaylistIndex(index) }} />
        :
        <PlaylistRow onSwipedRight={() => { addPlaylistToToPlaylist(p) }} id={"pl" + p.id} onBulbCheckClick={addToSpotifyPlaylist} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { loadPlaylistPrev(p); setSelectedPlaylistIndex(index); setSelectedTrack(null); }} />
}} */}


  // const getAlbumsPanel = () => {
  //   return <Virtuoso
  //     className={isMobile() ? 'hideScrollbar' : ""}
  //     style={{ height: '100%' }}
  //     totalCount={albums.length}
  //     // initialTopMostItemIndex={albumsScrollTop}
  //     // rangeChanged={(range) => {
  //     //   setAlbumsScrollTop(range.startIndex);
  //     // }}
  //     itemContent={(index) => {
  //       const p = albums[index];
  //       return isMobile() ?
  //         <PlaylistRow id={"tr" + p.id} onSwipedRight={() => addPlaylistToToPlaylist(p)} album onBulbCheckClick={addToSpotifyPlaylist} onLongPress={(pl, onof) => { onLongPress(pl, onof) }} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { setCurrentTab("2"); getTracks(p.id); setSearchText(p.name); setSelectedPlaylistIndex(index) }} />
  //         :
  //         <PlaylistRow id={"tr" + p.id} onSwipedRight={() => addPlaylistToToPlaylist(p)} album onBulbCheckClick={addToSpotifyPlaylist} bulbCheckOn={selectedTrack && p.tracks && p.tracks.some(x => x.id == selectedTrack.id)} selected={selectedPlaylistIndex == index} onBulbClick={addToBackgroundPlaylists} bulbOn={backgroundPlaylists && backgroundPlaylists.some(x => x.id == p.id)} playlist={p} onClick={() => { getTracks(p.id); setSelectedPlaylistIndex(index); setSelectedTrack(null); }} />

  //     }}
  //   />
  // }