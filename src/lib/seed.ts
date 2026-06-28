import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export async function clearOpportunities() {
  const collectionRef = collection(db, 'opportunities');
  const snapshot = await getDocs(collectionRef);
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, 'opportunities', document.id));
  }
  console.log('Database cleared successfully');
}
