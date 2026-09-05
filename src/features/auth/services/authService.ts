import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/core/config/firebase';
import { UserProfile } from '../types';

export class AuthService {
  static watchAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  static async signIn(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    return cred.user;
  }

  static async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
    const user = cred.user;

    const fullName = `${firstName} ${lastName}`.trim();
    await updateProfile(user, { displayName: fullName });

    const profile: UserProfile = {
      userId: user.uid,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);
    return user;
  }

  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  }

  static watchUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
    return onSnapshot(doc(db, 'users', userId), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(null);
      }
    });
  }
}
