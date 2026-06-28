import { db } from './firebase';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Investment, PlatformUser } from '../types';

export async function fetchInvestments(userId: string): Promise<Investment[]> {
  const q = query(collection(db, 'investments'), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Investment));
}

export async function addInvestment(investment: Investment & { userId: string }): Promise<void> {
  await addDoc(collection(db, 'investments'), investment);
}

export async function fetchPlatformUsers(): Promise<PlatformUser[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as PlatformUser));
}

export async function updatePlatformUser(userId: string, data: Partial<PlatformUser>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), data);
}

export async function deletePlatformUser(userId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId));
}

export async function getOrCreatePlatformUser(userId: string, email: string, address: string): Promise<PlatformUser> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as PlatformUser;
  } else {
    const newUser: PlatformUser = {
      address,
      email,
      kyc: 'Verified',
      balance: 0, // Starting simulated balance is 0
      joined: new Date().toISOString()
    };
    await setDoc(docRef, newUser);
    return newUser;
  }
}
