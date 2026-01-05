// services/expenseApi.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10);
}

export async function createExpense(data: {
  title: string;
  amount: number;
  currency: string;
  participantIds: string[];
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const inviteCode = generateInviteCode();

  const docRef = await addDoc(collection(db, "expenses"), {
    title: data.title,
    amount: data.amount,
    currency: data.currency,
    ownerId: user.uid,
    participants: data.participantIds,
    inviteCode,
    createdAt: serverTimestamp(),
  });

  return {
    expenseId: docRef.id,
    inviteCode,
  };
}
