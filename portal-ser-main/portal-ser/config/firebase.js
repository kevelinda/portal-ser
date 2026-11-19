import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Configurações reais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAIawHMklauJ4grKuZw3rDJKiwbknGG_NY",
  authDomain: "projetoser-cda7a.firebaseapp.com",
  databaseURL: "https://projetoser-cda7a-default-rtdb.firebaseio.com",
  projectId: "projetoser-cda7a",
  storageBucket: "projetoser-cda7a.firebasestorage.app",
  messagingSenderId: "599134232450",
  appId: "1:599134232450:web:7170befa9bca01ef1ab99b",
  measurementId: "G-REZ9J27ZE8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Conecta ao Realtime Database
const db = getDatabase(app);

// Exporta a conexão para utilizar nas pgs
export { app, db };
