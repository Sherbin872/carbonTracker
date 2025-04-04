import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, facebookProvider } from "../firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user from MongoDB
  const fetchUserData = async (uid) => {
    try {
      const response = await fetch(`https://carbontraker-server.onrender.com/api/users/${uid}`);
      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };
  

  // 🔹 Save or update user in MongoDB
  const saveUserToDB = async (firebaseUser) => {
    try {
      await fetch("https://carbontraker-server.onrender.com/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL ,
        }),
      });
    } catch (error) {
      console.error("Error saving user to database:", error);
    }
  };

  useEffect(() => {
    // 🔹 Listen for authentication changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mongoUser = await fetchUserData(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: mongoUser?.displayName || firebaseUser.displayName || "User",
          photoURL: mongoUser?.photoURL || firebaseUser.photoURL ,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔹 Register User
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Save new user to MongoDB
    await saveUserToDB(newUser);
    setUser({
      uid: newUser.uid,
      email: newUser.email,
      displayName: "User", // Email users don’t have a displayName initially
      photoURL: "/default-avatar.png",
    });

    return userCredential;
  };

  // 🔹 Login User
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const loggedInUser = userCredential.user;

    const mongoUser = await fetchUserData(loggedInUser.uid);
    setUser({
      uid: loggedInUser.uid,
      email: loggedInUser.email,
      displayName: mongoUser?.displayName || loggedInUser.displayName || "User",
      photoURL: mongoUser?.photoURL || loggedInUser.photoURL || "/default-avatar.png",
    });

    return userCredential;
  };

  // 🔹 Google Sign-In
  const signInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const googleUser = userCredential.user;
  
    // Always update MongoDB with the latest user info
    await saveUserToDB(googleUser);
  
    setUser({
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
    });
  
    return userCredential;
  };
  

  // 🔹 Facebook Sign-In
  const signInWithFacebook = async () => {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    const fbUser = userCredential.user;
  
    // Always update MongoDB with the latest user info
    await saveUserToDB(fbUser);
  
    setUser({
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
    });
  
    return userCredential;
  };
  

  // 🔹 Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, signInWithGoogle, signInWithFacebook, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};




export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
