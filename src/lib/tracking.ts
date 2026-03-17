import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AlgorithmVisit {
  algorithm: string;
  page: "visualizer" | "compare";
  timestamp: ReturnType<typeof serverTimestamp>;
}

export interface UserStats {
  totalVisits: number;
  algorithmCounts: Record<string, number>;
  lastVisit: ReturnType<typeof serverTimestamp>;
}

/** Record an algorithm visit */
export async function trackAlgorithmVisit(
  userId: string,
  algorithm: string,
  page: "visualizer" | "compare"
) {
  // Add to visits subcollection
  const visitsRef = collection(db, "users", userId, "visits");
  await addDoc(visitsRef, {
    algorithm,
    page,
    timestamp: serverTimestamp(),
  });

  // Update aggregate stats
  const statsRef = doc(db, "users", userId);
  const statsSnap = await getDoc(statsRef);

  if (statsSnap.exists()) {
    await updateDoc(statsRef, {
      totalVisits: increment(1),
      [`algorithmCounts.${algorithm}`]: increment(1),
      lastVisit: serverTimestamp(),
    });
  } else {
    await setDoc(statsRef, {
      totalVisits: 1,
      algorithmCounts: { [algorithm]: 1 },
      lastVisit: serverTimestamp(),
    });
  }
}

/** Get recent visits */
export async function getRecentVisits(userId: string, count = 20) {
  const visitsRef = collection(db, "users", userId, "visits");
  const q = query(visitsRef, orderBy("timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get user stats */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const statsRef = doc(db, "users", userId);
  const snap = await getDoc(statsRef);
  if (!snap.exists()) return null;
  return snap.data() as UserStats;
}
