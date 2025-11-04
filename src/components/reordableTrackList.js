

import React, { useEffect, useState, useRef } from "react";

import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid, flyToPlayer, flyToPlaylist } from '../util';

import { Virtuoso } from 'react-virtuoso';
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import SortableItem from '../components/sortableItem';
import useAppStore from '../AppStore';

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


const ReordableTrackList = ({ trackList, onClick, onDoubleClick, dragEndHandler, key, onSwipedRight, onDrop }) => {

    const {selectedTrack, setSelectedTrack, menuPosition, setMenuPosition, selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex, dragTrack, setDragTrack, dragSource, setDragSource, locked, dragTrackIndex, setDragTrackIndex } = useAppStore();

    const sensors = useSensors(
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleContextMenu = (e) => {
        e.preventDefault();
        setMenuPosition({ x: e.pageX, y: e.pageY });
    };

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEndHandler} modifiers={[restrictToVerticalAxis]}>
                <SortableContext items={(trackList || []).map((i, index) => key + index + "-" + i.id)} strategy={rectSortingStrategy}>
                    <Virtuoso
                        style={{ height: '100%' }}
                        totalCount={trackList.length}
                        itemContent={(index) => {
                            const tr = trackList[index];
                            if (!tr) return null;

                            return isMobile() ?
                                <SortableItem id={key + index + "-" + tr.id} value={tr.name} key={key + index + "-" + tr.id} onSwipedRight={() => { onSwipedRight(tr, key + index + "-" + tr.id, index) }} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => onDrop(dragTrack, index)} track={tr} onClick={() => { onDoubleClick(tr, index); setSelectedTrack(tr) }} /> :
                                <SortableItem id={key + index + "-" + tr.id} value={tr.name} key={key + index + "-" + tr.id} onContextMenu={handleContextMenu} index={index} selected={index == selectedPlaylistTrackIndex} onMouseDown={() => { setDragSource("playlist"); setDragTrack(tr); setDragTrackIndex(index); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => onDrop(dragTrack, locked ? null : index)} track={tr} onClick={() => setSelectedTrack(tr)} onDoubleClick={() => onDoubleClick(tr, index)} />
                        }}
                    />
                </SortableContext>
            </DndContext>
        </>
    );
}


export default ReordableTrackList;