// services\authApi.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// 1. 引入 JSON
import defaultFriendsRaw from '../assets/data/friends.json';

// 2. 在外层就定义好类型，不要在循环里写括号强转
const defaultFriends = defaultFriendsRaw as any[];

export type Session = { token: string; user: { id: string; email: string } }

export async function signupApi(email: string, password: string): Promise<Session> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  const user = cred.user;
  const myUid = user.uid;
  const myUsername = email.split('@')[0];

  // 3. 存储用户本人信息
  await setDoc(doc(db, 'users', myUid), {
    uid: myUid,
    username: myUsername,
    displayName: myUsername,
    avatar: `https://ui-avatars.com/api/?name=${myUsername}`,
    addedAt: Date.now(),
  });

  // 4. 使用已经定性好的数组，去掉循环里的 (defaultFriends as any[])
  for (const friend of defaultFriends) {
    const friendRef = doc(db, 'users', myUid, 'friends', friend.username);
    await setDoc(friendRef, {
      uid: friend.uid,
      username: friend.username,
      displayName: friend.displayName,
      avatar: friend.avatar,
      addedAt: friend.addedAt || Date.now(),
    });
  }

  return { token, user: { id: myUid, email: user.email ?? email } };
}