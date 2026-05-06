//Components
import { parseBlob } from "music-metadata-browser";
import Image from "next/image";
//Icons
import { HiDocumentAdd } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { FaSave } from "react-icons/fa";
//Types
import { tracksProps, TracksListProps } from "@/types/types";

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
                    {playlistTracks.length === 0 ? (
                        <p className="text-center text-[#E5E7EB]/60 py-4">
                            No tracks in this playlist
                        </p>
                    ) : (playlistTracks.map((track, index) => (
                        <div
                            key={index}
                            className={`flex rounded border duration-300 hover:scale-103
                                        ${index === currTrack ? "bg-[#4D5562] drop-shadow-[0_0_5px_#C93B76] border-[#C93B76]" : "bg-[#121826a6] border-transparent"}`}
                        >
                            <button
                                type="button"
                                className={`cursor-pointer w-full flex items-center gap-3 p-2`}
                                onClick={() => setCurrTrack(index)}
                            >
                                <h3 className="font-semibold">{index + 1}.</h3>
                                {/* Small cover */}
                                <div className="relative w-12 h-12">
                                    <Image
                                    src={track.cover || "/images/cover-2.jpg"}
                                    alt="cover"
                                    fill
                                    className="object-cover rounded"
                                    />
                                </div>

                                {/* Titles */}
                                <div className="flex flex-col text-start text-[#E5E7EB]">
                                    <p className="text-sm font-semibold">{track.title || "Unknown Title"}</p>
                                    <p className="text-xs opacity-70">{track.artist || "Unknown Artist"}</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                title="remove track"
                                onClick={() => handleRemoveTrack(index)}
                                className={`cursor-pointer aspect-1/1 text-[25px] rounded text-[#C93B76] duration-300
                                            hover:drop-shadow-[0_0_5px_#C93B76] group/button
                                            ${playlistName === "Default" ? "hidden" : ""}`}
                            >
                                <MdDeleteForever size={25} className="group-active/button:rotate-180 duration-200 mx-auto" />
                            </button>
                        </div>
                    )))}
                </div>
            </div>
        </div>
    );
}