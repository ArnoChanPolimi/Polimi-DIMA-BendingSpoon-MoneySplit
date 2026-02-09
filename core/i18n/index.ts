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
    currencyDemo: "💱 Currency Conversion Demo",
    selectCurrency: "Select default currency",
    exchangeRate: "📊 Live Exchange Rate",
    refreshRate: "Refresh Rate",
    quickConversion: "🔄 Quick Conversion Example",
    expenseList: "📋 Expense List",
    convertedTo: "Converted to",
    featureInfo: "✨ Feature Info",
    allExpensesConverted: "All expenses have been automatically converted to your selected currency",
    clickToSwitch: "Click the buttons above to switch default currency",
    ratesUpdateInRealTime: "Rates update in real-time after configuration",
    resultsAutoSaved: "Conversion results are automatically saved for next session",

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

    // ===== Quick Add / Add Expense (Group Creation) =====
    newExpenseGroup: "New Expense Group",
    groupNameTitle: "Group Name",
    alreadyExists: "Already exists",
    whoPaidTitle: "Who Paid?",
    whoSplitsTitle: "Who Splits?",
    totalBudgetTitle: "Total Budget",
    receiptOptionalTitle: "Receipt (Optional)",
    addMoreReceipts: "Add More Receipts",
    uploadReceipt: "Upload Receipt",
    confirmGenerateBill: "Generate Bill",
    selectFriends: "Select Friends",
    loadingOrNoFriends: "Loading... or you don't have any friends",
    done: "Done",
    noFriends: "You don't have any friends",
    receipts: "Receipts",

    // ===== Authentication / Signup =====
    createAccount: "Create Account",
    username: "Username",
    emailPlaceholder: "your@email.com",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordStrength: "Password Strength",
    agreeTerms: "I agree to the Terms and Conditions",
    creatingAccount: "Creating Account...",
    signUpButton: "Sign Up",
    fillAllFields: "Please fill all fields",
    passwordsDoNotMatch: "Passwords do not match",
    agreeTermsError: "Please agree to the terms and conditions",
    signupFailed: "Signup Failed",
    verificationSent: "Verification email sent to:",
    checkInbox: "Please check your inbox and click the link to activate your account.",
    checkingStatus: "Checking status...",
    timeoutVerification: "Timeout. Please resend if needed.",
    alreadyVerified: "I HAVE VERIFIED",
    resendEmail: "Resend Email",
    resendIn: "Resend in",
    backToEdit: "Back to Edit",
    emailVerified: "Email verified! Welcome aboard.",
    newVerificationSent: "A new verification email has been sent.",
    sessionExpired: "Session expired, please signup again.",
    verificationPending: "We haven't detected the verification yet. Please click the link in your email first.",
    somethingWrong: "Something went wrong, please try again.",
    termsTitle: "Terms and Conditions",
    termsContent: `1. User Agreement
By using MoneySplit, you agree to these terms and conditions.

2. Account Responsibility
You are responsible for maintaining the confidentiality of your account and password.

3. Acceptable Use
You agree not to use MoneySplit for any unlawful or prohibited purpose.

4. User Content
You retain ownership of any content you submit to MoneySplit.

5. Privacy
Your use of MoneySplit is governed by our Privacy Policy.

6. Limitation of Liability
MoneySplit is not liable for any indirect or consequential damages.

7. Termination
We may terminate your account immediately for any reason.

8. Changes to Terms
MoneySplit reserves the right to modify these terms at any time.

9. Governing Law
These Terms are governed by applicable law.

10. Contact
If you have questions, please contact us through the app.`,
    closeButton: "Close",
    success: "Success",
    sent: "Sent",
    pending: "Pending",

    // ===== Pull to Refresh =====
    refresh: "Refresh",
    refreshing: "Refreshing...",
    pullToRefresh: "Pull to refresh",
    releaseToRefresh: "Release to refresh",
    syncingWithCloud: "Syncing with cloud",
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
    currencyDemo: "💱 货币转换演示",
    selectCurrency: "选择默认货币",
    exchangeRate: "📊 实时汇率",
    refreshRate: "刷新汇率",
    quickConversion: "🔄 快速转换示例",
    expenseList: "📋 支出清单",
    convertedTo: "已转换到",
    featureInfo: "✨ 功能说明",
    allExpensesConverted: "所有支出金额已自动转换到您选择的货币",
    clickToSwitch: "点击上方按钮切换默认货币",
    ratesUpdateInRealTime: "配置 API Key 后，汇率实时更新",
    resultsAutoSaved: "转换结果自动保存，下次启动时恢复",

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

    // ===== Quick Add / Add Expense (Group Creation) =====
    newExpenseGroup: "新建消费组",
    groupNameTitle: "组名",
    alreadyExists: "已存在",
    whoPaidTitle: "谁支付？",
    whoSplitsTitle: "谁参与分摊？",
    totalBudgetTitle: "总金额",
    receiptOptionalTitle: "小票（可选）",
    addMoreReceipts: "添加更多小票",
    uploadReceipt: "上传小票",
    confirmGenerateBill: "生成账单",
    selectFriends: "选择好友",
    loadingOrNoFriends: "加载中...或您还没有好友",
    done: "完成",
    noFriends: "您还没有好友",
    receipts: "小票",

    // ===== Authentication / Signup =====
    createAccount: "创建账户",
    username: "用户名",
    emailPlaceholder: "your@email.com",
    password: "密码",
    confirmPassword: "确认密码",
    passwordStrength: "密码强度",
    agreeTerms: "我同意服务条款和隐私政策",
    creatingAccount: "正在创建账户...",
    signUpButton: "注册",
    fillAllFields: "请填写所有字段",
    passwordsDoNotMatch: "密码不匹配",
    agreeTermsError: "请同意服务条款和隐私政策",
    signupFailed: "注册失败",
    verificationSent: "验证邮件已发送至:",
    checkInbox: "请检查您的收件箱并点击链接以激活您的账户。",
    checkingStatus: "正在检查状态...",
    timeoutVerification: "超时。如需要请重新发送。",
    alreadyVerified: "我已验证",
    resendEmail: "重新发送邮件",
    resendIn: "重新发送",
    backToEdit: "返回编辑",
    emailVerified: "邮件已验证！欢迎加入。",
    newVerificationSent: "新的验证邮件已发送。",
    sessionExpired: "会话已过期，请重新注册。",
    verificationPending: "暂未检测到验证。请先点击邮件中的链接。",
    somethingWrong: "出了点问题，请重试。",
    termsTitle: "服务条款和条件",
    termsContent: `1. 用户协议
使用 MoneySplit 即表示您同意这些条款和条件。

2. 账户责任
您负责维护账户和密码的机密性。

3. 可接受的使用
您同意不将 MoneySplit 用于任何非法目的。

4. 用户内容
您保留提交到 MoneySplit 的内容的所有权。

5. 隐私
您使用 MoneySplit 受我们的隐私政策约束。

6. 责任限制
MoneySplit 不对任何间接或后果性损害负责。

7. 终止
我们可随时以任何理由终止您的账户。

8. 条款变更
MoneySplit 保留随时修改这些条款的权利。

9. 管辖法律
这些条款受适用法律管辖。

10. 联系方式
如有疑问，请通过应用与我们联系。`,
    closeButton: "关闭",
    success: "成功",
    sent: "已发送",
    pending: "等待中",

    groups: "群组",
    friends: "好友",
    quickAdd: "新增",

    // ===== Pull to Refresh =====
    refresh: "刷新",
    refreshing: "刷新中...",
    pullToRefresh: "下拉刷新",
    releaseToRefresh: "松开即可刷新",
    syncingWithCloud: "正在同步云端数据",
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
    currencyDemo: "💱 Demo conversione valuta",
    selectCurrency: "Seleziona valuta predefinita",
    exchangeRate: "📊 Tasso di cambio in tempo reale",
    refreshRate: "Aggiorna tasso",
    quickConversion: "🔄 Esempio di conversione veloce",
    expenseList: "📋 Elenco spese",
    convertedTo: "Convertito a",
    featureInfo: "✨ Info funzione",
    allExpensesConverted: "Tutte le spese sono state automaticamente convertite nella valuta selezionata",
    clickToSwitch: "Fare clic sui pulsanti sopra per cambiare la valuta predefinita",
    ratesUpdateInRealTime: "I tassi si aggiornano in tempo reale dopo la configurazione",
    resultsAutoSaved: "I risultati della conversione vengono salvati automaticamente per la prossima sessione",

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

    // ===== Quick Add / Add Expense (Group Creation) =====
    newExpenseGroup: "Nuovo Gruppo Spesa",
    groupNameTitle: "Nome Gruppo",
    alreadyExists: "Già esistente",
    whoPaidTitle: "Chi ha pagato?",
    whoSplitsTitle: "Chi divide?",
    totalBudgetTitle: "Budget Totale",
    receiptOptionalTitle: "Ricevuta (Opzionale)",
    addMoreReceipts: "Aggiungi Altre Ricevute",
    uploadReceipt: "Carica Ricevuta",
    confirmGenerateBill: "Genera Conto",
    selectFriends: "Seleziona Amici",
    loadingOrNoFriends: "Caricamento... o non hai amici",
    done: "Fatto",
    noFriends: "Non hai amici",
    receipts: "Ricevute",

    // ===== Authentication / Signup =====
    createAccount: "Crea Account",
    username: "Nome utente",
    emailPlaceholder: "your@email.com",
    password: "Password",
    confirmPassword: "Conferma Password",
    passwordStrength: "Forza Password",
    agreeTerms: "Accetto i Termini e le Condizioni",
    creatingAccount: "Creazione account...",
    signUpButton: "Registrati",
    fillAllFields: "Compila tutti i campi",
    passwordsDoNotMatch: "Le password non corrispondono",
    agreeTermsError: "Per favore accetta i termini e le condizioni",
    signupFailed: "Registrazione non riuscita",
    verificationSent: "Email di verifica inviata a:",
    checkInbox: "Controlla la tua casella di posta e fai clic sul link per attivare il tuo account.",
    checkingStatus: "Verifica in corso...",
    timeoutVerification: "Scaduto. Reinvia se necessario.",
    alreadyVerified: "HO GIÀ VERIFICATO",
    resendEmail: "Reinvia Email",
    resendIn: "Reinvia tra",
    backToEdit: "Torna a Modificare",
    emailVerified: "Email verificata! Benvenuto a bordo.",
    newVerificationSent: "Una nuova email di verifica è stata inviata.",
    sessionExpired: "Sessione scaduta, registrati di nuovo.",
    verificationPending: "Non abbiamo ancora rilevato la verifica. Fai clic sul link nell'email.",
    somethingWrong: "Qualcosa è andato storto, riprova.",
    termsTitle: "Termini e Condizioni",
    termsContent: `1. Accordo Utente
Utilizzando MoneySplit, accetti questi termini e condizioni.

2. Responsabilità Account
Sei responsabile del mantenimento della riservatezza del tuo account e password.

3. Uso Accettabile
Accetti di non utilizzare MoneySplit per alcuno scopo illegale.

4. Contenuto Utente
Mantieni la proprietà di qualsiasi contenuto inviato a MoneySplit.

5. Privacy
L'utilizzo di MoneySplit è disciplinato dalla nostra Informativa sulla Privacy.

6. Limitazione di Responsabilità
MoneySplit non è responsabile per danni indiretti o consequenziali.

7. Risoluzione
Possiamo terminare il tuo account in qualsiasi momento per qualsiasi motivo.

8. Modifiche ai Termini
MoneySplit si riserva il diritto di modificare questi termini in qualsiasi momento.

9. Legge Applicabile
Questi Termini sono disciplinati dalla legge applicabile.

10. Contatti
Se hai domande, contattaci attraverso l'app.`,
    closeButton: "Chiudi",
    success: "Successo",
    sent: "Inviato",
    pending: "In sospeso",

    groups: "Gruppi",
    friends: "Amici",
    quickAdd: "Nuovo",

    // ===== Pull to Refresh =====
    refresh: "Aggiorna",
    refreshing: "Aggiornamento in corso...",
    pullToRefresh: "Scorri verso il basso per aggiornare",
    releaseToRefresh: "Rilascia per aggiornare",
    syncingWithCloud: "Sincronizzazione con il cloud",
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