
import React, { useEffect, useState, useRef } from "react";

import TrackRow from '../components/trackRow';

import { loadThemeCSS, isMobile, fullscreen, startUniverse, newGuid, flyToPlayer, flyToPlaylist } from '../util';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';





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

const SortableItem = ({ track, forInfo, onClick, onArtistClick, onDoubleClick, onMouseDown, index, onDrop, selected, onContextMenu, forPlayer, hideImage, playing, onPlClick, id, onAddToPlaylistButton, onLongPress, onSwipedLeft, onSwipedRight }) => {

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : undefined,
    };

    return (
        <li ref={setNodeRef} style={style} className={`list-item ${isDragging ? "dragging" : ""}`}>
            <table style={{ width: "100%" }} className={isMobile() ? "item-row-mobile" : "item-row"}>
                <tbody>
                    <tr>
                        {/* Main content cell */}
                        <td style={{ width: "auto" }}>
                            <TrackRow
                                track={track}
                                forInfo={forInfo}
                                onClick={onClick}
                                onArtistClick={onArtistClick}
                                onDoubleClick={onDoubleClick}
                                onMouseDown={onMouseDown}
                                index={index}
                                onDrop={onDrop}
                                selected={selected}
                                onContextMenu={onContextMenu}
                                forPlaylist
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
                        </td>
                    </tr>
                </tbody>
            </table>

        </li>
    );
}

export default SortableItem;


