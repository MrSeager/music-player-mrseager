import Image from "next/image";
//Icons
import { HiPlay, HiPlayPause } from "react-icons/hi2";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans h-display
                    bg-gradient-to-r from-[#4c3346] via-[#422e53] to-[#28355c]
                    bg-[length:200%_200%]
                    animate-[gradient-move_8s_ease_infinite]">
      <main className="flex flex-1 w-full max-w-[120rem] flex-col items-center justify-center">
        <div className="aspect-4/6 bg-[#212936ab] p-5 rounded-[15px] flex flex-col items-center justify-between">
          <Image 
            src={'/images/cover-1.jpg'}
            alt="cover image"
            width={306}
            height={288}
            className="rounded-[15px]"
          />
          <div>
            <h1 className="text-center">Song</h1>
            <h2 className="text-center">Artist</h2>
          </div>
          <div className="grid grid-cols-2 w-full">
            <p>0:00</p>
            <p className="text-end">3:00</p>
            <div className="border col-span-2">

            </div>
          </div>
          <div className="flex gap-3 items-center">
              <button
                type="button"
                title="prev"
                className="text-[#4D5562] duration-300 cursor-pointer
                          hover:text-[#C93B76] hover:drop-shadow-[0_0_5px_#C93B76]"
              >
                <HiPlayPause size={30} className="rotate-180" />
              </button>
              <button
                type="button"
                title="play"
                className="bg-[#C93B76] p-4 rounded-full cursor-pointer duration-300 shadow-[#C93B76]
                            hover:drop-shadow-[0_0_5px_#C93B76]"
              >
                <HiPlay size={20} />
              </button>
              <button
                type="button"
                title="prev"
                className="text-[#4D5562] duration-300 cursor-pointer
                          hover:text-[#C93B76] hover:drop-shadow-[0_0_5px_#C93B76]"
              >
                <HiPlayPause size={30} />
              </button>
          </div>
        </div>
      </main>
    </div>
  );
}
