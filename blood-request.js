import { supabase } from "./supabase.js";

const form = document.getElementById("bloodRequestForm");
if (form) {
  const dateInput = document.getElementById("requiredDate");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const get = (id) => document.getElementById(id)?.value?.trim() || "";
    const checked = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || "";
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) { alert("Please login as a hospital first."); window.location.href = "login.html"; return; }

    const { data: hospital, error: hospitalError } = await supabase.from("hospitals").select("id").eq("auth_user_id", user.id).maybeSingle();
    if (hospitalError || !hospital) { alert("Hospital profile not found. Please register/login again."); return; }

    const bloodGroup = checked("bloodGroup");
    const units = Number(get("units"));
    const urgency = checked("urgency");
    if (!bloodGroup || !units || units < 1 || !urgency) { alert("Please complete blood group, units and urgency."); return; }

    const button = form.querySelector('button[type="submit"]');
    const oldText = button?.innerHTML;
    if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...'; }

    try {
      const { error } = await supabase.from("blood_requests").insert({
        hospital_id: hospital.id,
        requester_id: user.id,
        blood_group: bloodGroup,
        units,
        blood_component: get("bloodComponent"),
        urgency,
        patient_type: get("patientType"),
        patient_id: get("patientId"),
        required_date: get("requiredDate") || null,
        required_time: get("requiredTime") || null,
        additional_info: get("additionalInfo"),
        hospital_address: get("hospitalAddress"),
        city: get("city"), state: get("state"), pincode: get("pincode"),
        contact_name: get("contactName"), contact_phone: get("contactPhone"), status: "Pending"
      });
      if (error) throw error;
      alert("Blood request submitted successfully!");
      form.style.display = "none";
      document.getElementById("successBox")?.style.setProperty("display", "block");
    } catch (error) {
      console.error(error);
      alert("Blood request failed:\n\n" + (error.message || error));
    } finally {
      if (button) { button.disabled = false; button.innerHTML = oldText; }
    }
  });
}
