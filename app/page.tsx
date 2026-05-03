'use client';
//Components
import { useState, useRef, useEffect } from "react";
import { parseBlob, IAudioMetadata } from "music-metadata-browser";
import Player from "@/Components/Player";
import TracksList from "@/Components/TracksList";
//Types
import { tracksProps } from "@/types/types";

export default function Home() {
  const [currTrack, setCurrTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [metadata, setMetadata] = useState<IAudioMetadata | null>(null); //metadata
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [tracks, setTracks] = useState<tracksProps[]>([
    { url: '/music/lost-in-city-lights-145038.mp3' },
    { url: '/music/forest-lullaby-110624.mp3' },
  ]);

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
  }, [currTrack, tracks[currTrack]]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans h-display
                    bg-gradient-to-r from-[#4c3346] via-[#422e53] to-[#28355c]
                    bg-[length:200%_200%]
                    animate-[gradient-move_8s_ease_infinite]">
      <main className="group grid grid-cols-3 w-full max-w-[120rem] h-screen">

        <div>

        </div>
        <Player 
          coverImage={coverImage} 
          metadata={metadata}
          audioRef={audioRef} 
          currTrack={currTrack} 
          tracks={tracks} 
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying} 
          setCurrTrack={setCurrTrack}
        />
        
        <TracksList 
          tracks={tracks} 
          currTrack={currTrack} 
          setTracks={setTracks} 
          setCurrTrack={setCurrTrack}
        />
        {/*<div className="">
          <div className="w-full flex flex-col gap-2 overflowy-scroll">
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
            {tracks.map((track, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer
                  ${index === currTrack ? "bg-white/20" : "bg-white/5"}`}
                onClick={() => setCurrTrack(index)}
              >
                
                <div className="relative w-12 h-12">
                  <Image
                    src={track.cover || "/images/default-cover.jpg"}
                    alt="cover"
                    fill
                    className="object-cover rounded"
                  />
                </div>

                
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{track.title || "Unknown Title"}</p>
                  <p className="text-xs opacity-70">{track.artist || "Unknown Artist"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>*/}
      </main>
    </div>
  );
}
