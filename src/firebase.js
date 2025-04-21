// reemplazá con tu configuración real
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // ✅ solo si vas a usar analytics


const firebaseConfig = {
    apiKey: "AIzaSyDvWZXbI5AHFjtyBs2HdjjTOyuRK_bfwe0",
    authDomain: "torneos-305d7.firebaseapp.com",
    projectId: "torneos-305d7",
    storageBucket: "torneos-305d7.firebasestorage.app",
    messagingSenderId: "351316293628",
    appId: "1:351316293628:web:1045cf780675e0d2f5a479",
    measurementId: "G-R2SJSP830H"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const analytics = getAnalytics(app);
export { auth, googleProvider, analytics };
