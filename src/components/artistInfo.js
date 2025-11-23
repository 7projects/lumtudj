import React, { useState } from "react";
import Dialog from "../components/dialog";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import TrackRow from "./trackRow";
import useAppStore from "../AppStore";
import { text } from "@fortawesome/fontawesome-svg-core";
// PlaylistInfo component
// - Shows playlist details
// - Has a button to edit (opens Dialog)
// - Dialog contains name + description inputs

export default function ArtistInfo({ onClose }) {
    const { menuAnchor, setMenuAnchor, selectedArtist, setSelectedArtist, loadingArtistInfo, setLoadingArtistInfo, locked, setLocked, selectedLibraryIndex, setSelectedLibraryIndex, dragTrack, setDragTrack, dragSourceIndex, setDragSourceIndex, dragSource, setDragSource, library, filteredLibrary, setFilteredLibrary, selectedLibraryItem, setSelectedLibraryItem, setLibrary, loadingLibrary, setLoadingLibrary, menuPosition, selectedPlaylistTrackIndex, setSelectedPlaylistTrackIndex, setMenuPosition, selectedTrack, setSelectedTrack, selectedTrackIndex, setSelectedTrackIndex, playlistIndex, setPlaylistIndex } = useAppStore();

    const isLocked = () => {
        let l = localStorage.getItem("locked") == "true";
        const btn = document.getElementById("lockButton");

        if (l) {
            // Add class only if not already blinking
            if (!btn.classList.contains("blinking")) {
                btn.classList.add("blinking");
                // Remove blinking class automatically when animation ends
                btn.addEventListener("animationend", () => {
                    btn.classList.remove("blinking");
                });
            }
        }


        setLocked(l);
        return l;
    }

    return (

        <Dialog
            open={true}
            onClose={() => onClose?.()}
            title="Artist Info"
            style={{ textAlign: "center" }}
            blockBackground={false}
            buttons={[]}
        >
            {loadingArtistInfo ? <div className='loader' style={{ position: "absolute" }}></div> :
                <div className="artist-info" style={{}}>
                    <img className='artist-info-img' src={selectedArtist && selectedArtist.images && selectedArtist.images.length > 0 && selectedArtist.images[0].url} />
                    <div className='artist-info-name'>{selectedArtist && selectedArtist.name}</div>
                    <Tabs style={{ width: "100%" }}>
                        <TabList className="custom-tablist">
                            <Tab className="custom-tab">
                                Top Tracks
                            </Tab>
                            <Tab className="custom-tab">
                                Albums
                            </Tab>
                        </TabList>

                        <TabPanel>
                            <div style={{ overflowY: "auto", maxHeight: "40vh" }}>
                                {selectedArtist && selectedArtist.tracks.map((tr, index) => {
                                    // return <TrackRow id={"atr" + tr.id} index={index} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setDragSourceIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { if (isLocked()) { return; } setPlayIndex(index); setPlayPosition("main"); play(tr) }} />
                                    return <TrackRow forInfo id={"atr" + tr.id} index={index} track={tr} onMouseDown={() => { setDragSource("tracks"); setDragTrack(tr); setDragSourceIndex(index); setSelectedTrack(tr); }} onDoubleClick={() => { if (isLocked()) { return; } }} />
                                })}
                            </div>

                        </TabPanel>
                        <TabPanel>
                            <div style={{ overflowY: "auto", maxHeight: "40vh" }}>
                                {selectedArtist && selectedArtist.albums.map((a, index) => {
                                    return <div className="artist-info-album-row" key={"a" + a.id} onClick={() => { }}>
                                        <img

                                            className="artist-info-album-img"
                                            src={a.images && a.images[2] && a.images[2].url}
                                            alt={a.name}
                                        />
                                        <div className="artist-info-album-details">
                                            <div className="artist-info-album-name">{a.name}</div>
                                            <div className="artist-info-album-tracks">{a.total_tracks} tracks</div>
                                            <div className="artist-info-album-year">{a.release_date}</div> {/* assuming a.year exists */}
                                        </div>
                                    </div>

                                })}</div>
                        </TabPanel>
                    </Tabs>
                </div>}
        </Dialog >



    );
}
