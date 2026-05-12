//Components
import { IAudioMetadata } from "music-metadata-browser";

export default function Titles({ metadata }: {metadata: IAudioMetadata | null}) {
    return(
        <div className="flex flex-col w-full h-[50px] text-[#E5E7EB]">
            <h1 className="text-center text-[18px] truncate">{metadata?.common.title || "Unknown Title"}</h1>
            <h2 className="text-center opacity-70 text-[15px] truncate">
                {metadata?.common.artists?.join(", ") || metadata?.common.artist || "Unknown Artist"}
            </h2>
        </div>
    );
}