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
    const [transform, setTransform] = useState("scale(1)");

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

    //tilting player
    function handleMove(e: React.MouseEvent<HTMLDivElement>) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const midX = rect.width / 2;
        const midY = rect.height / 2;

        const rotateX = ((y - midY) / midY) * 10;
        const rotateY = ((x - midX) / midX) * -10;

        setTransform(`scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

        // glare position
        el.style.setProperty("--glare-x", `${x}px`);
        el.style.setProperty("--glare-y", `${y}px`);

        // stronger glare intensity
        const intensity = Math.abs(rotateX) + Math.abs(rotateY);
        const opacity = Math.min(intensity / 20, 0.75); // stronger cap
        el.style.setProperty("--glare-opacity", opacity.toString());

        // SHADOW: move based on tilt
        const shadowX = rotateY * -2;   // left/right
        const shadowY = rotateX * 2 + 10; // up/down + base shadow
        const shadowOpacity = Math.min(intensity / 25, 0.45);

        el.style.setProperty("--shadow-x", `${shadowX}px`);
        el.style.setProperty("--shadow-y", `${shadowY}px`);
        el.style.setProperty("--shadow-opacity", shadowOpacity.toString());
    }

    function handleLeave(e: React.MouseEvent<HTMLDivElement>) {
        const el = e.currentTarget;
        setTransform("scale(1) rotateX(0deg) rotateY(0deg)");
        el.style.setProperty("--glare-opacity", "0");
        el.style.setProperty("--shadow-x", "0px");
        el.style.setProperty("--shadow-y", "10px");
        el.style.setProperty("--shadow-opacity", "0.35");
    }

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
    }, [tracks[currTrack]?.url]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play();
        } else {
            audio.pause();
        }
    }, [isPlaying]);


    return (
        <div className="flex items-center justify-center perspective-1000">
            <div
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                style={{ transform }}
                className={`tilt-card duration-200 ease-out aspect-4/6 w-[22rem] bg-[#212936ab] p-5 rounded-[15px] flex flex-col items-center justify-between`}
            >
                
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