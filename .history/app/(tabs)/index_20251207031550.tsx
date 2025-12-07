// app/(tabs)/index.tsx

import type {
  ExpenseType,
  Group,
  GroupStatus,
} from "@/components/group/GroupCard"; // 现在只拿类型，不再用里面的 UI 组件

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AppScreen from "@/components/ui/AppScreen";
import AppTopBar from "@/components/ui/AppTopBar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// ========== 筛选类型 ==========
type TimeFilter = "all" | "lastYear" | "older";
type StatusFilter = "all" | GroupStatus;
type TypeFilter = "all" | ExpenseType;

// ========== 假数据：跨 3 年的旅游 / 购物记录 ==========
// 注意：这里的结构是 Group 类型 + ownerId + members
const demoGroups: Group[] = [
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

// ========== 把类型值变成人话标签 ==========
function formatTypeLabel(type: ExpenseType | string): string {
  switch (type) {
    case "travel":
      return "Travel";
    case "food":
      return "Food & drinks";
    case "shopping":
      return "Shopping";
    case "transport":
      return "Transport";
    case "household":
      return "Household";
    case "other":
      return "Other";
    default:
      return String(type);
  }
}

// ========== 单个 Group 卡片（包含：状态 + 群主头像 + 左下角一排头像） ==========
function GroupCardLocal({ group }: { group: Group }) {
  const isFinished = group.status === "finished";

  const owner =
    group.members?.find((m) => m.isOwner) ??
    group.members?.find((m) => m.id === group.ownerId);

  const typesLabels = (group.types || []).map(formatTypeLabel).join(" · ");

  return (
    <Pressable onPress={() => router.push(`/group/${group.id}`)}>
      <ThemedView style={styles.card}>
        {/* 第一行：状态 + 日期 */}
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.statusPill,
              isFinished ? styles.statusFinished : styles.statusOngoing,
            ]}
          >
            <ThemedText
              style={isFinished ? styles.statusTextFinished : styles.statusTextOngoing}
            >
              {isFinished ? "Finished" : "Not Finished"}
            </ThemedText>
          </View>

          <ThemedText style={styles.dateText}>
            {group.endDate
              ? `${group.startDate}  →  ${group.endDate}`
              : `From ${group.startDate}`}
          </ThemedText>
        </View>

        {/* 第二行：群主头像 + 标题 */}
        <View style={styles.titleRow}>
          {owner && (
            <View
              style={[
                styles.ownerAvatar,
                { backgroundColor: owner.avatarColor || "#9ca3af" },
              ]}
            >
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
          {group.membersCount} members · {group.totalExpenses.toFixed(2)} €
        </ThemedText>

        {/* 第四行：消费类型 */}
        {!!typesLabels && (
          <ThemedText style={styles.categoriesLine}>{typesLabels}</ThemedText>
        )}

        {/* 第五行：左下角成员头像一排 + 右侧提示文字 */}
        <View style={styles.bottomRow}>
          {/* 左下角：所有参与成员的头像 */}
          <View style={styles.avatarsRow}>
            {group.members?.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.smallAvatar,
                  { backgroundColor: m.avatarColor || "#9ca3af" },
                ]}
              >
                <ThemedText style={styles.smallAvatarText}>
                  {m.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* 右边提示 */}
          <ThemedText style={styles.tapHint}>
            Tap to see balances and expenses
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

// ========== 页面组件：包含 Filter + 列表 ==========
export default function GroupsScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredGroups = useMemo(() => {
    const now = new Date();
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

    return demoGroups
      .filter((g) => {
        // 时间筛选
        if (timeFilter !== "all") {
          const startMs = new Date(g.startDate).getTime();
          const diff = now.getTime() - startMs;
          if (timeFilter === "lastYear") {
            if (diff > ONE_YEAR_MS || diff < 0) {
              return false;
            }
          } else if (timeFilter === "older") {
            if (diff <= ONE_YEAR_MS) {
              return false;
            }
          }
        }

        // 状态筛选
        if (statusFilter !== "all" && g.status !== statusFilter) {
          return false;
        }

        // 类型筛选
        if (typeFilter !== "all" && !g.types.includes(typeFilter)) {
          return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => {
        // 时间越早越靠前
        const aMs = new Date(a.startDate).getTime();
        const bMs = new Date(b.startDate).getTime();
        return aMs - bMs;
      });
  }, [timeFilter, statusFilter, typeFilter]);

  return (
    <AppScreen>
      <AppTopBar
        title="My Groups"
        rightIconName="chatbubbles-outline"
        onRightIconPress={() => router.push("/friends")}
      />

      <ThemedText>
        Create a group for each trip or set of friends, then add expenses.
      </ThemedText>

      {/* 顶部 Filter 按钮 */}
      <View style={styles.filterToggleRow}>
        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilters((prev) => !prev)}
        >
          <Ionicons name="filter-outline" size={16} />
          <ThemedText style={styles.filterButtonText}>
            {showFilters ? "Hide filters" : "Show filters"}
          </ThemedText>
        </Pressable>
      </View>

      {/* Filter 面板 */}
      {showFilters && (
        <ThemedView style={styles.filterPanel}>
          {/* 时间筛选 */}
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            Time
          </ThemedText>
          <View style={styles.chipRow}>
            <FilterChip
              label="All"
              active={timeFilter === "all"}
              onPress={() => setTimeFilter("all")}
            />
            <FilterChip
              label="Last 12 months"
              active={timeFilter === "lastYear"}
              onPress={() => setTimeFilter("lastYear")}
            />
            <FilterChip
              label="Older than 1 year"
              active={timeFilter === "older"}
              onPress={() => setTimeFilter("older")}
            />
          </View>

          {/* 完成状态筛选 */}
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            Status
          </ThemedText>
          <View style={styles.chipRow}>
            <FilterChip
              label="All"
              active={statusFilter === "all"}
              onPress={() => setStatusFilter("all")}
            />
            <FilterChip
              label="Finished"
              active={statusFilter === "finished"}
              onPress={() => setStatusFilter("finished")}
            />
            <FilterChip
              label="Not finished"
              active={statusFilter === "ongoing"}
              onPress={() => setStatusFilter("ongoing")}
            />
          </View>

          {/* 消费类型筛选 */}
          <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
            Expense type
          </ThemedText>
          <View style={styles.chipRow}>
            <FilterChip
              label="All"
              active={typeFilter === "all"}
              onPress={() => setTypeFilter("all")}
            />
            <FilterChip
              label="Travel"
              active={typeFilter === "travel"}
              onPress={() => setTypeFilter("travel")}
            />
            <FilterChip
              label="Food & drinks"
              active={typeFilter === "food"}
              onPress={() => setTypeFilter("food")}
            />
            <FilterChip
              label="Shopping"
              active={typeFilter === "shopping"}
              onPress={() => setTypeFilter("shopping")}
            />
            <FilterChip
              label="Transport"
              active={typeFilter === "transport"}
              onPress={() => setTypeFilter("transport")}
            />
            <FilterChip
              label="Household"
              active={typeFilter === "household"}
              onPress={() => setTypeFilter("household")}
            />
            <FilterChip
              label="Other"
              active={typeFilter === "other"}
              onPress={() => setTypeFilter("other")}
            />
          </View>
        </ThemedView>
      )}

      {/* 分割线 */}
      <View style={{ height: 8 }} />

      {/* Group 列表：用我们自己写的 GroupCardLocal */}
      {filteredGroups.map((g) => (
        <GroupCardLocal key={g.id} group={g} />
      ))}

      {filteredGroups.length === 0 && (
        <ThemedText>No groups match current filters.</ThemedText>
      )}

      <View style={{ height: 16 }} />
    </AppScreen>
  );
}

// ========== 小小的 Chip 组件，用来当筛选按钮 ==========
interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <ThemedText style={active ? styles.chipTextActive : styles.chipText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// ========== 样式 ==========
const styles = StyleSheet.create({
  // —— Filter 一堆保持不变 ——
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
    borderColor: "#ddd",
  },
  filterButtonText: {
    fontSize: 13,
  },
  filterPanel: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
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
    borderColor: "#ddd",
  },
  chipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    fontSize: 12,
  },
  chipTextActive: {
    fontSize: 12,
    color: "white",
  },

  // —— Group 卡片相关样式（新增的） ——
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  statusFinished: {
    backgroundColor: "#f3f4f6",
  },
  statusOngoing: {
    backgroundColor: "#fee2e2",
  },
  statusTextFinished: {
    fontSize: 11,
    color: "#6b7280",
  },
  statusTextOngoing: {
    fontSize: 11,
    color: "#b91c1c",
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
