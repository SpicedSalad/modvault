import { ParallaxBlocks } from "@/components/ParallaxBlocks";
import { HeroClient } from "@/components/HeroClient";
import DiscoverPage from "./discover/page";

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <div className="flex flex-col w-full">

      {/* Hero Section Container */}
      <div className="relative min-h-screen flex items-center justify-center -mt-16 w-full">
        <ParallaxBlocks />
        <HeroClient />
      </div>
      
      {/* Scrollable Discover Section */}
      <div id="discover-section" className="w-full relative z-20 min-h-screen border-t-4 border-[#1a1a1a] shadow-[0_-15px_30px_rgba(0,0,0,0.8)] bg-[#1a1a1a]/95 backdrop-blur-sm">
         <DiscoverPage searchParams={props.searchParams} />
      </div>
    </div>
  );
}
