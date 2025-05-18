// firebaseInit.js
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing app...");

  // Firebase configuration (replace with your actual config)
  const firebaseConfig = {
    apiKey: "AIzaSyDNlQTyljEdqIsjO3f02aZzRNLCa2inq2w",
    authDomain: "meranaw-pananaroon.firebaseapp.com",
    databaseURL:
      "https://meranaw-pananaroon-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "meranaw-pananaroon",
    storageBucket: "meranaw-pananaroon.firebasestorage.app",
    messagingSenderId: "275452854496",
    appId: "1:275452854496:web:819619c149b950fdfc9085",
    measurementId: "G-J5XSKKGYKX",
  };

  // Function to load a script dynamically
  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
    };
    document.head.appendChild(script);
  }

  let firebaseAppInitialized = false;
  let firestoreLoaded = false;

  function initializeFirebase() {
    if (firebaseAppInitialized && firestoreLoaded) {
      try {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        // Make Firebase and Firestore available globally
        window.firebase = firebase;
        window.firestore = db;

        console.log("Firebase initialized successfully");

        // Load the firebaseService script after Firebase is initialized
        loadScript("firebaseService.js", () => {
          if (typeof initApp === "function") {
            initApp(); // Start the app only once
          }
          console.log("firebaseService.js loaded");
          // You might want to trigger an event here or call a function
          // in script.js to indicate that Firebase is ready.
        });
      } catch (error) {
        console.error("Error initializing Firebase:", error);
      }
    } else {
      console.log("Firebase app or firestore not yet loaded...");
    }
  }

  // Load Firebase App SDK
  loadScript(
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
    () => {
      console.log("firebase-app-compat.js loaded");
      firebaseAppInitialized = true;
      initializeFirebase();
    }
  );

  // Load Firebase Firestore SDK
  loadScript(
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js",
    () => {
      console.log("firebase-firestore-compat.js loaded");
      firestoreLoaded = true;
      initializeFirebase();
    }
  );
});
