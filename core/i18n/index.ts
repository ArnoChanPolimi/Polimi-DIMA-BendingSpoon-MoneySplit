// core\i18n\index.ts
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

const translations = {
  /* =========================
     English
  ========================= */
  en: {
    // ===== Common =====
    settings: "Settings",
    account: "Account",
    signedIn: "Signed in",
    switchAccount: "Switch account",
    editName: "Edit name",
    logout: "Log out",
    preferences: "Preferences",

    theme: "Theme",
    themeSubtitle: "System / Light / Dark",
    system: "System",
    light: "Light",
    dark: "Dark",

    language: "Language",
    appLanguage: "App language",
    english: "English",
    chinese: "Chinese",
    italian: "Italian",

    currency: "Currency",
    defaultCurrency: "Default currency",

    notifications: "Notifications",
    expenseChanges: "Expense changes",
    notifyExpense: "Notify me when an expense is added or edited",

    about: "About this app",
    aboutLine1: "Shared Expenses App — course project based on a Bending Spoons idea.",
    aboutLine2: "These settings are demo-only; you may persist them to a backend later.",

    notSignedIn: "You are not signed in.",
    login: "Log in",
    signup: "Sign up",

    error: "Error",

    groups: "Groups",
    friends: "Friends",
    quickAdd: "New",

    // ===== Groups list =====
    myGroups: "My Groups",
    groupsIntro: "Create a group for each trip or set of friends, then add expenses.",
    showFilters: "Show filters",
    hideFilters: "Hide filters",

    time: "Time",
    all: "All",
    last12Months: "Last 12 months",
    olderThan1Year: "Older than 1 year",

    status: "Status",
    finished: "Finished",
    notFinished: "Not finished",

    expenseType: "Expense type",

    typeTravel: "Travel",
    typeFoodDrinks: "Food & drinks",
    typeShopping: "Shopping",
    typeTransport: "Transport",
    typeHousehold: "Household",
    typeOther: "Other",

    members: "members",
    tapToSeeBalances: "Tap to see balances and expenses",
    noGroupsMatch: "No groups match current filters.",
    from: "From",

    // ===== New group =====
    newGroup: "New group",
    enterGroupName: "Please enter a group name.",
    groupName: "Group name",
    groupNamePlaceholder: "Paris Trip, Roommates...",
    membersDemo: "Members (demo)",
    member1: "Member 1",
    member2: "Member 2",
    member1Placeholder: "Alice",
    member2Placeholder: "Bob",
    saveDemo: "Save (demo)",
    membersTodo: "TODO: later we support adding many members dynamically.",

    // ===== Quick add expense =====
    newExpense: "New expense",
    step1Title: "1 · Give this expense a name",
    expenseNamePlaceholder: "e.g. Dinner at Milano",
    step2Title: "2 · Who is involved?",
    step2Hint: "Later this will come from your friends list. For now it is demo data.",
    you: "You",
    step3Title: "3 · Total amount",
    amountPlaceholder: "e.g. 120",
    notesOptionalTitle: "Optional · Notes",
    notesPlaceholder: "Anything you want to remember about this expense",

    demoAlertTitle: "Demo",
    demoAlertName: "Name",
    demoAlertAmount: "Amount",
    demoAlertPeople: "People",
  },

  /* =========================
     Chinese (简体中文)
  ========================= */
  zh: {
    settings: "设置",
    account: "账号",
    signedIn: "已登录",
    editName: "修改名称",          // 补齐这个
    switchAccount: "切换账号",
    logout: "退出登录",
    preferences: "偏好",

    theme: "主题",
    themeSubtitle: "跟随系统 / 浅色 / 深色",
    system: "跟随系统",
    light: "浅色",
    dark: "深色",

    language: "语言",
    appLanguage: "应用语言",
    english: "英语",
    chinese: "中文",
    italian: "意大利语",

    currency: "货币",
    defaultCurrency: "默认货币",

    notifications: "通知",
    expenseChanges: "消费变更",
    notifyExpense: "新增或编辑消费时通知我",

    about: "关于应用",
    aboutLine1: "共享记账应用——基于 Bending Spoons 的课程项目。",
    aboutLine2: "这些设置目前仅用于演示，之后可以保存到后端。",

    notSignedIn: "你还没有登录。",
    login: "登录",
    signup: "注册",

    error: "错误",

    myGroups: "我的群组",
    groupsIntro: "为每一次旅行或朋友分组创建一个群组，然后添加消费。",
    showFilters: "显示筛选",
    hideFilters: "隐藏筛选",

    time: "时间",
    all: "全部",
    last12Months: "最近一年",
    olderThan1Year: "一年以前",

    status: "状态",
    finished: "已结束",
    notFinished: "进行中",

    expenseType: "消费类型",

    typeTravel: "旅行",
    typeFoodDrinks: "餐饮",
    typeShopping: "购物",
    typeTransport: "交通",
    typeHousehold: "日常开销",
    typeOther: "其他",

    members: "人",
    tapToSeeBalances: "点击查看结算与明细",
    noGroupsMatch: "没有符合当前筛选条件的群组。",
    from: "从",

    newGroup: "新建群组",
    enterGroupName: "请输入群组名称。",
    groupName: "群组名称",
    groupNamePlaceholder: "巴黎旅行、合租账单…",
    membersDemo: "成员（演示）",
    member1: "成员 1",
    member2: "成员 2",
    member1Placeholder: "Alice",
    member2Placeholder: "Bob",
    saveDemo: "保存（演示）",
    membersTodo: "TODO：后续支持动态添加多个成员。",

    newExpense: "新增消费",
    step1Title: "1 · 为这笔消费起个名字",
    expenseNamePlaceholder: "例如：米兰晚餐",
    step2Title: "2 · 谁参与了？",
    step2Hint: "之后将来自好友列表，目前为演示数据。",
    you: "你",
    step3Title: "3 · 总金额",
    amountPlaceholder: "例如：120",
    notesOptionalTitle: "可选 · 备注",
    notesPlaceholder: "你想记录的任何信息",

    demoAlertTitle: "演示",
    demoAlertName: "名称",
    demoAlertAmount: "金额",
    demoAlertPeople: "参与人",

    groups: "群组",
    friends: "好友",
    quickAdd: "新增",
  },

  /* =========================
     Italian
  ========================= */
  it: {
    settings: "Impostazioni",
    account: "Account",
    signedIn: "Accesso effettuato",
    editName: "Modifica nome",     // 补齐这个
    switchAccount: "Cambia account",
    logout: "Esci",
    preferences: "Preferenze",

    theme: "Tema",
    themeSubtitle: "Sistema / Chiaro / Scuro",
    system: "Sistema",
    light: "Chiaro",
    dark: "Scuro",

    language: "Lingua",
    appLanguage: "Lingua dell’app",
    english: "Inglese",
    chinese: "Cinese",
    italian: "Italiano",

    currency: "Valuta",
    defaultCurrency: "Valuta predefinita",

    notifications: "Notifiche",
    expenseChanges: "Modifiche spese",
    notifyExpense: "Avvisami quando una spesa viene aggiunta o modificata",

    about: "Info sull’app",
    aboutLine1: "App di spese condivise — progetto del corso basato su un’idea di Bending Spoons.",
    aboutLine2: "Queste impostazioni sono solo dimostrative.",

    notSignedIn: "Non hai effettuato l’accesso.",
    login: "Accedi",
    signup: "Registrati",

    error: "Errore",

    myGroups: "I miei gruppi",
    groupsIntro: "Crea un gruppo per ogni viaggio o gruppo di amici.",
    showFilters: "Mostra filtri",
    hideFilters: "Nascondi filtri",

    time: "Periodo",
    all: "Tutti",
    last12Months: "Ultimi 12 mesi",
    olderThan1Year: "Più di un anno fa",

    status: "Stato",
    finished: "Concluso",
    notFinished: "In corso",

    expenseType: "Tipo di spesa",

    typeTravel: "Viaggio",
    typeFoodDrinks: "Cibo e bevande",
    typeShopping: "Shopping",
    typeTransport: "Trasporto",
    typeHousehold: "Casa",
    typeOther: "Altro",

    members: "membri",
    tapToSeeBalances: "Tocca per vedere saldi e spese",
    noGroupsMatch: "Nessun gruppo corrisponde ai filtri.",
    from: "Dal",

    newGroup: "Nuovo gruppo",
    enterGroupName: "Inserisci il nome del gruppo.",
    groupName: "Nome del gruppo",
    groupNamePlaceholder: "Viaggio a Parigi, Coinquilini…",
    membersDemo: "Membri (demo)",
    member1: "Membro 1",
    member2: "Membro 2",
    member1Placeholder: "Alice",
    member2Placeholder: "Bob",
    saveDemo: "Salva (demo)",
    membersTodo: "TODO: supportare l’aggiunta dinamica di membri.",

    newExpense: "Nuova spesa",
    step1Title: "1 · Dai un nome alla spesa",
    expenseNamePlaceholder: "Es. Cena a Milano",
    step2Title: "2 · Chi è coinvolto?",
    step2Hint: "In futuro verrà dai contatti. Ora è demo.",
    you: "Tu",
    step3Title: "3 · Importo totale",
    amountPlaceholder: "Es. 120",
    notesOptionalTitle: "Opzionale · Note",
    notesPlaceholder: "Qualsiasi dettaglio utile",

    demoAlertTitle: "Demo",
    demoAlertName: "Nome",
    demoAlertAmount: "Importo",
    demoAlertPeople: "Persone",

    groups: "Gruppi",
    friends: "Amici",
    quickAdd: "Nuovo",
  },
};

export const i18n = new I18n(translations);
i18n.enableFallback = true;

// 设置当前语言（没传就用系统语言）
export function applyLocale(lang?: "en" | "zh" | "it") {
  const sys = Localization.getLocales()?.[0]?.languageCode;
  const fallback: "en" | "zh" | "it" =
    sys === "zh" ? "zh" : sys === "it" ? "it" : "en";
  i18n.locale = lang ?? fallback;
}

export const t = (key: string) => i18n.t(key);