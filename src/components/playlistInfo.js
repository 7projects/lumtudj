import React, { useState } from "react";
import Dialog from "../components/dialog";

// PlaylistInfo component
// - Shows playlist details
// - Has a button to edit (opens Dialog)
// - Dialog contains name + description inputs

export default function PlaylistInfo({ playlist, onSave }) {
    const [open, setOpen] = useState(true);
    const [name, setName] = useState(playlist?.name || "");
    const [description, setDescription] = useState(playlist?.description || "");

    function handleSave() {
        onSave?.({ name, description });
        setOpen(false);
    }

    return (
        <div className="playlist-info">
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Edit Playlist"
                blockBackground={true}
                buttons={[
                    {
                        label: "Cancel",
                        onClick: () => setOpen(false),
                    },
                    {
                        label: "Save",
                        primary: true,
                        onClick: handleSave,
                    },
                ]}
            >
                <div className="playlist-fields">
                    <label>
                        Name
                    </label>
                    <br></br>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <br></br><br></br><br></br>
                    <label>
                        Description
                    </label>
                    <br></br>
                    <textarea
                        style={{ width: "100%" }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                </div>
            </Dialog>
        </div>
    );
}
