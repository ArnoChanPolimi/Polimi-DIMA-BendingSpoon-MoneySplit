// app/(tabs)/index.tsx
import type { ExpenseType, GroupStatus } from "@/components/group/GroupCard"; // 只拿类型
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import { t } from "@/core/i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { GroupWithMembers } from "@/services/groupsStore";
import { listGroups } from "@/services/groupsStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// ========== 筛选类型 ==========
type TimeFilter = "all" | "lastYear" | "older";
type StatusFilter = "all" | GroupStatus;
type TypeFilter = "all" | ExpenseType;

// ========== 假数据 ==========
const demoGroups: GroupWithMembers[] = [
  {
    id: "1",
    name: "Paris Trip 2022",
    membersCount: 3,
    totalExpenses: 260,
    startDate: "2022-04-12",
    endDate: "2022-04-18",
    status: "finished",
    types: ["travel", "food", "transport"],
    ownerId: "me",
    members: [
      { id: "me", name: "You", avatarColor: "#2563eb", isOwner: true },
      { id: "bob", name: "Bob", avatarColor: "#f97316" },
      { id: "alice", name: "Alice", avatarColor: "#14b8a6" },
    ],
  },
  {
    id: "2",
    name: "Roommates Bills 2023",
    membersCount: 4,
    totalExpenses: 1520,
    startDate: "2023-01-01",
    endDate: null,
    status: "ongoing",
    types: ["household", "other"],
    ownerId: "me",
    members: [
      { id: "me", name: "You", avatarColor: "#2563eb", isOwner: true },
      { id: "carol", name: "Carol", avatarColor: "#22c55e" },
      { id: "dave", name: "Dave", avatarColor: "#eab308" },
      { id: "tom", name: "Tom", avatarColor: "#a855f7" },
    ],
  },
  {
    id: "3",
    name: "Italy Road Trip 2023",
    membersCount: 2,
    totalExpenses: 840,
    startDate: "2023-08-05",
    endDate: "2023-08-15",
    status: "finished",
    types: ["travel", "food", "transport"],
    ownerId: "me",
    members: [
      { id: "me", name: "You", avatarColor: "#2563eb", isOwner: true },
      { id: "bob", name: "Bob", avatarColor: "#f97316" },
    ],
  },
  {
    id: "4",
    name: "Milan Shopping 2024",
    membersCount: 3,
    totalExpenses: 430,
    startDate: "2024-03-10",
    endDate: "2024-03-10",
    status: "finished",
    types: ["shopping", "food"],
    ownerId: "me",
    members: [
      { id: "me", name: "You", avatarColor: "#2563eb", isOwner: true },
      { id: "alice", name: "Alice", avatarColor: "#14b8a6" },
      { id: "carol", name: "Carol", avatarColor: "#22c55e" },
    ],
  },
  {
    id: "5",
    name: "Ski Trip 2025",
    membersCount: 5,
    totalExpenses: 1290,
    startDate: "2025-01-20",
    endDate: "2025-01-26",
    status: "finished",
    types: ["travel", "food", "transport"],
    ownerId: "bob",
    members: [
      { id: "bob", name: "Bob", avatarColor: "#f97316", isOwner: true },
      { id: "me", name: "You", avatarColor: "#2563eb" },
      { id: "alice", name: "Alice", avatarColor: "#14b8a6" },
      { id: "tom", name: "Tom", avatarColor: "#a855f7" },
      { id: "carol", name: "Carol", avatarColor: "#22c55e" },
    ],
  },
  {
    id: "6",
    name: "Group Dinner & Drinks 2025",
    membersCount: 6,
    totalExpenses: 210,
    startDate: "2025-02-18",
    endDate: "2025-02-18",
    status: "ongoing",
    types: ["food", "other"],
    ownerId: "alice",
    members: [
      { id: "alice", name: "Alice", avatarColor: "#14b8a6", isOwner: true },
      { id: "me", name: "You", avatarColor: "#2563eb" },
      { id: "bob", name: "Bob", avatarColor: "#f97316" },
      { id: "carol", name: "Carol", avatarColor: "#22c55e" },
      { id: "dave", name: "Dave", avatarColor: "#eab308" },
      { id: "tom", name: "Tom", avatarColor: "#a855f7" },
    ],
  },
];

