'use client';
//Components
import { useEffect, RefObject } from "react";

interface ProgressBarProps {
    audioRef: RefObject<HTMLAudioElement | null>;
    currentTime: number;
    duration: number;
    setCurrentTime: (currentTime: number) => void;
    setDuration: (duration: number) => void;
}

export default function ProgressBar({ audioRef, currentTime, duration, setCurrentTime, setDuration }: ProgressBarProps) {
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);

        return() => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
        }
    }, []);
    
    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = value;
        }
    }

    return(
        <div className="grid grid-cols-2 w-full">
            <p className="text-[13px] text-[#4D5562]">{formatTime(currentTime)}</p>
            <p className="text-[13px] text-[#4D5562] text-end">{formatTime(duration)}</p>
            <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                title="progress bar"
                style={
                        {
                        "--progress": `${(currentTime / duration) * 100}%`,
                        } as React.CSSProperties & { "--progress": string }
                    }
                className="progress-bar bg-[#E5E7EB] col-span-2 w-full h-1 cursor-pointer rounded-full"
            />
        </div>
    );
}