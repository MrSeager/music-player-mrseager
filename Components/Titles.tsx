//Components
import { IAudioMetadata } from "music-metadata-browser";

export default function Titles({ metadata }: {metadata: IAudioMetadata | null}) {
    return(
        <div className="flex flex-col w-full h-[50px]">
            <h1 className="text-center text-[#E5E7EB] text-[18px]">{metadata?.common.title || "Unknown Title"}</h1>
            <h2 className="text-center text-[#4D5562] text-[15px] ">
                {metadata?.common.artists?.join(", ") || metadata?.common.artist || "Unknown Artist"}
            </h2>
        </div>
    );
}