import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminPanel } from "./AdminPanel";

const ADMIN_EMAIL = "omkarbichu0612@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Guard: only the admin email gets in
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // Fetch every tweak with its uploader profile and image
  const { data: tweaks } = await supabase
    .from("tweaks")
    .select(`
      id,
      title,
      category,
      created_at,
      description,
      profiles!tweaks_user_id_fkey ( username ),
      images ( drive_image_url ),
      votes ( vote_value ),
      comments ( id )
    `)
    .order("created_at", { ascending: false });

  return <AdminPanel tweaks={tweaks || []} />;
}
