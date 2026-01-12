
import React, { useEffect, useState, useRef } from "react";

import TrackRow from '../components/trackRow';

import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid, flyToPlayer, flyToPlaylist } from '../util';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';


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
import { CSS } from "@dnd-kit/utilities";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const SortableItem = ({ view, onBulbsClick, enableDrag, source, track, forInfo, onClick, onArtistClick, onDoubleClick, onMouseDown, index, onDrop, selected, onContextMenu, forPlayer, hideImage, playing, onPlClick, id, onAddToPlaylistButton, onLongPress, onSwipedLeft, onSwipedRight }) => {

    const { selectedLibraryItem, setDragTrack, setDragSourceIndex, setDragSource } = useAppStore();

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : undefined,
    };

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

    return (
        <li key={id} ref={setNodeRef} style={style} className={`list-item ${isDragging ? "dragging" : ""}`} onClick={() => onClick?.(track)} onContextMenu={onContextMenu} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
            <table style={{ width: "100%" }}>
                <tbody>
                    <tr>
                        {/* Main content cell */}
                        <td className={getTrackRowClass()} style={{ width: "auto" }} draggable={isMobile() ? false : true} onDragStart={() => { setDragSource(source); setDragTrack(track); setDragSourceIndex(index); }} onDragEnd={() => { setDragTrack(null); setDragSourceIndex(-1); setDragSource(null) }}  >
                            <TrackRow
                                onBulbsClick={onBulbsClick}
                                view={view}
                                source={source}
                                track={track}
                                forInfo={forInfo}
                                draggable={false}
                                onArtistClick={onArtistClick}

                                index={index}
                                onDrop={onDrop}
                                selected={selected}


                                forPlayer={forPlayer}
                                hideImage={hideImage}
                                playing={playing}
                                onPlClick={onPlClick}
                                id={id}
                                onAddToPlaylistButton={onAddToPlaylistButton}
                                onLongPress={onLongPress}
                                onSwipedLeft={onSwipedLeft}
                                onSwipedRight={onSwipedRight}
                            />
                        </td>

                        {/* Drag handle cell */}
                        {enableDrag ?
                            <td
                                style={{
                                    touchAction: "none",
                                    width: 40,
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                    display: isMobile() || true ? "table-cell" : "none",

                                }}
                                {...attributes}
                                {...listeners}
                            >
                                <DragIndicatorIcon className='toolbar-button'></DragIndicatorIcon>
                                {/* <DragHandleIcon /> */}
                            </td> : null}
                    </tr>
                </tbody>
            </table>

        </li>
    );
}

export default SortableItem;


