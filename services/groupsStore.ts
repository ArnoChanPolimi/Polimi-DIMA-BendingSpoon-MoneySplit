// services/groupsStore.ts
import type { Group } from "@/components/group/GroupCard";
import { storageGet, storageSet } from "./storage";

export type Member = { id: string; name: string; avatarColor: string; isOwner?: boolean };

export type GroupWithMembers = Group & {
  members: Member[];
  ownerId?: string;
  currency?: string; 

};


const KEY = "moneysplit_groups_v1";

const COLORS = ["#2563eb", "#f97316", "#14b8a6", "#22c55e", "#eab308", "#a855f7", "#ef4444"];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

function buildMembers(memberNames: any[], ownerId = "me"): Member[] {
  return (memberNames ?? [])
    .map((raw) => {
      // raw can be: string OR {name: "..."} OR {id: "..."} OR something else
      const name =
        typeof raw === "string"
          ? raw
          : raw && typeof raw === "object"
          ? String(raw.name ?? raw.id ?? "")
          : String(raw ?? "");

      const safeName = name.trim() || "Unknown";

      const id =
        safeName.toLowerCase() === "you" ? "me" : safeName.toLowerCase();

      return {
        id,
        name: safeName,
        avatarColor: colorForId(id),
        isOwner: id === ownerId,
      };
    })
    .filter((m) => m.id); // remove empty
}


export async function listGroups(): Promise<GroupWithMembers[]> {
  return storageGet<GroupWithMembers[]>(KEY, []);
}

export async function addGroup(input: {
  name: string;
  totalExpenses: number;
  
  currency?: string;
  startDate?: string; // yyyy-mm-dd
  members: string[]; // ["You","Bob",...]
  ownerId?: string;
}): Promise<GroupWithMembers> {
  const now = new Date();
  const startDate = input.startDate ?? now.toISOString().slice(0, 10);
  const ownerId = input.ownerId ?? "me";

const group: GroupWithMembers = {
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  name: input.name,
  membersCount: input.members.length,
  totalExpenses: input.totalExpenses,
  currency: input.currency ?? "€", // ✅ ADD THIS LINE
  startDate,
  endDate: null,
  status: "ongoing",
  types: ["other"],
  ownerId,
  members: buildMembers(input.members, ownerId),
};

  const existing = await listGroups();
  await storageSet(KEY, [group, ...existing]);
  return group;
}
