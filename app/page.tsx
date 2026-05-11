'use client';
//Components
import { useState, useRef, useEffect } from "react";
import { parseBlob, IAudioMetadata } from "music-metadata-browser";
import Player from "@/Components/Player";
import TracksList from "@/Components/TracksList";
import PlaylistList from "@/Components/PlaylistsList";
//Types
import { tracksProps, UploadEvent } from "@/types/types";

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

  const [audioLevel, setAudioLevel] = useState(0);
  const eqInitialized = useRef<boolean>(false);

  //For mobile version 
  const [openMenu, setOpenMenu] = useState<"none" | "playlists" | "tracks">("none");
  
  //For drag-n-drop
  const [dragActive, setDragActive] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

  //Uploading tracks
  const handleFileUpload = async (e: UploadEvent) => {
    const fileList = e.target.files;

    if (!fileList) return;

    const files = Array.from(fileList);

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

    //setAllTracks(prev => [...prev, ...newTracks]);
    setAllTracks(prev => {
        const updated = [...prev, ...newTracks];

        // If default playlist is active → add new tracks to playlistTracks too
        if (playlistName === "Default") {
            setPlaylistTracks(updated);
        }

        return updated;
    });
  };

  //Equalizer
  const setupEqualizer = () => {
    if (eqInitialized.current) return;   // <-- prevents duplicates
    if (!audioRef.current) return;

    eqInitialized.current = true;        // <-- lock it

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioRef.current);
    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        requestAnimationFrame(tick);
    };

    tick();
  };

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

    // Rebuild playlist in saved order
    const matched = fileNames
      .map((savedName: string) =>
        allTracks.find(t => (t.file?.name || t.title) === savedName)
      )
      .filter(Boolean) as tracksProps[];

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
  }, []);

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
  }, [currTrack, playlistName]);

  useEffect(() => {
    if (playlistName === "Default") {
      queueMicrotask(() => {
        setPlaylistTracks(allTracks);
      });
    }
  }, [allTracks]);

  useEffect(() => {
    if (isPlaying) {
        setupEqualizer();
    }
  }, [isPlaying]);

  //For drag-n-drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      setDragActive(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) setDragActive(false);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragActive(false);

      if (!e.dataTransfer) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload({ target: { files } });
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div 
        className="blob text-[#E5E7EB] flex flex-col flex-1 items-center justify-center font-sans h-display
                    bg-gradient-to-r from-[#4c3346] via-[#422e53] to-[#28355c]
                    bg-[length:200%_200%]"
        style={{
            animation: `gradient-move ${8 - audioLevel * 6}s ease infinite`
        }}              
      >
      <main className="relative group lg:grid grid-cols-3 w-full max-w-[120rem] h-screen">
        <PlaylistList 
          allTracks={allTracks}

          playlistName={playlistName}

          playlistTracks={playlistTracks}
          setPlaylistName={setPlaylistName}

          savedPlaylists={savedPlaylists}
          setSavedPlaylists={setSavedPlaylists}

          openMenu={openMenu}
          setOpenMenu={setOpenMenu}

          loadPlaylist={loadPlaylist}
          refreshPlaylists={refreshPlaylists}
          setPlaylistTracks={setPlaylistTracks}
          setCurrTrack={setCurrTrack}
        />

        <Player  
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying} 
          
          currTrack={currTrack} 
          setCurrTrack={setCurrTrack}

          coverImage={coverImage} 
          metadata={metadata}
          audioRef={audioRef} 
          tracks={playlistTracks.length > 0 ? playlistTracks : allTracks}
          setupEqualizer={setupEqualizer}
          setOpenMenu={setOpenMenu}
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
          handleFileUpload={handleFileUpload}

          openMenu={openMenu} 
          setOpenMenu={setOpenMenu}
        />

        {dragActive && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center 
                      bg-black/60 border-4 border-dashed border-[#C93B76] 
                      text-[#E5E7EB] text-3xl pointer-events-auto"
          >
            Drop audio files here
          </div>
        )}
      </main>
    </div>
  );
}
