
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhLzGNOooJlR9N1Rd0vadcNUQzf4JuZKA",
  authDomain: "hackathon-25295.firebaseapp.com",
  projectId: "hackathon-25295",
  storageBucket: "hackathon-25295.firebasestorage.app",
  messagingSenderId: "986797281649",
  appId: "1:986797281649:web:8c9f6b98a25339d49066d0",
  measurementId: "G-B35L3Y9R3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
