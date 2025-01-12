// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {getStorage} from 'firebase/storage';
import {getAuth, GoogleAuthProvider} from 'firebase/auth'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhaacjz_ZTKhYWn4Zet0IpWHLP10zyN3g",
  authDomain: "fitbud-af423.firebaseapp.com",
  projectId: "fitbud-af423",
  storageBucket: "fitbud-af423.firebasestorage.app",
  messagingSenderId: "450776281511",
  appId: "1:450776281511:web:90ad0021c8007dc9c48682",
  measurementId: "G-83CKFQLD6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();
export const db = getFirestore();
export const storage = getStorage(app);