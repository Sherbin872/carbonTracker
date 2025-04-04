import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// 🔥 Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDBwOMeYOuOe2xtXqS6EtGu0zGQbKVAxi4",
    authDomain: "carbon-tracker-f5152.firebaseapp.com",
    projectId: "carbon-tracker-f5152",
    storageBucket: "carbon-tracker-f5152.firebasestorage.app",
    messagingSenderId: "68251016377",
    appId: "1:68251016377:web:4e5a92ba0e7e5769344f68",
    measurementId: "G-Y431HBKGTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Social Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };