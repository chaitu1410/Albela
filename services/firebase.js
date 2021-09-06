import firebase from "firebase";
import "firebase/storage";
import "firebase/auth";

var firebaseConfig = {
  apiKey: "AIzaSyALgJg0rNWY6Xoj0hSJpoD_9g9t_5nNkVw",
  authDomain: "classical-shop.firebaseapp.com",
  projectId: "classical-shop",
  storageBucket: "classical-shop.appspot.com",
  messagingSenderId: "621504489945",
  appId: "1:621504489945:web:2f1ee6f2da52f4bda391c8",
  measurementId: "G-GELC7TCT83",
};

if (!firebase.apps.length) {
  var firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore(firebaseApp);
const storage = firebase.app().storage();
const auth = firebase.auth();

export { db, storage, auth, firebase };
