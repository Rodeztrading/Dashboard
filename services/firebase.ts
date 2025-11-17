import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCq0QS3to5vnjjNq1rONYdWPiN9zGXqIZU",
  authDomain: "dashboard-ad936.firebaseapp.com",
  projectId: "dashboard-ad936",
  storageBucket: "dashboard-ad936.firebasestorage.app",
  messagingSenderId: "532129688792",
  appId: "1:532129688792:web:7f6445bccb6bc149d87bad",
  measurementId: "G-H58Q5M6W6W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);
