import { supabase } from "./supabase.js";

export async function getHospitals() {
  const { data, error } = await supabase.from("hospitals").select("id,name,city,state,address").order("name");
  if (error) { console.error("Hospitals fetch error:", error); return []; }
  return data || [];
}
export async function getHospital(hospitalId) {
  const { data, error } = await supabase.from("hospitals").select("id,name,city,state,address").eq("id", hospitalId).single();
  if (error) { console.error("Hospital fetch error:", error); return null; }
  return data;
}
export async function getCurrentHospital() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("hospitals").select("*").eq("auth_user_id", user.id).maybeSingle();
  return data || null;
}
export async function getCurrentHospitalId() { return (await getCurrentHospital())?.id || null; }
export async function getHospitalRequests(hospitalId) {
  const { data, error } = await supabase.from("blood_requests").select("*").eq("hospital_id", hospitalId).order("required_date", { ascending: true });
  if (error) { console.error("Hospital requests error:", error); return []; }
  return data || [];
}
