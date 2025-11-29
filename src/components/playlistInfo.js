import React, { useState } from "react";
import Dialog from "../components/dialog";

// PlaylistInfo component
// - Shows playlist details
// - Has a button to edit (opens Dialog)
// - Dialog contains name + description inputs

export default function PlaylistInfo({ playlist, title, onSave, onClose }) {
    // const [open, setOpen] = useState(true);
    const [name, setName] = useState(playlist?.name || "");
    const [description, setDescription] = useState(playlist?.description || "");
    const [isPublic, setIsPublic] = useState(playlist?.public || false);
    const [isCollaborative, setIsCollaborative] = useState(playlist?.collaborative || false);
    const [copied, setCopied] = useState(false);


    function handleSave() {
        onSave?.(playlist, name, description, isPublic, isCollaborative);
        onClose?.();
    }

    async function copyShareLink() {
        if (!playlist || !playlist.id) {
            // Nothing to copy
            setCopied(false);
            return;
        }

        const link = `https://open.spotify.com/playlist/${playlist.id}`;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link);
            } 

            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (e) {
            
        }
    }

    return (
        <div className="playlist-info">
            <Dialog
                open={true}
                onClose={() => onClose?.()}
                title={title || "Edit Playlist"}
                blockBackground={true}
                buttons={[
                    {
                        label: "Save",
                        primary: true,
                        onClick: handleSave,
                    },
                    {
                        label: "Cancel",
                        onClick: () => onClose?.(),
                    },
                ]}
            >
                <div className="playlist-fields">
                    <label>
                        Name
                    </label>
                    <br></br>
                    <input
                        style={{ width: "100%" }}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <br></br><br></br>
                    <label>
                        Description
                    </label>
                    <br></br>
                    <textarea
                        style={{ width: "100%", height: "60px" }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <br></br><br></br>
                    <label>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        {' '}Public
                    </label>
                    <br></br><br></br>
                    <label>
                        <input
                            type="checkbox"
                            checked={isCollaborative}
                            onChange={(e) => setIsCollaborative(e.target.checked)}
                        />
                        {' '}Collaborative
                    </label>

                    <br></br><br></br>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="dialog-btn" onClick={copyShareLink} style={{ padding: '6px 10px' }}>
                            Copy share link
                        </button>
                        {copied ? <span style={{ color: '#4caf50' }}>Copied!</span> : null}
                    </div>



                </div>
            </Dialog>
        </div>
    );
}
