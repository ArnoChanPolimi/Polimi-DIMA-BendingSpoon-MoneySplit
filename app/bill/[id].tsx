// // // app\bill\[id].tsx
// // import { Ionicons } from "@expo/vector-icons";
// // import { router, useLocalSearchParams } from 'expo-router';
// // import React, { useState } from 'react';
// // import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';

// // import { ThemedText } from "@/components/themed-text";
// // import { ThemedView } from "@/components/themed-view";
// // import AppScreen from "@/components/ui/AppScreen";
// // import AppTopBar from "@/components/ui/AppTopBar";
// // import { useThemeColor } from "@/hooks/use-theme-color";

// // import { doc, getDoc } from 'firebase/firestore'; // 获取数据库文档
// // import { getDownloadURL, ref } from 'firebase/storage'; // 获取图片链接
// // import { ActivityIndicator, Image } from 'react-native'; // 加载状态和图片组件
// // import { db, storage } from '../../services/firebase'; // 你的核心配置

// // const { width } = Dimensions.get('window');
// // const COLUMN_COUNT = 4;
// // const GRID_GAP = 12;
// // const ITEM_WIDTH = (width - 32 - (GRID_GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

// // export default function BillDetailScreen() {
// //   const { id } = useLocalSearchParams<{ id: string }>();
  
// //   const textColor = useThemeColor({}, "text");
// //   const borderColor = useThemeColor({}, "border");
// //   const tintColor = "#0a7ea4";
// //     // 在 BillDetailScreen 内部增加：
// //     const [billData, setBillData] = useState<any>(null);
// //     const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
// //     const [loading, setLoading] = useState(true);

// //     React.useEffect(() => {
// //     const loadData = async () => {
// //         if (!id) return;
// //         try {
// //         // 1. 去数据库拿账单信息
// //         const docSnap = await getDoc(doc(db, "expenses", id as string));
// //         if (docSnap.exists()) {
// //             const data = docSnap.data();
// //             setBillData(data); 

// //             // --- 新增：把假名单换成真名单 ---
// //             if (data.participants) { // 假设你在数据库里存的名字叫 participants
// //                 setParticipants(data.participants); 
// //             }
// //             // ----------------------------

// //             if (data.receiptPath) {
// //                 const url = await getDownloadURL(ref(storage, data.receiptPath));
// //                 setReceiptUrl(url);
// //             }
// //         }
// //         } catch (e) {
// //         console.error(e);
// //         } finally {
// //         setLoading(false);
// //         }
// //     };
// //     loadData();
// //     }, [id]);
  

// //   // 核心逻辑：数据驱动。这里的数据未来从数据库获取。
// //   // 无论人数是多少，UI 都会根据数组长度自动布局。
// //   const [participants, setParticipants] = useState([
// //     { id: '1', name: 'User', amount: '25.0', isPayer: true },
// //     { id: '2', name: 'Member A', amount: '12.5', isPayer: false },
// //     { id: '3', name: 'Member B', amount: '', isPayer: false },
// //     // 更多成员...
// //   ]);

// //   return (
// //     <AppScreen>
// //       <AppTopBar 
// //         title={id?.toString() || "Detail"}
// //         showBack={true} 
// //         onBackPress={() => router.back()} 
// //       />

// //       <ScrollView showsVerticalScrollIndicator={false}>
// //         {/* 汇总区域：展示总支出 */}
// //         <ThemedView style={[styles.summaryCard, { backgroundColor: tintColor }]}>
// //           <ThemedText style={styles.summaryLabel}>Total Expense</ThemedText>
// //           <ThemedText style={styles.summaryValue}>
// //             {billData?.totalAmount || "0.00"} €
// //           </ThemedText>
// //         </ThemedView>

// //         {/* 凭证区域：小票或截图 */}
// //         <View style={styles.section}>
// //           <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Receipts / Proof</ThemedText>
// //           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
// //             <Pressable style={[styles.addPhotoButton, { borderColor }]}>
// //               <Ionicons name="camera" size={28} color={tintColor} />
// //             </Pressable>
// //             {/* 增加逻辑判断：如果有图显示图，没图转圈圈，加载完显示最终图片 */}
// //             {receiptUrl ? (
// //             <Image source={{ uri: receiptUrl }} style={styles.receiptImage} />
// //             ) : (
// //             <View style={[styles.receiptPlaceholder, { backgroundColor: borderColor }]}>
// //                 {loading && <ActivityIndicator size="small" color={tintColor} />}
// //             </View>
// //             )}
// //           </ScrollView>
// //         </View>

// //         {/* 协作网格：适用于任何人数、任何场景（拼车、聚会等） */}
// //         <View style={styles.section}>
// //           <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
// //             Participants
// //           </ThemedText>
          
