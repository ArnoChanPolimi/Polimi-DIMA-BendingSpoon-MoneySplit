// app/group/[groupId]/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

// ====== 类型定义 ======

type GroupStatus = 'finished' | 'ongoing';

type GroupMember = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarColor: string;
  balance: number; // >0: owes; <0: should receive; 0: settled
  source: 'search' | 'contacts' | 'qr';
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
  '1': {
    id: '1',
    name: 'Paris Trip 2022',
    description: 'Spring trip to Paris with friends.',
    startDate: '2022-04-12',
    endDate: '2022-04-18',
    status: 'finished',
    totalExpenses: 260,
    members: [
      {
        id: 'me',
        name: 'You',
        email: 'you@example.com',
        avatarColor: '#2563eb',
        balance: -60,
        source: 'search',
      },
      {
        id: 'bob',
        name: 'Bob',
        email: 'bob@example.com',
        avatarColor: '#f97316',
        balance: 30,
        source: 'contacts',
      },
      {
        id: 'alice',
        name: 'Alice',
        email: 'alice@example.com',
        avatarColor: '#14b8a6',
        balance: 30,
        source: 'qr',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Roommates Bills 2023',
    description: 'Monthly flat bills and shared groceries.',
    startDate: '2023-01-01',
    endDate: null,
    status: 'ongoing',
    totalExpenses: 1520,
    members: [
      {
        id: 'me',
        name: 'You',
        avatarColor: '#2563eb',
        balance: 0,
        source: 'search',
      },
      {
        id: 'carol',
        name: 'Carol',
        avatarColor: '#22c55e',
        balance: 80,
        source: 'contacts',
      },
      {
        id: 'dave',
        name: 'Dave',
        avatarColor: '#eab308',
        balance: -80,
        source: 'search',
      },
    ],
  },
};

function formatDateRange(group: GroupDetail) {
  if (!group.endDate) return `From ${group.startDate}`;
  return `${group.startDate} → ${group.endDate}`;
}

function formatBalance(b: number): { label: string; color: string } {
  if (b > 0) return { label: `Owes ${b.toFixed(2)} €`, color: '#b91c1c' };
  if (b < 0) return { label: `Should receive ${(-b).toFixed(2)} €`, color: '#15803d' };
  return { label: 'Settled', color: '#6b7280' };
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const initialGroup =
    (groupId && DEMO_GROUPS[groupId]) ?? DEMO_GROUPS['1'];

  const [members, setMembers] = useState<GroupMember[]>(initialGroup.members);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<'none' | 'search' | 'contacts' | 'qr'>('none');

  const outstandingMembers = members.filter((m) => m.balance > 0);

  const handleRemindMember = (member: GroupMember) => {
    Alert.alert(
      'Reminder (demo)',
      `Would send a reminder to ${member.name} for ${member.balance.toFixed(
        2,
      )} €. \n\nIn real app: push notification / email / in-app message.`,
    );
  };

  const handleRemindAll = () => {
    if (outstandingMembers.length === 0) {
      Alert.alert('Everyone is settled', 'No one owes money right now.');
      return;
    }
    Alert.alert(
      'Remind all (demo)',
      `Would remind ${outstandingMembers.length} people who still owe money.`,
    );
  };

  // 模拟从“搜索 / 通讯录 / 扫码”加人
  const addMemberFromDemo = (
    who: 'bob' | 'alice' | 'tom',
    source: 'search' | 'contacts' | 'qr',
  ) => {
    const exists = members.some((m) => m.id === who);
    if (exists) {
      Alert.alert('Already a member', 'This person is already in the group.');
      return;
    }

    const demoMap: Record<typeof who, GroupMember> = {
      bob: {
        id: 'bob',
        name: 'Bob',
        email: 'bob@example.com',
        avatarColor: '#f97316',
        balance: 20,
        source,
      },
      alice: {
        id: 'alice',
        name: 'Alice',
        email: 'alice@example.com',
        avatarColor: '#14b8a6',
        balance: 0,
        source,
      },
      tom: {
        id: 'tom',
        name: 'Tom',
        phone: '+39 123 456',
        avatarColor: '#a855f7',
        balance: 15,
        source,
      },
    };

    setMembers((prev) => [...prev, demoMap[who]]);
    Alert.alert(
      'Member added (demo)',
      `${demoMap[who].name} has been added to this group.`,
    );
  };

  const group: GroupDetail = {
    ...initialGroup,
    members,
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
        {formatDateRange(group)} · {group.members.length} members
      </ThemedText>
      <ThemedText style={styles.totalText}>
        Total expenses: {group.totalExpenses.toFixed(2)} €
      </ThemedText>
      {group.description && (
        <ThemedText style={styles.description}>{group.description}</ThemedText>
      )}

      <View style={{ height: 12 }} />

      {/* 成员 + Reminder */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Members
      </ThemedText>

      <ThemedView style={styles.membersCard}>
        {members.map((m) => {
          const { label, color } = formatBalance(m.balance);
          return (
            <View key={m.id} style={styles.memberRow}>
              <View style={styles.memberLeft}>
                <View
                  style={[styles.avatar, { backgroundColor: m.avatarColor }]}
                >
                  <ThemedText style={styles.avatarText}>
                    {m.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={{ gap: 2 }}>
                  <ThemedText type="defaultSemiBold">{m.name}</ThemedText>
                  <ThemedText style={[styles.balanceText, { color }]}>
                    {label}
                  </ThemedText>
                </View>
              </View>

              {m.balance > 0 && (
                <Pressable
                  onPress={() => handleRemindMember(m)}
                  style={styles.remindButton}
                >
                  <ThemedText style={styles.remindButtonText}>
                    Remind
                  </ThemedText>
                </Pressable>
              )}
            </View>
          );
        })}

        <View style={styles.membersFooter}>
          <Pressable
            onPress={handleRemindAll}
            style={styles.remindAllButton}
          >
            <Ionicons name="notifications-outline" size={16} />
            <ThemedText style={styles.remindAllText}>
              Remind all who still owe
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <View style={{ height: 16 }} />

      {/* 邀请区块：搜索 / 通讯录 / QR */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Invite people
      </ThemedText>

      <ThemedView style={styles.inviteCard}>
        <ThemedText style={styles.inviteHint}>
          Add friends by searching account, using phone contacts, or showing a
          QR code. This is a demo UI (no real backend yet).
        </ThemedText>

        <View style={styles.inviteButtonsRow}>
          <InviteButton
            label="Search account"
            icon="search-outline"
            active={inviteMode === 'search'}
            onPress={() => {
              setInvitePanelOpen(true);
              setInviteMode('search');
            }}
          />
          <InviteButton
            label="From contacts"
            icon="people-circle-outline"
            active={inviteMode === 'contacts'}
            onPress={() => {
              setInvitePanelOpen(true);
              setInviteMode('contacts');
            }}
          />
          <InviteButton
            label="Show QR"
            icon="qr-code-outline"
            active={inviteMode === 'qr'}
            onPress={() => {
              setInvitePanelOpen(true);
              setInviteMode('qr');
            }}
          />
        </View>

        {invitePanelOpen && inviteMode === 'search' && (
          <InvitePanel
            title="Search accounts (demo)"
            hint="In real app, search backend by email / username. Here we use demo users:"
          >
            <DemoInviteRow
              label="Bob · bob@example.com"
              onPress={() => addMemberFromDemo('bob', 'search')}
            />
            <DemoInviteRow
              label="Alice · alice@example.com"
              onPress={() => addMemberFromDemo('alice', 'search')}
            />
          </InvitePanel>
        )}

        {invitePanelOpen && inviteMode === 'contacts' && (
          <InvitePanel
            title="From phone contacts (demo)"
            hint="Later: use expo-contacts to read real contacts. Now: simulate a few."
          >
            <DemoInviteRow
              label="Tom · +39 123 456"
              onPress={() => addMemberFromDemo('tom', 'contacts')}
            />
            <DemoInviteRow
              label="Bob · +39 987 654"
              onPress={() => addMemberFromDemo('bob', 'contacts')}
            />
          </InvitePanel>
        )}

        {invitePanelOpen && inviteMode === 'qr' && (
          <InvitePanel
            title="QR code (demo)"
            hint="Later: generate a join link for this group and turn it into a QR code. Others scan to join."
          >
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={48} />
              <ThemedText style={{ marginTop: 4 }}>
                QR code preview
              </ThemedText>
            </View>
          </InvitePanel>
        )}

        {invitePanelOpen && (
          <View style={styles.invitePanelFooter}>
            <Pressable
              onPress={() => {
                setInvitePanelOpen(false);
                setInviteMode('none');
              }}
            >
              <ThemedText style={styles.closeInviteText}>Close</ThemedText>
            </Pressable>
          </View>
        )}
      </ThemedView>

      <View style={{ height: 16 }} />

      {/* 占位：以后放真实的 expenses 列表 */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Expenses (to be implemented)
      </ThemedText>
      <ThemedText>
        Here you can later plug your real expense list and AA calculation.
      </ThemedText>
    </AppScreen>
  );
}

// 小组件：邀请按钮、面板、Demo 行
type InviteButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

function InviteButton({ label, icon, active, onPress }: InviteButtonProps) {
  return (
    <Pressable
      style={[
        styles.inviteButton,
        active && styles.inviteButtonActive,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} />
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}

type InvitePanelProps = {
  title: string;
  hint: string;
  children: React.ReactNode;
};

function InvitePanel({ title, hint, children }: InvitePanelProps) {
  return (
    <ThemedView style={styles.invitePanel}>
      <ThemedText style={styles.invitePanelTitle}>{title}</ThemedText>
      <ThemedText style={styles.invitePanelHint}>{hint}</ThemedText>
      {children}
    </ThemedView>
  );
}

type DemoInviteRowProps = {
  label: string;
  onPress: () => void;
};

function DemoInviteRow({ label, onPress }: DemoInviteRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.demoInviteRow}>
      <ThemedText>{label}</ThemedText>
      <Ionicons name="add-circle-outline" size={20} />
    </Pressable>
  );
}

// 样式
const styles = StyleSheet.create({
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  totalText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
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
    borderColor: '#ddd',
    padding: 10,
    gap: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 4,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: 'white',
  },
  balanceText: {
    fontSize: 12,
  },
  remindButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#b91c1c',
  },
  remindButtonText: {
    fontSize: 12,
    color: '#b91c1c',
  },
  membersFooter: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  remindAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remindAllText: {
    fontSize: 12,
  },
  inviteCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    gap: 8,
  },
  inviteHint: {
    fontSize: 12,
    opacity: 0.8,
  },
  inviteButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inviteButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  invitePanel: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
    gap: 6,
  },
  invitePanelTitle: {
    fontWeight: '600',
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
    borderColor: '#ddd',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  invitePanelFooter: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  closeInviteText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  demoInviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});
