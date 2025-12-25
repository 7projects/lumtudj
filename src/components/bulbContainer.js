import React from 'react';

export default function BulbContainer({ playlists = [], onClick, track }) {
    const handleClick = (e) => {
        if (typeof onClick === 'function') onClick(track, e);
    };

    return (
        <div className="bulb-container" onClick={handleClick}>
            {playlists && playlists.length > 0 ? (
                playlists.map((p) => <div key={p.id} className="littleBulbOn" />)
            ) : (
                <div className="bulb-container-text">add to...</div>
            )}
        </div>
    );
}