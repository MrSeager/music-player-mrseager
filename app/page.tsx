'use client';
//Components
import { useState, useRef, useEffect } from "react";
import { parseBlob, IAudioMetadata } from "music-metadata-browser";
import Player from "@/Components/Player";
import TracksList from "@/Components/TracksList";
import PlaylistList from "@/Components/PlaylistsList";
//Types
import { tracksProps } from "@/types/types";

export default function Home() {
  const [currTrack, setCurrTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [metadata, setMetadata] = useState<IAudioMetadata | null>(null); //metadata
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [allTracks, setAllTracks] = useState<tracksProps[]>([
    { url: '/music/lost-in-city-lights-145038.mp3' },
    { url: '/music/forest-lullaby-110624.mp3' },
  ]);
  const [playlistTracks, setPlaylistTracks] = useState<tracksProps[]>([]);
  const [playlistName, setPlaylistName] = useState<string>("Default");
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);

  const refreshPlaylists = () => {
      const saved = JSON.parse(localStorage.getItem("playlists") || "{}");
      setSavedPlaylists(Object.keys(saved));
  };

  const loadPlaylist = (name: string) => {
    if (name === "Default") {
      setPlaylistName("Default");
      setPlaylistTracks(allTracks);
      setCurrTrack(0);
      return;
    }

    const saved = JSON.parse(localStorage.getItem("playlists") || "{}");
    const fileNames = saved[name] ?? [];

    // Filter matching tracks
    const matched = allTracks.filter(t =>
      fileNames.includes(t.file?.name || t.title)
    );

    if (matched.length === 0) {
      alert("This playlist has no available tracks. Switching to Default.");

      setPlaylistName("Default");
      setPlaylistTracks(allTracks);
      setCurrTrack(0);
      setMetadata(null);
      setCoverImage(null);
      return;
    }

    // Detect missing tracks
    const missing = fileNames.filter((savedName: string) =>
        !allTracks.some(t => (t.file?.name || t.title) === savedName)
    );

    // Load matched tracks
    setPlaylistName(name);
    setPlaylistTracks(matched);
    setCurrTrack(0);

    // If some tracks were missing → notify user
    if (missing.length > 0) {
      alert(
          `Some tracks were not loaded because they were not uploaded:\n\n` +
          missing.join("\n")
      );
    }
  };

  //Loading metadata
  useEffect(() => {
    async function loadDefaultMetadata() {
      const updated = [...allTracks];

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

      setAllTracks(updated);
    }

    loadDefaultMetadata();
  }, []); // runs once on mount

  useEffect(() => {
    async function loadMetadata() {
      const activeTracks =
        playlistName === "Default" ? allTracks : playlistTracks;

      // no tracks at all for current context
      if (activeTracks.length === 0) {
        setMetadata(null);
        setCoverImage(null);
        return;
      }

      if (currTrack < 0 || currTrack >= activeTracks.length) {
        setMetadata(null);
        setCoverImage(null);
        return;
      }

      const track = activeTracks[currTrack];
      if (!track) return;

      let blob: Blob;

      if (track.file) {
        blob = track.file;
      } else {
        const res = await fetch(track.url);
        blob = await res.blob();
      }

      const data = await parseBlob(blob);
      setMetadata(data);

      let newCover: string | null = null;

      if (data.common.picture?.length) {
        const pic = data.common.picture[0];
        const base64 = Buffer.from(pic.data).toString("base64");
        newCover = `data:${pic.format};base64,${base64}`;
      }

      setCoverImage(newCover);

      if (playlistName === "Default") {
        setAllTracks(prev => {
          const updated = [...prev];
          updated[currTrack] = {
            ...updated[currTrack],
            title: data.common.title || "Unknown Title",
            artist: data.common.artist || "Unknown Artist",
            cover: newCover,
          };
          return updated;
        });
      } else {
        setPlaylistTracks(prev => {
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
    }

    loadMetadata();
  }, [currTrack, playlistName, playlistTracks, allTracks.length]);

  useEffect(() => {
    if (playlistName === "Default") {
      queueMicrotask(() => {
        setPlaylistTracks(allTracks);
      });
    }
  }, [allTracks]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans h-display
                    bg-gradient-to-r from-[#4c3346] via-[#422e53] to-[#28355c]
                    bg-[length:200%_200%]
                    animate-[gradient-move_8s_ease_infinite]">
      <main className="group grid grid-cols-3 w-full max-w-[120rem] h-screen">

        <PlaylistList 
          allTracks={allTracks}
          playlistName={playlistName}
          playlistTracks={playlistTracks}
          savedPlaylists={savedPlaylists}
          loadPlaylist={loadPlaylist}
          refreshPlaylists={refreshPlaylists}
          setPlaylistTracks={setPlaylistTracks}
          setCurrTrack={setCurrTrack}
          setPlaylistName={setPlaylistName}
          setSavedPlaylists={setSavedPlaylists}
        />

        <Player 
          coverImage={coverImage} 
          metadata={metadata}
          audioRef={audioRef} 
          currTrack={currTrack} 
          tracks={playlistTracks.length > 0 ? playlistTracks : allTracks} 
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying} 
          setCurrTrack={setCurrTrack}
        />
        
        <TracksList 
          allTracks={allTracks} 
          setAllTracks={setAllTracks} 

          playlistName={playlistName}
          setPlaylistName={setPlaylistName}

          playlistTracks={playlistTracks}
          setPlaylistTracks={setPlaylistTracks}

          currTrack={currTrack} 
          setCurrTrack={setCurrTrack}
          refreshPlaylists={refreshPlaylists}
        />
      </main>
    </div>
  );
}
