import { auth, db } from "@/services/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

export default function InviteScreen() {
  const { expenseId, code } = useLocalSearchParams();

  useEffect(() => {
    const joinExpense = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Please log in first");
        return;
      }

      if (!expenseId || !code) {
        Alert.alert("Invalid invite link");
        return;
      }

      const ref = doc(db, "expenses", String(expenseId));
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        Alert.alert("Expense not found");
        return;
      }

      const data = snap.data();
      if (data.inviteCode !== code) {
        Alert.alert("Invalid invite code");
        return;
      }

      await updateDoc(ref, {
        participants: arrayUnion(user.uid),
      });

      Alert.alert("Joined expense!");
      router.replace("/(tabs)");
    };

    joinExpense();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
