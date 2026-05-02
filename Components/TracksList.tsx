//Components
import { parseBlob } from "music-metadata-browser";
import Image from "next/image";
//Types
import { tracksProps, TracksListProps } from "@/types/types";

export default function TracksList({ tracks, currTrack, setTracks, setCurrTrack }: TracksListProps) {
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

    return(
        <div className="p-2 overflow-hidden">
            <div className="bg-[#212936ab] rounded-[15px] p-2 opacity-0 ease-out translate-x-[200px] duration-500 w-full flex flex-col items-end gap-2 h-full flex-1
                            group-hover:opacity-100 group-hover:translate-x-0">
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
                    onClick={() => document.getElementById("filePicker")?.click()}
                    className="cursor-pointer aspect-1/1 text-[25px] rounded bg-[#C93B76] text-[#E5E7EB] duration-300
                                hover:drop-shadow-[0_0_5px_#C93B76]"
                >
                    +
                </button>
                <div className="w-full rounded-lg p-2 flex-1 overflow-y-auto flex flex-col gap-2">
                    {tracks.map((track, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer duration-300
                                        hover:scale-103
                                        ${index === currTrack ? "bg-white/20" : "bg-white/5"}`}
                            onClick={() => setCurrTrack(index)}
                        >
                            {/* Small cover */}
                            <div className="relative w-12 h-12">
                                <Image
                                src={track.cover || "/images/default-cover.jpg"}
                                alt="cover"
                                fill
                                className="object-cover rounded"
                                />
                            </div>

                            {/* Titles */}
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold">{track.title || "Unknown Title"}</p>
                                <p className="text-xs opacity-70">{track.artist || "Unknown Artist"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}