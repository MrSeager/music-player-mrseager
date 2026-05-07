//Components
import { parseBlob } from "music-metadata-browser";
import Image from "next/image";
//Icons
import { HiDocumentAdd } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { FaSave } from "react-icons/fa";
//Types
import { tracksProps, TracksListProps } from "@/types/types";
import type { DragEndEvent } from "@dnd-kit/core";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";

import SortableTrack from "./SortableTrack"; // we create this next


export default function TracksList({ 
                                    allTracks, currTrack, playlistName, playlistTracks, refreshPlaylists,
                                    setAllTracks, setCurrTrack, setPlaylistName, setPlaylistTracks
                                }: TracksListProps) {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files);

        const newTracks: tracksProps[] = [];

        for (const file of fileArray) {
            // Parse metadata directly from the File
            const data = await parseBlob(file);

            let newCover: string | null = null;

            if (data.common.picture?.length) {
                const pic = data.common.picture[0];
                const base64 = Buffer.from(pic.data).toString("base64");
                newCover = `data:${pic.format};base64,${base64}`;
            }

            newTracks.push({
                url: URL.createObjectURL(file),
                file,
                title: data.common.title || file.name,
                artist: data.common.artist || "Unknown Artist",
                cover: newCover,
            });
        }

        //setAllTracks(prev => [...prev, ...newTracks]);
        setAllTracks(prev => {
            const updated = [...prev, ...newTracks];

            // If default playlist is active → add new tracks to playlistTracks too
            if (playlistName === "Default") {
                setPlaylistTracks(updated);
            }

            return updated;
        });
    };

    const handleRemoveTrack = (index: number) => {
        setPlaylistTracks(prev => {
            const updated = prev.filter((_, i) => i !== index);

            if (updated.length === 0) {
                setCurrTrack(0);
                return [];
            }

            // CASE 1: Deleted the currently playing track
            if (currTrack === index) {
                if (index >= updated.length) {
                    setCurrTrack(0); // wrap to start
                } else {
                    setCurrTrack(index); // play next track
                }
            }

            // CASE 2: Deleted a track before the current one
            else if (currTrack > index) {
                setCurrTrack(currTrack - 1);
            }

            return updated;
        });
    };

    const handleSavePlaylist = () => {
        if (!playlistName.trim()) {
            alert("Enter playlist name");
            return;
        }

        if (playlistName === "Default") {
            alert("You cannot save a playlist named 'Default'");
            return;
        }

        const saved = JSON.parse(localStorage.getItem("playlists") || "{}");

        // If playlist exists, ask user if they want to overwrite
        if (saved[playlistName]) {
            const confirmOverwrite = confirm(
                `Playlist "${playlistName}" already exists. Overwrite it?`
            );

            if (!confirmOverwrite) return;
        }

        const names = playlistTracks.map(t => t.file?.name || t.title);

        saved[playlistName] = names;

        localStorage.setItem("playlists", JSON.stringify(saved));
        refreshPlaylists();
        alert("Playlist saved");
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id as number;

        if (activeId !== overId) {
            setPlaylistTracks(prev => {
                const newOrder = arrayMove(prev, activeId, overId);

                // Fix current track index
                if (currTrack === activeId) {
                    setCurrTrack(overId);
                } else if (currTrack > activeId && currTrack <= overId) {
                    setCurrTrack(currTrack - 1);
                } else if (currTrack < activeId && currTrack >= overId) {
                    setCurrTrack(currTrack + 1);
                }

                return newOrder;
            });
        }
    };

    return(
        <div className="p-2 overflow-hidden">
            <div className="shadow-xl bg-[#212936ab] rounded-[15px] p-2 opacity-0 ease-out translate-x-[200px] duration-500 w-full flex flex-col items-end gap-2 h-full flex-1
                            group-hover:opacity-100 group-hover:translate-x-0">
                <div className="w-full flex justify-between px-3">
                    <input 
                        type="text"
                        title="playlist name"
                        placeholder="Playlist name"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                    />
                    <input
                        id="filePicker"
                        type="file"
                        title="filePicker"
                        accept="audio/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            title="save playlist"
                            onClick={handleSavePlaylist}
                            className="cursor-pointer p-1 aspect-1/1 text-[25px] rounded bg-[#C93B76] text-[#E5E7EB] duration-300
                                        hover:drop-shadow-[0_0_5px_#C93B76] group/button"
                        >
                            <FaSave size={25} className="group-active/button:rotate-180 duration-200" />
                        </button>
                        <button
                            type="button"
                            title="add"
                            onClick={() => document.getElementById("filePicker")?.click()}
                            className="cursor-pointer p-1 aspect-1/1 text-[25px] rounded bg-[#C93B76] text-[#E5E7EB] duration-300
                                        hover:drop-shadow-[0_0_5px_#C93B76] group/button"
                        >
                            <HiDocumentAdd size={25} className="group-active/button:rotate-180 duration-200" />
                        </button>
                    </div>
                </div>
                <div className="w-full rounded-lg p-2 flex-1 overflow-y-auto flex flex-col gap-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={playlistTracks.map((_, i) => i)}
                            strategy={verticalListSortingStrategy}
                        >
                            {playlistTracks.map((track, index) => (
                                <SortableTrack
                                    key={index}
                                    id={index}
                                    index={index}
                                    track={track}
                                    currTrack={currTrack}
                                    playlistName={playlistName}
                                    handleRemoveTrack={handleRemoveTrack}
                                    setCurrTrack={setCurrTrack}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}