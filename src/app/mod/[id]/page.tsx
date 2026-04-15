import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ModInteractive } from "./ModInteractive";
import { ModComments } from "./ModComments";
import { convertDriveLink } from "@/lib/utils";

export default async function ModDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();

  const { data: tweak, error } = await supabase
    .from("tweaks")
    .select(`
      *,
      profiles!tweaks_user_id_fkey ( username, avatar_url ),
      images ( drive_image_url )
    `)
    .eq("id", id)
    .single();

  if (error || !tweak) return notFound();

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch votes and calculate total
  const { data: votes } = await supabase.from("votes").select("*").eq("tweak_id", id);
  const upvotesCount = votes?.filter(v => v.vote_value === 1).length || 0;
  const downvotesCount = votes?.filter(v => v.vote_value === -1).length || 0;
  const totalScore = upvotesCount - downvotesCount;
  const userVote = votes?.find(v => v.user_id === user?.id)?.vote_value || 0;

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar_url)")
    .eq("tweak_id", id)
    .order("created_at", { ascending: true });

  // Fetch or trigger insight
  let insight = null;
  const { data: existingInsight } = await supabase.from("ai_insights").select("*").eq("tweak_id", id).single();
  if (existingInsight) {
    insight = existingInsight;
  }

  const images = tweak.images.map((img: { drive_image_url: string }) => convertDriveLink(img.drive_image_url));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Col - 2/3 */}
        <div className="w-full md:w-2/3 space-y-8">
          <ModInteractive 
            tweakId={id} 
            initialScore={totalScore} 
            initialUserVote={userVote}
            userId={user?.id || null}
            initialImages={images}
            author={tweak.profiles}
            title={tweak.title}
          />

          <div className="glass-panel border-pixel-white-glow p-6 relative">
            <h2 className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] text-2xl mb-4 py-1 leading-normal">Description</h2>
            <p className="text-gray-300 font-sans whitespace-pre-wrap leading-relaxed">
              {tweak.description}
            </p>
          </div>
        </div>

        {/* Right Col - 1/3 */}
        <div className="w-full md:w-1/3 space-y-8">
          {/* Action Box */}
          <div className="glass-panel border-pixel-white-glow p-6 flex flex-col items-center relative">
             <a href={convertDriveLink(tweak.drive_link)} target="_blank" rel="noreferrer" className="w-full relative overflow-hidden group shadow-[0_0_20px_rgba(63,186,84,0.3)] hover:shadow-[0_0_30px_rgba(63,186,84,0.6)] mb-4 bg-grass text-white border-pixel border-black text-center py-4 font-pixel btn-push transition-all">
               <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>
               DOWNLOAD FILE
             </a>
             <div className="w-full flex flex-wrap gap-2 justify-center">
               <span className="bg-black/40 text-gray-300 px-3 py-1 font-sans text-sm border border-white/10 backdrop-blur-sm shadow-sm">
                 {tweak.category}
               </span>
               {tweak.tags?.map((tag: string) => (
                 <span key={tag} className="bg-black/40 text-gray-300 px-3 py-1 font-sans text-sm border border-white/10 backdrop-blur-sm shadow-sm">
                   #{tag}
                 </span>
               ))}
             </div>
          </div>

          {/* Librarian's Report */}
          <div 
            className="bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden"
            style={{
              boxShadow: `
                inset 4px 0 0 0 rgba(255,170,0,0.2),
                inset 0 4px 0 0 rgba(255,170,0,0.2),
                inset -4px 0 0 0 rgba(255,170,0,0.05),
                inset 0 -4px 0 0 rgba(255,170,0,0.05),
                0 0 0 4px #ffaa00,
                0 0 20px 2px rgba(255,170,0,0.4)
              `,
              borderRadius: '0px'
            }}
          >
             <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 rounded-bl-full mix-blend-screen" />
             <h2 className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] text-xl flex items-center gap-2 mb-4 py-1 leading-normal">
               {/* Animated star or icon */}
               <span className="text-2xl drop-shadow-none text-gold">✨</span> Librarian&apos;s Report
             </h2>
             {insight ? (
               <div className="space-y-4">
                 <p className="text-gray-300 font-sans text-sm italic border-l-4 border-gold pl-3">
                   {insight.summary_text}
                 </p>
                 <div className="flex items-center gap-2 font-sans text-sm">
                   <span className="text-gray-400">Sentiment:</span>
                   <span className={
                     insight.sentiment === 'Positive' ? 'text-grass' : 
                     insight.sentiment === 'Negative' ? 'text-red-500' : 'text-yellow-500'
                   }>{insight.sentiment}</span>
                 </div>
               </div>
             ) : (
               <p className="text-gray-400 font-sans text-sm italic">
                  Not enough data for the Librarian yet. Comments are required to generate an insight.
               </p>
             )}
          </div>

        </div>

      </div>

      {/* Discussion / Comments Row */}
      <div className="mt-12 glass-panel border-pixel-white-glow p-6 max-w-3xl relative">
        <h2 className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] text-2xl mb-6 py-1 leading-normal">Discussion</h2>
        <ModComments tweakId={id} initialComments={comments || []} userId={user?.id || null} />
      </div>

    </div>
  );
}
