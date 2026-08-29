import { supabase } from "./supabase.js";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) { console.error(error); return null; }
  return data.user;
}

export async function getCurrentHospital() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase.from("hospitals").select("*").eq("auth_user_id", user.id).maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

export async function getCurrentHospitalId() {
  const hospital = await getCurrentHospital();
  return hospital?.id ?? null;
}

export async function requireHospitalLogin() {
  const user = await getCurrentUser();
  if (!user) { window.location.href = "login.html"; return null; }
  return user;
}

const form = document.getElementById("hospitalForm");
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const get = (id) => document.getElementById(id)?.value?.trim() || "";
    const password = get("password");
    const confirm = get("confirmPassword");
    if (password.length < 8) return alert("Password must be at least 8 characters.");
    if (password !== confirm) return alert("Passwords do not match.");
    if (!document.getElementById("terms")?.checked) return alert("Please accept the terms and conditions.");

    const button = form.querySelector('button[type="submit"]');
    const oldText = button?.innerHTML;
    if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...'; }

    try {
      const payload = {
        role: "hospital",
        name: get("hospitalName"), registration_number: get("registrationNumber"), hospital_type: get("hospitalType"),
        phone: get("phone"), email: get("email").toLowerCase(), address: get("address"), city: get("city"),
        state: get("state"), pincode: get("pincode"), blood_bank: get("bloodBank"),
        authorized_name: get("authorizedName"), designation: get("designation"),
        authorized_phone: get("authorizedPhone"), authorized_email: get("authorizedEmail")
      };

      const { error } = await supabase.auth.signUp({ email: payload.email, password, options: { data: payload } });
      if (error) throw error;
      alert("Hospital registration successful! Check your email if confirmation is enabled, then login as Hospital.");
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert("Hospital registration failed:\n\n" + (error.message || error));
    } finally {
      if (button) { button.disabled = false; button.innerHTML = oldText; }
    }
  });
}
