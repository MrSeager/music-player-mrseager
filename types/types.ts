import { RefObject, Dispatch } from "react";
import { IAudioMetadata } from "music-metadata-browser";

export interface tracksProps {
  url: string;
  file?: File;
  title?: string | null;
  artist?: string | null;
  cover?: string | null;
}

export interface PlayerProps {
    coverImage: string | null;
    metadata: IAudioMetadata | null;
    audioRef: RefObject<HTMLAudioElement | null>;
    currTrack: number;
    tracks: tracksProps[];
    isPlaying: boolean;
    setIsPlaying: Dispatch<React.SetStateAction<boolean>>;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
}

export interface TracksListProps {
    allTracks: tracksProps[];
    currTrack: number;
    playlistName: string;
    playlistTracks: tracksProps[];
    setAllTracks: Dispatch<React.SetStateAction<tracksProps[]>>;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
    setPlaylistName: (playlistName: string) => void;
    setPlaylistTracks: Dispatch<React.SetStateAction<tracksProps[]>>;
}

export interface PlaylistListProps {
    allTracks: tracksProps[];
    playlistName: string; 
    playlistTracks: tracksProps[];
    setPlaylistTracks: Dispatch<React.SetStateAction<tracksProps[]>>;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
    setPlaylistName: (playlistName: string) => void;
}