import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDBlEqnCWEy9nA3L2qYBVoet1w1sTCr1_A",
    authDomain: "face-authentication-files.firebaseapp.com",
    projectId: "face-authentication-files",
    storageBucket: "face-authentication-files.firebasestorage.app",
    messagingSenderId: "410030228747",
    appId: "1:410030228747:web:0495548ebb71dacdb24e0e",
    measurementId: "G-G2B4BTRVD6"
  };

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);


