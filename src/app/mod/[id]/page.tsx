import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ModInteractive } from "./ModInteractive";
import { ModComments } from "./ModComments";
import { convertDriveLink, parseTag } from "@/lib/utils";

export default async function ModDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();

  const { data: tweak, error } = await supabase
    .from("tweaks")
    .select(`
      *,
      profiles!tweaks_user_id_fkey ( username, avatar_url ),
      images ( drive_image_url ),
      tweak_files ( * )
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

  // Fetch existing insight
  let insight = null;
  const { data: existingInsight } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("tweak_id", id)
    .maybeSingle();
  if (existingInsight) insight = existingInsight;

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
             <div className="w-full flex-col gap-3 mb-6">
               <h3 className="text-white font-pixel text-lg mb-4 text-center">Versions</h3>
               {tweak.tweak_files && tweak.tweak_files.length > 0 ? (
                 <div className="space-y-3">
                   {tweak.tweak_files.map((file: any) => (
                     <div key={file.id} className="bg-black/40 border border-white/10 p-3 flex flex-col gap-2 relative group overflow-hidden shadow-sm hover:border-grass/50 transition-colors">
                       <div className="flex justify-between items-center">
                         <span className="font-pixel text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] text-sm">v{file.mc_version}</span>
                         <span className="text-xs font-sans px-2 py-0.5 bg-white/10 rounded-sm text-gray-300">{file.loader_type}</span>
                       </div>
                       <a 
                         href={file.download_url} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="w-full relative overflow-hidden group shadow-[0_0_10px_rgba(63,186,84,0.2)] hover:shadow-[0_0_20px_rgba(63,186,84,0.5)] bg-grass/80 text-white border-pixel border-black text-center py-2 text-xs font-pixel btn-push transition-all mt-1"
                       >
                         <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay pointer-events-none"></div>
                         DOWNLOAD
                       </a>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-gray-500 font-sans text-sm text-center">No downloads available.</p>
               )}
             </div>
             <div className="w-full flex flex-wrap gap-2 justify-center pt-2">
               <span className="inline-flex items-center bg-black/40 text-gray-300 px-3 py-1 font-sans text-xs border border-white/10 leading-none">
                 {tweak.category}
               </span>
               {tweak.tags?.map((tag: unknown, idx: number) => {
                 const parsedTag = parseTag(tag);
                 return (
                   <span key={idx} className="inline-flex items-center bg-black/40 text-gray-300 px-3 py-1 font-sans text-xs border border-white/10 leading-none">
                     #{parsedTag}
                   </span>
                 );
               })}
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
             <h2 className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] text-xl mb-4 py-1 leading-normal">
               Librarian&apos;s Report
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
        <ModComments tweakId={id} initialComments={comments || []} userId={user?.id || null} hasInsight={!!insight} />
      </div>

    </div>
  );
}
