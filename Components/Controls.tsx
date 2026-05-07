'use client';
//Components
import { useState } from "react";
//Icons
import { HiPlay, HiPause, HiPlayPause } from "react-icons/hi2";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";

interface ControlsProps {
    changeTrack: (direction: "next" | "prev") => void;
    togglePlay: () => void;
    isPlaying: boolean;
    volume: number;
    setVolume: (volume: number) => void;
}

export default function Controls({ changeTrack, togglePlay, isPlaying, volume, setVolume }: ControlsProps) {
    const [showVolume, setShowVolume] = useState<boolean>(false);
    
    return(
        <div className="grid grid-cols-5 w-full relative">
            <div className="flex gap-3 items-center justify-center col-span-3 col-start-2">
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
            <button
                type="button"
                title="volume"
                onClick={() => setShowVolume(!showVolume)}
                className="justify-self-end text-[#4D5562] duration-300 cursor-pointer
                            hover:text-[#C93B76] hover:drop-shadow-[0_0_5px_#C93B76]"
            >
                {volume === 0 ? <HiVolumeOff size={30} /> : <HiVolumeUp size={30} />}
            </button>
            <div className={`absolute bg-[#212936ab] duration-300 right-0 bottom-10 bg-transparent overflow-hidden
                            ${!showVolume ? "w-0 opacity-0" : "w-[6rem] opacity-100"}`}>
                <input
                    type="range"
                    title="volume"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24 accent-[#C93B76] h-1.5"
                />
            </div>
        </div>
    );
}