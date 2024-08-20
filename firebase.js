// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB0tme8XCWAlK3VnFR9O1M23f2xUW39zrQ",
    authDomain: "omec-blog.firebaseapp.com",
    projectId: "omec-blog",
    storageBucket: "omec-blog.appspot.com",
    messagingSenderId: "1097909755541",
    appId: "1:1097909755541:web:7c6fcd6efa7f3e3773859c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };



 