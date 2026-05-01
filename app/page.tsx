'use client';
//Components
import { useState, useRef, useEffect } from "react";
import { parseBlob, IAudioMetadata } from "music-metadata-browser";
import Image from "next/image";
import Controls from "@/Components/Controls";
import ProgressBar from "@/Components/ProgressBar";
import Titles from "@/Components/Titles";

interface tracksProps {
  url: string;
  file?: File; // optional, only for user-added tracks
  title?: string | null;
  artist?: string | null;
  cover?: string | null;
}

export default function Home() {
  const [currTrack, setCurrTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [metadata, setMetadata] = useState<IAudioMetadata | null>(null); //metadata
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [tracks, setTracks] = useState<tracksProps[]>([
    { url: '/music/lost-in-city-lights-145038.mp3' },
    { url: '/music/forest-lullaby-110624.mp3' },
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

  //Loading metadata
  useEffect(() => {
    async function loadDefaultMetadata() {
      const updated = [...tracks];

      for (let i = 0; i < updated.length; i++) {
        const track = updated[i];

        // Skip if already has metadata (user-added or already parsed)
        if (track.title || track.file) continue;

        const res = await fetch(track.url);
        const blob = await res.blob();
        const data = await parseBlob(blob);

        let cover: string | null = null;

        if (data.common.picture?.length) {
          const pic = data.common.picture[0];
          const base64 = Buffer.from(pic.data).toString("base64");
          cover = `data:${pic.format};base64,${base64}`;
        }

        updated[i] = {
          ...updated[i],
          title: data.common.title || "Unknown Title",
          artist: data.common.artist || "Unknown Artist",
          cover,
        };
      }

      setTracks(updated);
    }

    loadDefaultMetadata();
  }, []); // runs once on mount

  useEffect(() => {
    async function loadMetadata() {
      const track = tracks[currTrack];
      if (!track) return;

      let blob: Blob;

      if (track.file) {
        // User uploaded file → use the File directly
        blob = track.file;
      } else {
        // Default track → fetch from server
        const res = await fetch(track.url);
        blob = await res.blob();
      }

      const data = await parseBlob(blob);
      setMetadata(data);

      // Extract cover
      let newCover: string | null = null;

      if (data.common.picture?.length) {
        const pic = data.common.picture[0];
        const base64 = Buffer.from(pic.data).toString("base64");
        newCover = `data:${pic.format};base64,${base64}`;
      }

      setCoverImage(newCover);

      // Update track metadata
      setTracks(prev => {
        const updated = [...prev];
        updated[currTrack] = {
          ...updated[currTrack],
          title: data.common.title || "Unknown Title",
          artist: data.common.artist || "Unknown Artist",
          cover: newCover,
        };
        return updated;
      });
    }

    loadMetadata();
  }, [currTrack]);

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

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans h-display
                    bg-gradient-to-r from-[#4c3346] via-[#422e53] to-[#28355c]
                    bg-[length:200%_200%]
                    animate-[gradient-move_8s_ease_infinite]">
      <main className="flex flex-1 flex-col items-center justify-center w-full max-w-[120rem]">
        {/*test area start*/}
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
          className="mb-4 px-4 py-2 rounded bg-white text-black"
        >
          Add Tracks
        </button>
        {/*test area end*/}

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

        <div className="w-full flex flex-col gap-2">
          {tracks.map((track, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer
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

      </main>
    </div>
  );
}
