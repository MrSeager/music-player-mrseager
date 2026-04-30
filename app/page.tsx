'use client';
//Components
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Controls from "@/Components/Controls";

interface tracksProps {
  cover: string;
  track: string;
}

export default function Home() {
  const [currTrack, setCurrTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [tracks] = useState<tracksProps[]>([
    { cover: '/images/cover-1.jpg', track: '/music/lost-in-city-lights-145038.mp3' },
    { cover: '/images/cover-2.jpg', track: '/music/forest-lullaby-110624.mp3' },
  ]);

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
  }, [currTrack]);

  //Time
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
  }

  //Progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans h-display
                    bg-gradient-to-r from-[#4c3346] via-[#422e53] to-[#28355c]
                    bg-[length:200%_200%]
                    animate-[gradient-move_8s_ease_infinite]">
      <main className="flex flex-1 w-full max-w-[120rem] flex-col items-center justify-center">
        <div className="aspect-4/6 bg-[#212936ab] p-5 rounded-[15px] flex flex-col items-center justify-between">
          
          {/* Cover */}
          <Image 
            src={tracks[currTrack].cover}
            alt="cover image"
            width={306}
            height={288}
            className="rounded-[15px]"
          />

          {/* Titles */}
          <div>
            <h1 className="text-center">Song</h1>
            <h2 className="text-center">Artist</h2>
          </div>

          {/* Progress bar */}
          <div className="grid grid-cols-2 w-full gap-2">
            <p>{formatTime(currentTime)}</p>
            <p className="text-end">{formatTime(duration)}</p>
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

          <Controls 
            changeTrack={changeTrack}
            togglePlay={togglePlay}
            isPlaying={isPlaying}
          />

          {/* Audio */}
          <audio ref={audioRef} src={tracks[currTrack].track} />
        </div>
      </main>
    </div>
  );
}
