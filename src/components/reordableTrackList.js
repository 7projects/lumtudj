

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
import { KeyboardVoiceSharp } from "@mui/icons-material";


const ReordableTrackList = ({ ref, onContextMenu, enableDrag, source, trackList, onClick, onDoubleClick, dragEndHandler, keys, onSwipedRight, onDrop, selectedIndex }) => {

    const { selectedTrack, setSelectedTrack, menuPosition, setMenuPosition, selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex, dragTrack, setDragTrack, dragSource, setDragSource, locked, dragSourceIndex, setDragSourceIndex } = useAppStore();

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

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEndHandler} modifiers={[restrictToVerticalAxis]}>
                <SortableContext items={(trackList || []).map((i, index) => keys + index + "-" + i.id)} strategy={rectSortingStrategy}>
                    <Virtuoso
                        ref={ref}
                        style={{ height: "calc(100% - 40px)" }}
                        totalCount={trackList.length}
                        itemContent={(index) => {
                            const tr = trackList[index];
                            if (!tr) return null;

                            return isMobile() ?
                                <SortableItem onContextMenu={(e) => { onContextMenu?.(e, tr, index) }} enableDrag={enableDrag} source={source} id={keys + index + "-" + tr.id} value={tr.name} key={KeyboardVoiceSharp + index + "-" + tr.id} onSwipedRight={() => { onSwipedRight(tr, keys + index + "-" + tr.id, index) }} index={index} selected={index == selectedIndex} onDrop={(index) => onDrop(dragTrack, index)} track={tr} onClick={() => onClick?.(tr, index)} /> :
                                <SortableItem enableDrag={enableDrag} source={source} id={keys + index + "-" + tr.id} value={tr.name} key={keys + index + "-" + tr.id} onContextMenu={(e) => { onContextMenu?.(e, tr, index) }} index={index} selected={index == selectedIndex} onMouseDown={() => { setDragSource("playlist"); setSelectedPlaylistTrackIndex(index) }} onDrop={(index) => onDrop(dragTrack, locked ? null : index)} track={tr} onClick={() => onClick?.(tr, index)} onDoubleClick={() => onDoubleClick(tr, index)} />
                        }}
                    />
                </SortableContext>
            </DndContext>
        </>
    );
}


export default ReordableTrackList;