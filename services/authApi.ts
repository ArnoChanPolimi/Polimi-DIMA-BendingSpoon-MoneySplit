// services/authApi.ts
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

export type Session = { token: string; user: { id: string; email: string } };

export async function loginApi(email: string, password: string): Promise<Session> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  return { token, user: { id: cred.user.uid, email: cred.user.email ?? email } };
}

export async function signupApi(email: string, password: string): Promise<Session> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  return { token, user: { id: cred.user.uid, email: cred.user.email ?? email } };
}

export async function resetPasswordApi(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}