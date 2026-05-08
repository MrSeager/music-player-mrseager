import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { MdDeleteForever } from "react-icons/md";
//Types
import { SortableTrackProps } from "@/types/types"; 

export default function SortableTrack({
    id,
    index,
    track,
    currTrack,
    playlistName,
    handleRemoveTrack,
    setCurrTrack
}: SortableTrackProps) {
    const isDefault = playlistName === "Default";

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id as number });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!isDefault ? attributes : {})}
            {...(!isDefault ? listeners : {})}
            className={isDefault ? "" : "cursor-grab active:cursor-grabbing"}
        >
            <div className={`flex rounded border duration-300 hover:scale-103
                            ${index === currTrack
                                ? "bg-[#4D5562] drop-shadow-[0_0_5px_#C93B76] border-[#C93B76]"
                                : "bg-[#121826a6] border-transparent"
                            }`}>
                <button
                    type="button"
                    className="cursor-pointer w-full flex items-center gap-3 p-2"
                    onClick={() => setCurrTrack(index)}
                >
                    <h3 className="font-semibold">{index + 1}.</h3>

                    <div className="relative w-12 h-12">
                        <Image
                            src={track.cover || "/images/cover-2.jpg"}
                            alt="cover"
                            fill
                            className="object-cover rounded"
                        />
                    </div>

                    <div className="flex flex-col text-start text-[#E5E7EB]">
                        <p className="text-sm font-semibold">{track.title}</p>
                        <p className="text-xs opacity-70">{track.artist}</p>
                    </div>
                </button>

                {playlistName !== "Default" && (
                    <button
                        type="button"
                        title="remove track"
                        onClick={() => handleRemoveTrack(index)}
                        className="cursor-pointer px-4 aspect-1/1 text-[25px] rounded text-[#C93B76] duration-300 hover:drop-shadow-[0_0_5px_#C93B76]"
                    >
                        <MdDeleteForever size={25} className="mx-auto" />
                    </button>
                )}
            </div>
        </div>
    );
}
