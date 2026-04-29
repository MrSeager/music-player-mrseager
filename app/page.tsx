'use client';
//Components
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
//Icons
import { HiPlay, HiPause, HiPlayPause } from "react-icons/hi2";

interface tracksProps {
  cover: string;
  track: string;
}

export default function Home() {
  const [currTrack, setCurrTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [tracks] = useState<tracksProps[]>([
    { cover: '/images/cover-1.jpg', track: '/music/lost-in-city-lights-145038.mp3' },
    { cover: '/images/cover-2.jpg', track: '/music/forest-lullaby-110624.mp3' },
  ]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.load();
    audioRef.current.play();
    setIsPlaying(true);
  }, [currTrack]);

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
          <div className="grid grid-cols-2 w-full">
            <p>0:00</p>
            <p className="text-end">3:00</p>
            <div className="border col-span-2">

            </div>
          </div>

          {/* Controls */}
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
                className="bg-[#C93B76] p-4 rounded-full cursor-pointer duration-300 shadow-[#C93B76]
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

          {/* Audio */}
          <audio ref={audioRef} src={tracks[currTrack].track} />
        </div>
      </main>
    </div>
  );
}
