// components/group/GroupCard.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { t } from '@/core/i18n';
import { router } from 'expo-router';
import { Platform, Pressable, Text as RNText, StyleSheet, View } from 'react-native';

export type ExpenseType =
  | 'travel'
  | 'food'
  | 'shopping'
  | 'transport'
  | 'household'
  | 'other';

export type GroupStatus = 'finished' | 'ongoing';

export type Group = {
  id: string;
  name: string;
  membersCount: number;
  totalExpenses: number;
  startDate: string;    // 'YYYY-MM-DD'
  endDate?: string | null;
  status: GroupStatus;
  types: ExpenseType[]; // 这个 group 里出现过的消费类型
};

const typeLabelMap: Record<ExpenseType, string> = {
  travel: t('typeTravel'),
  food: t('typeFoodDrinks'),
  shopping: t('typeShopping'),
  transport: t('typeTransport'),
  household: t('typeHousehold'),
  other: t('typeOther'),
};

function formatDateRange(group: Group): string {
  if (!group.endDate) {
    return `${t('from')} ${group.startDate}`;
  }
  return `${group.startDate} → ${group.endDate}`;
}

export default function GroupCard({ group }: { group: Group }) {
  const dateRangeLabel = formatDateRange(group);
  const typesLabel = group.types.map((t) => typeLabelMap[t]).join(' · ');

  return (
    <Pressable onPress={() => router.push(`/group/${group.id}`)}>
      <ThemedView style={styles.card}>
        {/* 顶部：状态角标 + 日期 */}
        <View style={styles.headerRow}>
          {group.status === 'ongoing' && (
            <ThemedView style={styles.badge}>
              <ThemedText style={styles.badgeText}>{t('notFinished')}</ThemedText>
            </ThemedView>
          )}

          <ThemedText style={styles.dateText}>{dateRangeLabel}</ThemedText>
        </View>

        {/* 名称 */}
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {group.name}
        </ThemedText>

        {/* 成员 & 总额 */}
        {/* 成员 & 总额 */}
        <View style={styles.row}>
          <ThemedText style={styles.membersText}>
            {group.membersCount} {t('members')}
          </ThemedText>
          
          {/* 使用 RNText 强制打破主题颜色限制 */}
          <View style={styles.amountBadge}>
            <RNText style={styles.amountValue}>
              {group.totalExpenses.toFixed(2)} €
            </RNText>
          </View>
        </View>

        {/* 消费类型 */}
        <ThemedText style={styles.types}>
          {typesLabel}
        </ThemedText>

        <ThemedText style={styles.hint}>
          {t('tapToSeeBalances')}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badge: {
    backgroundColor: '#fee2e2', // 淡红
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginRight: 8,
  },
  badgeText: {
    color: '#b91c1c', // 深红
    fontSize: 11,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  name: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // 确保垂直对齐
    marginTop: 4,
  },
  membersText: {
    fontSize: 13,
    opacity: 0.8,
  },
  types: {
    fontSize: 12,
    opacity: 0.8,
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.6,
  },
  amountBadge: {
    backgroundColor: 'red', // 强制亮白
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,           // 加粗边框
    borderColor: '#000000',   // 用黑色边框把白色和蓝色背景强行隔开
    // 确保阴影不被切断
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '900',        // 极粗
    color: '#000000',         // 强制纯黑文字
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});