// app/group/[groupId]/index.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import { t } from "@/core/i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

// ====== 类型定义 ======
type GroupStatus = "finished" | "ongoing";

type GroupMember = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarColor: string;
  balance: number; // >0: owes; <0: should receive; 0: settled
  source: "search" | "contacts" | "qr";
};

type GroupDetail = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  status: GroupStatus;
  totalExpenses: number;
  members: GroupMember[];
};

// ====== 假数据 ======
const DEMO_GROUPS: Record<string, GroupDetail> = {
  "1": {
    id: "1",
    name: "Paris Trip 2022",
    description: "Spring trip to Paris with friends.",
    startDate: "2022-04-12",
    endDate: "2022-04-18",
    status: "finished",
    totalExpenses: 260,
    members: [
      {
        id: "me",
        name: "You",
        email: "you@example.com",
        avatarColor: "#2563eb",
        balance: -60,
        source: "search",
      },
      {
        id: "bob",
        name: "Bob",
        email: "bob@example.com",
        avatarColor: "#f97316",
        balance: 30,
        source: "contacts",
      },
      {
        id: "alice",
        name: "Alice",
        email: "alice@example.com",
        avatarColor: "#14b8a6",
        balance: 30,
        source: "qr",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Roommates Bills 2023",
    description: "Monthly flat bills and shared groceries.",
    startDate: "2023-01-01",
    endDate: null,
    status: "ongoing",
    totalExpenses: 1520,
    members: [
      {
        id: "me",
        name: "You",
        avatarColor: "#2563eb",
        balance: 0,
        source: "search",
      },
      {
        id: "carol",
        name: "Carol",
        avatarColor: "#22c55e",
        balance: 80,
        source: "contacts",
      },
      {
        id: "dave",
        name: "Dave",
        avatarColor: "#eab308",
        balance: -80,
        source: "search",
      },
    ],
  },
};

// ====== 文案/格式化工具 ======
function formatDateRange(group: GroupDetail) {
  if (!group.endDate) return `${t("from")} ${group.startDate}`;
  return `${group.startDate} → ${group.endDate}`;
}

function buildReminderText(group: GroupDetail, member: GroupMember) {
  const amount = member.balance.toFixed(2);
  return t("reminderMessageTemplate")
    .replace("{name}", member.name)
    .replace("{amount}", amount)
    .replace("{group}", group.name);
}

function formatBalance(b: number) {
  if (b > 0) return { key: "owes" as const, amount: b.toFixed(2) };
  if (b < 0) return { key: "shouldReceive" as const, amount: (-b).toFixed(2) };
  return { key: "settled" as const, amount: "" };
}

export default function GroupDetailScreen() {
  // ✅ 关键修复：groupId 可能是 string | string[] | undefined
  const params = useLocalSearchParams<{ groupId?: string | string[] }>();
  const groupIdParam = params.groupId;

  // ✅ 永远得到一个 string
  const groupId: string =
    typeof groupIdParam === "string"
      ? groupIdParam
      : Array.isArray(groupIdParam)
      ? groupIdParam[0] ?? "1"
      : "1";

  // ✅ 永远是 GroupDetail（不会变 union）
  const initialGroup: GroupDetail = DEMO_GROUPS[groupId] ?? DEMO_GROUPS["1"];

  const [members, setMembers] = useState<GroupMember[]>(initialGroup.members);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<"none" | "search" | "contacts" | "qr">("none");

  // 合成最新 group（含 members state）
  const group: GroupDetail = useMemo(
    () => ({
      ...initialGroup,
      members,
    }),
    [initialGroup, members]
  );

  const outstandingMembers = useMemo(() => members.filter((m) => m.balance > 0), [members]);

  // ====== 主题色 ======
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const primary = useThemeColor({}, "primary");
  const muted = useThemeColor({}, "icon");

  // 状态色（集中定义）
  const danger = "#b91c1c";
  const success = "#15803d";

  // ====== Reminder 逻辑 ======
  const handleRemindMember = (member: GroupMember) => {
    const text = buildReminderText(group, member);

    Alert.alert(
      t("sendReminderDemoTitle"),
      t("sendReminderDemoBody").replace("{name}", member.name).replace("{text}", text)
    );
  };

  const handleRemindAll = () => {
    if (outstandingMembers.length === 0) {
      Alert.alert(t("everyoneSettledTitle"), t("everyoneSettledBody"));
      return;
    }

    const list = outstandingMembers
      .map((m) => `• ${m.name}: ${m.balance.toFixed(2)} €`)
      .join("\n");

    Alert.alert(t("sendRemindersDemoTitle"), t("sendRemindersDemoBody").replace("{list}", list));
  };

  // 模拟从“搜索 / 通讯录 / 扫码”加人
  const addMemberFromDemo = (who: "bob" | "alice" | "tom", source: "search" | "contacts" | "qr") => {
    const exists = members.some((m) => m.id === who);
    if (exists) {
      Alert.alert(t("alreadyMemberTitle"), t("alreadyMemberBody"));
      return;
    }

    const demoMap: Record<typeof who, GroupMember> = {
      bob: {
        id: "bob",
        name: "Bob",
        email: "bob@example.com",
        avatarColor: "#f97316",
        balance: 20,
        source,
      },
      alice: {
        id: "alice",
        name: "Alice",
        email: "alice@example.com",
        avatarColor: "#14b8a6",
        balance: 0,
        source,
      },
      tom: {
        id: "tom",
        name: "Tom",
        phone: "+39 123 456",
        avatarColor: "#a855f7",
        balance: 15,
        source,
      },
    };

    setMembers((prev) => [...prev, demoMap[who]]);
    Alert.alert(t("memberAddedTitle"), t("memberAddedBody").replace("{name}", demoMap[who].name));
  };

  return (
    <AppScreen>
      <AppTopBar
        title={group.name}
        showBack
        rightIconName="chatbubbles-outline"
        onRightIconPress={() => router.push(`/group/${group.id}/chat`)}
      />

      {/* 基本信息 */}
      <ThemedText style={styles.dateText}>
        {formatDateRange(group)} · {group.members.length} {t("members")}
      </ThemedText>

      <ThemedText style={styles.totalText}>
        {t("totalExpenses")}: {group.totalExpenses.toFixed(2)} €
      </ThemedText>

      {!!group.description && <ThemedText style={styles.description}>{group.description}</ThemedText>}

      <View style={{ height: 12 }} />

      {/* Members */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {t("membersTitle")}
      </ThemedText>

      <ThemedView style={[styles.membersCard, { borderColor, backgroundColor: cardColor }]}>
        {members.map((m) => {
          const info = formatBalance(m.balance);
          const label =
            info.key === "settled"
              ? t("settled")
              : info.key === "owes"
              ? t("owesAmount").replace("{amount}", info.amount)
              : t("shouldReceiveAmount").replace("{amount}", info.amount);

          const color = info.key === "owes" ? danger : info.key === "shouldReceive" ? success : muted;

          return (
            <View key={m.id} style={styles.memberRow}>
              <View style={styles.memberLeft}>
                <View style={[styles.avatar, { backgroundColor: m.avatarColor }]}>
                  <ThemedText style={styles.avatarText}>{m.name.charAt(0).toUpperCase()}</ThemedText>
                </View>

                <View style={{ gap: 2 }}>
                  <ThemedText type="defaultSemiBold">{m.name}</ThemedText>
                  <ThemedText style={[styles.balanceText, { color }]}>{label}</ThemedText>
                </View>
              </View>

              {m.balance > 0 && (
                <Pressable onPress={() => handleRemindMember(m)} style={[styles.remindButton, { borderColor: danger }]}>
                  <ThemedText style={[styles.remindButtonText, { color: danger }]}>{t("remind")}</ThemedText>
                </Pressable>
              )}
            </View>
          );
        })}

        <View style={styles.membersFooter}>
          <Pressable onPress={handleRemindAll} style={styles.remindAllButton}>
            <Ionicons name="notifications-outline" size={16} color={textColor} />
            <ThemedText style={styles.remindAllText}>{t("remindAllWhoOwe")}</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <View style={{ height: 16 }} />

      {/* Invite */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {t("invitePeople")}
      </ThemedText>

      <ThemedView style={[styles.inviteCard, { borderColor, backgroundColor: cardColor }]}>
        <ThemedText style={styles.inviteHint}>{t("inviteHint")}</ThemedText>

        <View style={styles.inviteButtonsRow}>
          <InviteButton
            label={t("searchAccount")}
            icon="search-outline"
            active={inviteMode === "search"}
            onPress={() => {
              setInvitePanelOpen(true);
              setInviteMode("search");
            }}
            borderColor={borderColor}
            cardColor={cardColor}
            primary={primary}
            textColor={textColor}
            backgroundColor={backgroundColor}
          />
          <InviteButton
            label={t("fromContacts")}
            icon="people-circle-outline"
            active={inviteMode === "contacts"}
            onPress={() => {
              setInvitePanelOpen(true);
              setInviteMode("contacts");
            }}
            borderColor={borderColor}
            cardColor={cardColor}
            primary={primary}
            textColor={textColor}
            backgroundColor={backgroundColor}
          />
          <InviteButton
            label={t("showQR")}
            icon="qr-code-outline"
            active={inviteMode === "qr"}
            onPress={() => {
              setInvitePanelOpen(true);
              setInviteMode("qr");
            }}
            borderColor={borderColor}
            cardColor={cardColor}
            primary={primary}
            textColor={textColor}
            backgroundColor={backgroundColor}
          />
        </View>

        {invitePanelOpen && inviteMode === "search" && (
          <InvitePanel
            title={t("searchAccountsDemoTitle")}
            hint={t("searchAccountsDemoHint")}
            borderColor={borderColor}
            cardColor={cardColor}
          >
            <DemoInviteRow label={`Bob · bob@example.com`} onPress={() => addMemberFromDemo("bob", "search")} textColor={textColor} />
            <DemoInviteRow label={`Alice · alice@example.com`} onPress={() => addMemberFromDemo("alice", "search")} textColor={textColor} />
          </InvitePanel>
        )}

        {invitePanelOpen && inviteMode === "contacts" && (
          <InvitePanel
            title={t("fromContactsDemoTitle")}
            hint={t("fromContactsDemoHint")}
            borderColor={borderColor}
            cardColor={cardColor}
          >
            <DemoInviteRow label={`Tom · +39 123 456`} onPress={() => addMemberFromDemo("tom", "contacts")} textColor={textColor} />
            <DemoInviteRow label={`Bob · +39 987 654`} onPress={() => addMemberFromDemo("bob", "contacts")} textColor={textColor} />
          </InvitePanel>
        )}

        {invitePanelOpen && inviteMode === "qr" && (
          <InvitePanel
            title={t("qrDemoTitle")}
            hint={t("qrDemoHint")}
            borderColor={borderColor}
            cardColor={cardColor}
          >
            <View style={[styles.qrPlaceholder, { borderColor, backgroundColor: cardColor }]}>
              <Ionicons name="qr-code-outline" size={48} color={textColor} />
              <ThemedText style={{ marginTop: 4 }}>{t("qrPreview")}</ThemedText>
            </View>
          </InvitePanel>
        )}

        {invitePanelOpen && (
          <View style={styles.invitePanelFooter}>
            <Pressable
              onPress={() => {
                setInvitePanelOpen(false);
                setInviteMode("none");
              }}
            >
              <ThemedText style={styles.closeInviteText}>{t("close")}</ThemedText>
            </Pressable>
          </View>
        )}
      </ThemedView>

      <View style={{ height: 16 }} />

      {/* Expenses placeholder */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {t("expensesTodoTitle")}
      </ThemedText>
      <ThemedText>{t("expensesTodoBody")}</ThemedText>
    </AppScreen>
  );
}

// ===== 小组件 =====
type InviteButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  borderColor: string;
  cardColor: string;
  primary: string;
  textColor: string;
  backgroundColor: string;
};

function InviteButton({
  label,
  icon,
  active,
  onPress,
  borderColor,
  cardColor,
  primary,
  textColor,
  backgroundColor,
}: InviteButtonProps) {
  const activeBg = backgroundColor;
  return (
    <Pressable
      style={[
        styles.inviteButton,
        { borderColor, backgroundColor: cardColor },
        active && { borderColor: primary, backgroundColor: activeBg },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={textColor} />
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}

type InvitePanelProps = {
  title: string;
  hint: string;
  children: React.ReactNode;
  borderColor: string;
  cardColor: string;
};

function InvitePanel({ title, hint, children, borderColor, cardColor }: InvitePanelProps) {
  return (
    <ThemedView style={[styles.invitePanel, { borderColor, backgroundColor: cardColor }]}>
      <ThemedText style={styles.invitePanelTitle}>{title}</ThemedText>
      <ThemedText style={styles.invitePanelHint}>{hint}</ThemedText>
      {children}
    </ThemedView>
  );
}

type DemoInviteRowProps = {
  label: string;
  onPress: () => void;
  textColor: string;
};

function DemoInviteRow({ label, onPress, textColor }: DemoInviteRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.demoInviteRow}>
      <ThemedText>{label}</ThemedText>
      <Ionicons name="add-circle-outline" size={20} color={textColor} />
    </Pressable>
  );
}

// ===== 样式 =====
const styles = StyleSheet.create({
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  totalText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },

  membersCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 4,
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "white",
  },
  balanceText: {
    fontSize: 12,
  },
  remindButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  remindButtonText: {
    fontSize: 12,
  },
  membersFooter: {
    marginTop: 4,
    alignItems: "flex-start",
  },
  remindAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  remindAllText: {
    fontSize: 12,
  },

  inviteCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  inviteHint: {
    fontSize: 12,
    opacity: 0.8,
  },
  inviteButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  invitePanel: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 6,
  },
  invitePanelTitle: {
    fontWeight: "600",
    fontSize: 13,
  },
  invitePanelHint: {
    fontSize: 12,
    opacity: 0.8,
  },
  qrPlaceholder: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  invitePanelFooter: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  closeInviteText: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
  demoInviteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
});