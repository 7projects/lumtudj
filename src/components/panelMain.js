

import React, { useEffect, useState, useRef, use } from "react";
import axios from "axios";

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ReordableTrackList from '../components/reordableTrackList';
import api from '../Api';
import PlaylistRow from '../components/playlistRow';
import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid, myShazamTracksPl, lastListenedPl } from '../util';
import { faL, faPersonMilitaryToPerson } from '@fortawesome/free-solid-svg-icons';
import { savePlaylists, loadPlaylists, saveBackgroundPlaylists, loadBackgroundPlaylists, addToHistory, getHistory, saveAlbums, loadAlbums, clearDatabase, saveLibrary } from '../database';
import Tooltip from '@mui/material/Tooltip';
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
import StarsIcon from '@mui/icons-material/Stars';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

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

const myShazamTracksPlIcon = <svg className='icon-color' width="32px" height="32px" viewBox="0 0 14.00 14.00" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M 7.00025,1.00025 C 3.686888,1.00025 1,3.685638 1,7 1,10.312362 3.686888,12.99975 7.00025,12.99975 10.313612,12.99975 13,10.312362 13,7 13,3.685638 10.313612,1.00025 7.00025,1.00025 M 5.9362943,9.367901 C 5.2928211,9.367901 4.6498479,9.15491 4.1558685,8.727428 3.5488938,8.20295 3.1889088,7.48798 3.1414108,6.715512 3.0964126,5.966043 3.351402,5.243573 3.8593809,4.682097 4.4303571,4.050623 5.4538144,3.069664 5.4968126,3.027666 5.7743011,2.761677 6.2142827,2.772176 6.4797717,3.050166 6.7447606,3.328654 6.735761,3.769636 6.4577727,4.035625 6.4472727,4.045625 5.4273156,5.023583 4.889338,5.617559 4.6353486,5.899547 4.507354,6.259032 4.529853,6.631016 4.554352,7.0255 4.7438441,7.395485 5.0648307,7.673973 5.4868131,8.038958 6.3197784,8.119454 6.8412567,7.652473 7.1507438,7.372984 7.5272281,6.964001 7.531228,6.959502 7.7912171,6.676013 8.2311988,6.658014 8.513687,6.919002 8.7961753,7.178992 8.8151745,7.619973 8.555185,7.903461 8.537686,7.920961 8.1292027,8.365442 7.7692177,8.689429 7.2667387,9.14041 6.6012664,9.3679 5.9362941,9.3679 M 10.141119,9.3184 c -0.5714763,0.630974 -1.5944336,1.612433 -1.6379318,1.654431 -0.1349944,0.127995 -0.3074872,0.192492 -0.47998,0.192492 -0.1839924,0 -0.3659848,-0.0725 -0.5029791,-0.214991 -0.2654889,-0.279488 -0.2559893,-0.71947 0.021999,-0.985459 0.0105,-0.01 1.031457,-0.988458 1.5684347,-1.582934 C 9.3646512,8.100451 9.4926458,7.740466 9.4701468,7.368482 9.4461478,6.973998 9.2561557,6.604013 8.9351691,6.326525 8.5131867,5.96154 7.6802214,5.880044 7.1592431,6.348525 6.848756,6.626514 6.4727717,7.036496 6.4692718,7.040496 6.2087827,7.323485 5.769801,7.342484 5.4863128,7.082496 5.2043245,6.822006 5.1843254,6.380525 5.4453148,6.097037 5.4623138,6.078537 5.8702971,5.634056 6.2307821,5.310569 7.2202408,4.421606 8.8411733,4.404107 9.8441315,5.272069 c 0.6069745,0.525478 0.9674595,1.239948 1.0139575,2.012416 0.046,0.748469 -0.209491,1.472439 -0.71697,2.033915" />
</svg>;

