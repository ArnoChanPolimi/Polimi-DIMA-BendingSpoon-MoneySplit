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

    // ===== Stats / Budget =====
    monthlyLimit: "Monthly Budget Limit",
    limitPlaceholder: "Enter your budget limit",
    cancel: "Cancel",

    overspent: "Overspent!",

    // ===== Groups list =====
    yourSharedBillGroups: "Shared Bill Groups", // 新增这一行
    myGroups: "My Groups",
    totalSpending: "Total Spending", // 新增
    created: "Created",             // 新增
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
    newExpenseGroup: "Create Group",
    groupNameTitle: "Group Name",
    alreadyExists: "Already exists",
    whoPaidTitle: "Who Paid?",
    whoSplitsTitle: "Who Splits?",
    totalBudgetTitle: "Total Budget",
    receiptOptionalTitle: "Receipt (Optional)",
    addMoreReceipts: "Add More Receipts",
    uploadReceipt: "Upload Receipt",
    confirmGenerateBill: "Create Group",
    selectFriends: "Select Friends",
    loadingOrNoFriends: "Loading... or you don't have any friends",
    done: "Done",
    noFriends: "You don't have any friends",
    receipts: "Receipts",
    selectCover: "Select Cover",
    tapToSelectCover: "Tap to select cover image",
    groupDescription: "Description (Optional)",
    groupDescriptionPlaceholder: "What is this group for?",
    selectMembers: "Select Members",

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

    // ===== Currency Selection =====
    recordCurrency: "Record currency",
    selectRecordCurrency: "Select the currency for this expense",

    // ===== Split Amounts =====
    splitAmounts: "Split amounts",
    enterAmount: "Enter amount",
    me: "Me",
    splitModeEqual: "Equal",
    splitModeCustom: "Custom",
    splitModeRatio: "Ratio",
    perPerson: "per person",
    enterRatio: "Ratio",

    // ===== Avatar =====
    selectAvatar: "Select Avatar",
    defaultAvatars: "Default",
    colorAvatars: "Colors",
    customAvatar: "Custom",
    uploadFromGallery: "Upload from Gallery",
    changeAvatar: "Change Avatar",
    avatarUpdated: "Avatar updated",
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

    // ===== Stats / Budget =====
    monthlyLimit: "Limite Budget Mensile",
    limitPlaceholder: "Inserisci il tuo limite",
    cancel: "Annulla",
    overspent: "Budget Superato!",

    // ===== Groups list =====
    yourSharedBillGroups: "Gruppi di Spesa Condivisi",
    myGroups: "I miei gruppi",
    totalSpending: "Spesa Totale", // 新增
    created: "Creato il",          // 新增
    groupsIntro: "Crea un gruppo per ogni viaggio...",
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
    newExpenseGroup: "Crea Gruppo",
    groupNameTitle: "Nome Gruppo",
    alreadyExists: "Già esistente",
    whoPaidTitle: "Chi ha pagato?",
    whoSplitsTitle: "Chi divide?",
    totalBudgetTitle: "Budget Totale",
    receiptOptionalTitle: "Ricevuta (Opzionale)",
    addMoreReceipts: "Aggiungi Altre Ricevute",
    uploadReceipt: "Carica Ricevuta",
    confirmGenerateBill: "Crea Gruppo",
    selectFriends: "Seleziona Amici",
    loadingOrNoFriends: "Caricamento... o non hai amici",
    done: "Fatto",
    noFriends: "Non hai amici",
    receipts: "Ricevute",
    selectCover: "Seleziona Copertina",
    tapToSelectCover: "Tocca per selezionare l'immagine di copertina",
    groupDescription: "Descrizione (Opzionale)",
    groupDescriptionPlaceholder: "A cosa serve questo gruppo?",
    selectMembers: "Seleziona Membri",

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

    // ===== Currency Selection =====
    recordCurrency: "Valuta di registrazione",
    selectRecordCurrency: "Seleziona la valuta di registrazione per questa spesa",

    // ===== Split Amounts =====
    splitAmounts: "Importi di suddivisione",
    enterAmount: "Inserisci importo",
    me: "Io",
    splitModeEqual: "Uguale",
    splitModeCustom: "Personalizzato",
    splitModeRatio: "Proporzione",
    perPerson: "a persona",
    enterRatio: "Proporzione",

    // ===== Avatar =====
    selectAvatar: "Seleziona Avatar",
    defaultAvatars: "Predefiniti",
    colorAvatars: "Colori",
    customAvatar: "Personalizzato",
    uploadFromGallery: "Carica dalla Galleria",
    changeAvatar: "Cambia Avatar",
    avatarUpdated: "Avatar aggiornato",
  },
};

export const i18n = new I18n(translations);
i18n.enableFallback = true;

// 设置当前语言（没传就用系统语言）
export function applyLocale(lang?: "en" | "it") {
  const sys = Localization.getLocales()?.[0]?.languageCode;
  const fallback: "en" | "it" = sys === "it" ? "it" : "en";
  i18n.locale = lang ?? fallback;
}

export const t = (key: string) => i18n.t(key);