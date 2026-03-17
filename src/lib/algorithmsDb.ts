import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { algorithmInfoMap, type AlgorithmInfo } from "./algorithms";

export const ALGORITHMS_COLLECTION = "algorithms";

// Types
export interface AlgorithmDocument extends AlgorithmInfo {
  id: string; // "bubble", "selection", etc.
}

/**
 * Fetch all algorithms from Firestore.
 */
export async function fetchAlgorithmsFromDb(): Promise<AlgorithmDocument[]> {
  const querySnapshot = await getDocs(collection(db, ALGORITHMS_COLLECTION));
  const algorithms: AlgorithmDocument[] = [];
  querySnapshot.forEach((docSnap) => {
    algorithms.push({ id: docSnap.id, ...docSnap.data() } as AlgorithmDocument);
  });
  return algorithms;
}

/**
 * Seed the algorithms into Firestore from the static map.
 * This is meant to be run once by an admin to populate the database.
 */
export async function seedAlgorithms() {
  const entries = Object.entries(algorithmInfoMap);
  const promises = entries.map(async ([key, info]) => {
    const docRef = doc(db, ALGORITHMS_COLLECTION, key);
    await setDoc(docRef, info);
    console.log(`Seeded algorithm: ${key}`);
  });
  
  await Promise.all(promises);
  console.log("Finished seeding algorithms to Firestore.");
}
