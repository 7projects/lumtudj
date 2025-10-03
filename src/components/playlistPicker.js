// Snackbar.js
import React, { useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const PlaylistPicker = ({ track, playlists, onClose, onLongPress, onSwipedLeft, onSwipedRight, onClick }) => {
    useEffect(() => {

    }, []);

    const close = () => {
        if (onClose)
            onClose();
    }

    const swipeHandler = useSwipeable({
        onSwipedLeft: () => { if (onSwipedLeft) onSwipedLeft() },
        onSwipedRight: () => { if (onSwipedRight) onSwipedRight() },
        // onSwipedUp: () => alert('Swiped up!'),
        // onSwipedDown: () => alert('Swiped down!'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    const onClickHandler = (e, pl, bulbOn) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClick) { onClick(pl, bulbOn) }
    }

    return (
        <div className='playlistPickerContainer' {...swipeHandler} onClick={onClose}>
            <div className={"playlistPicker"}>
                {playlists && playlists.map((pl, index) => {
                    const bulbOn = pl.tracks.some(x => x.id == track.id);
                    return <div key={"plp" + index} onClick={(e) => onClickHandler(e, pl, bulbOn)} className={bulbOn ? 'playlistPickerRowBulbOn' : 'playlistPickerRow'}>{pl.name}</div>
                })}
            </div>
        </div>

    );
};

export default PlaylistPicker;
