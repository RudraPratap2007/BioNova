import { supabase } from "./supabase.js";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email")?.value.trim().toLowerCase();
    const password = document.getElementById("password")?.value;
    const type = window.accountType || "donor";
    const button = document.querySelector(".login-submit");
    const oldText = button?.innerHTML;
    if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...'; }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data.user;
      const role = user.user_metadata?.role;
      if (role && role !== type) {
        await supabase.auth.signOut();
        throw new Error(`This account is registered as ${role}, not ${type}.`);
      }
      window.location.href = type === "hospital" ? "hospital-dashboard.html" : "donor-dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Login failed: " + (error.message || error));
      if (button) { button.disabled = false; button.innerHTML = oldText; }
    }
  });
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}
export async function getCurrentUserId() { return (await getCurrentUser())?.id || null; }
export async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) { window.location.href = "login.html"; return null; }
  return user;
}
export async function logout() { await supabase.auth.signOut(); window.location.href = "login.html"; }
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserId = getCurrentUserId;
window.requireLogin = requireLogin;