// //           <View style={styles.gridContainer}>
// //             {participants.map((person) => (
// //               <Pressable key={person.id} style={styles.gridItem}>
// //                 <View style={styles.avatarWrapper}>
// //                   {/* 头像 */}
// //                   <View style={[
// //                     styles.avatar, 
// //                     { borderColor: person.isPayer ? "#FFD700" : borderColor },
// //                     person.isPayer && { borderWidth: 2 }
// //                   ]}>
// //                     <ThemedText>{person.name[0]}</ThemedText>
// //                   </View>

// //                   {/* 状态气泡：显示金额或等待状态 */}
// //                   <View style={[
// //                     styles.amountBadge,
// //                     { backgroundColor: person.amount ? "#4CAF50" : "#94A3B8" }
// //                   ]}>
// //                     <ThemedText style={styles.amountText}>
// //                       {person.amount ? `${person.amount}€` : "?"}
// //                     </ThemedText>
// //                   </View>
// //                 </View>
// //                 <ThemedText numberOfLines={1} style={styles.nameLabel}>
// //                   {person.name}
// //                 </ThemedText>
// //               </Pressable>
// //             ))}
// //           </View>
// //         </View>
// //       </ScrollView>
// //     </AppScreen>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   summaryCard: { margin: 16, padding: 24, borderRadius: 16, alignItems: 'center' },
// //   summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
// //   summaryValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
// //   section: { paddingHorizontal: 16, marginBottom: 24 },
// //   sectionTitle: { marginBottom: 12, fontSize: 16 },
// //   addPhotoButton: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
// //   receiptPlaceholder: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
// //   gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
// //   gridItem: { width: ITEM_WIDTH, alignItems: 'center', marginBottom: 16 },
// //   avatarWrapper: { position: 'relative' },
// //   avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
// //   amountBadge: { position: 'absolute', bottom: -2, right: -6, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 10, borderWidth: 2, borderColor: '#FFF', minWidth: 32, alignItems: 'center' },
// //   amountText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
// //   nameLabel: { marginTop: 6, fontSize: 10, opacity: 0.6 },
// //   receiptImage: {
// //     width: 80, 
// //     height: 80, 
// //     borderRadius: 8, 
// //     marginRight: 12,
// //     backgroundColor: '#f1f1f1' // 图片加载前的底色
// //   }
// // });

// import { Ionicons } from "@expo/vector-icons";
// import { router, useLocalSearchParams, useNavigation } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Image,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   View
// } from 'react-native';

// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";
// import AppScreen from "@/components/ui/AppScreen";
// import AppTopBar from "@/components/ui/AppTopBar";
// import { useThemeColor } from "@/hooks/use-theme-color";

// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { getDownloadURL, ref } from 'firebase/storage';
// import { auth, db, storage } from '../../services/firebase';

// // 定义好友对象的接口，消除 any
// interface InvolvedFriend {
//   uid: string;
//   displayName: string;
//   claimedAmount?: string;
// }

// interface BillData {
//   name: string;
//   totalExpenses: number;
//   involvedFriends: InvolvedFriend[];
//   receiptPath?: string;
// }

// const { width } = Dimensions.get('window');
// const COLUMN_COUNT = 4;
// const GRID_GAP = 12;
// const ITEM_WIDTH = (width - 32 - (GRID_GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

// export default function BillDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const navigation = useNavigation();
  
//   const borderColor = useThemeColor({}, "border");
//   const tintColor = "#0a7ea4";

//   const [billData, setBillData] = useState<BillData | null>(null);
//   const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const loadData = async () => {
//       if (!id) return;
//       try {
//         const docSnap = await getDoc(doc(db, "groups", id as string)); 
//         if (docSnap.exists()) {
//           const data = docSnap.data() as BillData;
//           setBillData(data); 

//           if (data.receiptPath) {
//             try {
//               const url = await getDownloadURL(ref(storage, data.receiptPath));
//               setReceiptUrl(url);
//             } catch (err) {
//               console.log("Storage error:", err);
//             }
//           }
//         }
//       } catch (e) {
//         console.error("Load failed:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, [id]);

//   const handleClaimAmount = (person: InvolvedFriend) => {
//     if (!id || !billData) return;

//     const onConfirm = async (value: string | null) => {
//       if (!value || isNaN(Number(value))) return;

//       try {
//         const billRef = doc(db, "groups", id as string);
//         const newFriends = billData.involvedFriends.map((f: InvolvedFriend) => {
//           if (f.uid === person.uid) {
//             return { ...f, claimedAmount: value }; 
//           }
//           return f;
//         });

