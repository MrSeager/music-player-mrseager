"use client";
//Components
import { useState, useEffect } from "react";
//Types
import { PlaylistListProps } from "@/types/types";
//Icons
import { MdDeleteForever } from "react-icons/md";

export default function PlaylistList({ allTracks, playlistName, playlistTracks, savedPlaylists, 
                                        refreshPlaylists, loadPlaylist,
                                        setPlaylistTracks, setCurrTrack, setPlaylistName, setSavedPlaylists }: PlaylistListProps) {


    const deletePlaylist = (name: string) => {
        if (name === "Default") {
            alert("You cannot delete the Default playlist");
            return;
        }

        const saved = JSON.parse(localStorage.getItem("playlists") || "{}");

        delete saved[name]; // remove playlist

        localStorage.setItem("playlists", JSON.stringify(saved));
        refreshPlaylists();

        // Update UI list
        setSavedPlaylists(Object.keys(saved));

        // If the deleted playlist is currently active → switch to Default
        if (playlistName === name) {
            setPlaylistName("Default");
            setPlaylistTracks(allTracks);
            setCurrTrack(0);
        }
    };

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("playlists") || "{}");
        setSavedPlaylists(Object.keys(saved));
    }, [setSavedPlaylists]);
    
    return(
        <div className="p-2 overflow-hidden">
            <div className="shadow-xl bg-[#212936ab] rounded-[15px] p-3 opacity-0 ease-out translate-x-[-200px] duration-500 w-full flex flex-col gap-2 h-full flex-1
                            group-hover:lg:opacity-100 group-hover:lg:translate-x-0">
                <p>You need to load your tracks to make your playlist work</p>
                <button
                    type="button"
                    onClick={() => loadPlaylist("Default")}
                    className={`cursor-pointer flex rounded duration-300 p-2 hover:scale-103
                                ${playlistName === "Default" ? "bg-[#4D5562] drop-shadow-[0_0_5px_#C93B76] border-[#C93B76]" : "bg-[#121826a6] border-transparent"}`}
                >
                    All loaded tracks
                </button>

                {/* Saved playlists */}
                {savedPlaylists.length === 0 && (
                    <p className="text-sm text-[#E5E7EB]/60">
                        No playlists saved yet
                    </p>
                )}

                {savedPlaylists.map(name => (
                    <div
                        key={name}
                        className={`border flex rounded duration-300 hover:scale-103
                                    ${name === playlistName ? "bg-[#4D5562] drop-shadow-[0_0_5px_#C93B76] border-[#C93B76]" : "bg-[#121826a6] border-transparent"}`}
                    >
                        <button
                            type="button"
                            onClick={() => loadPlaylist(name)}
                            className="cursor-pointer w-full flex items-center gap-3 p-2"
                        >
                            {name}
                        </button>
                        <button
                            type="button"
                            title="remove track"
                            onClick={() => deletePlaylist(name)}
                            className="cursor-pointer aspect-1/1 text-[25px] rounded text-[#C93B76] duration-300
                                        hover:drop-shadow-[0_0_5px_#C93B76] group/button"
                        >
                            <MdDeleteForever size={25} className="group-active/button:rotate-180 duration-200 mx-auto" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}