// ========== 类型标签 i18n ==========
function typeKey(type: ExpenseType | string) {
  switch (type) {
    case "travel":
      return "typeTravel";
    case "food":
      return "typeFoodDrinks";
    case "shopping":
      return "typeShopping";
    case "transport":
      return "typeTransport";
    case "household":
      return "typeHousehold";
    case "other":
      return "typeOther";
    default:
      return "typeOther";
  }
}

// ========== 单个 Group 卡片 ==========
function GroupCardLocal({
  group,
  borderColor,
  cardColor,
  muted,
  textColor,
}: {
  group: GroupWithMembers;
  borderColor: string;
  cardColor: string;
  muted: string;
  textColor: string;
}) {
  const isFinished = group.status === "finished";

  const owner =
    group.members?.find((m) => m.isOwner) ?? group.members?.find((m) => m.id === group.ownerId);

  const typesLabels = (group.types || []).map((tp) => t(typeKey(tp))).join(" · ");

  return (
    <Pressable onPress={() => router.push(`/group/${group.id}`)}>
      <ThemedView style={[styles.card, { borderColor, backgroundColor: cardColor }]}>
        {/* 第一行：状态 + 日期 */}
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isFinished ? cardColor : cardColor },
            ]}
          >
            <ThemedText style={[styles.statusText, { color: isFinished ? muted : textColor }]}>
              {isFinished ? t("finished") : t("notFinished")}
            </ThemedText>
          </View>

          <ThemedText style={styles.dateText}>
            {group.endDate
              ? `${group.startDate}  →  ${group.endDate}`
              : `${t("from")} ${group.startDate}`}
          </ThemedText>
        </View>

        {/* 第二行：群主头像 + 标题 */}
        <View style={styles.titleRow}>
          {owner && (
            <View style={[styles.ownerAvatar, { backgroundColor: owner.avatarColor || muted }]}>
              <ThemedText style={styles.ownerAvatarText}>
                {owner.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}

          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {group.name}
          </ThemedText>
        </View>

        {/* 第三行：成员数量 + 总金额 */}
        <ThemedText style={styles.membersLine}>
          {group.membersCount} {t("members")} · {group.totalExpenses.toFixed(2)} {group.currency ?? "€"}

        </ThemedText>

        {/* 第四行：消费类型 */}
        {!!typesLabels && <ThemedText style={styles.categoriesLine}>{typesLabels}</ThemedText>}

        {/* 第五行：头像一排 + 提示 */}
        <View style={styles.bottomRow}>
          <View style={styles.avatarsRow}>
            {group.members?.map((m) => (
              <View
                key={m.id}
                style={[styles.smallAvatar, { backgroundColor: m.avatarColor || muted }]}
              >
                <ThemedText style={styles.smallAvatarText}>
                  {m.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText style={styles.tapHint}>{t("tapToSeeBalances")}</ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

// ========== 页面组件 ==========
export default function GroupsScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);


  // theme colors
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const muted = useThemeColor({}, "icon");
  const primary = useThemeColor({}, "primary");
useFocusEffect(
  useCallback(() => {
    let alive = true;

    (async () => {
      const data = await listGroups();
      if (alive) setGroups(data);
    })();

    return () => {
      alive = false;
    };
  }, [])
);


  const filteredGroups = useMemo(() => {
    const now = new Date();
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

    return groups
      .filter((g) => {
        if (timeFilter !== "all") {
          const startMs = new Date(g.startDate).getTime();
          const diff = now.getTime() - startMs;
          if (timeFilter === "lastYear") {
            if (diff > ONE_YEAR_MS || diff < 0) return false;
          } else if (timeFilter === "older") {
            if (diff <= ONE_YEAR_MS) return false;
          }
        }

        if (statusFilter !== "all" && g.status !== statusFilter) return false;

        if (typeFilter !== "all" && !g.types.includes(typeFilter)) return false;

        return true;
      })
      .slice()
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [groups, timeFilter, statusFilter, typeFilter]);

  return (
    <AppScreen>
      <AppTopBar
        title={t("myGroups")}
        rightIconName="chatbubbles-outline"
        onRightIconPress={() => router.push("/friends")}
      />

      <ThemedText>{t("groupsIntro")}</ThemedText>

      {/* Filter 按钮 */}
      <View style={styles.filterToggleRow}>
        <Pressable
          style={[styles.filterButton, { borderColor, backgroundColor: cardColor }]}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Ionicons name="filter-outline" size={16} color={textColor} />
          <ThemedText style={styles.filterButtonText}>
            {showFilters ? t("hideFilters") : t("showFilters")}
          </ThemedText>
        </Pressable>
      </View>

      {/* Filter 面板 */}
      {showFilters && (
        <ThemedView style={[styles.filterPanel, { borderColor, backgroundColor: cardColor }]}>
          {/* Time */}
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            {t("time")}
          </ThemedText>
          <View style={styles.chipRow}>
            <FilterChip
              label={t("all")}
              active={timeFilter === "all"}
              onPress={() => setTimeFilter("all")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("last12Months")}
              active={timeFilter === "lastYear"}
              onPress={() => setTimeFilter("lastYear")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("olderThan1Year")}
              active={timeFilter === "older"}
              onPress={() => setTimeFilter("older")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
          </View>

          {/* Status */}
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            {t("status")}
          </ThemedText>
          <View style={styles.chipRow}>
            <FilterChip
              label={t("all")}
              active={statusFilter === "all"}
              onPress={() => setStatusFilter("all")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("finished")}
              active={statusFilter === "finished"}
              onPress={() => setStatusFilter("finished")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("notFinished")}
              active={statusFilter === "ongoing"}
              onPress={() => setStatusFilter("ongoing")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
          </View>

          {/* Expense type */}
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            {t("expenseType")}
          </ThemedText>
          <View style={styles.chipRow}>
            <FilterChip
              label={t("all")}
              active={typeFilter === "all"}
              onPress={() => setTypeFilter("all")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("typeTravel")}
              active={typeFilter === "travel"}
              onPress={() => setTypeFilter("travel")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("typeFoodDrinks")}
              active={typeFilter === "food"}
              onPress={() => setTypeFilter("food")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("typeShopping")}
              active={typeFilter === "shopping"}
              onPress={() => setTypeFilter("shopping")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("typeTransport")}
              active={typeFilter === "transport"}
              onPress={() => setTypeFilter("transport")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("typeHousehold")}
              active={typeFilter === "household"}
              onPress={() => setTypeFilter("household")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
            <FilterChip
              label={t("typeOther")}
              active={typeFilter === "other"}
              onPress={() => setTypeFilter("other")}
              borderColor={borderColor}
              cardColor={cardColor}
              primary={primary}
            />
          </View>
        </ThemedView>
      )}

      <View style={{ height: 8 }} />

      {filteredGroups.map((g) => (
        <GroupCardLocal
          key={g.id}
          group={g}
          borderColor={borderColor}
          cardColor={cardColor}
          muted={muted}
          textColor={textColor}
        />
      ))}

      {filteredGroups.length === 0 && <ThemedText>{t("noGroupsMatch")}</ThemedText>}

      <View style={{ height: 16 }} />
    </AppScreen>
  );
}

// ========== Chip ==========
interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  borderColor: string;
  cardColor: string;
  primary: string;
}

function FilterChip({ label, active, onPress, borderColor, cardColor, primary }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor, backgroundColor: cardColor },
        active && { backgroundColor: primary, borderColor: primary },
      ]}
    >
      <ThemedText style={active ? styles.chipTextActive : styles.chipText}>{label}</ThemedText>
    </Pressable>
  );
}

// ========== 样式 ==========
const styles = StyleSheet.create({
  filterToggleRow: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 13,
  },
  filterPanel: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  filterTitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  chipTextActive: {
    fontSize: 12,
    color: "white",
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
  },
  dateText: {
    fontSize: 11,
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  ownerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerAvatarText: {
    color: "white",
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 18,
  },
  membersLine: {
    marginTop: 4,
    fontSize: 13,
  },
  categoriesLine: {
    fontSize: 12,
    opacity: 0.8,
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  avatarsRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 4,
  },
  smallAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarText: {
    fontSize: 11,
    color: "white",
  },
  tapHint: {
    fontSize: 11,
    opacity: 0.7,
    flexShrink: 1,
    textAlign: "right",
  },
});