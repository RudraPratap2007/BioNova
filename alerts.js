import { supabase } from "./supabase.js";

const target = document.getElementById("alertsSection") || document.getElementById("alertsContainer");

async function loadAlerts() {
  if (!target) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { target.innerHTML = '<div class="no-alerts"><p>Please login to view alerts.</p></div>'; return; }

  const { data: hospital } = await supabase.from("hospitals").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!hospital) { target.innerHTML = '<div class="no-alerts"><p>Hospital profile not found.</p></div>'; return; }

  const { data: requests, error } = await supabase.from("blood_requests").select("id,blood_group,units,city,urgency,required_date,reason,additional_info,status").eq("hospital_id", hospital.id).order("required_date", { ascending: true });
  if (error) { console.error(error); target.innerHTML = '<div class="no-alerts"><p>Unable to load alerts.</p></div>'; return; }

  target.innerHTML = "<div class=\"alerts-header\"><div><h2>Live Blood Requests</h2><p>Requests saved in your Supabase database.</p></div></div>";
  if (!requests?.length) { target.insertAdjacentHTML("beforeend", '<div class="no-alerts"><p>No blood requests yet.</p></div>'); return; }

  for (const r of requests) {
    const card = document.createElement("div");
    card.className = `alert-card ${(r.urgency || "normal").toLowerCase()}`;
    card.innerHTML = `<div class="alert-header"><div class="alert-blood"><i class="fa-solid fa-droplet"></i><strong>${r.blood_group || "-"}</strong></div><span class="alert-status">${r.status || "Pending"}</span></div><div class="alert-body"><h3>${r.units || 0} Unit(s) Required</h3><p><i class="fa-solid fa-location-dot"></i> ${r.city || "Location not available"}</p><p><i class="fa-solid fa-triangle-exclamation"></i> Urgency: ${r.urgency || "Normal"}</p><p><i class="fa-solid fa-calendar"></i> Required: ${r.required_date ? new Date(r.required_date + "T00:00:00").toLocaleDateString("en-IN") : "Not specified"}</p><p>${r.reason || r.additional_info || ""}</p></div><div class="alert-footer"><small>Request ID: ${r.id}</small></div>`;
    target.appendChild(card);
  }
}

document.addEventListener("DOMContentLoaded", loadAlerts);
supabase.channel("blood-request-alerts").on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, loadAlerts).subscribe();
