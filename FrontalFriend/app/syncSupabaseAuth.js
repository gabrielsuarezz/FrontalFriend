// utils/syncSupabaseAuth.js
import { supabase } from "../SupabaseClient";
import { FIREBASE_AUTH } from "../FirebaseConfig";

export async function syncSupabaseAuth() {
  const auth = FIREBASE_AUTH;
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) return null;

  // Get Firebase ID token
  const token = await firebaseUser.getIdToken(true);

  // Tell Supabase “this token belongs to the current user”
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token,
  });

  const { data } = await supabase.auth.getUser();
  return data.user;
}
