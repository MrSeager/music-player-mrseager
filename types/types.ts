import { RefObject, Dispatch } from "react";
import { IAudioMetadata } from "music-metadata-browser";

export type UploadEvent =
  | React.ChangeEvent<HTMLInputElement>
  | { target: { files: File[] } };

export interface tracksProps {
  url: string;
  file?: File;
  title?: string | null;
  artist?: string | null;
  cover?: string | null;
}

export interface SortableTrackProps {
    id: number;
    index: number;
    track: tracksProps;
    currTrack: number;
    playlistName: string;
    handleRemoveTrack: (index: number) => void;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
}

export interface PlayerProps {
    coverImage: string | null;
    metadata: IAudioMetadata | null;
    audioRef: RefObject<HTMLAudioElement | null>;
    currTrack: number;
    tracks: tracksProps[];
    isPlaying: boolean;
    setupEqualizer: () => void;
    setIsPlaying: Dispatch<React.SetStateAction<boolean>>;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
    setOpenMenu: (openMenu: "none" | "playlists" | "tracks") => void;
}

export interface TracksListProps {
    allTracks: tracksProps[];
    currTrack: number;
    playlistName: string;
    playlistTracks: tracksProps[];
    openMenu: "none" | "playlists" | "tracks";
    refreshPlaylists: () => void;
    handleFileUpload: (e: UploadEvent) => void;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
    setPlaylistName: (playlistName: string) => void;
    setPlaylistTracks: Dispatch<React.SetStateAction<tracksProps[]>>;
    setOpenMenu: (openMenu: "none" | "playlists" | "tracks") => void;
}

export interface PlaylistListProps {
    allTracks: tracksProps[];
    playlistName: string;
    savedPlaylists: string[];
    openMenu: "none" | "playlists" | "tracks";
    refreshPlaylists: () => void;
    loadPlaylist: (name: string) => void;
    setPlaylistTracks: Dispatch<React.SetStateAction<tracksProps[]>>;
    setCurrTrack: Dispatch<React.SetStateAction<number>>;
    setPlaylistName: (playlistName: string) => void;
    setSavedPlaylists: (savedPlaylists: string[]) => void;
    setOpenMenu: (openMenu: "none" | "playlists" | "tracks") => void;
}