//         await updateDoc(billRef, { involvedFriends: newFriends });

//         setBillData((prev: BillData | null) => {
//           if (!prev) return null;
//           return {
//             ...prev,
//             involvedFriends: [...newFriends]
//           };
//         });
//       } catch (e) {
//         console.error("Update failed:", e);
//       }
//     };

//     // 💡 彻底修复 TypeScript 对参数 'v' 的抱怨
//     if (Platform.OS === 'ios') {
//       Alert.prompt(
//         "Claim Amount",
//         `How much for ${person.displayName}?`,
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "OK", onPress: (v: string | undefined) => onConfirm(v || null) }
//         ],
//         "plain-text",
//         person.claimedAmount?.toString() || ""
//       );
//     } else if (Platform.OS === 'web') {
//       const val = window.prompt(`How much for ${person.displayName}?`, person.claimedAmount || "");
//       onConfirm(val);
//     } else {
//       Alert.alert("Notice", "Android amount claiming is coming soon. Using test value 10.00", [
//         { text: "OK", onPress: () => onConfirm("10.00") }
//       ]);
//     }
//   };

//   const handleSafeBack = () => {
//     if (navigation.canGoBack()) {
//       router.back();
//     } else {
//       router.replace("/"); 
//     }
//   };

//   if (loading) {
//     return (
//       <AppScreen>
//         <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 50 }} />
//       </AppScreen>
//     );
//   }

//   return (
//     <AppScreen>
//       <AppTopBar 
//         title={billData?.name || "Bill Detail"}
//         showBack={true} 
//         onBackPress={handleSafeBack} 
//       />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
//         <ThemedView style={[styles.summaryCard, { backgroundColor: tintColor }]}>
//           <ThemedText style={styles.summaryLabel}>Total Expense</ThemedText>
//           <ThemedText style={styles.summaryValue}>
//             {billData?.totalExpenses || "0.00"} €
//           </ThemedText>
//         </ThemedView>

//         <View style={styles.section}>
//           <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Receipts / Proof</ThemedText>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             <View style={[styles.addPhotoButton, { borderColor }]}>
//               <Ionicons name="camera" size={28} color={tintColor} />
//             </View>
//             {receiptUrl && <Image source={{ uri: receiptUrl }} style={styles.receiptImage} />}
//           </ScrollView>
//         </View>

//         <View style={styles.section}>
//           <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>SPLITTING WITH</ThemedText>
//           <View style={styles.gridContainer}>
//             {billData?.involvedFriends?.map((person: InvolvedFriend, index: number) => {
//               const isMe = person.uid === auth.currentUser?.uid;
//               return (
//                 <Pressable 
//                   key={person.uid || `p-${index}`} 
//                   style={styles.gridItem} 
//                   onPress={() => handleClaimAmount(person)}
//                 >
//                   <View style={styles.avatarWrapper}>
//                     <View style={[
//                       styles.avatar, 
//                       { borderColor: isMe ? tintColor : borderColor, borderWidth: isMe ? 2 : 1 }
//                     ]}>
//                       <ThemedText>{(person.displayName || "U")[0].toUpperCase()}</ThemedText>
//                     </View>
//                     {person.claimedAmount && (
//                       <View style={[styles.amountBadge, { backgroundColor: "#4CAF50" }]}>
//                         <ThemedText style={styles.amountText}>{person.claimedAmount}€</ThemedText>
//                       </View>
//                     )}
//                   </View>
//                   <ThemedText numberOfLines={1} style={[
//                     styles.nameLabel, 
//                     isMe && { color: tintColor, fontWeight: 'bold' }
//                   ]}>
//                     {isMe ? "Me" : person.displayName}
//                   </ThemedText>
//                 </Pressable>
//               );
//             })}
//           </View>
//         </View>
//       </ScrollView>
//     </AppScreen>
//   );
// }

// const styles = StyleSheet.create({
//   summaryCard: { margin: 16, padding: 24, borderRadius: 16, alignItems: 'center' },
//   summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
//   summaryValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
//   section: { paddingHorizontal: 16, marginBottom: 24 },
//   sectionTitle: { marginBottom: 12, fontSize: 16 },
//   addPhotoButton: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
//   gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, minHeight: 150 },
//   gridItem: { width: ITEM_WIDTH, alignItems: 'center', marginBottom: 16 },
//   avatarWrapper: { position: 'relative', width: 55, height: 55 },
//   avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
//   amountBadge: { position: 'absolute', bottom: -2, right: -6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, borderWidth: 2, borderColor: '#FFF', minWidth: 38, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
//   amountText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
//   nameLabel: { marginTop: 6, fontSize: 11, opacity: 0.8 },
//   receiptImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 }
// });