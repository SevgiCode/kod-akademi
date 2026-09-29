import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginError = document.getElementById("loginError");

// Ако сесијата е веќе отворена, не задржувај го ученикот повторно на екранот за најава.
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "./index.html";
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Се најавува...";

  try {
    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "./index.html";
  } catch (error) {
    console.error(error);

    loginError.textContent =
      "Погрешна е-пошта или лозинка. Обидете се повторно.";

    loginButton.disabled = false;
    loginButton.textContent = "Најави се";
  }
});