const lastListenedPlIcon = <svg className='icon-color' width="32px" height="32px" viewBox="0 0 14.00 14.00" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M216.81 155.94c0-10.96 8.88-19.84 19.84-19.84 10.95 0 19.83 8.88 19.83 19.84v120.75l82.65 36.33c10.01 4.41 14.56 16.1 10.15 26.11-4.41 10.02-16.1 14.56-26.11 10.15l-93.5-41.1c-7.51-2.82-12.86-10.07-12.86-18.57V155.94zM9.28 153.53c-.54-1.88-.83-3.87-.83-5.92l.16-73.41c0-11.84 9.59-21.43 21.43-21.43 11.83 0 21.43 9.59 21.43 21.43l-.06 27.86a255.053 255.053 0 0144.08-45.53c16.78-13.47 35.57-25.04 56.18-34.24 64.6-28.81 134.7-28.73 195.83-5.31 60.67 23.24 112.56 69.47 141.51 133.25.56 1.01 1.03 2.07 1.41 3.17 28.09 64.15 27.83 133.6 4.6 194.21-22.33 58.29-65.87 108.46-125.8 137.98-.38.22-.76.42-1.16.62-12.44 6.14-25.46 11.26-38.74 15.3-4.96 1.46-10.12.99-14.68-1.46-15.1-8.13-12.86-30.46 3.53-35.45 8.78-2.7 17.32-5.87 25.67-9.6.41-.21.84-.4 1.27-.58 2-.91 3.99-1.85 5.96-2.82.53-.26 1.07-.5 1.62-.71 50.62-25.1 87.42-67.61 106.34-116.98 19.93-52.04 20.04-111.64-4.41-166.46l-.01-.02c-24.46-54.82-68.84-94.54-120.82-114.45-52.04-19.94-111.63-20.04-166.45 4.41a217.791 217.791 0 00-47.75 29.11 216.133 216.133 0 00-37.71 39.04l17.1-.97c11.83-.65 21.96 8.42 22.61 20.26.65 11.83-8.42 21.96-20.26 22.61l-69.71 3.94c-11.02.6-20.56-7.21-22.34-17.85zm237.66 358.9c17.55.55 26.69-20.55 14.26-32.98-3.57-3.45-7.9-5.35-12.86-5.56-11.92-.39-23.48-1.72-35.19-4.01-7.52-1.44-14.84 1.44-19.39 7.59-8.15 11.46-1.97 27.43 11.85 30.22a256.37 256.37 0 0041.33 4.74zm-119.12-34.22c11.75 6.79 26.54-.08 28.81-13.5 1.23-7.97-2.34-15.6-9.26-19.74-10.27-5.99-19.83-12.71-28.99-20.28-13.76-11.34-34.16.32-31.36 17.95.81 4.7 3.05 8.59 6.69 11.68a255.166 255.166 0 0034.11 23.89zm-88.67-86.32c8.88 14.11 30.17 11.17 34.88-4.84 1.51-5.36.76-10.83-2.17-15.57-6.29-10.03-11.7-20.52-16.31-31.43-6.2-14.74-26.7-15.97-34.56-2.04-2.94 5.15-3.3 11.48-1 16.94 5.36 12.77 11.8 25.21 19.16 36.94zM.66 274.2c.62 8.63 6.81 15.71 15.27 17.51 12.64 2.53 23.99-7.36 23.19-20.23-.85-11.87-.73-23.54.32-35.4.59-7.04-2.49-13.66-8.31-17.67-12.22-8.25-28.69-.5-30.08 14.17a257.06 257.06 0 00-.39 41.62z" />
</svg>;

const myShazamTracksPlIconMobile = <svg className='icon-color' width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
</svg>;

