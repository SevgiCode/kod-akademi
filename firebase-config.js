import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLfSrs-pEXXF0jdWbFnZy0IGltwOFuxu4",
  authDomain: "kod-akademi-portal.firebaseapp.com",
  projectId: "kod-akademi-portal",
  storageBucket: "kod-akademi-portal.firebasestorage.app",
  messagingSenderId: "845720599745",
  appId: "1:845720599745:web:ae4b52eaee2f3315c7a840",
  measurementId: "G-0229FLVHWZ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
