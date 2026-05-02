//Icons
import { HiPlay, HiPause, HiPlayPause } from "react-icons/hi2";

interface ControlsProps {
    changeTrack: (direction: "next" | "prev") => void;
    togglePlay: () => void;
    isPlaying: boolean;
}

export default function Controls({ changeTrack, togglePlay, isPlaying }: ControlsProps) {
    return(
        <div className="flex gap-3 items-center">
            <button
                type="button"
                title="prev"
                onClick={() => changeTrack("prev")}
                className="text-[#4D5562] duration-300 cursor-pointer
                            hover:text-[#C93B76] hover:drop-shadow-[0_0_5px_#C93B76]"
            >
                <HiPlayPause size={30} className="rotate-180" />
            </button>
            <button
                type="button"
                title="play"
                onClick={togglePlay}
                className="bg-[#C93B76] text-[#E5E7EB] p-4 rounded-full cursor-pointer duration-300 shadow-[#C93B76]
                            hover:drop-shadow-[0_0_5px_#C93B76] active:rotate-180"
            >
                {isPlaying ? <HiPause size={20} /> : <HiPlay size={20} />}
            </button>
            <button
            type="button"
            title="prev"
            onClick={() => changeTrack("next")}
            className="text-[#4D5562] duration-300 cursor-pointer
                        hover:text-[#C93B76] hover:drop-shadow-[0_0_5px_#C93B76]"
            >
                <HiPlayPause size={30} />
            </button>
        </div>
    );
}