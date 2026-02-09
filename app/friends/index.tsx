// app\friends\index.tsx
import {
    addDoc,
    and,
    collection,
    doc,
    limit,
    onSnapshot,
    or,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { useAuth } from '@/components/auth/AuthContext';
import { ThemedText } from '@/components/themed-text';
import AppScreen from '@/components/ui/AppScreen';
import AppTopBar from '@/components/ui/AppTopBar';
import { auth, db } from '@/services/firebase';
import { Ionicons } from "@expo/vector-icons";

// 默认头像映射
const DEFAULT_AVATARS: Record<string, any> = {
  avatar_1: require("@/assets/images/avatars/avatar_1.png"),
  avatar_2: require("@/assets/images/avatars/avatar_2.png"),
  avatar_3: require("@/assets/images/avatars/avatar_3.png"),
  avatar_4: require("@/assets/images/avatars/avatar_4.png"),
  avatar_5: require("@/assets/images/avatars/avatar_5.png"),
  avatar_6: require("@/assets/images/avatars/avatar_6.png"),
  avatar_7: require("@/assets/images/avatars/avatar_7.png"),
  avatar_8: require("@/assets/images/avatars/avatar_8.png"),
};

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]); // 👈 新增：存放好友申请
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user: currentUserData } = useAuth(); // 从 Context 获取合并了数据库名字的 user

  // --- 逻辑 1：监听发给"我"的和"我发出的"申请 ---
  // 1. 在组件内部顶部增加状态
  const [myFriendIds, setMyFriendIds] = useState<string[]>([]);

  // 2. 插入新的监听逻辑 (就在逻辑 1 的 useEffect 后面)
  useEffect(() => {
    if (!auth.currentUser) return;
    // 盯住红圈路径：users/我的ID/friends
    const colRef = collection(db, "users", auth.currentUser.uid, "friends");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      // 把红圈里所有文档的 ID (好友UID) 拿出来存进状态
      setMyFriendIds(snap.docs.map(d => d.id));
    });
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   if (!auth.currentUser) return;

  //   const notificationsRef = collection(db, "notifications");

  //   // 修复版：将所有条件放入 and() 内部
  //   const q = query(
  //     notificationsRef,
  //     and(
  //       where("type", "==", "friend_request"),
  //       where("status", "==", "pending"),
  //       or(
  //         where("to", "==", auth.currentUser.uid),
  //         where("from", "==", auth.currentUser.uid)
  //       )
  //     )
  //   );

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const reqs = snapshot.docs.map(doc => ({ 
  //       id: doc.id, 
  //       ...doc.data() 
  //     }));
  //     setPendingRequests(reqs);
  //   }, (error: Error) => {
  //     console.error("监听申请报错:", error);
  //   });

  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(db, "notifications");

    // 修改版：只要是发给“我”的、且状态是 pending 或 unread 的，全抓回来
    const q = query(
      notificationsRef,
      and(
        // 关键：这里需要包含我发出的和发给我的，以便更新搜索列表的状态
        or(
          where("to", "==", auth.currentUser.uid),
          where("from", "==", auth.currentUser.uid)
        )
        // or(
        //   where("status", "==", "pending"),
        //   where("status", "==", "unread")
        // )
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allReqs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log("Total Notifications caught:", allReqs.length);
      setPendingRequests(allReqs); // 现在这里面既有好友申请，又有账单邀请了
    }, (error: Error) => {
      console.error("监听通知报错:", error);
    });

    return () => unsubscribe();
  }, []);


  // --- 逻辑 2：纯净版自动搜索（只对准你有的 username 和 email） ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    
    // 重点：这里绝对不转小写！你输入什么，我们就拿什么去撞数据库
    const text = searchQuery.trim(); 
    const usersRef = collection(db, "users");
    
    const q = query(
      usersRef,
      or(
        // 实现“写一半就跳出来”的逻辑：
        // 只要数据库里的 username 是以你输入的 text 开头的，全部抓出来
        and(where("username", ">=", text), where("username", "<=", text + "\uf8ff")),
        and(where("email", ">=", text), where("email", "<=", text + "\uf8ff"))
      ),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== auth.currentUser?.uid);
      setSearchResults(users);
      setLoading(false);
    }, (error: any) => {
      // 报错了看这里！它会给你一个链接，必须点！
      console.error("Firebase 索引错误:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchQuery]);

  // --- 逻辑 3：发送好友申请函数 ---
  const handleSendRequest = async (targetUser: any) => {
    if (!auth.currentUser) {
      return Alert.alert("Error", "User session not found.");
    }

    // 关键修复 1：确保拿到的是 uid (Firestore 搜索结果通常是这个字段)
    const targetId = targetUser.id || targetUser.uid; 
    if (!targetId) {
      console.error("Target User ID is missing!", targetUser);
      return Alert.alert("Error", "Invalid user data.");
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "notifications"), {
        from: auth.currentUser.uid,
        fromName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || "Someone",
        to: targetId, // 使用修复后的 targetId
        type: "friend_request",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      Alert.alert("Success", `Request sent to ${targetUser.username}`);
      // setSearchQuery(""); // 发送成功后清空搜索，给用户“完成感”
    } catch (error: any) {
      // 增加详细报错日志
      console.error("Friend request failed:", error.code, error.message);
      Alert.alert("Error", `Could not send request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // // // --- 逻辑 4：处理接受申请 (修复版：存入用户文档下的 friends 子集合) ---
  const handleAcceptRequest = async (request: any) => {
    // 1. 严格检查：如果 user 还没加载好，直接 return，防止后面 .email 报错
    if (!auth.currentUser || !currentUserData) {
      console.warn("[Friends] 正在尝试接受申请，但用户信息尚未加载完成");
      return; 
    }
    
    try {
      setLoading(true);
      const myUid = auth.currentUser.uid;

      // 2. 名字优先级优化：数据库字段 > 邮箱前缀 > 邮箱强制前8位 > "User"
      // 确保从 currentUserData（你监听主表得到的实时对象）中取值
      const myEmail = currentUserData.email || auth.currentUser.email || "";
      const emailPrefix = myEmail ? myEmail.split('@')[0] : "";
      const emailShort = myEmail ? myEmail.substring(0, 8) : "";

      // 时刻覆盖更新的核心：确保写入对方数据库的名字是当前最准的
      const myName = (currentUserData as any).username || 
                     currentUserData.displayName || 
                     emailPrefix || 
                     emailShort || 
                     "User";
      
      const targetUid = request.from;
      const targetName = request.fromName || "Friend";

      console.log(`[Accepting] 我(${myName}) 正在接受来自 (${targetName}) 的申请`);

      // 3. 执行双向写入
      const myRef = doc(db, "users", myUid, "friends", targetUid);
      const targetRef = doc(db, "users", targetUid, "friends", myUid);

      await Promise.all([
        // 写入我的列表
        setDoc(myRef, {
          uid: targetUid,
          displayName: targetName,
          addedAt: serverTimestamp(),
        }),
        // 写入对方的列表 (关键：这里存入的是我们刚才算出来的 myName)
        setDoc(targetRef, {
          uid: myUid,
          displayName: myName, 
          addedAt: serverTimestamp(),
        })
      ]);

      // 4. 更新通知状态
      await updateDoc(doc(db, "notifications", request.id), {
        status: "accepted"
      });

      console.log("✅ 双向好友关系已建立，名字使用的是:", myName);
      
    } catch (error: any) {
      console.error("接受申请失败:", error.message);
      Alert.alert("Error", "Failed to accept request.");
    } finally {
      setLoading(false);
    }
  };
  

  // 1. 增加拒绝函数
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "notifications", requestId), {
        status: "declined"
      });
    } catch (error) {
      Alert.alert("Error", "Failed to decline.");
    }
  };

  // 刷新函数
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <AppScreen>
      <AppTopBar 
        title="Friends Center" 
        showBack
        backSize={25}
        showRefresh={true}
        onRefreshPress={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      {/* 1. 搜索框 - 像素风 */}
      <View style={styles.searchBox}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Search friends to add..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
            onSubmitEditing={() => console.log('Searching for:', searchQuery)} 
          />
          
          {/* 右侧搜索按键 */}
          <Pressable 
            style={styles.searchIconBtn} 
            onPress={() => console.log('Manual Search Triggered')}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#60a5fa" />
            ) : (
              <Ionicons name="search" size={20} color="#60a5fa" />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* 2. 消息通知区 (增加 key 强制重绘) */}
        {/* 2. 消息通知区 */}
        {pendingRequests.length > 0 ? (
          <View style={styles.section}>
            {/* --- A. 好友申请列表 --- */}
            {pendingRequests.filter(r => 
              r.type === "friend_request" && 
              r.to === auth.currentUser?.uid && 
              (r.status === "pending" || r.status === "unread") // 容错处理
            ).length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>Friend Requests</ThemedText>
                {pendingRequests.filter(r => r.type === "friend_request" && r.to === auth.currentUser?.uid && (r.status === "pending" || r.status === "unread")).map((req) => (
                  <View key={req.id} style={styles.requestRow}>
                    <ThemedText style={{ flex: 1 }}>{req.fromName} wants to be friends</ThemedText>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable onPress={() => handleAcceptRequest(req)} style={styles.acceptBtn}>
                        <ThemedText style={styles.acceptText}>Accept</ThemedText>
                      </Pressable>
                      <Pressable onPress={() => handleDeclineRequest(req.id)} style={styles.declineBtn}>
                        <ThemedText style={styles.declineText}>Decline</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
                <View style={{ height: 16 }} />
              </>
            )}

            {/* --- B. 账单邀请列表 (这是我们要加的新东西) --- */}
            {pendingRequests.filter(r => r.type === "new_group" && r.status === "unread").length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>Bill Invitations</ThemedText>
                {pendingRequests.filter(r => r.type === "new_group" && r.status === "unread").map((req) => (
                  <View key={req.id} style={[styles.requestRow, { borderColor: '#007AFF', borderWidth: 1 }]}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontWeight: '600' }}>{req.groupName}</ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Invited by {req.fromName}</ThemedText>
                    </View>
                    <Pressable 
                      onPress={() => handleDeclineRequest(req.id)} 
                      style={[styles.acceptBtn, { backgroundColor: '#007AFF' }]}
                    >
                      <ThemedText style={styles.acceptText}>Accept</ThemedText>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </View>
        ) : (
          <View style={{ height: 1 }} />
        )}

        {/* 3. 搜索结果区 - 只在搜索后显示 */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Search Results</ThemedText>
            {searchResults.map((item) => {

              // 2. 判断是否在申请中 (检查 pendingRequests 监听到的通知里是否有与该用户的往来记录)
              const isPending = pendingRequests.some(req => 
                req.status === "pending" && ( // 增加状态显式校验
                  (req.from === auth.currentUser?.uid && req.to === item.id) || 
                  (req.from === item.id && req.to === auth.currentUser?.uid)
                )
              );

              // 判断是否已经是好友
              // const isAlreadyFriend = (item.friends || []).includes(auth.currentUser?.uid);
              // const isAlreadyFriend = (auth.currentUser as any)?.friends?.includes(item.id);
              const isAlreadyFriend = myFriendIds.includes(item.id);

              // 处理头像：avatar 可能是对象 { type, value } 或字符串
              const getAvatarSource = () => {
                const avatar = item.avatar;
                
                // 如果是对象格式 { type: "default", value: "avatar_3" } - 使用预设头像
                if (avatar && typeof avatar === 'object' && avatar.type === 'default' && avatar.value) {
                  const avatarKey = avatar.value as string;
                  if (DEFAULT_AVATARS[avatarKey]) {
                    return DEFAULT_AVATARS[avatarKey];
                  }
                }
                // 如果是对象格式 { type: "custom", value: "url" }
                if (avatar && typeof avatar === 'object' && avatar.type === 'custom' && avatar.value) {
                  return { uri: avatar.value };
                }
                // 如果是对象格式 { type: "color", value: "#xxx" } - 使用颜色生成头像
                if (avatar && typeof avatar === 'object' && avatar.type === 'color' && avatar.value) {
                  const color = avatar.value.replace('#', '');
                  return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || 'U')}&background=${color}&color=fff` };
                }
                // 如果是字符串URL
                if (typeof avatar === 'string' && avatar) {
                  return { uri: avatar };
                }
                // 默认头像
                return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username || 'User')}&background=60a5fa&color=fff` };
              };

              return (
                <View key={item.id} style={styles.row}>
                  <Image 
                    source={getAvatarSource()} 
                    style={styles.avatar} 
                  />
                  <View style={styles.info}>
                    <ThemedText type="defaultSemiBold">{item.username}</ThemedText>
                    <ThemedText style={styles.details}>{item.email}</ThemedText>
                  </View>

                  {/* 根据逻辑显示不同状态按钮 - 像素风 */}
                  {isAlreadyFriend ? (
                    <View style={[styles.actionArea, { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' }]}>
                      <ThemedText style={{ color: '#9ca3af', fontSize: 12, fontWeight: 'bold' }}>Added</ThemedText>
                    </View>
                  ) : isPending ? (
                    <View style={[styles.actionArea, { backgroundColor: '#fff7ed', borderColor: '#f97316' }]}>
                      <ThemedText style={{ color: '#f97316', fontSize: 12, fontWeight: 'bold' }}>Pending</ThemedText>
                    </View>
                  ) : (
                    <Pressable onPress={() => handleSendRequest(item)} style={styles.actionArea}>
                      <ThemedText style={styles.addText}>Add</ThemedText>
                    </Pressable>
                  )}
                </View>
              );
            })}
            {/* 在 ScrollView 内部的搜索结果区下方 */}
            {searchResults.length === 0 && !loading && (
              <ThemedText style={styles.empty}>No users found with "{searchQuery}"</ThemedText>
            )}
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

// 样式部分 (在原有基础上新增)
const styles = StyleSheet.create({
  searchBox: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#60a5fa',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 15,
    color: '#1f2937',
  },
  searchIconBtn: {
    position: 'absolute',
    right: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  details: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  idBadge: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  actionArea: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  addText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: { 
    height: 1, 
    backgroundColor: '#f3f4f6',
    marginLeft: 62,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9ca3af',
    fontSize: 14,
  },
  section: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, opacity: 0.6 },
  requestRow: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  acceptBtn: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  acceptText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  declineBtn: { 
    backgroundColor: '#f3f4f6', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  declineText: { 
    color: '#6b7280', 
    fontSize: 12, 
    fontWeight: 'bold' 
  }
});