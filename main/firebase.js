// Firebase configuration - must be defined BEFORE initializing
const firebaseConfig = {
  apiKey: "AIzaSyDNlQTyljEdqIsjO3f02aZzRNLCa2inq2w",
  authDomain: "meranaw-pananaroon.firebaseapp.com",
  projectId: "meranaw-pananaroon",
  storageBucket: "meranaw-pananaroon.firebasestorage.app",
  messagingSenderId: "275452854496",
  appId: "1:275452854496:web:819619c149b950fdfc9085",
  measurementId: "G-J5XSKKGYKX",
};

// Import Firebase modules - using CDN with window objects
// import { initializeApp } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.9.0/firebase-app.js";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   doc,
//   getDoc,
//   query,
//   where,
//   addDoc,
// } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.9.0/firebase-firestore.js";

// Initialize Firebase - only ONCE
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Collection references
const proverbsCollection = db.collection("meranaw_proverb");
const contributionsCollection = db.collection("contributions");

// Firebase service object
const firebaseService = {
  getAllProverbs: async function () {
    try {
      const proverbsSnapshot = await proverbsCollection.get();
      return proverbsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting proverbs:", error);
      return [];
    }
  },

  getProverbsByTheme: async function (theme) {
    try {
      const q = proverbsCollection.where("theme", "==", theme);
      const querySnapshot = await q.get();
      const proverbsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().proverb || "",
        literalMeaning: doc.data().literal_meaning || "",
        translation: doc.data().english_translation || "",
        theme: doc.data().theme || "",
      }));
      return proverbsList;
    } catch (error) {
      console.error("Error getting proverbs by theme:", error);
      return [];
    }
  },

  getProverbById: async function (id) {
    try {
      const docRef = proverbsCollection.doc(id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return {
          id: docSnap.id,
          text: docSnap.data().proverb || "",
          literalMeaning: docSnap.data().literal_meaning || "",
          translation: docSnap.data().english_translation || "",
          theme: docSnap.data().theme || "",
        };
      } else {
        console.log("No such proverb!");
        return null;
      }
    } catch (error) {
      console.error("Error getting proverb:", error);
      return null;
    }
  },

  addProverbContribution: async function (data) {
    try {
      const contributionData = {
        proverb: data.text,
        literal_meaning: data.literalMeaning,
        english_translation: data.translation,
        theme: data.theme,
        source: data.source,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "pending",
      };

      const docRef = await contributionsCollection.add(contributionData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding proverb contribution:", error);
      throw error;
    }
  },

  searchProverbs: async function (searchTerm) {
    try {
      const proverbsSnapshot = await proverbsCollection.get();
      const proverbsList = proverbsSnapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().proverb || "",
        literalMeaning: doc.data().literal_meaning || "",
        translation: doc.data().english_translation || "",
        theme: doc.data().theme || "",
      }));

      const searchTermLower = searchTerm.toLowerCase();
      return proverbsList.filter(
        (proverb) =>
          proverb.text.toLowerCase().includes(searchTermLower) ||
          proverb.translation.toLowerCase().includes(searchTermLower) ||
          (proverb.literalMeaning &&
            proverb.literalMeaning.toLowerCase().includes(searchTermLower))
      );
    } catch (error) {
      console.error("Error searching proverbs:", error);
      return [];
    }
  },
};

// Make available globally
window.firebaseService = firebaseService;
