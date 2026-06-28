import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { BusinessOpportunity } from '../types';
export { clearOpportunities } from './seed';

export async function fetchOpportunities(): Promise<BusinessOpportunity[]> {
  try {
    const collectionRef = collection(db, 'opportunities');
    const snapshot = await getDocs(collectionRef);
    const opportunities: BusinessOpportunity[] = [];
    const demoIds = ['opp-1', 'opp-2', 'opp-3', 'opp-4', 'opp-5', 'opp-6'];
    snapshot.forEach((doc) => {
      if (!demoIds.includes(doc.id)) {
        opportunities.push({ id: doc.id, ...doc.data() } as BusinessOpportunity);
      }
    });
    return opportunities;
  } catch (e) {
    console.error("Error fetching opportunities from Firestore:", e);
    return [];
  }
}

export async function addOpportunity(opportunity: BusinessOpportunity): Promise<void> {
  try {
    const collectionRef = collection(db, 'opportunities');
    await addDoc(collectionRef, opportunity);
    console.log("Document written successfully");
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}

export async function updateOpportunity(opportunityId: string, data: Partial<BusinessOpportunity>): Promise<void> {
  try {
    const docRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(docRef, data);
    console.log("Opportunity updated successfully in Firestore");
  } catch (e) {
    console.error("Error updating opportunity: ", e);
    throw e;
  }
}
