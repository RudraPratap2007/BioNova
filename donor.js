import { supabase } from "./supabase.js";

const form = document.getElementById("donorRegistrationForm");
if (!form) throw new Error("Donor registration form not found.");

function value(id) { return document.getElementById(id)?.value?.trim() || ""; }
function checked(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value || ""; }

// The original page did not contain password fields. Add them once so donor accounts
// can actually use the Supabase login page.
const confirmation = document.getElementById("confirmation");
if (confirmation && !document.getElementById("donorPasswordFields")) {
  const box = document.createElement("div");
  box.id = "donorPasswordFields";
  box.className = "form-card";
  box.innerHTML = `
    <div class="form-group">
      <label for="donorPassword">Password <span class="required">*</span></label>
      <input type="password" id="donorPassword" minlength="8" required placeholder="Minimum 8 characters">
    </div>
    <div class="form-group">
      <label for="donorConfirmPassword">Confirm Password <span class="required">*</span></label>
      <input type="password" id="donorConfirmPassword" minlength="8" required placeholder="Re-enter password">
    </div>`;
  confirmation.closest("div.form-card")?.before(box);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = value("fullName");
  const dob = value("dateOfBirth");
  const gender = value("gender");
  const bloodGroup = checked("bloodGroup");
  const phone = value("phoneNumber");
  const email = value("emailAddress").toLowerCase();
  const address = value("address");
  const city = value("city");
  const state = value("state");
  const pincode = value("pincode");
  const password = value("donorPassword");
  const confirmPassword = value("donorConfirmPassword");

  if (!/^[0-9]{10}$/.test(phone)) return alert("Please enter a valid 10-digit mobile number.");
  if (!email) return alert("Please enter your email address.");
  if (!bloodGroup) return alert("Please select your blood group.");
  if (!/^[0-9]{6}$/.test(pincode)) return alert("Please enter a valid 6-digit pincode.");
  if (password.length < 8) return alert("Password must be at least 8 characters.");
  if (password !== confirmPassword) return alert("Passwords do not match.");

  const button = form.querySelector('button[type="submit"]');
  const oldText = button?.innerHTML;
  if (button) { button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...'; }

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "donor", full_name: fullName, date_of_birth: dob, gender,
          blood_group: bloodGroup, phone_number: phone, address, city, state, pincode
        }
      }
    });
    if (error) throw error;

    alert("Donor registration successful! Check your email if Supabase asks for email confirmation, then login.");
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    alert("Registration failed:\n\n" + (error.message || error));
  } finally {
    if (button) { button.disabled = false; button.innerHTML = oldText; }
  }
});
