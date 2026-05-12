"use client";
//Components
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { confirmToast } from "./ConfirmToast";
//Icons
import { HiDocumentAdd } from "react-icons/hi";
import { MdAddCircleOutline } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
//Types
import { tracksProps, TracksListProps } from "@/types/types";
import type { DragEndEvent } from "@dnd-kit/core";
//DndContext
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

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

import SortableTrack from "./SortableTrack";


export default function TracksList({ 
                                    allTracks, currTrack, playlistName, playlistTracks, openMenu,
                                    refreshPlaylists, handleFileUpload,
                                    setCurrTrack, setPlaylistName, setPlaylistTracks, setOpenMenu
                                }: TracksListProps) {
    const [openAddPanel, setOpenAddPanel] = useState<boolean>(false);

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
            toast.error("Enter playlist name", {
                style: {
                    background: "#212936",
                    color: "#E5E7EB",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textAlign: "center",
                },
            });
            return;
        }

        if (playlistName === "Default") {
            toast.error("You cannot save a playlist named 'Default'", {
                style: {
                    background: "#212936",
                    color: "#E5E7EB",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textAlign: "center",
                },
            });
            return;
        }

        const saved = JSON.parse(localStorage.getItem("playlists") || "{}");

        // If playlist exists → show confirm toast
        if (saved[playlistName]) {
            confirmToast(
            `Playlist "${playlistName}" already exists. Overwrite it?`,
                () => savePlaylist()
            );
            return;
        }

        savePlaylist();
    };

    const savePlaylist = () => {
        const saved = JSON.parse(localStorage.getItem("playlists") || "{}");
        const names = playlistTracks.map(t => t.file?.name || t.title);

        saved[playlistName] = names;

        localStorage.setItem("playlists", JSON.stringify(saved));
        refreshPlaylists();

        toast.success("Playlist saved", { 
            duration: 2000,
            style: {
                    background: "#212936",
                    color: "#E5E7EB",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textAlign: "center",
                }
        });
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

    //Adding tracks from allTracks
    const isDuplicate = (track: tracksProps) => {
        return playlistTracks.some(t => {
            if (t.file && track.file) return t.file.name === track.file.name;
            return t.title === track.title;
        });
    };

    const availableTracks = allTracks.filter(t => !isDuplicate(t));

    const handleAddFromDefault = (track: tracksProps) => {
        if (isDuplicate(track)) return; // safety

        setPlaylistTracks(prev => [...prev, track]);
    };


    return(
        <div className={`absolute right-0 top-0 lg:w-full lg:static lg:p-2 overflow-hidden duration-300 h-full z-100 bg-[#212936ab] lg:bg-transparent
                        ${openMenu === "tracks" ? "w-full p-2" : "w-0 p-0"}`}>
            <div className="shadow-xl bg-[#212936ab] rounded-[15px] p-3 lg:opacity-0 ease-out lg:translate-x-[200px] duration-500 w-full flex flex-col items-end gap-2 h-full flex-1
                            group-hover:lg:opacity-100 group-hover:lg:translate-x-0">
                <div className="flex justify-between text-[#C93B76] lg:hidden w-full">
                    <button
                        type="button"
                        title="track list"
                        className="cursor-pointer flex items-center gap-5 border border-3 px-3 font-semibold"
                        onClick={() => setOpenMenu("playlists")}
                    >
                        <FaArrowLeft /> Playlists
                    </button>
                    <button
                        type="button"
                        title="close"
                        className="cursor-pointer border border-3 px-3"
                        onClick={() => setOpenMenu("none")}
                    >
                        <IoCloseSharp size={25} />
                    </button>
                </div>
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
                <div className="w-full rounded-lg p-2 flex-1 overflow-x-hidden overflow-y-auto flex flex-col gap-2 custom-scrollbar">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
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
                    {playlistName !== "Default" ?
                        <button
                            type="button"
                            title="add"
                            onClick={() => setOpenAddPanel(true)}
                            className="cursor-pointer rounded bg-[#121826a6] text-[#C93B76] font-bold text-[35px] duration-300 
                                        hover:scale-103"
                        >
                            <MdAddCircleOutline size={35} className="mx-auto my-2" />
                        </button>
                        : ""
                    }
                </div>
            </div>
            <div 
                onClick={() => setOpenAddPanel(false)} 
                className={`ease-in-out fixed top-0 left-0 w-full overflow-hidden bg-[#2129368e] flex items-center justify-center duration-300
                            ${openAddPanel ? 'h-full' : 'h-0 opacity-0'}`}
            >
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    className={`top-15 grid grid-cols-2 w-full lg:max-w-[75%] max-h-screen overflow-y-auto  bg-[#4d5562d1] p-3 rounded-xl gap-3`}
                >
                    <button
                        type="button"
                        title="close"
                        className="cursor-pointer border border-3 px-3 flex items-center justify-center text-[#C93B76] lg:hidden"
                        onClick={() => setOpenAddPanel(false)}
                    >
                        <IoCloseSharp size={25} />
                    </button>
                    {availableTracks.length === 0 ? (
                        <p className="col-span-2 text-center text-[#E5E7EB] py-5 opacity-80">
                            No tracks available to add
                        </p>
                    ) : (availableTracks.map((track, index) => (
                        <button
                            type="button"
                            key={index}
                            onClick={() => handleAddFromDefault(track)}
                            className="cursor-pointer flex items-center duration-300 gap-3 justify-between rounded bg-[#212936] px-2 py-1
                                        hover:scale-102 hover:drop-shadow-[0_0_5px_#C93B76]"
                        >
                            <div className="relative w-12 h-12">
                                <Image
                                    src={track.cover || "/images/cover-2.jpg"}
                                    alt="cover"
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>
                            <div className="text-[#E5E7EB] text-start w-full flex flex-col items-start">
                                <p className="text-sm font-semibold">{track.title}</p>
                                <p className="text-xs opacity-70">{track.artist}</p>
                            </div>
                            <MdAddCircleOutline size={35} />
                        </button>
                    )))}
                </div>
            </div>
        </div>
    );
}