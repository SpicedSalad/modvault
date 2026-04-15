import { createClient } from "@/lib/supabase/server";
import { ModCard } from "@/components/ModCard";
import { DiscoverFilters } from "./DiscoverFilters";
import { parseTag } from "@/lib/utils";

export default async function DiscoverPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const category = searchParams.category as string;
  const sort = searchParams.sort as string || "upvotes";
  const search = searchParams.search as string;
  const loader = searchParams.loader as string;
  
  const supabase = await createClient();

  let query = supabase.from("tweaks").select(`
    *,
    images ( drive_image_url ),
    comments ( id ),
    votes ( vote_value )
    ${loader ? ', tweak_files!inner(loader_type)' : ''}
  `);

  if (category) {
    query = query.eq("category", category);
  }

  // search handled locally below for tag support

  if (loader) {
    query = query.eq("tweak_files.loader_type", loader);
  }

  const { data: rawTweaks, error } = await query;
  
  let tweaks = rawTweaks ? [...rawTweaks] : [];
  
  if (search) {
    const s = search.toLowerCase();
    tweaks = tweaks.filter((t: any) => {
      // It already matched title/description in DB OR it might match a tag.
      // Wait, if it matched title/desc in DB, it will be in tweaks.
      // But we modified the DB query to `.or(...)`. If the DB filtered out rows without title/desc match,
      // it would miss tweaks that ONLY match by tag.
      // So we should remove `.or(...)` from DB query if we want to search tags locally, OR we keep it and just accept we only search tags on already-matched tweaks.
      // We will remove `.or` from DB query below.
      
      const titleMatch = t.title?.toLowerCase().includes(s);
      const descMatch = t.description?.toLowerCase().includes(s);
      const tagMatch = t.tags?.some((tagRaw: string) => parseTag(tagRaw).toLowerCase().includes(s));
      
      return titleMatch || descMatch || tagMatch;
    });
  }
  
  // Sort heavily computed metric results natively on the Server Node instance
  tweaks.sort((a: any, b: any) => {
    if (sort === "upvotes") {
      const aScore = (a.votes?.filter((v: any) => v.vote_value === 1).length || 0) - (a.votes?.filter((v: any) => v.vote_value === -1).length || 0);
      const bScore = (b.votes?.filter((v: any) => v.vote_value === 1).length || 0) - (b.votes?.filter((v: any) => v.vote_value === -1).length || 0);
      return bScore - aScore;
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <DiscoverFilters />

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 
            className="text-3xl font-pixel text-white leading-normal" 
            style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 20px rgba(255,255,255,0.9)' }}
          >
            Discover Tweaks
          </h1>
          <span className="text-gray-400 font-sans">{tweaks?.length || 0} Results</span>
        </div>

        {error ? (
          <div className="text-red-500 font-sans p-4 bg-red-500/10 border border-red-500/20 rounded">
            Error loading tweaks: {error.message}
          </div>
        ) : tweaks?.length === 0 ? (
          <div className="text-gray-400 font-sans p-8 text-center bg-deepslate border-pixel border-[#1a1a1a]">
            No tweaks found matching your criteria. Be the first to upload one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweaks.map((tweak: any) => {
              const commentsCount = tweak.comments?.length || 0;
              const upvotesCount = tweak.votes?.filter((v: any) => v.vote_value === 1).length || 0;
              const downvotesCount = tweak.votes?.filter((v: any) => v.vote_value === -1).length || 0;
              const totalScore = upvotesCount - downvotesCount;

              return (
                <ModCard 
                  key={tweak.id} 
                  tweak={tweak} 
                  thumbnailUrl={tweak.images?.[0]?.drive_image_url} 
                  upvotes={totalScore} 
                  commentsCount={commentsCount} 
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
