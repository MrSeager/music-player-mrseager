'use client';
//Components
import { useState, useEffect } from "react";
import Image from "next/image";
import Controls from "@/Components/Controls";
import ProgressBar from "@/Components/ProgressBar";
import Titles from "@/Components/Titles";
//Types
import { PlayerProps } from "@/types/types";


export default function Player({ 
                                    coverImage, metadata, audioRef, currTrack, tracks, isPlaying,
                                    setIsPlaying, setCurrTrack 
                                }: PlayerProps) {
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
        audio.play();
            setIsPlaying(true);
        } else {
        audio.pause();
            setIsPlaying(false);
        }
    };

    const changeTrack = (direction: "next" | "prev") => {
        if (direction === "next") {
            setCurrTrack((currTrack + 1) % tracks.length);
        } else {
            setCurrTrack((currTrack - 1 + tracks.length) % tracks.length);
        }
    };

    //Play next after ending
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const handleEnded = () => {
            // Move to next track
            setCurrTrack((prev) => (prev + 1) % tracks.length);
        };

        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
        };
    }, [tracks.length]);

    //Play
    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.load();

        if (isPlaying) {
            audioRef.current.play();
        }
    }, [tracks[currTrack]?.url, isPlaying]);

    return (
        <div className="flex items-center justify-center">
            <div className="aspect-4/6 w-[22rem] bg-[#212936ab] p-5 rounded-[15px] flex flex-col items-center justify-between">
                
                {/* Cover */}
                <div className="relative overflow-hidden rounded-[15px] w-[306px] h-[288px] flex items-center justify-center">
                    <Image 
                        src={coverImage || '/images/cover-1.jpg'}
                        alt="cover image"
                        fill
                        className="rounded-[15px] object-cover"
                    />
                </div>
                
                <Titles 
                    metadata={metadata}
                />
                <ProgressBar 
                    audioRef={audioRef}
                    currentTime={currentTime}
                    duration={duration}
                    setCurrentTime={setCurrentTime}
                    setDuration={setDuration}
                />
                <Controls 
                    changeTrack={changeTrack}
                    togglePlay={togglePlay}
                    isPlaying={isPlaying}
                />

                {/* Audio */}
                <audio ref={audioRef} src={tracks[currTrack].url} />
            </div>
        </div>
    );
}