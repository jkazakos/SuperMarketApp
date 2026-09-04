import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBLC1mD6V64oYQXdqTsSMdTXxHIyV0ZPDE',
  authDomain: 'supermarketapp-55d3a.firebaseapp.com',
  projectId: 'supermarketapp-55d3a',
  storageBucket: 'supermarketapp-55d3a.firebasestorage.app',
  messagingSenderId: '398537824373',
  appId: '1:398537824373:web:25899db54c569699afc03c',
  measurementId: 'G-2JWZFL3WWR',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