const PanelMain = ({ onBack, onToolBarClick, onChange, selectedLibraryItem, tracks, onContextMenu, mode, handleMenu, onDoubleClick, isLocked, onClick, onMenuClick, onSwipedRight, onBulbClick, onBulbCheckClick, onLongPress, onShuffleClick, onDrop }) => {

    const { setMenuAnchor, library, setLoadingLibrary, filteredLibrary, setFilteredLibrary, setLibrary, loadingLibrary, selectedLibraryIndex, setSelectedLibraryIndex, backgroundPlaylists, setBackgroundPlaylists, selectedTrack, setSelectedTrack, selectedTrackIndex, setSelectedTrackIndex } = useAppStore();

    const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);

    const [libraryItem, setLibraryItem] = useState(null);

    // useEffect(() => {
    //     setSelectedPlaylistTracks(tracks);
    // }, [tracks]);


    useEffect(() => {
        let changedPL;
        if (libraryItem) {
            changedPL = {
                ...libraryItem,
                tracks: selectedPlaylistTracks
            }
        } else {
            changedPL = {
                id: "searchResults",
                type: "search",
                tracks: selectedPlaylistTracks,
                name: searchText,
            }
        }

        onChange && onChange(changedPL);

    }, [selectedPlaylistTracks]);

    useEffect(() => {
        if (!selectedLibraryItem?.tracks) {
            setSelectedPlaylistTracks([]);
            return;
        }

        setSelectedPlaylistTracks([...selectedLibraryItem.tracks]);
        setLibraryItem(selectedLibraryItem);
        setSearchText(selectedLibraryItem.name);

        debugger;
        if (selectedLibraryItem.type == "search" && selectedLibraryItem.name.trim() == "") {
            inputRef && inputRef.current.focus();
        }

    }, [selectedLibraryItem]);

    const tracksRef = useRef(null);
    const inputRef = useRef(null);
    const [searchText, setSearchText] = useState("");
    const [playlistChanged, setPlaylistChanged] = useState();
    const [loadingTracks, setLoadingTracks] = useState(false);

    const onSearchTextChanged = (e) => {
        setSearchText(e.target.value);

        let changedPL = {
            id: libraryItem ? libraryItem.id : "searchResults",
            type: libraryItem ? libraryItem.type : "search",
            tracks: selectedPlaylistTracks,
            name: e.target.value,
        };

        onChange && onChange(changedPL);

        if (e.target.value.trim() == "") {
            setSelectedPlaylistTracks([]);
            setLibraryItem(null);
            return;
        }

        if (selectedLibraryIndex && selectedLibraryIndex > -1) {
            setPlaylistChanged(true);
        }
    }

    const getLastListened = async () => {

        let lastTracks = await getHistory();

        lastTracks.sort((a, b) => {
            return b.datePlayed - a.datePlayed;
        });

        return lastTracks;
    }

    const getMyShazamTracks = async () => {

        setLoadingTracks(true);
        const id = localStorage.getItem("myShazamTracksID");
        if (!id) {
            alert("Cant find My Shazam tracks id");
            return [];
        }

        const tracks = await api.getTracks(id, 50);

        setLoadingTracks(false);
        return tracks;
    }

    const search = async (query) => {

        setPlaylistChanged(false);
        setLoadingTracks(true);
        const data = await api.search(query);
        setSelectedPlaylistTracks(data);
        setLoadingTracks(false);
    };

    const handleSelectedPlaylistDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            const oldIndex = selectedPlaylistTracks.findIndex((i, index) => "spl" + index + "-" + i.id === active.id);
            const newIndex = selectedPlaylistTracks.findIndex((i, index) => "spl" + index + "-" + i.id === over.id);

            if (libraryItem && libraryItem.type == "playlist") {
                api.changeTrackPosition(libraryItem.id, oldIndex, newIndex);
            }

            setSelectedPlaylistTracks((prev) => arrayMove(prev, oldIndex, newIndex));
            setPlaylistChanged(true);
        }
    }


    const initNewSearchActivity = () => {
        onToolBarClick("search");
        if (inputRef && inputRef.current) inputRef.current.focus();
    }


    const handleKeyDown = async (e) => {

        //check if e.key is alphanumeric or space
        let st = searchText;

        // if(libraryItem && libraryItem.type != "search"){
        //     onToolBarClick("search");
        //     if (inputRef && inputRef.current) inputRef.current.focus();
        // }

        if (e.key === 'Backspace') {
            st = st.slice(0, -1);

        }

        if (st != undefined && st.trim() == "") {
            setSearchText("");
            setSelectedPlaylistTracks([]);
            setLibraryItem(null);

            return;
        }

        if (e.key.match(/^[a-zA-Z0-9 ]$/) && e.key !== 'Enter') {
            st += e.key;
        }

        setLibraryItem(null);

        // setSelectedLibraryIndex(-1);
        if (e.key === 'Enter' && searchText.trim()) {
            search(searchText);
            e.preventDefault();
            if (inputRef && inputRef.current)
                inputRef.current.blur();
        } else {

            //filter all tracks from library (each playlist in libray contains tracks) whose name contains st
            let allTracks = [];
            let filtered = [];

            library.forEach(pl => {

                if (pl.name.toLowerCase().includes(st.toLowerCase())) {
                    filtered.push(...pl.tracks);
                }

                allTracks = allTracks.concat(pl.tracks);
            });

            filtered.push(
                ...allTracks.filter(
                    tr =>
                        tr?.name?.toLowerCase().includes(st.toLowerCase()) ||
                        tr?.artists?.[0]?.name?.toLowerCase().includes(st.toLowerCase())
                )
            );

            console.log(
                allTracks.find(tr => !tr || !tr.name)
            );

            const distinct = [...new Map(filtered.map(item => [item.id, item])).values()];

            setSelectedPlaylistTracks(distinct);

        }
    };

    return (
        <>
            {/* <img src="https://mosaic.scdn.co/640/ab67616d00001e0204508fa56b3746ca1f90f73cab67616d00001e024206814685e7f97a78670cc9ab67616d00001e027b2ed55c469487b2be37cac0ab67616d00001e028e7da55a612d5dda4e2d6663" alt="Search" className="panel-image" /> */}

            {/* <img src={track && track.album && track.album.images && track.album.images[0].url} alt="Search" className="panel-image" />  */}
            {true ? <div className="toolbar-wrapper">

                {mode == "normal" ?
                    <>
                        <div className='toolbar-search'>
                            <ArrowBackIosIcon className='toolbar-button' onClick={onBack}></ArrowBackIosIcon>
                            {/* <KeyboardArrowRightIcon></KeyboardArrowRightIcon> */}
                            <SearchIcon className='toolbar-button' style={{ cursor: "pointer" }} onClick={() => { onToolBarClick("search"); if (inputRef && inputRef.current) inputRef.current.focus(); }}></SearchIcon>
                            {libraryItem?.images ? <img className="" style={{ width: 20, borderRadius: "50%" }} src={libraryItem?.images?.[2]?.url || libraryItem?.images?.[0]?.url} />

                                : null}

                            {libraryItem?.images ? <div>{searchText}</div> :
                                <input ref={inputRef} className="toolbar-input-search" placeholder="Search" onFocus={(e) => e.target.select()} value={searchText} onKeyDown={handleKeyDown} onChange={onSearchTextChanged} />}
                        </div>

                        {/* {playlistChanged ? <SaveIcon onClick={saveSelectedPlaylist} className='toolbar-button'></SaveIcon> : null} */}

                        <div className='toolbar-icons'>
                            {/* <SwapVertIcon className='toolbar-button'></SwapVertIcon> */}

                            <Tooltip style={{}} enterDelay={500} title={"Aggregate tracks across playlists, count how many playlists each song appears in"} >
                                <StarsIcon className='toolbar-button' onClick={() => onToolBarClick("TopTracks")}></StarsIcon>
                            </Tooltip>
                            <Tooltip style={{}} enterDelay={500} title={"Show last listened tracks"} >
                                <HistoryIcon className='toolbar-button' onClick={() => onToolBarClick("LastListened")}></HistoryIcon>
                            </Tooltip>
                            <Tooltip style={{}} enterDelay={500} title={"Show last shazamed tracks"} >
                                <svg onClick={() => onToolBarClick("MyShazamedTracks")} class='toolbar-button' width="22" height="22" viewBox="0 0 35 35" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="translate(1, 1)" class='toolbar-button' >
                                        <path class='toolbar-button' d="M23.85 21.795c-1.428 1.577-3.985 4.030-4.094 4.135-0.312 0.298-0.735 0.481-1.201 0.481-0.961 0-1.74-0.779-1.74-1.74 0-0.495 0.207-0.942 0.539-1.259l0.001-0.001c0.026-0.025 2.578-2.471 3.92-3.956 0.561-0.611 0.905-1.43 0.905-2.328 0-0.072-0.002-0.144-0.007-0.214l0 0.010c-0.079-1.050-0.58-1.97-1.331-2.599l-0.006-0.005c-0.596-0.47-1.357-0.754-2.185-0.754-0.859 0-1.646 0.306-2.259 0.814l0.006-0.005c-0.776 0.695-1.716 1.72-1.724 1.73-0.319 0.35-0.777 0.569-1.287 0.569-0.961 0-1.74-0.779-1.74-1.74 0-0.459 0.178-0.877 0.468-1.188l-0.001 0.001c0.042-0.046 1.062-1.157 1.963-1.966 1.22-1.054 2.822-1.695 4.573-1.695 1.699 0 3.256 0.604 4.47 1.608l-0.012-0.009c1.448 1.231 2.399 3.007 2.533 5.008l0.001 0.022c0.008 0.128 0.013 0.277 0.013 0.428 0 1.796-0.686 3.433-1.81 4.661l0.005-0.005zM13.341 21.918c-0.020 0-0.044 0-0.067 0-1.675 0-3.208-0.605-4.393-1.609l0.010 0.008c-1.447-1.23-2.399-3.007-2.534-5.006l-0.001-0.022c-0.008-0.127-0.013-0.275-0.013-0.424 0-1.798 0.687-3.435 1.812-4.664l-0.005 0.005c1.427-1.578 3.985-4.030 4.093-4.135 0.312-0.298 0.735-0.481 1.201-0.481 0.961 0 1.74 0.779 1.74 1.74 0 0.495-0.207 0.942-0.539 1.259l-0.001 0.001c-0.026 0.025-2.576 2.469-3.92 3.954-0.561 0.611-0.905 1.43-0.905 2.329 0 0.072 0.002 0.143 0.007 0.214l-0-0.010c0.080 1.050 0.58 1.97 1.331 2.602l0.006 0.005c0.596 0.47 1.358 0.753 2.186 0.753 0.858 0 1.646-0.305 2.26-0.812l-0.006 0.005c0.774-0.699 1.715-1.721 1.724-1.732 0.319-0.344 0.773-0.558 1.277-0.558 0.961 0 1.74 0.779 1.74 1.74 0 0.455-0.174 0.868-0.46 1.178l0.001-0.001c-0.044 0.044-1.065 1.155-1.964 1.964-1.2 1.053-2.784 1.696-4.517 1.696-0.022 0-0.045-0-0.067-0l0.003 0zM16 1.004c0 0 0 0-0 0-8.282 0-14.996 6.714-14.996 14.996s6.714 14.996 14.996 14.996c8.282 0 14.996-6.714 14.996-14.996v0c-0-8.282-6.714-14.996-14.996-14.996v0z"></path>
                                    </g>
                                </svg>
                            </Tooltip>
                            <MoreVertIcon onClick={handleMenu} menu-target="tracks" className='toolbar-button'></MoreVertIcon>
                        </div>
                    </> : null}
            </div> : null}
            {
                loadingTracks ? <div className='loader'></div> :
                    <ReordableTrackList view={"details"} onClick={(tr, index) => { setSelectedTrack(tr); setSelectedTrackIndex(index) }} ref={tracksRef} selectedIndex={selectedTrackIndex} onContextMenu={onContextMenu} enableDrag={libraryItem && libraryItem.type == "playlist"} source="plprev" onDoubleClick={onDoubleClick} trackList={selectedPlaylistTracks} dragEndHandler={handleSelectedPlaylistDragEnd} keys={"spl"} onDrop={onDrop}></ReordableTrackList>

                // getTracksPanel()
            }
        </>);


}

export default PanelMain;

