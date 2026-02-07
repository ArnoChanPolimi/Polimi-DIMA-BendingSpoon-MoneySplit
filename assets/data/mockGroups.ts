// assets\data\mockGroups.ts
export const MOCK_GROUPS_DATA: Record<string, any> = {
  'GB-20220412-X9P2': { 
    id: 'GB-20220412-X9P2', 
    name: 'Demo Example: Paris Trip 2024', 
    startDate: '2022-04-12', 
    totalExpenses: 260.00, 
    status: 'finished',
    involvedFriends: [
      { uid: 'u1', displayName: 'Alice' },
    ] 
  },
  'GB-20230101-R4T7': { 
    id: 'GB-20230101-R4T7', 
    name: 'Demo Example: Roommates Bills', 
    startDate: '2020-01-01', 
    totalExpenses: 1520.00, 
    status: 'ongoing',
    involvedFriends: [
      { uid: 'u1', displayName: 'Alice' },
      { uid: 'u2', displayName: 'Bob' }
    ]
  }
};