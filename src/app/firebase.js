// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZnTz4qtmfhHRXcBr9JzK9wh5RFfuizQc",
  authDomain: "hspantryapp-5594b.firebaseapp.com",
  projectId: "hspantryapp-5594b",
  storageBucket: "hspantryapp-5594b.appspot.com",
  messagingSenderId: "305745043253",
  appId: "1:305745043253:web:53a9b3bdeeb39fcfcf367c",
  measurementId: "G-QJYFKM9T9K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };