//Components
import { parseBlob } from "music-metadata-browser";
import Image from "next/image";
//Icons
import { HiDocumentAdd } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
//Types
import { tracksProps, TracksListProps } from "@/types/types";

export default function TracksList({ 
                                    tracks, currTrack, 
                                    setTracks, setCurrTrack 
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

        setTracks(prev => [...prev, ...newTracks]);
    };

    const handleRemoveTrack = (index: number) => {
        setTracks(prev => {
            const updated = prev.filter((_, i) => i !== index);

            // If playlist becomes empty
            if (updated.length === 0) {
                setCurrTrack(0);
                return updated;
            }

            // CASE 1: Deleted the currently playing track
            if (currTrack === index) {
                // If it was the last track → go to 0
                if (index >= updated.length) {
                    setCurrTrack(0);
                } else {
                    // Otherwise → play the next track (same index now points to next)
                    setCurrTrack(index);
                }
            }

            // CASE 2: Deleted a track before the current one
            else if (currTrack > index) {
                setCurrTrack(currTrack - 1);
            }

            // CASE 3: Deleted a track after the current one → do nothing

            return updated;
        });
    };

    return(
        <div className="p-2 overflow-hidden">
            <div className="bg-[#212936ab] rounded-[15px] p-2 opacity-0 ease-out translate-x-[200px] duration-500 w-full flex flex-col items-end gap-2 h-full flex-1
                            group-hover:opacity-100 group-hover:translate-x-0">
                <div className="w-full flex justify-end px-3">
                    <input
                        id="filePicker"
                        type="file"
                        title="filePicker"
                        accept="audio/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                    />
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
                <div className="w-full rounded-lg p-2 flex-1 overflow-y-auto flex flex-col gap-2">
                    {tracks.map((track, index) => (
                        <div
                            key={index}
                            className={`flex rounded duration-300 hover:scale-103
                                        ${index === currTrack ? "bg-white/20" : "bg-white/5"}`}
                        >
                            <button
                                type="button"
                                className={`cursor-pointer w-full flex items-center gap-3 p-2 
                                            `}
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
                                className="cursor-pointer aspect-1/1 text-[25px] rounded text-[#C93B76] duration-300
                                            hover:drop-shadow-[0_0_5px_#C93B76] group/button"
                            >
                                <MdDeleteForever size={25} className="group-active/button:rotate-180 duration-200 mx-auto" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}