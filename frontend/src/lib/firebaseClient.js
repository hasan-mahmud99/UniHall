import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4iG6UXfY0wzjklYVg_4HUZH_ZneqD9QI",
  authDomain: "unihal-5b9dc.firebaseapp.com",
  projectId: "unihal-5b9dc",
  storageBucket: "unihal-5b9dc.firebasestorage.app",
  messagingSenderId: "10240357140",
  appId: "1:10240357140:web:970a96f0b91cc11cf68801",
  measurementId: "G-GC60JQCZBE",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
