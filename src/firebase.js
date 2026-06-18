import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBBY-G5hw-AJJFzqKD_It6Voxjs8XYLc08",
    authDomain: "kora-yaser.firebaseapp.com",
    projectId: "kora-yaser",
    storageBucket: "kora-yaser.firebasestorage.app",
    messagingSenderId: "535391014705",
    appId: "1:535391014705:web:85b5a4a268208c35856a10"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
    return signOut(auth);
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export { auth };
