import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDHhRpBphM4fdmEA3BbOTiHcuT3V2k4lpU',
  appId: '1:398537824373:android:dbd4c18d09db871cafc03c',
  messagingSenderId: '398537824373',
  projectId: 'supermarketapp-55d3a',
  storageBucket: 'supermarketapp-55d3a.firebasestorage.app',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
