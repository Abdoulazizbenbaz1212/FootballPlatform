import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCHBPJgTXgUSWc7keGlitwZme0s6DYjUsM",
    authDomain: "footballplatform-75fa1.firebaseapp.com",
    projectId: "footballplatform-75fa1",
    storageBucket: "footballplatform-75fa1.firebasestorage.app",
    messagingSenderId: "216163618569",
    appId: "1:216163618569:web:6319644ab30e6e5f48cdd8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
};
