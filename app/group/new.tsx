// app/group/new.tsx
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { t } from "@/core/i18n";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function NewGroupScreen() {
  const [name, setName] = useState("");
  const [member1, setMember1] = useState("");
  const [member2, setMember2] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t("error"), t("enterGroupName"));
      return;
    }

    console.log("Create group (demo):", {
      name,
      members: [member1, member2].filter(Boolean),
    });

    router.back();
  };

  return (
    <AppScreen>
      <AppTopBar title={t("newGroup")} showBack />

      <View style={styles.field}>
        <ThemedText>{t("groupName")}</ThemedText>
        <ThemedTextInput
          value={name}
          onChangeText={setName}
          placeholder={t("groupNamePlaceholder")}
        />
      </View>

      <ThemedText type="subtitle">{t("membersDemo")}</ThemedText>

      <View style={styles.field}>
        <ThemedText>{t("member1")}</ThemedText>
        <ThemedTextInput
          value={member1}
          onChangeText={setMember1}
          placeholder={t("member1Placeholder")}
        />
      </View>

      <View style={styles.field}>
        <ThemedText>{t("member2")}</ThemedText>
        <ThemedTextInput
          value={member2}
          onChangeText={setMember2}
          placeholder={t("member2Placeholder")}
        />
      </View>

      <PrimaryButton label={t("saveDemo")} onPress={handleSave} />

      <ThemedText>{t("membersTodo")}</ThemedText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 4,
  },
});