import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOKEN_ENDPOINT = "https://speech2text-broker.onrender.com/api/live-token";
const TRANSLATE_ENDPOINT = "https://speech2text-broker.onrender.com/api/translate";
const SUMMARY_ENDPOINT = "https://speech2text-broker.onrender.com/api/summarize";
const SPEECH_ENDPOINT = "https://speech2text-broker.onrender.com/api/speech";
const SUPABASE_URL = "https://jjdcjuxeuxbnxggxzbsl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_81wK9xZIlCC9CBukLWIu-g_yx851dCK";
const MODEL = "gemini-3.5-transcribe-live";
const TARGET_SAMPLE_RATE = 16_000;
const LIBRARY_KEY = "speech2text.library.v1";
const UI_LANGUAGE_KEY = "speech2text.uiLanguage";
const TEXT_SIZE_KEY = "speech2text.textSize";
const SUMMARY_PROFILE_KEY = "speech2text.summaryProfile";
const SUMMARY_INCLUDE_NOTES_KEY = "speech2text.summaryIncludeNotes";
const CUSTOM_SUMMARY_PROFILES_KEY = "speech2text.customSummaryProfiles";
const BOOKMARKS_SUMMARY_KEY = "__bookmarks";
const LEGACY_SEGMENTS_KEY = "speech2text.segments";
const LEGACY_TRANSLATIONS_KEY = `${LEGACY_SEGMENTS_KEY}.translations`;
const FINAL_TRANSCRIPT_WAIT_MS = 3_500;
const QUIET_FINAL_WAIT_MS = 700;
const TRANSLATION_TIMEOUT_MS = 30_000;
const SUMMARY_TIMEOUT_MS = 60_000;
const SPEECH_TIMEOUT_MS = 60_000;
const COPY_CONFIRMATION_MS = 1_200;
const CLOUD_SYNC_DELAY_MS = 900;
const LIVE_SAVE_DELAY_MS = 1_500;
const LIVE_SESSION_ROTATE_MS = 8.5 * 60 * 1000;
const MAX_QUEUED_AUDIO_CHUNKS = 120;
const RECORDING_PREVIEW = new URLSearchParams(window.location.search).has("recordingPreview");
const TRANSLATION_LANGUAGES = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "fr", label: "Français", shortLabel: "FR" },
  { code: "ja", label: "日本語", shortLabel: "JA" },
  { code: "de", label: "Deutsch", shortLabel: "DE" }
];
const SUMMARY_PROFILES = [
  { code: "student" },
  { code: "business" },
  { code: "meeting" },
  { code: "research" }
];
const UI_STRINGS = {
  en: {
    sidebarTitle: "Courses",
    newWorkspace: "New workspace",
    loadWorkspace: "Load",
    loadWorkspaceTitle: "Load workspace",
    activeWorkspace: "Active workspace",
    collapseCoursePanel: "Collapse courses",
    expandCoursePanel: "Show courses",
    textSize: "Text size",
    textSizeSmall: "Small text",
    textSizeMedium: "Medium text",
    textSizeLarge: "Large text",
    newCourse: "Add Course",
    newSession: "Add",
    addCourseTooltip: "Add a course to this workspace",
    addSessionTooltip: "Add a lecture to this course",
    defaultWorkspace: "My Workspace",
    defaultSubject: "Courses",
    defaultSessionPrefix: "Lecture",
    noLectureSelected: "No lecture selected",
    start: "🎙️ Rec",
    startShort: "Rec",
    stop: "⏹️ Stop",
    stopShort: "Stop",
    ready: "Ready",
    connecting: "Connecting…",
    recordingPreparing: "Preparing recording…",
    reconnecting: "Refreshing recording connection…",
    microphonePrompt: "Waiting for microphone permission…",
    listening: "Listening",
    stopping: "Finalizing…",
    error: "Error",
    copy: "Copy",
    copied: "✓ Copied",
    copyAll: "Copy all",
    copyAllShort: "Copy",
    exportSession: "Export",
    exportTitle: "Export lecture",
    exportDescription: "Choose a formatted export.",
    exportMarkdown: "Markdown",
    exportPdf: "PDF",
    exportWord: "Word",
    exportReady: "Export ready.",
    printReady: "Print window opened.",
    searchWorkspace: "Search",
    searchTitle: "Search workspace",
    searchPlaceholder: "Search all lectures...",
    searchEmpty: "No result.",
    searchHint: "Type a keyword to search this workspace.",
    bookmarkAction: "Mark",
    bookmarkTooltip: "Bookmark the current moment",
    bookmarkAdded: "Bookmark added.",
    bookmarksTitle: "Bookmarks",
    bookmarksHint: "Mark important moments while recording",
    bookmarksEmpty: "No bookmark yet.",
    bookmarksFold: "Collapse bookmarks",
    bookmarksUnfold: "Show bookmarks",
    bookmarksFolded: "Bookmarks · {count}",
    bookmarkDefault: "Bookmark {number}",
    clear: "Clear text",
    clearShort: "Clear",
    originalTab: "Original",
    foldTranscript: "Collapse transcript",
    unfoldTranscript: "Show transcript",
    foldedTranscript: "{label} · {count} characters",
    playSpeech: "Read translation aloud",
    stopSpeech: "Stop audio",
    speechGenerating: "Preparing audio…",
    speechReady: "Audio ready",
    speechTapAgain: "Audio ready. Tap play again.",
    speechFailed: "Audio generation failed.",
    speechUnavailable: "Generate a translation before listening to it.",
    foldNotes: "Collapse notes",
    unfoldNotes: "Show notes",
    foldedNotes: "Notes · {count} characters",
    foldSummary: "Collapse summary",
    unfoldSummary: "Show summary",
    foldedSummary: "{label} summary · {count} characters",
    empty: "The lecture transcript will appear here.",
    emptyTranslation: "Choose a language to generate a translation.",
    detectedUnknown: "Detected language: unknown",
    detectedMixed: "Detected language: mixed",
    detected: "Detected language: {language}",
    technicalDetails: "Technical details",
    waiting: "Waiting for a session.",
    disclaimer: "Captions are an aid and may contain errors.",
    newCourseTitle: "New course",
    courseName: "Course name",
    newWorkspaceTitle: "New workspace",
    workspaceName: "Workspace name",
    cancel: "Cancel",
    close: "Close",
    create: "Create",
    confirmTitle: "Confirm",
    delete: "Delete",
    notesTitle: "Notes",
    notesHint: "Saved automatically",
    notesPlaceholder: "Add notes while listening...",
    summaryTitle: "Summary",
    summaryHint: "Generated summary · {profile}",
    summaryPlaceholder: "Generate a study sheet from this lecture.",
    generateSummary: "Generate",
    regenerateSummary: "Regenerate",
    editSummary: "Edit",
    summarySettings: "Summary settings",
    summaryProfileTitle: "Summary settings",
    summaryProfileDescription: "Choose the structure used to generate summaries.",
    summaryProfileStudent: "Student",
    summaryProfileStudentDescription: "Study sheet with main ideas, key concepts, important details, exam questions and vocabulary.",
    summaryProfileBusiness: "Business",
    summaryProfileBusinessDescription: "Business brief with context, decisions, action items, risks, opportunities and next steps.",
    summaryProfileMeeting: "Meeting",
    summaryProfileMeetingDescription: "Meeting notes with topics discussed, decisions, owners, open questions and follow-ups.",
    summaryProfileResearch: "Research",
    summaryProfileResearchDescription: "Analytical brief with thesis, evidence, methods, limitations and points to verify.",
    summaryIncludeNotes: "Use personal notes when generating summaries",
    customProfileTitle: "Custom profile",
    customProfileName: "Profile name",
    customProfileKeywords: "Sections or keywords",
    customProfileKeywordsPlaceholder: "One section or keyword per line",
    customProfileAdd: "Add profile",
    customProfileDelete: "Delete profile",
    customProfileSaved: "Summary profile saved.",
    copySummary: "Copy",
    summaryCopied: "Summary copied.",
    summaryGenerating: "Generating study sheet…",
    summaryGeneratingLanguage: "Generating {language} study sheet…",
    summaryRequested: "Study sheet requested.",
    summaryReady: "Study sheet ready",
    summaryReceived: "Study sheet received: {count} characters.",
    summarySlow: "The study sheet is taking too long. Try again with a shorter transcript.",
    summaryFailed: "Study sheet generation failed.",
    summaryEmpty: "No summary to copy yet.",
    editTranscriptSegment: "Edit transcript",
    emptyTranscriptSegment: "The transcript cannot be empty.",
    rename: "Double-click to rename",
    renameAria: "Rename",
    deleteSubject: "Delete course",
    deleteSession: "Delete lecture",
    deleteWorkspace: "Delete workspace",
    deleteWorkspaceBlocked: "Delete the courses in this workspace before deleting the workspace.",
    deleteWorkspaceConfirm: "Delete the workspace “{name}”?",
    deleteSubjectBlocked: "Delete the lectures in this course before deleting the course.",
    deleteSubjectConfirm: "Delete the course “{name}”?",
    deleteSessionConfirm: "Delete the lecture “{name}”?",
    moveUp: "Move {name} up",
    moveDown: "Move {name} down",
    unfold: "Expand {name}",
    fold: "Collapse {name}",
    stopBeforeSwitch: "Stop the current lecture before switching sessions.",
    tokenRequest: "Requesting Gemini token.",
    tokenReceived: "Token received from local broker.",
    socketOpen: "Gemini WebSocket open. Sending setup.",
    socketError: "Gemini WebSocket error.",
    socketClosed: "WebSocket closed: code {code}{reason}.",
    interrupted: "The connection was interrupted.",
    rotationStarted: "Refreshing Gemini session before the time limit.",
    rotationReady: "Gemini session refreshed.",
    reconnectFailed: "The recording connection could not be refreshed.",
    audioBufferFlushed: "Buffered audio sent: {count} chunks.",
    tokenMissing: "The server did not provide a connection token.",
    emptyToken: "The connection token is empty.",
    connectFailed: "The connection could not be established.",
    unsupportedMic: "This browser does not allow microphone access.",
    audioEnd: "Audio end sent. Final wait: {ms} ms.",
    finalized: "Finalization complete.",
    micActive: "Microphone active: {inputRate} Hz -> {outputRate} Hz.",
    unreadable: "Unreadable Gemini message: {message}",
    setupConfirmed: "Gemini setup confirmed.",
    interimReceived: "Interim transcript received: {count} characters.",
    finalReceived: "Final transcript received: {count} characters{language}.",
    generationComplete: "Gemini generation complete.",
    translating: "Translating to {language}…",
    translationRequested: "Translation requested to {language}.",
    translationReady: "Translation ready",
    translationReceived: "Translation received: {count} characters.",
    translationSlow: "Translation is taking too long. Check the broker and try again.",
    translationFailed: "Translation failed.",
    originalCopied: "Original text copied.",
    fullCopied: "Full transcript copied.",
    blockCopied: "{language} copied.",
    nothingToCopy: "No transcript to copy yet.",
    copyUnavailable: "Copy is not available in this browser.",
    clearConfirm: "Clear the transcript saved in this session?",
    copyDate: "Copied on {date}",
    localMode: "Local mode",
    signedInAs: "Signed in as {email}",
    signIn: "Sign in",
    signOut: "Sign out",
    signUp: "Create account",
    authSignInTitle: "Sign in",
    authSignUpTitle: "Create account",
    authDescriptionSignIn: "Use your account to save lectures online.",
    authDescriptionSignUp: "Create an account to sync lectures later.",
    authEmail: "Email",
    authPassword: "Password",
    authSwitchToSignUp: "Create account",
    authSwitchToSignIn: "Sign-in",
    authSubmitSignIn: "Sign in",
    authSubmitSignUp: "Create account",
    authResetPassword: "Forgot password?",
    authResetSent: "Password reset email sent if this address exists.",
    authResendConfirmation: "Resend confirmation",
    authConfirmationSent: "Confirmation email sent if this address is waiting for confirmation.",
    authCheckEmail: "Account created. Check your email if confirmation is enabled.",
    authSignedIn: "Signed in.",
    authSignedOut: "Signed out.",
    authFailed: "Authentication failed.",
    accountTitle: "Account",
    signInRequired: "Sign in before starting a lecture.",
    syncLoading: "Loading cloud library…",
    syncSaving: "Saving online…",
    syncSaved: "Saved online.",
    syncFailed: "Cloud sync failed.",
    syncLocalPushed: "Local library saved online.",
    syncCloudLoaded: "Cloud library loaded."
  },
  fr: {
    sidebarTitle: "Cours",
    newWorkspace: "Nouveau workspace",
    loadWorkspace: "Charger",
    loadWorkspaceTitle: "Charger un workspace",
    activeWorkspace: "Workspace actif",
    collapseCoursePanel: "Replier les cours",
    expandCoursePanel: "Afficher les cours",
    textSize: "Taille du texte",
    textSizeSmall: "Petit texte",
    textSizeMedium: "Texte moyen",
    textSizeLarge: "Grand texte",
    newCourse: "Add Course",
    newSession: "Add",
    addCourseTooltip: "Ajouter un cours dans ce workspace",
    addSessionTooltip: "Ajouter une séance dans ce cours",
    defaultWorkspace: "Mon workspace",
    defaultSubject: "Cours",
    defaultSessionPrefix: "Cours",
    noLectureSelected: "Aucune séance sélectionnée",
    start: "🎙️ Rec",
    startShort: "Rec",
    stop: "⏹️ Arrêter",
    stopShort: "Arrêter",
    ready: "Prêt",
    connecting: "Connexion…",
    recordingPreparing: "Préparation de l’enregistrement…",
    reconnecting: "Rafraîchissement de la connexion d’enregistrement…",
    microphonePrompt: "Autorisation micro en attente…",
    listening: "Écoute en cours",
    stopping: "Finalisation…",
    error: "Erreur",
    copy: "Copier",
    copied: "✓ Copié",
    copyAll: "Copier tout",
    copyAllShort: "Copier",
    exportSession: "Exporter",
    exportTitle: "Exporter la séance",
    exportDescription: "Choisis un export formaté.",
    exportMarkdown: "Markdown",
    exportPdf: "PDF",
    exportWord: "Word",
    exportReady: "Export prêt.",
    printReady: "Fenêtre d'impression ouverte.",
    searchWorkspace: "Rechercher",
    searchTitle: "Rechercher dans le workspace",
    searchPlaceholder: "Rechercher dans toutes les séances...",
    searchEmpty: "Aucun résultat.",
    searchHint: "Entre un mot-clé pour chercher dans ce workspace.",
    bookmarkAction: "Marquer",
    bookmarkTooltip: "Marquer le moment en cours",
    bookmarkAdded: "Marque-page ajouté.",
    bookmarksTitle: "Marque-pages",
    bookmarksHint: "Marquer les moments importants pendant l'enregistrement",
    bookmarksEmpty: "Aucun marque-page pour le moment.",
    bookmarksFold: "Replier les marque-pages",
    bookmarksUnfold: "Afficher les marque-pages",
    bookmarksFolded: "Marque-pages · {count}",
    bookmarkDefault: "Marque-page {number}",
    clear: "Effacer le texte",
    clearShort: "Effacer",
    originalTab: "Original",
    foldTranscript: "Replier la transcription",
    unfoldTranscript: "Afficher la transcription",
    foldedTranscript: "{label} · {count} caractères",
    playSpeech: "Lire la traduction à voix haute",
    stopSpeech: "Arrêter l'audio",
    speechGenerating: "Préparation de l'audio…",
    speechReady: "Audio prêt",
    speechTapAgain: "Audio prêt. Appuie à nouveau sur lecture.",
    speechFailed: "La génération audio a échoué.",
    speechUnavailable: "Génère une traduction avant de l'écouter.",
    foldNotes: "Replier les notes",
    unfoldNotes: "Afficher les notes",
    foldedNotes: "Notes · {count} caractères",
    foldSummary: "Replier la fiche",
    unfoldSummary: "Afficher la fiche",
    foldedSummary: "Fiche {label} · {count} caractères",
    empty: "Les paroles du professeur apparaîtront ici.",
    emptyTranslation: "Choisis une langue pour générer une traduction.",
    detectedUnknown: "Langue détectée: inconnue",
    detectedMixed: "Langue détectée: mixte",
    detected: "Langue détectée: {language}",
    technicalDetails: "Détails techniques",
    waiting: "En attente d'une session.",
    disclaimer: "Les sous-titres sont une aide et peuvent contenir des erreurs.",
    newCourseTitle: "Nouveau cours",
    courseName: "Nom du cours",
    newWorkspaceTitle: "Nouveau workspace",
    workspaceName: "Nom du workspace",
    cancel: "Annuler",
    close: "Fermer",
    create: "Créer",
    confirmTitle: "Confirmer",
    delete: "Supprimer",
    notesTitle: "Notes",
    notesHint: "Enregistrées automatiquement",
    notesPlaceholder: "Ajouter des notes pendant l'écoute...",
    summaryTitle: "Fiche résumé",
    summaryHint: "Fiche générée · {profile}",
    summaryPlaceholder: "Générer une fiche de révision à partir de cette séance.",
    generateSummary: "Générer",
    regenerateSummary: "Régénérer",
    editSummary: "Modifier",
    summarySettings: "Réglages de la fiche",
    summaryProfileTitle: "Réglages de la fiche",
    summaryProfileDescription: "Choisis la structure utilisée pour générer les fiches.",
    summaryProfileStudent: "Étudiant",
    summaryProfileStudentDescription: "Fiche de révision avec idées principales, notions clés, détails importants, questions possibles et vocabulaire.",
    summaryProfileBusiness: "Business",
    summaryProfileBusinessDescription: "Synthèse business avec contexte, décisions, actions, risques, opportunités et prochaines étapes.",
    summaryProfileMeeting: "Réunion",
    summaryProfileMeetingDescription: "Compte rendu avec sujets abordés, décisions, responsables, questions ouvertes et suivis.",
    summaryProfileResearch: "Recherche",
    summaryProfileResearchDescription: "Synthèse analytique avec thèse, preuves, méthodes, limites et points à vérifier.",
    summaryIncludeNotes: "Utiliser les notes personnelles pour générer les fiches",
    customProfileTitle: "Profil personnalisé",
    customProfileName: "Nom du profil",
    customProfileKeywords: "Sections ou mots-clés",
    customProfileKeywordsPlaceholder: "Une section ou un mot-clé par ligne",
    customProfileAdd: "Ajouter le profil",
    customProfileDelete: "Supprimer le profil",
    customProfileSaved: "Profil de fiche enregistré.",
    copySummary: "Copier",
    summaryCopied: "Fiche résumé copiée.",
    summaryGenerating: "Génération de la fiche…",
    summaryGeneratingLanguage: "Génération de la fiche en {language}…",
    summaryRequested: "Fiche résumé demandée.",
    summaryReady: "Fiche résumé prête",
    summaryReceived: "Fiche reçue: {count} caractères.",
    summarySlow: "La génération de fiche prend trop de temps. Essaie avec une transcription plus courte.",
    summaryFailed: "La génération de fiche a échoué.",
    summaryEmpty: "Aucune fiche résumé à copier pour le moment.",
    editTranscriptSegment: "Modifier la transcription",
    emptyTranscriptSegment: "La transcription ne peut pas être vide.",
    rename: "Double-cliquer pour renommer",
    renameAria: "Renommer",
    deleteSubject: "Supprimer le cours",
    deleteSession: "Supprimer la séance",
    deleteWorkspace: "Supprimer le workspace",
    deleteWorkspaceBlocked: "Supprime d'abord tous les cours de ce workspace avant de le supprimer.",
    deleteWorkspaceConfirm: "Supprimer le workspace « {name} » ?",
    deleteSubjectBlocked: "Supprime d'abord toutes les séances de ce cours avant de supprimer le cours.",
    deleteSubjectConfirm: "Supprimer le cours « {name} » ?",
    deleteSessionConfirm: "Supprimer la séance « {name} » ?",
    moveUp: "Remonter {name}",
    moveDown: "Descendre {name}",
    unfold: "Déplier {name}",
    fold: "Replier {name}",
    stopBeforeSwitch: "Arrête la séance en cours avant de changer de cours.",
    tokenRequest: "Demande d'un jeton Gemini.",
    tokenReceived: "Jeton reçu du broker local.",
    socketOpen: "WebSocket Gemini ouverte. Envoi de la configuration.",
    socketError: "Erreur WebSocket Gemini.",
    socketClosed: "WebSocket fermée: code {code}{reason}.",
    interrupted: "La connexion a été interrompue.",
    rotationStarted: "Rafraîchissement de la session Gemini avant la limite de temps.",
    rotationReady: "Session Gemini rafraîchie.",
    reconnectFailed: "La connexion d’enregistrement n’a pas pu être rafraîchie.",
    audioBufferFlushed: "Audio mis en attente envoyé: {count} blocs.",
    tokenMissing: "Le serveur n’a pas fourni de jeton de connexion.",
    emptyToken: "Le jeton de connexion est vide.",
    connectFailed: "La connexion n’a pas pu être établie.",
    unsupportedMic: "Ce navigateur ne permet pas l’accès au microphone.",
    audioEnd: "Fin d'audio envoyée. Attente finale: {ms} ms.",
    finalized: "Finalisation terminée.",
    micActive: "Micro actif: {inputRate} Hz -> {outputRate} Hz.",
    unreadable: "Message Gemini illisible: {message}",
    setupConfirmed: "Configuration Gemini confirmée.",
    interimReceived: "Transcription temporaire reçue: {count} caractères.",
    finalReceived: "Transcription finale reçue: {count} caractères{language}.",
    generationComplete: "Génération Gemini terminée.",
    translating: "Traduction vers {language}…",
    translationRequested: "Traduction demandée vers {language}.",
    translationReady: "Traduction prête",
    translationReceived: "Traduction reçue: {count} caractères.",
    translationSlow: "La traduction prend trop de temps. Vérifie le broker et réessaie.",
    translationFailed: "La traduction a échoué.",
    originalCopied: "Texte original copié.",
    fullCopied: "Transcription complète copiée.",
    blockCopied: "{language} copié.",
    nothingToCopy: "Aucune transcription à copier pour le moment.",
    copyUnavailable: "La copie n’est pas disponible dans ce navigateur.",
    clearConfirm: "Effacer la transcription enregistrée dans cette séance ?",
    copyDate: "Copie du {date}",
    localMode: "Mode local",
    signedInAs: "Connecté: {email}",
    signIn: "Connexion",
    signOut: "Déconnexion",
    signUp: "Créer un compte",
    authSignInTitle: "Connexion",
    authSignUpTitle: "Créer un compte",
    authDescriptionSignIn: "Utilise ton compte pour sauvegarder les cours en ligne.",
    authDescriptionSignUp: "Crée un compte pour synchroniser les cours ensuite.",
    authEmail: "Email",
    authPassword: "Mot de passe",
    authSwitchToSignUp: "Créer un compte",
    authSwitchToSignIn: "J'ai déjà un compte",
    authSubmitSignIn: "Connexion",
    authSubmitSignUp: "Créer le compte",
    authResetPassword: "Mot de passe oublié ?",
    authResetSent: "Email de réinitialisation envoyé si cette adresse existe.",
    authResendConfirmation: "Renvoyer confirmation",
    authConfirmationSent: "Email de confirmation envoyé si cette adresse est en attente de confirmation.",
    authCheckEmail: "Compte créé. Vérifie tes emails si la confirmation est activée.",
    authSignedIn: "Connexion réussie.",
    authSignedOut: "Déconnexion réussie.",
    authFailed: "Authentification impossible.",
    accountTitle: "Compte",
    signInRequired: "Connecte-toi avant de démarrer un cours.",
    syncLoading: "Chargement de la bibliothèque en ligne…",
    syncSaving: "Sauvegarde en ligne…",
    syncSaved: "Sauvegardé en ligne.",
    syncFailed: "Synchronisation cloud impossible.",
    syncLocalPushed: "Bibliothèque locale sauvegardée en ligne.",
    syncCloudLoaded: "Bibliothèque en ligne chargée."
  }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const toggleButton = document.querySelector("#toggle");
const bookmarkCurrentButton = document.querySelector("#bookmark-current");
const copyAllButton = document.querySelector("#copy-all");
const exportSessionButton = document.querySelector("#export-session");
const searchWorkspaceButton = document.querySelector("#search-workspace");
const clearButton = document.querySelector("#clear");
const textSizeSmallButton = document.querySelector("#text-size-small");
const textSizeMediumButton = document.querySelector("#text-size-medium");
const textSizeLargeButton = document.querySelector("#text-size-large");
const coursePanelElement = document.querySelector("#course-panel");
const coursePanelToggleButton = document.querySelector("#course-panel-toggle");
const coursePanelSummaryButton = document.querySelector("#course-panel-summary");
const coursePanelArrowElement = document.querySelector("#course-panel-arrow");
const coursePanelCurrentElement = document.querySelector("#course-panel-current");
const newWorkspaceButton = document.querySelector("#new-workspace");
const loadWorkspaceButton = document.querySelector("#load-workspace");
const activeWorkspaceTitleElement = document.querySelector("#active-workspace-title");
const uiEnglishButton = document.querySelector("#ui-en");
const uiFrenchButton = document.querySelector("#ui-fr");
const sidebarTitleElement = document.querySelector("#sidebar-title");
const statusElement = document.querySelector("#status");
const transcriptElement = document.querySelector("#transcript");
const interimElement = document.querySelector("#interim");
const transcriptCardElement = document.querySelector(".transcript-card");
const speakTranscriptButton = document.querySelector("#speak-transcript");
const transcriptFoldButton = document.querySelector("#transcript-fold");
const transcriptFoldSummaryElement = document.querySelector("#transcript-fold-summary");
const errorElement = document.querySelector("#error");
const diagnosticsElement = document.querySelector("#diagnostics");
const transcriptTabButtons = [...document.querySelectorAll("[data-transcript-tab]")];
const courseTreeElement = document.querySelector("#course-tree");
const activeSubjectTitleElement = document.querySelector("#active-subject-title");
const activeSessionTitleElement = document.querySelector("#active-session-title");
const diagnosticsSummaryElement = document.querySelector("#diagnostics-summary");
const disclaimerElement = document.querySelector("#disclaimer");
const activityBannerElement = document.querySelector("#activity-banner");
const activityTextElement = document.querySelector("#activity-text");
const notesTitleElement = document.querySelector("#notes-title");
const notesHintElement = document.querySelector("#notes-hint");
const sessionNotesElement = document.querySelector("#session-notes");
const notesPanelElement = document.querySelector(".notes-panel");
const notesFoldButton = document.querySelector("#notes-fold");
const notesFoldSummaryElement = document.querySelector("#notes-fold-summary");
const bookmarksTitleElement = document.querySelector("#bookmarks-title");
const bookmarksHintElement = document.querySelector("#bookmarks-hint");
const bookmarksPanelElement = document.querySelector(".bookmarks-panel");
const bookmarksFoldButton = document.querySelector("#bookmarks-fold");
const bookmarksFoldSummaryElement = document.querySelector("#bookmarks-fold-summary");
const bookmarksListElement = document.querySelector("#bookmarks-list");
const summaryTitleElement = document.querySelector("#summary-title");
const summaryHintElement = document.querySelector("#summary-hint");
const summarySettingsButton = document.querySelector("#summary-settings");
const sessionSummaryElement = document.querySelector("#session-summary");
const sessionSummaryPreviewElement = document.querySelector("#session-summary-preview");
const summaryPanelElement = document.querySelector(".summary-panel");
const summaryFoldButton = document.querySelector("#summary-fold");
const summaryFoldSummaryElement = document.querySelector("#summary-fold-summary");
const summaryLanguageButtons = [...document.querySelectorAll("[data-summary-language]")];
const editSummaryButton = document.querySelector("#edit-summary");
const copySummaryButton = document.querySelector("#copy-summary");
const subjectDialog = document.querySelector("#subject-dialog");
const subjectForm = document.querySelector("#subject-form");
const subjectNameInput = document.querySelector("#subject-name");
const subjectDialogTitleElement = document.querySelector("#subject-dialog-title");
const subjectNameLabelElement = document.querySelector("#subject-name-label");
const subjectCancelButton = document.querySelector("#subject-cancel");
const subjectCreateButton = document.querySelector("#subject-create");
const workspaceDialog = document.querySelector("#workspace-dialog");
const workspaceDialogTitleElement = document.querySelector("#workspace-dialog-title");
const workspaceListElement = document.querySelector("#workspace-list");
const workspaceCloseButton = document.querySelector("#workspace-close");
const confirmDialog = document.querySelector("#confirm-dialog");
const confirmForm = document.querySelector("#confirm-form");
const confirmTitleElement = document.querySelector("#confirm-title");
const confirmMessageElement = document.querySelector("#confirm-message");
const confirmCancelButton = document.querySelector("#confirm-cancel");
const confirmOkButton = document.querySelector("#confirm-ok");
const authStateElement = document.querySelector("#auth-state");
const authButton = document.querySelector("#auth-button");
const authDialog = document.querySelector("#auth-dialog");
const authForm = document.querySelector("#auth-form");
const authTitleElement = document.querySelector("#auth-title");
const authDescriptionElement = document.querySelector("#auth-description");
const authEmailInput = document.querySelector("#auth-email");
const authPasswordInput = document.querySelector("#auth-password");
const authEmailLabelElement = document.querySelector("#auth-email-label");
const authPasswordLabelElement = document.querySelector("#auth-password-label");
const authErrorElement = document.querySelector("#auth-error");
const authResetButton = document.querySelector("#auth-reset");
const authResendButton = document.querySelector("#auth-resend");
const authSwitchButton = document.querySelector("#auth-switch");
const authCancelButton = document.querySelector("#auth-cancel");
const authSubmitButton = document.querySelector("#auth-submit");
const accountDialog = document.querySelector("#account-dialog");
const accountTitleElement = document.querySelector("#account-title");
const accountEmailElement = document.querySelector("#account-email");
const accountCloseButton = document.querySelector("#account-close");
const accountSignOutButton = document.querySelector("#account-sign-out");
const summaryProfileDialog = document.querySelector("#summary-profile-dialog");
const summaryProfileTitleElement = document.querySelector("#summary-profile-title");
const summaryProfileDescriptionElement = document.querySelector("#summary-profile-description");
const summaryIncludeNotesInput = document.querySelector("#summary-include-notes");
const summaryIncludeNotesLabelElement = document.querySelector("#summary-include-notes-label");
const summaryProfileListElement = document.querySelector("#summary-profile-list");
const summaryProfileCloseButton = document.querySelector("#summary-profile-close");
const customProfileTitleElement = document.querySelector("#custom-profile-title");
const customProfileNameLabelElement = document.querySelector("#custom-profile-name-label");
const customProfileNameInput = document.querySelector("#custom-profile-name");
const customProfileKeywordsLabelElement = document.querySelector("#custom-profile-keywords-label");
const customProfileKeywordsInput = document.querySelector("#custom-profile-keywords");
const customProfileAddButton = document.querySelector("#custom-profile-add");
const exportDialog = document.querySelector("#export-dialog");
const exportTitleElement = document.querySelector("#export-title");
const exportDescriptionElement = document.querySelector("#export-description");
const exportMarkdownButton = document.querySelector("#export-markdown");
const exportPdfButton = document.querySelector("#export-pdf");
const exportWordButton = document.querySelector("#export-word");
const exportCloseButton = document.querySelector("#export-close");
const searchDialog = document.querySelector("#search-dialog");
const searchTitleElement = document.querySelector("#search-title");
const searchInputElement = document.querySelector("#search-input");
const searchResultsElement = document.querySelector("#search-results");
const searchCloseButton = document.querySelector("#search-close");

let socket;
let mediaStream;
let audioContext;
let audioSource;
let processor;
let silentOutput;
let isListening = false;
let isStopping = false;
let recordingStartedAt = 0;
let isRotatingConnection = false;
let stopAfterRotation = false;
let audioSendPaused = false;
let stopWaiter;
let hasPendingInterim = false;
let rotationTimer;
let queuedAudioChunks = [];
let plannedSocketCloses = new WeakSet();
let diagnosticLines = [];
let translatingTo = "";
let summarizingTo = "";
let speakingKey = "";
let activeTranscriptTab = "original";
let isTranscriptFolded = false;
let isBookmarksFolded = false;
let isNotesFolded = false;
let isSummaryFolded = false;
let isSummaryEditing = false;
let pendingSessionSelect;
let authSession;
let authMode = "signIn";
let dialogMode = "subject";
let syncTimer;
let localSaveTimer;
let isSyncingCloud = false;
let isApplyingCloudLibrary = false;
let isCoursePanelCollapsed = false;
let transcriptEditTimer;
let wakeLock;
let speechAudio;
const speechCache = new Map();
let uiLanguage = localStorage.getItem(UI_LANGUAGE_KEY) || "en";
let textSize = normalizeTextSize(localStorage.getItem(TEXT_SIZE_KEY));
let includeNotesInSummary = localStorage.getItem(SUMMARY_INCLUDE_NOTES_KEY) !== "false";
let summaryProfile = normalizeSummaryProfile(localStorage.getItem(SUMMARY_PROFILE_KEY));
let library = loadLibrary();

renderAll();
if (RECORDING_PREVIEW) setRecordingLayout(true);
registerServiceWorker();
initializeAuth();

toggleButton.addEventListener("click", () => (isListening ? stopSession() : startSession()));
bookmarkCurrentButton.addEventListener("click", addCurrentBookmark);
copyAllButton.addEventListener("click", copyFullTranscript);
exportSessionButton.addEventListener("click", openExportDialog);
searchWorkspaceButton.addEventListener("click", openSearchDialog);
clearButton.addEventListener("click", clearTranscript);
speakTranscriptButton.addEventListener("click", toggleSpeechPlayback);
transcriptFoldButton.addEventListener("click", toggleTranscriptFold);
notesFoldButton.addEventListener("click", toggleNotesFold);
bookmarksFoldButton.addEventListener("click", toggleBookmarksFold);
summarySettingsButton.addEventListener("click", openSummaryProfileDialog);
summaryFoldButton.addEventListener("click", toggleSummaryFold);
for (const button of transcriptTabButtons) {
  button.addEventListener("click", () => selectTranscriptTab(button.dataset.transcriptTab));
}
textSizeSmallButton.addEventListener("click", () => setTextSize("small"));
textSizeMediumButton.addEventListener("click", () => setTextSize("medium"));
textSizeLargeButton.addEventListener("click", () => setTextSize("large"));
coursePanelToggleButton.addEventListener("click", () => setCoursePanelCollapsed(true));
coursePanelSummaryButton.addEventListener("click", () => setCoursePanelCollapsed(false));
newWorkspaceButton.addEventListener("click", openWorkspaceDialog);
loadWorkspaceButton.addEventListener("click", openWorkspaceSwitcher);
workspaceCloseButton.addEventListener("click", () => workspaceDialog.close());
activeWorkspaceTitleElement.addEventListener("dblclick", (event) => {
  event.stopPropagation();
  const workspace = getActiveWorkspace();
  if (workspace) startInlineEdit(activeWorkspaceTitleElement, workspace.name, (name) => renameWorkspace(workspace.id, name));
});
uiEnglishButton.addEventListener("click", () => setInterfaceLanguage("en"));
uiFrenchButton.addEventListener("click", () => setInterfaceLanguage("fr"));
subjectCancelButton.addEventListener("click", () => subjectDialog.close());
subjectForm.addEventListener("submit", createSubjectFromDialog);
sessionNotesElement.addEventListener("input", saveSessionNotes);
summaryIncludeNotesInput.addEventListener("change", toggleSummaryNotesContext);
customProfileAddButton.addEventListener("click", createCustomSummaryProfile);
sessionSummaryElement.addEventListener("input", saveSessionSummary);
sessionSummaryElement.addEventListener("blur", finishSummaryEdit);
editSummaryButton.addEventListener("click", editSummary);
for (const button of summaryLanguageButtons) {
  button.addEventListener("click", () => selectSummaryLanguage(button.dataset.summaryLanguage));
}
copySummaryButton.addEventListener("click", copySummary);
authButton.addEventListener("click", handleAuthButton);
authForm.addEventListener("submit", handleAuthSubmit);
authResetButton.addEventListener("click", sendPasswordReset);
authResendButton.addEventListener("click", resendEmailConfirmation);
authSwitchButton.addEventListener("click", toggleAuthMode);
authCancelButton.addEventListener("click", () => authDialog.close());
accountCloseButton.addEventListener("click", () => accountDialog.close());
accountSignOutButton.addEventListener("click", signOut);
summaryProfileCloseButton.addEventListener("click", () => summaryProfileDialog.close());
exportMarkdownButton.addEventListener("click", () => exportCurrentSession("markdown"));
exportPdfButton.addEventListener("click", () => exportCurrentSession("pdf"));
exportWordButton.addEventListener("click", () => exportCurrentSession("word"));
exportCloseButton.addEventListener("click", () => exportDialog.close());
searchInputElement.addEventListener("input", renderSearchResults);
searchCloseButton.addEventListener("click", () => searchDialog.close());

async function startSession() {
  clearError();
  if (!authSession?.access_token) {
    showError(t("signInRequired"));
    openAuthDialog();
    return;
  }
  ensureActiveSession({ createSessionIfMissing: true });
  revealActiveSubject();
  setCoursePanelCollapsed(true);
  activeTranscriptTab = "original";
  isTranscriptFolded = false;
  renderAll();
  toggleButton.disabled = true;
  setRecordingLayout(true);
  setStatus(t("microphonePrompt"), "connecting");
  showActivity(t("microphonePrompt"));

  try {
    await startAudioCapture();
    showActivity(t("recordingPreparing"));
    setStatus(t("connecting"), "connecting");
    const token = await requestToken();
    await openSocket(token);
    flushQueuedAudio();
    await requestScreenWakeLock();
    isListening = true;
    recordingStartedAt = Date.now();
    toggleButton.disabled = false;
    setActionButton(toggleButton, "⏹", t("stopShort"));
    toggleButton.classList.add("is-stop");
    renderSegments();
    renderLibrary();
    setStatus(t("listening"), "listening");
    hideActivity();
    scheduleConnectionRotation();
  } catch (error) {
    clearConnectionRotationTimer();
    hideActivity();
    await releaseScreenWakeLock();
    await cleanupAudio();
    socket?.close();
    socket = undefined;
    showError(error.message || t("connectFailed"));
    setStatus(t("error"), "error");
    toggleButton.disabled = false;
    setRecordingLayout(false);
  }
}

async function stopSession() {
  if (isRotatingConnection) {
    stopAfterRotation = true;
    toggleButton.disabled = true;
    setStatus(t("stopping"), "stopping");
    return;
  }
  if (isStopping) return;
  isStopping = true;
  toggleButton.disabled = true;
  clearConnectionRotationTimer();
  audioSendPaused = false;
  queuedAudioChunks = [];
  setStatus(t("stopping"), "stopping");

  await cleanupAudio();
  await finishTranscription();
  await releaseScreenWakeLock();
  flushLocalLibrarySave();

  socket?.close();
  socket = undefined;

  isStopping = false;
  isListening = false;
  recordingStartedAt = 0;
  resetControls();
}

function resetControls() {
  toggleButton.disabled = false;
  setRecordingLayout(RECORDING_PREVIEW);
  setActionButton(toggleButton, "🎙️", t("startShort"));
  toggleButton.classList.remove("is-stop");
  hideInterimTranscript();
  setStatus(t("ready"), "idle");
  hideActivity();
  clearConnectionRotationTimer();
  audioSendPaused = false;
  queuedAudioChunks = [];
  plannedSocketCloses = new WeakSet();
  stopAfterRotation = false;
  recordingStartedAt = isListening ? recordingStartedAt : 0;
  renderLibrary();
  renderSegments();
  renderTranscriptTabs();
}

function setRecordingLayout(isRecording) {
  document.body.dataset.recording = isRecording ? "true" : "false";
}

async function finishTranscription() {
  if (socket?.readyState !== WebSocket.OPEN) return;

  const waitMs = hasPendingInterim ? FINAL_TRANSCRIPT_WAIT_MS : QUIET_FINAL_WAIT_MS;
  const finalWait = waitForFinalTranscription(waitMs);
  addDiagnostic(t("audioEnd", { ms: waitMs }));
  sendJSON({ realtimeInput: { audioStreamEnd: true } });
  await finalWait;
  addDiagnostic(t("finalized"));
}

function waitForFinalTranscription(waitMs) {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, waitMs);
    stopWaiter = () => {
      window.clearTimeout(timeout);
      stopWaiter = undefined;
      resolve();
    };
  });
}

function scheduleConnectionRotation() {
  clearConnectionRotationTimer();
  if (!isListening || isStopping) return;
  rotationTimer = window.setTimeout(rotateGeminiConnection, LIVE_SESSION_ROTATE_MS);
}

function clearConnectionRotationTimer() {
  window.clearTimeout(rotationTimer);
  rotationTimer = undefined;
}

async function rotateGeminiConnection() {
  if (!isListening || isStopping || isRotatingConnection) return;
  isRotatingConnection = true;
  audioSendPaused = true;
  toggleButton.disabled = true;
  setStatus(t("reconnecting"), "connecting");
  showActivity(t("reconnecting"));
  addDiagnostic(t("rotationStarted"));

  try {
    await finishTranscription();
    const previousSocket = socket;
    socket = undefined;
    if (previousSocket?.readyState === WebSocket.OPEN || previousSocket?.readyState === WebSocket.CONNECTING) {
      plannedSocketCloses.add(previousSocket);
      previousSocket.close();
    }

    const token = await requestToken();
    await openSocket(token);
    audioSendPaused = false;
    flushQueuedAudio();
    addDiagnostic(t("rotationReady"));

    if (stopAfterRotation) {
      stopAfterRotation = false;
      isRotatingConnection = false;
      await stopSession();
      return;
    }

    toggleButton.disabled = false;
    setStatus(t("listening"), "listening");
    hideActivity();
    scheduleConnectionRotation();
  } catch (error) {
    addDiagnostic(`${t("reconnectFailed")} ${error.message ?? ""}`.trim());
    showError(error.message || t("reconnectFailed"));
    await handleUnexpectedClose();
  } finally {
    isRotatingConnection = false;
  }
}

async function handleUnexpectedClose() {
  clearConnectionRotationTimer();
  await cleanupAudio();
  await releaseScreenWakeLock();
  socket = undefined;
  stopWaiter?.();
  isStopping = false;
  isListening = false;
  recordingStartedAt = 0;
  showError(t("interrupted"));
  resetControls();
}

function showActivity(message) {
  activityTextElement.textContent = message;
  activityBannerElement.hidden = false;
}

function hideActivity() {
  activityBannerElement.hidden = true;
}

async function requestToken() {
  addDiagnostic(t("tokenRequest"));
  const response = await fetch(TOKEN_ENDPOINT, {
    cache: "no-store",
    headers: getAuthenticatedHeaders()
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || t("tokenMissing"));
  }
  const result = await response.json();
  if (!result.token) throw new Error(t("emptyToken"));
  addDiagnostic(t("tokenReceived"));
  return result.token;
}

function openSocket(token) {
  return new Promise((resolve, reject) => {
    const endpoint = new URL(
      "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained"
    );
    endpoint.searchParams.set("access_token", token);
    const connectionSocket = new WebSocket(endpoint);
    socket = connectionSocket;

    connectionSocket.onopen = () => {
      addDiagnostic(t("socketOpen"));
      sendJSONToSocket(connectionSocket, {
        setup: {
          model: `models/${MODEL}`,
          generationConfig: { responseModalities: ["TEXT"] },
          inputAudioTranscription: { languageCodes: [] }
        }
      });
      resolve();
    };
    connectionSocket.onmessage = async (event) => {
      const data = await readMessageData(event.data);
      const message = parseMessage(data);
      if (!message) {
        addDiagnostic(t("unreadable", { message: summarizeMessage(data) }));
        return;
      }
      handleMessage(message);
    };
    connectionSocket.onerror = () => {
      addDiagnostic(t("socketError"));
      reject(new Error(t("socketError")));
    };
    connectionSocket.onclose = (event) => {
      addDiagnostic(t("socketClosed", { code: event.code, reason: event.reason ? `, ${event.reason}` : "" }));
      stopWaiter?.();
      if (plannedSocketCloses.has(connectionSocket)) {
        plannedSocketCloses.delete(connectionSocket);
        return;
      }
      if (isListening && !isStopping) handleUnexpectedClose();
    };
  });
}

async function startAudioCapture() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(t("unsupportedMic"));
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
  });
  audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
  await audioContext.resume();
  audioSource = audioContext.createMediaStreamSource(mediaStream);
  processor = audioContext.createScriptProcessor(4096, 1, 1);
  silentOutput = audioContext.createGain();
  silentOutput.gain.value = 0;

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const pcm = resampleAndEncode(input, audioContext.sampleRate, TARGET_SAMPLE_RATE);
    if (audioSendPaused || socket?.readyState !== WebSocket.OPEN) {
      queueAudioChunk(pcm);
      return;
    }
    sendAudioChunk(pcm);
  };

  audioSource.connect(processor);
  processor.connect(silentOutput);
  silentOutput.connect(audioContext.destination);
  addDiagnostic(t("micActive", { inputRate: audioContext.sampleRate, outputRate: TARGET_SAMPLE_RATE }));
}

async function cleanupAudio() {
  mediaStream?.getTracks().forEach((track) => track.stop());
  processor?.disconnect();
  audioSource?.disconnect();
  silentOutput?.disconnect();
  await audioContext?.close();
  mediaStream = undefined;
  processor = undefined;
  audioSource = undefined;
  silentOutput = undefined;
  audioContext = undefined;
}

async function requestScreenWakeLock() {
  if (!("wakeLock" in navigator) || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = undefined;
    });
  } catch {
    wakeLock = undefined;
  }
}

async function releaseScreenWakeLock() {
  if (!wakeLock) return;
  const lock = wakeLock;
  wakeLock = undefined;
  try {
    await lock.release();
  } catch {
    // The browser may already have released it when the page lost focus.
  }
}

async function readMessageData(data) {
  if (typeof data === "string") return data;
  if (data instanceof Blob) return data.text();
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  return String(data);
}

function parseMessage(rawMessage) {
  try { return JSON.parse(rawMessage); } catch { return undefined; }
}

function handleMessage(message) {
  if (message.setupComplete) addDiagnostic(t("setupConfirmed"));

  const content = message.serverContent;
  if (!content) return;

  const interim = content.interimInputTranscription?.text;
  if (interim) {
    hasPendingInterim = true;
    showInterimTranscript(interim);
    addDiagnostic(t("interimReceived", { count: interim.length }));
  }

  const finalized = content.inputTranscription?.text?.trim();
  if (finalized) {
    const session = getActiveSession();
    if (!session) return;
    const sourceLanguage = normalizeLanguageCode(content.inputTranscription.languageCode);
    const segment = {
      id: crypto.randomUUID(),
      text: finalized,
      sourceLanguage,
      createdAt: new Date().toISOString()
    };
    hasPendingInterim = false;
    addDiagnostic(t("finalReceived", { count: finalized.length, language: sourceLanguage ? ` (${sourceLanguage})` : "" }));
    session.segments.push(segment);
    session.translations = {};
    stopSpeechPlayback();
    hideInterimTranscript();
    appendTranscriptSegment(segment);
    saveLibrary({ defer: true });
    renderTranscriptTabs();
    stopWaiter?.();
  }

  if (content.generationComplete) addDiagnostic(t("generationComplete"));
}

function createWorkspace() {
  const name = subjectNameInput.value.trim();
  const workspace = createDefaultWorkspace({ withSubject: false });
  workspace.name = name;
  library.workspaces.push(workspace);
  library.activeWorkspaceId = workspace.id;
  library.activeSubjectId = "";
  library.activeSessionId = "";
  saveLibrary();
  renderAll();
}

function createSubject(workspaceId = library.activeWorkspaceId) {
  const workspace = library.workspaces.find((item) => item.id === workspaceId) ?? getActiveWorkspace();
  const name = subjectNameInput.value.trim();
  const subject = {
    id: crypto.randomUUID(),
    name: name.trim(),
    collapsed: false,
    createdAt: new Date().toISOString(),
    sessions: [createSessionRecord()]
  };
  workspace.subjects.push(subject);
  library.activeWorkspaceId = workspace.id;
  library.activeSubjectId = subject.id;
  library.activeSessionId = subject.sessions[0].id;
  saveLibrary();
  renderAll();
}

function openWorkspaceDialog() {
  dialogMode = "workspace";
  if (workspaceDialog.open) workspaceDialog.close();
  renderInterfaceText();
  subjectNameInput.value = "";
  subjectDialog.showModal();
  window.setTimeout(() => subjectNameInput.focus(), 0);
}

function openWorkspaceSwitcher() {
  renderWorkspaceSwitcher();
  workspaceDialog.showModal();
}

function selectWorkspace(workspaceId) {
  if (isListening) {
    showError(t("stopBeforeSwitch"));
    return;
  }

  const workspace = library.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return;
  const subject = workspace.subjects[0];
  library.activeWorkspaceId = workspace.id;
  library.activeSubjectId = subject?.id ?? "";
  library.activeSessionId = subject?.sessions[0]?.id ?? "";
  translatingTo = "";
  clearError();
  workspaceDialog.close();
  saveLibrary();
  renderAll();
}

function openSubjectDialog(workspaceId = library.activeWorkspaceId) {
  dialogMode = "subject";
  library.activeWorkspaceId = workspaceId;
  renderInterfaceText();
  subjectNameInput.value = "";
  subjectDialog.showModal();
  window.setTimeout(() => subjectNameInput.focus(), 0);
}

function createSubjectFromDialog(event) {
  event.preventDefault();
  if (!subjectNameInput.value.trim()) return;
  if (dialogMode === "workspace") createWorkspace();
  else createSubject();
  subjectDialog.close();
}

function createSession(subjectId = library.activeSubjectId) {
  const location = findSubjectLocation(subjectId);
  const subject = location?.subject ?? getActiveSubject();
  const workspace = location?.workspace ?? getActiveWorkspace();
  const session = createSessionRecord();
  subject.sessions.push(session);
  library.activeWorkspaceId = workspace.id;
  library.activeSubjectId = subject.id;
  library.activeSessionId = session.id;
  subject.collapsed = false;
  saveLibrary();
  renderAll();
}

function createSessionRecord() {
  return {
    id: crypto.randomUUID(),
    title: defaultSessionTitle(),
    createdAt: new Date().toISOString(),
    segments: [],
    notes: "",
    bookmarks: [],
    summary: "",
    summaryLanguage: uiLanguage,
    summaryProfile,
    summaries: {},
    translations: {}
  };
}

function defaultSessionTitle() {
  return `${t("defaultSessionPrefix")} ${new Date().toLocaleDateString(locale(), { day: "2-digit", month: "2-digit" })}`;
}

function selectSession(subjectId, sessionId) {
  if (isListening) {
    showError(t("stopBeforeSwitch"));
    return;
  }
  const location = findSubjectLocation(subjectId);
  if (location) library.activeWorkspaceId = location.workspace.id;
  library.activeSubjectId = subjectId;
  library.activeSessionId = sessionId;
  translatingTo = "";
  clearError();
  saveLibrary();
  renderAll();
}

async function handleSessionRecord(subjectId, sessionId) {
  const isActiveSession = subjectId === library.activeSubjectId && sessionId === library.activeSessionId;
  if (isListening) {
    if (isActiveSession) await stopSession();
    else showError(t("stopBeforeSwitch"));
    return;
  }

  const location = findSubjectLocation(subjectId);
  if (!location) return;
  library.activeWorkspaceId = location.workspace.id;
  library.activeSubjectId = subjectId;
  library.activeSessionId = sessionId;
  clearError();
  saveLibrary();
  renderAll();
  await startSession();
}

function renderAll() {
  ensureActiveSession();
  renderInterfaceText();
  renderHeader();
  renderCoursePanelState();
  renderLibrary();
  renderWorkspaceSwitcher();
  renderSegments();
  renderBookmarks();
  renderNotes();
  renderSummary();
  renderTranscriptTabs();
}

function renderInterfaceText() {
  document.documentElement.lang = uiLanguage;
  sidebarTitleElement.textContent = t("sidebarTitle");
  newWorkspaceButton.textContent = t("newWorkspace");
  loadWorkspaceButton.textContent = t("loadWorkspace");
  workspaceDialogTitleElement.textContent = t("loadWorkspaceTitle");
  activeWorkspaceTitleElement.title = t("rename");
  if (!isListening && !isStopping) setActionButton(toggleButton, "🎙️", t("startShort"));
  setActionButton(bookmarkCurrentButton, "⚑", t("bookmarkAction"));
  bookmarkCurrentButton.title = t("bookmarkTooltip");
  bookmarkCurrentButton.setAttribute("aria-label", t("bookmarkTooltip"));
  setActionButton(copyAllButton, "⧉", t("copyAllShort"));
  setActionButton(exportSessionButton, "⇩", t("exportSession"));
  setActionButton(searchWorkspaceButton, "⌕", t("searchWorkspace"));
  setActionButton(clearButton, "⌫", t("clearShort"));
  renderTranscriptTabs();
  renderTextSizeControl();
  diagnosticsSummaryElement.textContent = t("technicalDetails");
  if (!diagnosticLines.length) diagnosticsElement.textContent = t("waiting");
  disclaimerElement.textContent = t("disclaimer");
  subjectDialogTitleElement.textContent = t(dialogMode === "workspace" ? "newWorkspaceTitle" : "newCourseTitle");
  subjectNameLabelElement.textContent = t(dialogMode === "workspace" ? "workspaceName" : "courseName");
  subjectCancelButton.textContent = t("cancel");
  subjectCreateButton.textContent = t("create");
  confirmTitleElement.textContent = t("confirmTitle");
  confirmCancelButton.textContent = t("cancel");
  confirmOkButton.textContent = t("delete");
  authEmailLabelElement.textContent = t("authEmail");
  authPasswordLabelElement.textContent = t("authPassword");
  authResetButton.textContent = t("authResetPassword");
  authResendButton.textContent = t("authResendConfirmation");
  authCancelButton.textContent = t("cancel");
  accountTitleElement.textContent = t("accountTitle");
  accountCloseButton.textContent = t("close");
  accountSignOutButton.textContent = t("signOut");
  workspaceCloseButton.textContent = t("cancel");
  bookmarksTitleElement.textContent = t("bookmarksTitle");
  bookmarksHintElement.textContent = t("bookmarksHint");
  renderBookmarksFoldState();
  notesTitleElement.textContent = t("notesTitle");
  notesHintElement.textContent = t("notesHint");
  sessionNotesElement.placeholder = t("notesPlaceholder");
  renderNotesFoldState();
  summaryTitleElement.textContent = t("summaryTitle");
  summaryHintElement.textContent = t("summaryHint", { profile: getSummaryProfileLabel(summaryProfile) });
  summarySettingsButton.title = t("summarySettings");
  summarySettingsButton.setAttribute("aria-label", t("summarySettings"));
  summaryProfileTitleElement.textContent = t("summaryProfileTitle");
  summaryProfileDescriptionElement.textContent = t("summaryProfileDescription");
  summaryIncludeNotesInput.checked = includeNotesInSummary;
  summaryIncludeNotesInput.disabled = false;
  summaryIncludeNotesLabelElement.textContent = t("summaryIncludeNotes");
  summaryProfileCloseButton.textContent = t("close");
  customProfileTitleElement.textContent = t("customProfileTitle");
  customProfileNameLabelElement.textContent = t("customProfileName");
  customProfileKeywordsLabelElement.textContent = t("customProfileKeywords");
  customProfileKeywordsInput.placeholder = t("customProfileKeywordsPlaceholder");
  customProfileAddButton.textContent = t("customProfileAdd");
  exportTitleElement.textContent = t("exportTitle");
  exportDescriptionElement.textContent = t("exportDescription");
  exportMarkdownButton.textContent = t("exportMarkdown");
  exportPdfButton.textContent = t("exportPdf");
  exportWordButton.textContent = t("exportWord");
  exportCloseButton.textContent = t("close");
  searchTitleElement.textContent = t("searchTitle");
  searchInputElement.placeholder = t("searchPlaceholder");
  searchCloseButton.textContent = t("close");
  sessionSummaryElement.placeholder = t("summaryPlaceholder");
  editSummaryButton.textContent = t("editSummary");
  copySummaryButton.textContent = t("copySummary");
  renderLanguageButton(uiEnglishButton, "en", { showCode: false });
  renderLanguageButton(uiFrenchButton, "fr", { showCode: false });
  renderSummaryProfileOptions();
  renderSummaryFoldState();
  uiEnglishButton.dataset.active = uiLanguage === "en" ? "true" : "false";
  uiFrenchButton.dataset.active = uiLanguage === "fr" ? "true" : "false";
  coursePanelToggleButton.title = t("collapseCoursePanel");
  coursePanelToggleButton.setAttribute("aria-label", t("collapseCoursePanel"));
  coursePanelSummaryButton.title = t("expandCoursePanel");
  coursePanelSummaryButton.setAttribute("aria-label", t("expandCoursePanel"));
  renderAuthState();
  if (statusElement.dataset.state === "idle") setStatus(t("ready"), "idle");
}

function renderCoursePanelState() {
  const subject = getActiveSubject();
  const session = getActiveSession();
  const label = [subject?.name, session?.title].filter(Boolean).join(" / ") || t("noLectureSelected");
  coursePanelCurrentElement.textContent = label;
  coursePanelArrowElement.textContent = isCoursePanelCollapsed ? "▾" : "▴";
  coursePanelElement.dataset.collapsed = isCoursePanelCollapsed ? "true" : "false";
}

function setCoursePanelCollapsed(collapsed) {
  isCoursePanelCollapsed = collapsed;
  renderCoursePanelState();
}

function setInterfaceLanguage(language) {
  uiLanguage = language === "fr" ? "fr" : "en";
  localStorage.setItem(UI_LANGUAGE_KEY, uiLanguage);
  scheduleCloudSync();
  renderAll();
}

function renderTextSizeControl() {
  document.body.dataset.textSize = textSize;
  const buttons = [
    [textSizeSmallButton, "small", "textSizeSmall"],
    [textSizeMediumButton, "medium", "textSizeMedium"],
    [textSizeLargeButton, "large", "textSizeLarge"]
  ];

  for (const [button, size, labelKey] of buttons) {
    button.dataset.active = textSize === size ? "true" : "false";
    button.title = t(labelKey);
    button.setAttribute("aria-label", t(labelKey));
    button.setAttribute("aria-pressed", textSize === size ? "true" : "false");
  }
}

function setTextSize(size) {
  textSize = normalizeTextSize(size);
  localStorage.setItem(TEXT_SIZE_KEY, textSize);
  renderTextSizeControl();
}

function t(key, values = {}) {
  let text = UI_STRINGS[uiLanguage]?.[key] ?? UI_STRINGS.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    text = text.replaceAll(`{${name}}`, value);
  }
  return text;
}

function locale() {
  return uiLanguage === "fr" ? "fr-FR" : "en-US";
}

function renderHeader() {
  const subject = getActiveSubject();
  const session = getActiveSession();
  activeSubjectTitleElement.textContent = subject?.name ?? t("defaultSubject");
  activeSessionTitleElement.textContent = session?.title ?? t("noLectureSelected");
}

function setActionButton(button, icon, label) {
  const iconElement = document.createElement("span");
  iconElement.className = "action-icon";
  iconElement.textContent = icon;
  iconElement.setAttribute("aria-hidden", "true");

  const labelElement = document.createElement("span");
  labelElement.className = "action-label";
  labelElement.textContent = label;

  button.replaceChildren(iconElement, labelElement);
}

async function initializeAuth() {
  const { data, error } = await supabase.auth.getSession();
  if (error) addDiagnostic(`Supabase auth: ${error.message}`);
  authSession = data?.session;
  renderAuthState();
  if (authSession) loadCloudLibrary();

  supabase.auth.onAuthStateChange((_event, session) => {
    authSession = session;
    renderAuthState();
    if (session) loadCloudLibrary();
  });
}

function renderAuthState() {
  const email = authSession?.user?.email;
  authStateElement.textContent = email ? email : "";
  authStateElement.hidden = true;
  authButton.textContent = email ? "👤" : "↪";
  authButton.title = email ? t("signedInAs", { email }) : t("signIn");
  authButton.setAttribute("aria-label", authButton.title);
  accountEmailElement.textContent = email ? t("signedInAs", { email }) : "";
  renderAuthDialog();
}

function renderAuthDialog() {
  const isSignUp = authMode === "signUp";
  authTitleElement.textContent = t(isSignUp ? "authSignUpTitle" : "authSignInTitle");
  authDescriptionElement.textContent = t(isSignUp ? "authDescriptionSignUp" : "authDescriptionSignIn");
  authSwitchButton.textContent = t(isSignUp ? "authSwitchToSignIn" : "authSwitchToSignUp");
  authSubmitButton.textContent = t(isSignUp ? "authSubmitSignUp" : "authSubmitSignIn");
  authPasswordInput.autocomplete = isSignUp ? "new-password" : "current-password";
  authResendButton.hidden = isSignUp;
}

async function handleAuthButton() {
  clearError();
  clearAuthError();
  if (authSession) {
    accountDialog.showModal();
    return;
  }

  authMode = "signIn";
  openAuthDialog();
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showError(error.message || t("authFailed"));
    return;
  }
  accountDialog.close();
  setStatus(t("authSignedOut"), "idle");
}

function openAuthDialog() {
  clearAuthError();
  authEmailInput.value = "";
  authPasswordInput.value = "";
  renderAuthDialog();
  authDialog.showModal();
  window.setTimeout(() => authEmailInput.focus(), 0);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearAuthError();
  authSubmitButton.disabled = true;

  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;
  const authCall = authMode === "signUp"
    ? supabase.auth.signUp({ email, password })
    : supabase.auth.signInWithPassword({ email, password });

  const { data, error } = await authCall;
  authSubmitButton.disabled = false;

  if (error) {
    showAuthError(error.message || t("authFailed"));
    return;
  }

  authSession = data.session ?? authSession;
  authDialog.close();
  setStatus(authMode === "signUp" && !data.session ? t("authCheckEmail") : t("authSignedIn"), "idle");
  renderAuthState();
  if (authSession) loadCloudLibrary();
}

async function sendPasswordReset() {
  clearAuthError();
  const email = authEmailInput.value.trim();
  if (!email) {
    showAuthError(t("authEmail"));
    authEmailInput.focus();
    return;
  }

  authResetButton.disabled = true;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  authResetButton.disabled = false;
  if (error) {
    showAuthError(error.message || t("authFailed"));
    return;
  }
  showAuthError(t("authResetSent"));
}

async function resendEmailConfirmation() {
  clearAuthError();
  const email = authEmailInput.value.trim();
  if (!email) {
    showAuthError(t("authEmail"));
    authEmailInput.focus();
    return;
  }

  authResendButton.disabled = true;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  authResendButton.disabled = false;
  if (error) {
    showAuthError(error.message || t("authFailed"));
    return;
  }
  showAuthError(t("authConfirmationSent"));
}

function toggleAuthMode() {
  authMode = authMode === "signIn" ? "signUp" : "signIn";
  clearAuthError();
  renderAuthDialog();
}

function showAuthError(message) {
  authErrorElement.textContent = message;
  authErrorElement.hidden = false;
}

function clearAuthError() {
  authErrorElement.textContent = "";
  authErrorElement.hidden = true;
}

async function loadCloudLibrary() {
  if (!authSession?.user?.id || isSyncingCloud) return;
  isSyncingCloud = true;
  setStatus(t("syncLoading"), "connecting");

  try {
    const userId = authSession.user.id;
    const [workspacesResult, coursesResult, sessionsResult, segmentsResult, translationsResult] = await Promise.all([
      supabase.from("workspaces").select("*").eq("user_id", userId).order("sort_order").order("created_at"),
      supabase.from("courses").select("*").eq("user_id", userId).order("sort_order").order("created_at"),
      supabase.from("lecture_sessions").select("*").eq("user_id", userId).order("sort_order").order("created_at"),
      supabase.from("transcript_segments").select("*").eq("user_id", userId).order("sort_order").order("created_at"),
      supabase.from("session_translations").select("*").eq("user_id", userId).order("created_at")
    ]);

    const error = workspacesResult.error || coursesResult.error || sessionsResult.error || segmentsResult.error || translationsResult.error;
    if (error) throw error;

    if (!workspacesResult.data.length && library.workspaces.length) {
      isSyncingCloud = false;
      await syncLibraryToCloud({ announce: false });
      setStatus(t("syncLocalPushed"), "idle");
      return;
    }

    if (workspacesResult.data.length) {
      applyCloudLibrary({
        workspaces: workspacesResult.data,
        courses: coursesResult.data,
        sessions: sessionsResult.data,
        segments: segmentsResult.data,
        translations: translationsResult.data
      });
      setStatus(t("syncCloudLoaded"), "idle");
    } else {
      setStatus(t("ready"), "idle");
    }
  } catch (error) {
    addDiagnostic(`Supabase sync: ${error.message || t("syncFailed")}`);
    showError(error.message || t("syncFailed"));
    setStatus(t("syncFailed"), "error");
  } finally {
    isSyncingCloud = false;
  }
}

function applyCloudLibrary({ workspaces, courses, sessions, segments, translations }) {
  const coursesByWorkspace = groupBy(courses, "workspace_id");
  const sessionsByCourse = groupBy(sessions, "course_id");
  const segmentsBySession = groupBy(segments, "session_id");
  const translationsBySession = groupBy(translations, "session_id");

  const mappedWorkspaces = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    collapsed: workspace.collapsed,
    createdAt: workspace.created_at,
    subjects: (coursesByWorkspace.get(workspace.id) ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      collapsed: course.collapsed,
      createdAt: course.created_at,
      sessions: (sessionsByCourse.get(course.id) ?? []).map((session) => ({
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        notes: session.notes ?? "",
        summary: session.summary ?? "",
        summaryLanguage: session.summary_language ?? uiLanguage,
        summaryProfile: "student",
        summaries: normalizeSummaries(session.summaries, session.summary, session.summary_language),
        bookmarks: parseBookmarksFromSummaries(session.summaries),
        segments: (segmentsBySession.get(session.id) ?? []).map((segment) => ({
          id: segment.id,
          text: segment.text,
          sourceLanguage: segment.source_language ?? "",
          createdAt: segment.created_at
        })),
        translations: Object.fromEntries(
          (translationsBySession.get(session.id) ?? []).map((translation) => [
            translation.target_language,
            translation.translated_text
          ])
        )
      }))
    }))
  }));

  const firstWorkspace = mappedWorkspaces[0] ?? createDefaultWorkspace({ withSubject: false });
  const activeWorkspace = mappedWorkspaces.find((workspace) => workspace.id === library.activeWorkspaceId) ?? firstWorkspace;
  const activeSubject = activeWorkspace.subjects.find((subject) => subject.id === library.activeSubjectId) ?? activeWorkspace.subjects[0];
  const activeSession = activeSubject?.sessions.find((session) => session.id === library.activeSessionId) ?? activeSubject?.sessions[0];

  isApplyingCloudLibrary = true;
  library = {
    workspaces: mappedWorkspaces.length ? mappedWorkspaces : [firstWorkspace],
    activeWorkspaceId: activeWorkspace.id,
    activeSubjectId: activeSubject?.id ?? "",
    activeSessionId: activeSession?.id ?? ""
  };
  ensureActiveSession();
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  isApplyingCloudLibrary = false;
  renderAll();
}

function groupBy(items, key) {
  const grouped = new Map();
  for (const item of items ?? []) {
    const value = item[key];
    if (!grouped.has(value)) grouped.set(value, []);
    grouped.get(value).push(item);
  }
  return grouped;
}

function scheduleCloudSync() {
  if (!authSession?.user?.id || isApplyingCloudLibrary) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => syncLibraryToCloud(), CLOUD_SYNC_DELAY_MS);
}

async function syncLibraryToCloud({ announce = true } = {}) {
  if (!authSession?.user?.id || isApplyingCloudLibrary) return;
  if (isSyncingCloud) {
    scheduleCloudSync();
    return;
  }

  isSyncingCloud = true;
  if (announce) setStatus(t("syncSaving"), "connecting");

  try {
    const userId = authSession.user.id;
    const workspaces = [];
    const courses = [];
    const sessions = [];
    const segments = [];
    const translations = [];

    for (const [workspaceIndex, workspace] of library.workspaces.entries()) {
      workspaces.push({
        id: workspace.id,
        user_id: userId,
        name: workspace.name,
        sort_order: workspaceIndex,
        collapsed: Boolean(workspace.collapsed),
        created_at: workspace.createdAt ?? new Date().toISOString()
      });

      for (const [courseIndex, subject] of workspace.subjects.entries()) {
        courses.push({
          id: subject.id,
          user_id: userId,
          workspace_id: workspace.id,
          name: subject.name,
          sort_order: courseIndex,
          collapsed: Boolean(subject.collapsed),
          created_at: subject.createdAt ?? new Date().toISOString()
        });

        for (const [sessionIndex, session] of subject.sessions.entries()) {
          sessions.push({
            id: session.id,
            user_id: userId,
            course_id: subject.id,
            title: session.title,
            notes: session.notes ?? "",
            summary: session.summary ?? "",
            summary_language: getActiveSummaryLanguage(session),
            summaries: serializeSummariesWithBookmarks(session),
            sort_order: sessionIndex,
            created_at: session.createdAt
          });

          for (const [segmentIndex, segment] of (session.segments ?? []).entries()) {
            segments.push({
              id: segment.id,
              user_id: userId,
              session_id: session.id,
              text: segment.text,
              source_language: segment.sourceLanguage || null,
              sort_order: segmentIndex,
              created_at: segment.createdAt
            });
          }

          for (const [targetLanguage, translatedText] of Object.entries(session.translations ?? {})) {
            if (!translatedText) continue;
            translations.push({
              user_id: userId,
              session_id: session.id,
              target_language: targetLanguage,
              translated_text: translatedText
            });
          }
        }
      }
    }

    await deleteCloudTable("session_translations", userId);
    await deleteCloudTable("transcript_segments", userId);
    await deleteCloudTable("lecture_sessions", userId);
    await deleteCloudTable("courses", userId);
    await deleteCloudTable("workspaces", userId);

    await insertCloudRows("workspaces", workspaces);
    await insertCloudRows("courses", courses);
    await insertCloudRows("lecture_sessions", sessions);
    await insertCloudRows("transcript_segments", segments);
    await insertCloudRows("session_translations", translations);

    const { error: preferenceError } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      ui_language: uiLanguage
    });
    if (preferenceError) throw preferenceError;

    if (announce) setStatus(t("syncSaved"), "idle");
  } catch (error) {
    addDiagnostic(`Supabase sync: ${error.message || t("syncFailed")}`);
    showError(error.message || t("syncFailed"));
    if (announce) setStatus(t("syncFailed"), "error");
  } finally {
    isSyncingCloud = false;
  }
}

async function deleteCloudTable(tableName, userId) {
  const { error: deleteError } = await supabase.from(tableName).delete().eq("user_id", userId);
  if (deleteError) throw deleteError;
}

async function insertCloudRows(tableName, rows) {
  if (!rows.length) return;

  const { error: insertError } = await supabase.from(tableName).insert(rows);
  if (insertError) throw insertError;
}

function renderLibrary() {
  courseTreeElement.replaceChildren();
  const workspace = getActiveWorkspace();

  activeWorkspaceTitleElement.textContent = workspace?.name ?? t("defaultWorkspace");
  if (!workspace) return;

  const addSubjectButton = document.createElement("button");
  addSubjectButton.className = "course-add-button";
  addSubjectButton.type = "button";
  addSubjectButton.textContent = t("newCourse");
  addSubjectButton.title = t("addCourseTooltip");
  addSubjectButton.setAttribute("aria-label", t("addCourseTooltip"));
  addSubjectButton.addEventListener("click", () => openSubjectDialog(workspace.id));
  courseTreeElement.append(addSubjectButton);

  for (const [subjectIndex, subject] of workspace.subjects.entries()) {
    const subjectBlock = document.createElement("section");
    subjectBlock.className = "subject-block";

    const subjectHeader = document.createElement("div");
    subjectHeader.className = "subject-row";

    const toggle = document.createElement("button");
    toggle.className = "subject-toggle";
    toggle.type = "button";
    toggle.textContent = subject.collapsed ? "+" : "−";
    toggle.setAttribute("aria-label", t(subject.collapsed ? "unfold" : "fold", { name: subject.name }));
    toggle.addEventListener("click", () => toggleSubject(subject.id));

    const subjectTitle = document.createElement("button");
    subjectTitle.className = "subject-title";
    subjectTitle.type = "button";
    subjectTitle.textContent = subject.name;
    subjectTitle.title = t("rename");
    subjectTitle.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      startInlineEdit(subjectTitle, subject.name, (name) => renameSubject(subject.id, name));
    });
    const subjectActions = document.createElement("div");
    subjectActions.className = "row-actions";
    const subjectDeleteButton = renderDeleteButton({
      label: t("deleteSubject"),
      disabled: subject.sessions.length > 0,
      disabledMessage: t("deleteSubjectBlocked"),
      onDelete: () => deleteSubject(subject.id)
    });
    subjectHeader.append(toggle, subjectTitle);
    subjectHeader.append(
      renderOrderControls({
        name: subject.name,
        canMoveUp: subjectIndex > 0,
        canMoveDown: subjectIndex < workspace.subjects.length - 1,
        onMoveUp: () => moveSubject(subject.id, -1),
        onMoveDown: () => moveSubject(subject.id, 1)
      })
    );
    subjectActions.append(subjectDeleteButton);
    subjectHeader.append(subjectActions);
    subjectBlock.append(subjectHeader);

    if (subject.collapsed) {
      courseTreeElement.append(subjectBlock);
      continue;
    }

    const sessionList = document.createElement("div");
    sessionList.className = "session-list";

    for (const [sessionIndex, session] of subject.sessions.entries()) {
      const sessionRow = document.createElement("div");
      sessionRow.className = "session-row";

      const button = document.createElement("button");
      button.className = "session-button";
      button.type = "button";
      button.textContent = session.title;
      button.title = t("rename");
      button.dataset.active = session.id === library.activeSessionId ? "true" : "false";
      button.addEventListener("click", () => scheduleSessionSelect(subject.id, session.id));
      button.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        window.clearTimeout(pendingSessionSelect);
        startInlineEdit(button, session.title, (title) => renameSession(subject.id, session.id, title));
      });
      const sessionRecordButton = document.createElement("button");
      const isActiveRecording = isListening && subject.id === library.activeSubjectId && session.id === library.activeSessionId;
      sessionRecordButton.className = "session-record-button";
      sessionRecordButton.type = "button";
      sessionRecordButton.textContent = isActiveRecording ? t("stopShort") : t("startShort");
      sessionRecordButton.title = isActiveRecording ? t("stop") : t("start");
      sessionRecordButton.setAttribute("aria-label", sessionRecordButton.title);
      sessionRecordButton.addEventListener("click", (event) => {
        event.stopPropagation();
        window.clearTimeout(pendingSessionSelect);
        handleSessionRecord(subject.id, session.id);
      });
      sessionRow.append(
        button,
        sessionRecordButton,
        renderOrderControls({
          name: session.title,
          canMoveUp: sessionIndex > 0,
          canMoveDown: sessionIndex < subject.sessions.length - 1,
          onMoveUp: () => moveSession(subject.id, session.id, -1),
          onMoveDown: () => moveSession(subject.id, session.id, 1)
        }),
        renderDeleteButton({
          label: t("deleteSession"),
          onDelete: () => deleteSession(subject.id, session.id)
        })
      );
      sessionList.append(sessionRow);
    }

    const addSessionButton = document.createElement("button");
    addSessionButton.className = "session-add-button";
    addSessionButton.type = "button";
    addSessionButton.textContent = t("newSession");
    addSessionButton.title = t("addSessionTooltip");
    addSessionButton.setAttribute("aria-label", t("addSessionTooltip"));
    addSessionButton.addEventListener("click", () => createSession(subject.id));
    sessionList.append(addSessionButton);
    subjectBlock.append(sessionList);

    courseTreeElement.append(subjectBlock);
  }
}

function renderWorkspaceSwitcher() {
  workspaceListElement.replaceChildren();

  for (const workspace of library.workspaces) {
    const row = document.createElement("div");
    row.className = "workspace-option";
    row.dataset.active = workspace.id === library.activeWorkspaceId ? "true" : "false";

    const button = document.createElement("button");
    button.className = "workspace-option-button";
    button.type = "button";
    button.textContent = workspace.name;
    button.addEventListener("click", () => selectWorkspace(workspace.id));

    row.append(
      button,
      renderDeleteButton({
        label: t("deleteWorkspace"),
        disabled: workspace.subjects.length > 0,
        disabledMessage: t("deleteWorkspaceBlocked"),
        onDelete: () => deleteWorkspace(workspace.id)
      })
    );
    workspaceListElement.append(row);
  }
}

function renderOrderControls({ name, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) {
  const controls = document.createElement("div");
  controls.className = "order-controls";

  const upButton = document.createElement("button");
  upButton.className = "order-button";
  upButton.type = "button";
  upButton.textContent = "↑";
  upButton.disabled = !canMoveUp;
  upButton.setAttribute("aria-label", t("moveUp", { name }));
  upButton.addEventListener("click", onMoveUp);

  const downButton = document.createElement("button");
  downButton.className = "order-button";
  downButton.type = "button";
  downButton.textContent = "↓";
  downButton.disabled = !canMoveDown;
  downButton.setAttribute("aria-label", t("moveDown", { name }));
  downButton.addEventListener("click", onMoveDown);

  controls.append(upButton, downButton);
  return controls;
}

function renderDeleteButton({ label, disabled = false, disabledMessage = t("deleteSubjectBlocked"), onDelete }) {
  const button = document.createElement("button");
  button.className = "delete-button";
  button.type = "button";
  button.textContent = "×";
  button.disabled = disabled;
  button.title = disabled ? disabledMessage : label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (disabled) {
      showError(disabledMessage);
      return;
    }
    onDelete();
  });
  return button;
}

function scheduleSessionSelect(subjectId, sessionId) {
  window.clearTimeout(pendingSessionSelect);
  pendingSessionSelect = window.setTimeout(() => selectSession(subjectId, sessionId), 220);
}

function moveSubject(subjectId, direction) {
  const location = findSubjectLocation(subjectId);
  if (!location) return;
  const currentIndex = location.workspace.subjects.findIndex((subject) => subject.id === subjectId);
  if (!moveItem(location.workspace.subjects, currentIndex, direction)) return;
  saveLibrary();
  renderAll();
}

function moveSession(subjectId, sessionId, direction) {
  const subject = findSubjectLocation(subjectId)?.subject;
  if (!subject) return;

  const currentIndex = subject.sessions.findIndex((session) => session.id === sessionId);
  if (!moveItem(subject.sessions, currentIndex, direction)) return;
  saveLibrary();
  renderAll();
}

function moveItem(items, currentIndex, direction) {
  const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return false;

  const [item] = items.splice(currentIndex, 1);
  items.splice(nextIndex, 0, item);
  return true;
}

async function deleteWorkspace(workspaceId) {
  const workspace = library.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return;
  if (workspace.subjects.length > 0) {
    showError(t("deleteWorkspaceBlocked"));
    return;
  }
  const shouldReopenSwitcher = workspaceDialog.open;
  if (shouldReopenSwitcher) workspaceDialog.close();
  if (!(await confirmAction(t("deleteWorkspaceConfirm", { name: workspace.name })))) {
    if (shouldReopenSwitcher) openWorkspaceSwitcher();
    return;
  }

  library.workspaces = library.workspaces.filter((item) => item.id !== workspaceId);
  if (!library.workspaces.length) library.workspaces.push(createDefaultWorkspace({ withSubject: false }));

  const nextWorkspace = library.workspaces[0];
  const nextSubject = nextWorkspace.subjects[0];
  library.activeWorkspaceId = nextWorkspace.id;
  library.activeSubjectId = nextSubject?.id ?? "";
  library.activeSessionId = nextSubject?.sessions[0]?.id ?? "";
  clearError();
  saveLibrary();
  renderAll();
  if (shouldReopenSwitcher) openWorkspaceSwitcher();
}

async function deleteSubject(subjectId) {
  const location = findSubjectLocation(subjectId);
  const subject = location?.subject;
  if (!subject) return;
  if (subject.sessions.length > 0) {
    showError(t("deleteSubjectBlocked"));
    return;
  }
  if (!(await confirmAction(t("deleteSubjectConfirm", { name: subject.name })))) return;

  location.workspace.subjects = location.workspace.subjects.filter((item) => item.id !== subjectId);
  const nextSubject = location.workspace.subjects[0];
  library.activeWorkspaceId = location.workspace.id;
  library.activeSubjectId = nextSubject?.id ?? "";
  library.activeSessionId = nextSubject?.sessions[0]?.id ?? "";
  clearError();
  saveLibrary();
  renderAll();
}

async function deleteSession(subjectId, sessionId) {
  if (isListening) {
    showError(t("stopBeforeSwitch"));
    return;
  }

  const location = findSubjectLocation(subjectId);
  const subject = location?.subject;
  const session = subject?.sessions.find((item) => item.id === sessionId);
  if (!subject || !session) return;
  if (!(await confirmAction(t("deleteSessionConfirm", { name: session.title })))) return;

  const deletedIndex = subject.sessions.findIndex((item) => item.id === sessionId);
  subject.sessions = subject.sessions.filter((item) => item.id !== sessionId);
  library.activeWorkspaceId = location.workspace.id;
  library.activeSubjectId = subject.id;
  if (library.activeSessionId === sessionId) {
    const nextSession = subject.sessions[Math.min(deletedIndex, subject.sessions.length - 1)];
    library.activeSessionId = nextSession?.id ?? "";
  }
  clearError();
  translatingTo = "";
  saveLibrary();
  renderAll();
}

function toggleSubject(subjectId) {
  const subject = findSubjectLocation(subjectId)?.subject;
  if (!subject) return;
  subject.collapsed = !subject.collapsed;
  saveLibrary();
  renderLibrary();
}

function revealActiveSubject() {
  const subject = getActiveSubject();
  if (!subject) return;
  subject.collapsed = false;
  saveLibrary();
}

function renameWorkspace(workspaceId, name) {
  const workspace = library.workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return;
  if (!name?.trim()) return;
  workspace.name = name.trim();
  saveLibrary();
  renderAll();
}

function renameSubject(subjectId, name) {
  const subject = findSubjectLocation(subjectId)?.subject;
  if (!subject) return;
  if (!name?.trim()) return;
  subject.name = name.trim();
  saveLibrary();
  renderAll();
}

function renameSession(subjectId, sessionId, title) {
  const subject = findSubjectLocation(subjectId)?.subject;
  const session = subject?.sessions.find((item) => item.id === sessionId);
  if (!session) return;
  if (!title?.trim()) return;
  session.title = title.trim();
  saveLibrary();
  renderAll();
}

function startInlineEdit(target, currentValue, onCommit) {
  const input = document.createElement("input");
  input.className = "inline-edit session-edit";
  if (target.classList.contains("workspace-title")) input.className = "inline-edit workspace-edit";
  if (target.classList.contains("subject-title")) input.className = "inline-edit subject-edit";
  input.type = "text";
  input.value = currentValue;
  input.setAttribute("aria-label", t("renameAria"));

  let completed = false;
  const finish = (shouldCommit) => {
    if (completed) return;
    completed = true;
    const nextValue = input.value.trim();
    if (shouldCommit && nextValue && nextValue !== currentValue) onCommit(nextValue);
    else renderLibrary();
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));

  target.replaceWith(input);
  input.focus();
  input.select();
}

function renderSegments() {
  const segments = getSegments();
  const activeInterim = getActiveInterimText();
  const session = getActiveSession();
  const activeTranslation = activeTranscriptTab === "original" ? "" : session?.translations?.[activeTranscriptTab] ?? "";
  renderTranscriptFoldState();
  transcriptElement.replaceChildren();
  bookmarkCurrentButton.disabled = !session || !isListening || isStopping;
  copyAllButton.disabled = !getActiveTranscriptText().trim();
  clearButton.disabled = segments.length === 0;
  exportSessionButton.disabled = !hasExportableSession();
  searchWorkspaceButton.disabled = !getActiveWorkspace();

  if (isTranscriptFolded) return;

  if (activeTranscriptTab !== "original") {
    if (translatingTo === activeTranscriptTab) {
      const loading = document.createElement("p");
      loading.className = "empty-state";
      loading.textContent = t("translating", { language: getLanguageLabel(activeTranscriptTab) });
      transcriptElement.append(loading);
      return;
    }

    if (activeTranslation) {
      const paragraph = document.createElement("p");
      paragraph.className = "transcript-segment translation-text";
      paragraph.textContent = activeTranslation;
      transcriptElement.append(paragraph);
      return;
    }

    const emptyTranslation = document.createElement("p");
    emptyTranslation.className = "empty-state";
    emptyTranslation.textContent = t("emptyTranslation");
    transcriptElement.append(emptyTranslation);
    return;
  }

  if (!segments.length && !activeInterim) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = t("empty");
    transcriptElement.append(empty);
    return;
  }
  const canEdit = !isListening && !isStopping;
  if (canEdit) {
    const textarea = document.createElement("textarea");
    textarea.className = "transcript-segment transcript-edit transcript-edit-all";
    textarea.value = getTranscriptText();
    textarea.rows = 1;
    textarea.title = t("editTranscriptSegment");
    textarea.setAttribute("aria-label", t("editTranscriptSegment"));
    textarea.addEventListener("input", () => scheduleTranscriptEditSave(textarea));
    textarea.addEventListener("blur", () => commitTranscriptEdit(textarea));
    transcriptElement.append(textarea);
    resizeTranscriptEdit(textarea);
    return;
  }

  for (const segment of segments) {
    const paragraph = document.createElement("p");
    paragraph.className = "transcript-segment";
    paragraph.textContent = segment.text;
    transcriptElement.append(paragraph);
  }
  if (activeInterim) showInterimTranscript(activeInterim);
  transcriptElement.parentElement.scrollTop = transcriptElement.parentElement.scrollHeight;
}

function renderTranscriptTabs() {
  const session = getActiveSession();
  const sourceLanguage = getSourceLanguageForTranslation();
  if (activeTranscriptTab !== "original" && !TRANSLATION_LANGUAGES.some((language) => language.code === activeTranscriptTab)) {
    activeTranscriptTab = "original";
  }

  for (const button of transcriptTabButtons) {
    const tab = button.dataset.transcriptTab;
    const isOriginal = tab === "original";
    const hasTranslation = !isOriginal && Boolean(session?.translations?.[tab]);
    if (isOriginal) button.textContent = t("originalTab");
    else renderLanguageButton(button, tab);
    button.dataset.active = activeTranscriptTab === tab ? "true" : "false";
    button.dataset.ready = isOriginal || hasTranslation ? "true" : "false";
    button.disabled = isListening || isStopping || translatingTo || (!isOriginal && !getSegments().length) || (!isOriginal && sourceLanguage !== "mixed" && sourceLanguage === tab);
    button.title = isOriginal || hasTranslation
      ? (isOriginal ? button.textContent : getLanguageLabel(tab))
      : t("translationRequested", { language: getLanguageLabel(tab) });
    button.setAttribute("aria-pressed", activeTranscriptTab === tab ? "true" : "false");
  }
  renderSpeechButton();
  renderTranscriptFoldState();
}

function renderSpeechButton() {
  const session = getActiveSession();
  const text = getActiveTranscriptText().trim();
  const speechKey = getSpeechCacheKey();
  const canSpeak = Boolean(session && activeTranscriptTab !== "original" && text && session.translations?.[activeTranscriptTab]);
  const isGenerating = Boolean(speakingKey && speakingKey === speechKey);
  const isPlaying = Boolean(speechAudio && !speechAudio.paused && speechAudio.dataset.speechKey === speechKey);
  speakTranscriptButton.disabled = !canSpeak || isListening || isStopping || translatingTo || (Boolean(speakingKey) && !isGenerating);
  speakTranscriptButton.textContent = isGenerating ? "…" : (isPlaying ? "■" : "▶");
  speakTranscriptButton.title = isPlaying ? t("stopSpeech") : t(canSpeak ? "playSpeech" : "speechUnavailable");
  speakTranscriptButton.setAttribute("aria-label", speakTranscriptButton.title);
}

function renderTranscriptFoldState() {
  if (isListening || isStopping) isTranscriptFolded = false;
  const activeText = getActiveTranscriptText().trim();
  const activeLabel = activeTranscriptTab === "original" ? t("originalTab") : getLanguageLabel(activeTranscriptTab);
  transcriptFoldButton.disabled = isListening || isStopping || (!activeText && !getActiveInterimText());
  transcriptFoldButton.textContent = isTranscriptFolded ? "▾" : "▴";
  transcriptFoldButton.title = t(isTranscriptFolded ? "unfoldTranscript" : "foldTranscript");
  transcriptFoldButton.setAttribute("aria-label", transcriptFoldButton.title);
  transcriptFoldButton.setAttribute("aria-expanded", isTranscriptFolded ? "false" : "true");
  transcriptFoldSummaryElement.hidden = !isTranscriptFolded;
  transcriptFoldSummaryElement.textContent = t("foldedTranscript", {
    label: activeLabel,
    count: String(activeText.length)
  });
  transcriptElement.hidden = isTranscriptFolded;
  transcriptCardElement.dataset.folded = isTranscriptFolded ? "true" : "false";
}

function toggleTranscriptFold() {
  if (isListening || isStopping) return;
  isTranscriptFolded = !isTranscriptFolded;
  renderTranscriptFoldState();
  renderSegments();
}

async function selectTranscriptTab(tab) {
  if (isListening || isStopping || translatingTo) return;
  stopSpeechPlayback();
  if (tab === "original") {
    activeTranscriptTab = "original";
    renderTranscriptTabs();
    renderSegments();
    return;
  }

  const session = getActiveSession();
  if (!session?.segments.length) return;
  const sourceLanguage = getSourceLanguageForTranslation();
  if (sourceLanguage !== "mixed" && sourceLanguage === tab) return;

  activeTranscriptTab = normalizeLanguageCode(tab);
  renderTranscriptTabs();
  renderSegments();
  if (!session.translations?.[activeTranscriptTab]) await translateTranscript(activeTranscriptTab);
}

async function toggleSpeechPlayback() {
  const session = getActiveSession();
  const targetLanguage = normalizeLanguageCode(activeTranscriptTab);
  const text = getActiveTranscriptText().trim();
  if (!session || targetLanguage === "original" || !text || !session.translations?.[targetLanguage]) {
    showError(t("speechUnavailable"));
    return;
  }

  const speechKey = getSpeechCacheKey();
  if (speechAudio && speechAudio.dataset.speechKey === speechKey && !speechAudio.paused) {
    stopSpeechPlayback();
    return;
  }

  stopSpeechPlayback();
  let url = speechCache.get(speechKey);
  if (!url) {
    url = await createSpeechAudioURL({ text, targetLanguage, speechKey });
    if (!url) return;
    speechCache.set(speechKey, url);
  }

  speechAudio = new Audio(url);
  speechAudio.dataset.speechKey = speechKey;
  speechAudio.addEventListener("ended", () => {
    speechAudio = undefined;
    setStatus(t("speechReady"), "idle");
    renderSpeechButton();
  }, { once: true });
  speechAudio.addEventListener("pause", renderSpeechButton);
  try {
    await speechAudio.play();
  } catch {
    setStatus(t("speechTapAgain"), "idle");
  }
  renderSpeechButton();
}

async function createSpeechAudioURL({ text, targetLanguage, speechKey }) {
  clearError();
  if (!authSession?.access_token) {
    showError(t("signInRequired"));
    openAuthDialog();
    return "";
  }

  speakingKey = speechKey;
  setStatus(t("speechGenerating"), "connecting");
  renderSpeechButton();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SPEECH_TIMEOUT_MS);

  try {
    const response = await fetch(SPEECH_ENDPOINT, {
      method: "POST",
      headers: getAuthenticatedHeaders({ "Content-Type": "application/json" }),
      signal: controller.signal,
      body: JSON.stringify({ text, targetLanguage })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || t("speechFailed"));
    }

    const audioBlob = await response.blob();
    setStatus(t("speechReady"), "idle");
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    const message = error.name === "AbortError"
      ? t("speechFailed")
      : error.message || t("speechFailed");
    showError(message);
    setStatus(t("error"), "error");
    return "";
  } finally {
    window.clearTimeout(timeout);
    speakingKey = "";
    renderSpeechButton();
  }
}

function stopSpeechPlayback() {
  if (!speechAudio) return;
  speechAudio.pause();
  speechAudio.currentTime = 0;
  speechAudio = undefined;
  renderSpeechButton();
}

function getSpeechCacheKey() {
  const session = getActiveSession();
  const language = normalizeLanguageCode(activeTranscriptTab);
  const text = getActiveTranscriptText();
  return session && language ? `${session.id}:${language}:${hashText(text)}` : "";
}

function appendTranscriptSegment(segment) {
  if (!isListening || isStopping) {
    renderSegments();
    return;
  }

  transcriptElement.querySelector(".empty-state")?.remove();
  const paragraph = document.createElement("p");
  paragraph.className = "transcript-segment";
  paragraph.textContent = segment.text;
  transcriptElement.append(paragraph);
  copyAllButton.disabled = false;
  clearButton.disabled = false;
  transcriptElement.parentElement.scrollTop = transcriptElement.parentElement.scrollHeight;
}

function showInterimTranscript(text) {
  interimElement.hidden = true;
  interimElement.textContent = text;
  transcriptElement.querySelector(".empty-state")?.remove();
  let liveInterim = transcriptElement.querySelector(".interim-inline");
  if (!liveInterim) {
    liveInterim = document.createElement("p");
    liveInterim.className = "interim interim-inline";
    transcriptElement.append(liveInterim);
  }
  liveInterim.textContent = text;
  transcriptElement.parentElement.scrollTop = transcriptElement.parentElement.scrollHeight;
}

function hideInterimTranscript() {
  interimElement.hidden = true;
  interimElement.textContent = "";
  transcriptElement.querySelector(".interim-inline")?.remove();
}

function getActiveInterimText() {
  return isListening ? interimElement.textContent.trim() : "";
}

function scheduleTranscriptEditSave(textarea) {
  resizeTranscriptEdit(textarea);
  window.clearTimeout(transcriptEditTimer);
  transcriptEditTimer = window.setTimeout(() => saveTranscriptEdit(textarea.value), 600);
}

function commitTranscriptEdit(textarea) {
  window.clearTimeout(transcriptEditTimer);
  if (saveTranscriptEdit(textarea.value)) renderSegments();
}

function saveTranscriptEdit(value) {
  const session = getActiveSession();
  if (!session) return false;
  const text = value.trim();
  if (!text) {
    showError(t("emptyTranscriptSegment"));
    return false;
  }
  if (text === getTranscriptText().trim()) return true;

  const firstSegment = session.segments[0];
  session.segments = [{
    id: firstSegment?.id ?? crypto.randomUUID(),
    text,
    sourceLanguage: getSourceLanguageForTranslation(),
    createdAt: firstSegment?.createdAt ?? new Date().toISOString()
  }];
  session.translations = {};
  clearError();
  saveLibrary();
  activeTranscriptTab = "original";
  renderTranscriptTabs();
  return true;
}

function resizeTranscriptEdit(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function renderNotes() {
  const session = getActiveSession();
  sessionNotesElement.value = session?.notes ?? "";
  sessionNotesElement.disabled = !session;
  renderNotesFoldState();
}

function saveSessionNotes() {
  const session = getActiveSession();
  if (!session) return;
  session.notes = sessionNotesElement.value;
  saveLibrary();
  renderNotesFoldState();
}

function renderNotesFoldState() {
  const session = getActiveSession();
  const notes = session?.notes?.trim() ?? "";
  notesFoldButton.disabled = !session;
  notesFoldButton.textContent = isNotesFolded ? "▾" : "▴";
  notesFoldButton.title = t(isNotesFolded ? "unfoldNotes" : "foldNotes");
  notesFoldButton.setAttribute("aria-label", notesFoldButton.title);
  notesFoldButton.setAttribute("aria-expanded", isNotesFolded ? "false" : "true");
  notesFoldSummaryElement.hidden = !isNotesFolded;
  notesFoldSummaryElement.textContent = t("foldedNotes", { count: String(notes.length) });
  sessionNotesElement.hidden = isNotesFolded;
  notesPanelElement.dataset.folded = isNotesFolded ? "true" : "false";
}

function toggleNotesFold() {
  isNotesFolded = !isNotesFolded;
  renderNotesFoldState();
}

function addCurrentBookmark() {
  const session = getActiveSession();
  if (!session || !isListening) return;
  const bookmarks = getSessionBookmarks(session);
  const lastSegment = [...(session.segments ?? [])].reverse().find((segment) => segment.text?.trim());
  const activeInterim = getActiveInterimText().trim();
  const bookmark = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    offsetMs: getRecordingOffsetMs(),
    title: t("bookmarkDefault", { number: String(bookmarks.length + 1) }),
    snippet: createBookmarkSnippet(activeInterim || lastSegment?.text || "")
  };
  bookmarks.push(bookmark);
  setSessionBookmarks(session, bookmarks);
  setStatus(t("bookmarkAdded"), "idle");
  renderBookmarks();
}

function renderBookmarks() {
  const session = getActiveSession();
  const bookmarks = getSessionBookmarks(session);
  bookmarksListElement.replaceChildren();
  bookmarkCurrentButton.disabled = !session || !isListening || isStopping;

  if (isBookmarksFolded) {
    renderBookmarksFoldState(bookmarks);
    return;
  }

  if (!bookmarks.length) {
    const empty = document.createElement("p");
    empty.className = "bookmarks-empty";
    empty.textContent = t("bookmarksEmpty");
    bookmarksListElement.append(empty);
    renderBookmarksFoldState(bookmarks);
    return;
  }

  for (const bookmark of bookmarks) {
    const row = document.createElement("div");
    row.className = "bookmark-row";
    const text = document.createElement("div");
    text.className = "bookmark-text";
    text.innerHTML = `
      <strong>${escapeHTML(formatBookmarkTime(bookmark))}</strong>
      <span>${escapeHTML(bookmark.snippet || bookmark.title || "")}</span>
    `;
    const deleteButton = document.createElement("button");
    deleteButton.className = "bookmark-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = t("delete");
    deleteButton.setAttribute("aria-label", t("delete"));
    deleteButton.addEventListener("click", () => deleteBookmark(bookmark.id));
    row.append(text, deleteButton);
    bookmarksListElement.append(row);
  }

  renderBookmarksFoldState(bookmarks);
}

function renderBookmarksFoldState(bookmarks = getSessionBookmarks(getActiveSession())) {
  const session = getActiveSession();
  bookmarksFoldButton.disabled = !session;
  bookmarksFoldButton.textContent = isBookmarksFolded ? "▾" : "▴";
  bookmarksFoldButton.title = t(isBookmarksFolded ? "bookmarksUnfold" : "bookmarksFold");
  bookmarksFoldButton.setAttribute("aria-label", bookmarksFoldButton.title);
  bookmarksFoldButton.setAttribute("aria-expanded", isBookmarksFolded ? "false" : "true");
  bookmarksFoldSummaryElement.hidden = !isBookmarksFolded;
  bookmarksFoldSummaryElement.textContent = t("bookmarksFolded", { count: String(bookmarks.length) });
  bookmarksListElement.hidden = isBookmarksFolded;
  bookmarksPanelElement.dataset.folded = isBookmarksFolded ? "true" : "false";
}

function toggleBookmarksFold() {
  isBookmarksFolded = !isBookmarksFolded;
  renderBookmarks();
}

function deleteBookmark(bookmarkId) {
  const session = getActiveSession();
  if (!session) return;
  setSessionBookmarks(session, getSessionBookmarks(session).filter((bookmark) => bookmark.id !== bookmarkId));
  renderBookmarks();
}

function openSummaryProfileDialog() {
  summaryIncludeNotesInput.checked = includeNotesInSummary;
  renderSummaryProfileOptions();
  summaryProfileDialog.showModal();
}

function renderSummaryProfileOptions() {
  summaryProfileListElement.innerHTML = getSummaryProfiles().map((profile) => {
    const checked = profile.code === summaryProfile ? " checked" : "";
    const deleteButton = profile.custom
      ? `<button class="profile-delete" type="button" data-profile-delete="${escapeHTML(profile.code)}" title="${escapeHTML(t("customProfileDelete"))}">×</button>`
      : "";
    return `
      <label class="profile-option">
        <input type="radio" name="summary-profile" value="${profile.code}"${checked}>
        <span>
          <strong>${getSummaryProfileLabel(profile.code)}</strong>
          <small>${getSummaryProfileDescription(profile.code)}</small>
        </span>
        ${deleteButton}
      </label>
    `;
  }).join("");

  for (const input of summaryProfileListElement.querySelectorAll("input[name='summary-profile']")) {
    input.addEventListener("change", () => setSummaryProfile(input.value));
  }
  for (const button of summaryProfileListElement.querySelectorAll("[data-profile-delete]")) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteCustomSummaryProfile(button.dataset.profileDelete);
    });
  }
}

function setSummaryProfile(profileCode) {
  const nextProfile = normalizeSummaryProfile(profileCode);
  if (summaryProfile === nextProfile) return;
  summaryProfile = nextProfile;
  localStorage.setItem(SUMMARY_PROFILE_KEY, summaryProfile);
  isSummaryEditing = false;
  renderInterfaceText();
  renderSummary();
}

function toggleSummaryNotesContext() {
  includeNotesInSummary = summaryIncludeNotesInput.checked;
  localStorage.setItem(SUMMARY_INCLUDE_NOTES_KEY, includeNotesInSummary ? "true" : "false");
}

function createCustomSummaryProfile() {
  const name = customProfileNameInput.value.trim();
  const sections = customProfileKeywordsInput.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!name || !sections.length) return;

  const profiles = loadCustomSummaryProfiles();
  const profile = {
    code: `custom-${crypto.randomUUID()}`,
    name,
    sections
  };
  profiles.push(profile);
  saveCustomSummaryProfiles(profiles);
  customProfileNameInput.value = "";
  customProfileKeywordsInput.value = "";
  setSummaryProfile(profile.code);
  setStatus(t("customProfileSaved"), "idle");
}

function deleteCustomSummaryProfile(profileCode) {
  const nextProfiles = loadCustomSummaryProfiles().filter((profile) => profile.code !== profileCode);
  saveCustomSummaryProfiles(nextProfiles);
  if (summaryProfile === profileCode) setSummaryProfile("student");
  else renderSummaryProfileOptions();
}

function renderSummary() {
  const session = getActiveSession();
  const hasTranscript = getSegments().length > 0;
  const summaryLanguage = getActiveSummaryLanguage(session);
  const summary = getSummaryText(session, summaryLanguage);
  const isGeneratingCurrentSummary = summarizingTo === summaryLanguage && !summary.trim();
  const displayText = isGeneratingCurrentSummary
    ? t("summaryGeneratingLanguage", { language: getLanguageLabel(summaryLanguage) })
    : summary;
  const showPreview = Boolean(summary.trim()) && !isSummaryEditing && !isSummaryFolded && !isGeneratingCurrentSummary;
  sessionSummaryElement.value = displayText;
  sessionSummaryPreviewElement.innerHTML = showPreview ? renderMarkdown(summary) : "";
  sessionSummaryPreviewElement.hidden = !showPreview;
  sessionSummaryElement.hidden = isSummaryFolded || showPreview;
  sessionSummaryElement.disabled = !session || isListening || isStopping || Boolean(summarizingTo);
  editSummaryButton.disabled = !summary.trim() || isListening || isStopping || Boolean(summarizingTo);
  copySummaryButton.disabled = !summary.trim() || Boolean(summarizingTo);

  for (const button of summaryLanguageButtons) {
    const language = button.dataset.summaryLanguage;
    if (summarizingTo === language) button.textContent = "...";
    else renderLanguageButton(button, language);
    button.disabled = !session || !hasTranscript || isListening || isStopping || Boolean(summarizingTo);
    button.dataset.active = summaryLanguage === language ? "true" : "false";
    button.title = `${t("generateSummary")} - ${getLanguageLabel(language)}`;
    button.setAttribute("aria-pressed", summaryLanguage === language ? "true" : "false");
  }
  renderSummaryFoldState(summary, summaryLanguage);
}

function saveSessionSummary() {
  const session = getActiveSession();
  if (!session) return;
  const language = getActiveSummaryLanguage(session);
  const summaries = getSessionSummaries(session);
  summaries[getSummaryStorageKey(language)] = sessionSummaryElement.value;
  session.summary = sessionSummaryElement.value;
  session.summaryLanguage = language;
  session.summaryProfile = summaryProfile;
  saveLibrary();
  copySummaryButton.disabled = !sessionSummaryElement.value.trim();
  renderSummaryFoldState(sessionSummaryElement.value, language);
}

function editSummary() {
  if (isListening || isStopping || summarizingTo) return;
  isSummaryEditing = true;
  renderSummary();
  sessionSummaryElement.focus();
}

function finishSummaryEdit() {
  if (!isSummaryEditing) return;
  isSummaryEditing = false;
  renderSummary();
}

function renderSummaryFoldState(summary = getSummaryText(getActiveSession(), getActiveSummaryLanguage()), language = getActiveSummaryLanguage()) {
  const session = getActiveSession();
  const text = summary?.trim() ?? "";
  summaryFoldButton.disabled = !session;
  summaryFoldButton.textContent = isSummaryFolded ? "▾" : "▴";
  summaryFoldButton.title = t(isSummaryFolded ? "unfoldSummary" : "foldSummary");
  summaryFoldButton.setAttribute("aria-label", summaryFoldButton.title);
  summaryFoldButton.setAttribute("aria-expanded", isSummaryFolded ? "false" : "true");
  summaryFoldSummaryElement.hidden = !isSummaryFolded;
  summaryFoldSummaryElement.textContent = t("foldedSummary", {
    label: getLanguageLabel(language),
    count: String(text.length)
  });
  summaryPanelElement.dataset.folded = isSummaryFolded ? "true" : "false";
}

function toggleSummaryFold() {
  isSummaryFolded = !isSummaryFolded;
  if (isSummaryFolded) isSummaryEditing = false;
  renderSummary();
}

async function generateSummary(targetLanguage = uiLanguage) {
  clearError();
  if (!authSession?.access_token) {
    showError(t("signInRequired"));
    openAuthDialog();
    return;
  }

  const session = getActiveSession();
  const subject = getActiveSubject();
  const text = getTranscriptText().trim();
  if (!session || !subject || !text) return;

  const normalizedTargetLanguage = normalizeLanguageCode(targetLanguage) || uiLanguage;
  const activeProfile = getSummaryProfile(summaryProfile);
  isSummaryEditing = false;
  session.summaryLanguage = normalizedTargetLanguage;
  session.summaryProfile = summaryProfile;
  summarizingTo = normalizedTargetLanguage;
  setStatus(t("summaryGenerating"), "connecting");
  addDiagnostic(t("summaryRequested"));
  renderSummary();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS);

  try {
    const response = await fetch(SUMMARY_ENDPOINT, {
      method: "POST",
      headers: getAuthenticatedHeaders({ "Content-Type": "application/json" }),
      signal: controller.signal,
      body: JSON.stringify({
        text,
        targetLanguage: normalizedTargetLanguage,
        summaryProfile,
        summaryProfileTitle: activeProfile?.custom ? activeProfile.name : "",
        summaryProfileSections: activeProfile?.custom ? activeProfile.sections : [],
        includeNotes: includeNotesInSummary,
        notes: session.notes ?? "",
        courseTitle: subject.name,
        sessionTitle: session.title
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.summary) {
      throw new Error(result.error || t("summaryFailed"));
    }

    const summaries = getSessionSummaries(session);
    summaries[getSummaryStorageKey(normalizedTargetLanguage)] = result.summary;
    session.summary = result.summary;
    session.summaryLanguage = normalizedTargetLanguage;
    session.summaryProfile = summaryProfile;
    saveLibrary();
    addDiagnostic(t("summaryReceived", { count: result.summary.length }));
    setStatus(t("summaryReady"), "idle");
  } catch (error) {
    const message = error.name === "AbortError"
      ? t("summarySlow")
      : error.message || t("summaryFailed");
    addDiagnostic(`Erreur de fiche: ${message}`);
    showError(message);
    setStatus(t("error"), "error");
  } finally {
    window.clearTimeout(timeout);
    summarizingTo = "";
    renderSummary();
  }
}

async function selectSummaryLanguage(targetLanguage) {
  const session = getActiveSession();
  const language = normalizeLanguageCode(targetLanguage) || uiLanguage;
  if (!session) return;
  const summaries = getSessionSummaries(session);
  const summaryKey = getSummaryStorageKey(language);
  const existingSummary = summaries[summaryKey]?.trim() || (summaryProfile === "student" ? summaries[language]?.trim() : "") || "";
  const sourceSummary = summaries[getSummaryStorageKey("en")]?.trim() || summaries.en?.trim() || session.summary?.trim() || "";
  const isLikelyMigratedDuplicate = language !== "en" && existingSummary && sourceSummary && existingSummary === sourceSummary;
  isSummaryEditing = false;
  session.summaryLanguage = language;
  session.summaryProfile = summaryProfile;
  if (existingSummary && !isLikelyMigratedDuplicate) session.summary = existingSummary;
  renderSummary();
  if (!existingSummary || isLikelyMigratedDuplicate) {
    if (isLikelyMigratedDuplicate) {
      delete summaries[summaryKey];
      delete summaries[language];
      session.summary = "";
      renderSummary();
    }
    await generateSummary(language);
  }
  else saveLibrary();
}

async function copySummary() {
  const session = getActiveSession();
  const summary = getSummaryText(session, getActiveSummaryLanguage(session)).trim();
  if (!summary) {
    showError(t("summaryEmpty"));
    return;
  }
  await copyText(summary, t("summaryCopied"), copySummaryButton);
}

function getDominantSourceLanguage() {
  const counts = new Map();
  for (const segment of getSegments()) {
    const sourceLanguage = normalizeLanguageCode(segment.sourceLanguage);
    if (!sourceLanguage || sourceLanguage === "mixed") continue;
    counts.set(sourceLanguage, (counts.get(sourceLanguage) ?? 0) + 1);
  }

  let dominant = "";
  let highestCount = 0;
  for (const [language, count] of counts) {
    if (count > highestCount) {
      dominant = language;
      highestCount = count;
    }
  }

  return dominant;
}

function getSourceLanguageForTranslation() {
  const languages = new Set();
  for (const segment of getSegments()) {
    const sourceLanguage = normalizeLanguageCode(segment.sourceLanguage);
    if (!sourceLanguage) continue;
    if (sourceLanguage === "mixed") return "mixed";
    languages.add(sourceLanguage);
  }

  if (languages.size > 1) return "mixed";
  return [...languages][0] ?? "";
}

async function translateTranscript(targetLanguage) {
  clearError();
  if (!authSession?.access_token) {
    showError(t("signInRequired"));
    openAuthDialog();
    return;
  }
  const session = getActiveSession();
  if (!session?.segments.length) return;

  const sourceLanguage = getSourceLanguageForTranslation();
  if (sourceLanguage !== "mixed" && sourceLanguage === targetLanguage) return;
  if (session.translations?.[targetLanguage]) return;

  translatingTo = targetLanguage;
  addDiagnostic(t("translationRequested", { language: getLanguageLabel(targetLanguage) }));
  renderTranscriptTabs();
  renderSegments();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT_MS);

  try {
    const response = await fetch(TRANSLATE_ENDPOINT, {
      method: "POST",
      headers: getAuthenticatedHeaders({ "Content-Type": "application/json" }),
      signal: controller.signal,
      body: JSON.stringify({
        text: getTranscriptText(),
        sourceLanguage,
        targetLanguage
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.translation) {
      throw new Error(result.error || t("translationFailed"));
    }

    session.translations = { ...(session.translations ?? {}), [targetLanguage]: result.translation };
    clearSpeechCacheForSession(session.id, targetLanguage);
    saveLibrary();
    addDiagnostic(t("translationReceived", { count: result.translation.length }));
    setStatus(t("translationReady"), "idle");
  } catch (error) {
    const message = error.name === "AbortError"
      ? t("translationSlow")
      : error.message || t("translationFailed");
    addDiagnostic(`Erreur de traduction: ${message}`);
    showError(message);
  } finally {
    window.clearTimeout(timeout);
    translatingTo = "";
    renderTranscriptTabs();
    renderSegments();
  }
}

function getAuthenticatedHeaders(headers = {}) {
  if (!authSession?.access_token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${authSession.access_token}`
  };
}

function getTranscriptText() {
  return getSegments().map((segment) => segment.text).join("\n\n");
}

async function copyFullTranscript() {
  clearError();
  const text = getActiveTranscriptText().trim();
  if (!text) {
    showError(t("nothingToCopy"));
    return;
  }

  await copyText(text, t("fullCopied"), copyAllButton);
}

function getActiveTranscriptText() {
  const session = getActiveSession();
  if (activeTranscriptTab === "original") return getTranscriptText();
  return session?.translations?.[activeTranscriptTab] ?? "";
}

async function copyText(text, successMessage, button) {
  clearError();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      confirmCopy(button);
      setStatus(successMessage, "idle");
      return;
    }
    copyTextWithFallback(text);
    confirmCopy(button);
    setStatus(successMessage, "idle");
  } catch {
    try {
      copyTextWithFallback(text);
      confirmCopy(button);
      setStatus(successMessage, "idle");
    } catch {
      showError(t("copyUnavailable"));
    }
  }
}

function copyTextWithFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy failed");
}

function confirmCopy(button) {
  if (!button) return;

  const previousHTML = button.innerHTML;
  button.textContent = t("copied");
  button.classList.add("is-copied");
  window.setTimeout(() => {
    button.innerHTML = previousHTML;
    button.classList.remove("is-copied");
  }, COPY_CONFIRMATION_MS);
}

function formatTranscriptForExport() {
  const session = getActiveSession();
  const subject = getActiveSubject();
  if (!session || !subject) return "";
  const date = new Date().toLocaleString(locale());
  const lines = [subject.name, session.title, t("copyDate", { date }), ""];

  for (const segment of session.segments) {
    const time = new Date(segment.createdAt).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });
    lines.push(`[${time}] ${segment.text}`, "");
  }

  const bookmarks = getSessionBookmarks(session);
  if (bookmarks.length) {
    lines.push("", `[${t("bookmarksTitle")}]`);
    for (const bookmark of bookmarks) {
      lines.push(`- ${formatBookmarkTime(bookmark)} ${bookmark.snippet || bookmark.title}`);
    }
    lines.push("");
  }

  if (session.notes?.trim()) lines.push("", `[${t("notesTitle")}]`, session.notes.trim(), "");
  for (const [summaryKey, summary] of Object.entries(getSessionSummaries(session))) {
    if (isReservedSummaryKey(summaryKey)) continue;
    if (summary?.trim()) lines.push("", `[${formatSummaryExportLabel(summaryKey)}]`, summary.trim(), "");
  }

  for (const language of TRANSLATION_LANGUAGES) {
    const translation = session.translations?.[language.code];
    if (translation) lines.push("", `[${language.label}]`, translation);
  }

  return lines.join("\n").trimEnd();
}

function hasExportableSession() {
  const session = getActiveSession();
  return Boolean(session && (
    session.segments?.length ||
    getSessionBookmarks(session).length ||
    session.notes?.trim() ||
    Object.entries(session.summaries ?? {}).some(([key, summary]) => !isReservedSummaryKey(key) && summary?.trim()) ||
    Object.values(session.translations ?? {}).some((translation) => translation?.trim())
  ));
}

function openExportDialog() {
  if (!hasExportableSession()) {
    showError(t("nothingToCopy"));
    return;
  }
  exportDialog.showModal();
}

function exportCurrentSession(format) {
  const documentData = buildFormattedExport();
  if (!documentData) return;

  if (format === "markdown") {
    downloadBlob(`${documentData.filename}.md`, "text/markdown;charset=utf-8", formatTranscriptForExport());
  } else if (format === "word") {
    downloadBlob(`${documentData.filename}.doc`, "application/msword;charset=utf-8", buildWordHTML(documentData));
  } else if (format === "pdf") {
    openPrintExport(documentData);
  }

  exportDialog.close();
  setStatus(format === "pdf" ? t("printReady") : t("exportReady"), "idle");
}

function buildFormattedExport() {
  const session = getActiveSession();
  const subject = getActiveSubject();
  if (!session || !subject) return undefined;

  const title = `${subject.name} - ${session.title}`;
  const date = new Date().toLocaleString(locale());
  const sections = [];
  if (session.segments?.length) {
    sections.push({
      title: t("originalTab"),
      html: session.segments.map((segment) => {
        const time = new Date(segment.createdAt).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });
        return `<p><strong>${escapeHTML(time)}</strong> ${escapeHTML(segment.text)}</p>`;
      }).join("")
    });
  }

  const bookmarks = getSessionBookmarks(session);
  if (bookmarks.length) {
    sections.push({
      title: t("bookmarksTitle"),
      html: `<ul>${bookmarks.map((bookmark) => `
        <li><strong>${escapeHTML(formatBookmarkTime(bookmark))}</strong> ${escapeHTML(bookmark.snippet || bookmark.title)}</li>
      `).join("")}</ul>`
    });
  }

  for (const language of TRANSLATION_LANGUAGES) {
    const translation = session.translations?.[language.code]?.trim();
    if (translation) {
      sections.push({
        title: language.label,
        html: renderPlainTextAsHTML(translation)
      });
    }
  }

  if (session.notes?.trim()) {
    sections.push({
      title: t("notesTitle"),
      html: renderPlainTextAsHTML(session.notes)
    });
  }

  for (const [summaryKey, summary] of Object.entries(getSessionSummaries(session))) {
    if (isReservedSummaryKey(summaryKey)) continue;
    if (summary?.trim()) {
      sections.push({
        title: formatSummaryExportLabel(summaryKey),
        html: renderMarkdown(summary)
      });
    }
  }

  return {
    title,
    date,
    filename: slugify(title),
    sections
  };
}

function buildWordHTML(documentData) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(documentData.title)}</title>
  <style>${exportDocumentCSS()}</style>
</head>
<body>${buildExportBody(documentData)}</body>
</html>`;
}

function openPrintExport(documentData) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    showError(t("copyUnavailable"));
    return;
  }
  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(documentData.title)}</title>
  <style>${exportDocumentCSS()} @media print { body { margin: 0; } }</style>
</head>
<body>${buildExportBody(documentData)}
<script>window.addEventListener("load", () => window.print());<\/script>
</body>
</html>`);
  printWindow.document.close();
}

function buildExportBody(documentData) {
  return `
    <main class="export-document">
      <p class="eyebrow">${escapeHTML(t("copyDate", { date: documentData.date }))}</p>
      <h1>${escapeHTML(documentData.title)}</h1>
      ${documentData.sections.map((section) => `
        <section>
          <h2>${escapeHTML(section.title)}</h2>
          ${section.html}
        </section>
      `).join("")}
    </main>
  `;
}

function exportDocumentCSS() {
  return `
    body { margin: 32px; color: #111827; font-family: Arial, sans-serif; line-height: 1.5; }
    .export-document { max-width: 760px; margin: 0 auto; }
    .eyebrow { color: #64748b; font-size: 12px; text-transform: uppercase; }
    h1 { margin: 0 0 24px; font-size: 28px; }
    h2 { margin: 24px 0 8px; padding-bottom: 6px; border-bottom: 1px solid #cbd5e1; font-size: 18px; }
    h3, h4, h5 { margin: 16px 0 8px; font-size: 15px; }
    p { margin: 0 0 10px; }
    ul, ol { margin: 0 0 12px; padding-left: 24px; }
    li { margin: 4px 0; }
    code { padding: 1px 4px; background: #f1f5f9; border-radius: 4px; }
  `;
}

function renderPlainTextAsHTML(text) {
  return String(text ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHTML(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function downloadBlob(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function slugify(value) {
  return String(value ?? "lecture")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "lecture";
}

function openSearchDialog() {
  searchInputElement.value = "";
  renderSearchResults();
  searchDialog.showModal();
  window.setTimeout(() => searchInputElement.focus(), 0);
}

function renderSearchResults() {
  const query = searchInputElement.value.trim();
  searchResultsElement.replaceChildren();
  if (!query) {
    const hint = document.createElement("p");
    hint.className = "search-empty";
    hint.textContent = t("searchHint");
    searchResultsElement.append(hint);
    return;
  }

  const results = searchWorkspace(query);
  if (!results.length) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = t("searchEmpty");
    searchResultsElement.append(empty);
    return;
  }

  for (const result of results) {
    const button = document.createElement("button");
    button.className = "search-result";
    button.type = "button";
    button.innerHTML = `
      <strong>${escapeHTML(result.subjectName)} / ${escapeHTML(result.sessionTitle)}</strong>
      <span>${escapeHTML(result.source)}</span>
      <small>${escapeHTML(result.snippet)}</small>
    `;
    button.addEventListener("click", () => {
      searchDialog.close();
      selectSession(result.subjectId, result.sessionId);
    });
    searchResultsElement.append(button);
  }
}

function searchWorkspace(query) {
  const workspace = getActiveWorkspace();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!workspace || !terms.length) return [];

  const results = [];
  for (const subject of workspace.subjects ?? []) {
    for (const session of subject.sessions ?? []) {
      const fields = collectSearchFields(session);
      for (const field of fields) {
        const haystack = field.text.toLowerCase();
        if (!terms.every((term) => haystack.includes(term))) continue;
        results.push({
          subjectId: subject.id,
          subjectName: subject.name,
          sessionId: session.id,
          sessionTitle: session.title,
          source: field.source,
          snippet: createSearchSnippet(field.text, terms[0])
        });
        break;
      }
    }
  }
  return results.slice(0, 30);
}

function collectSearchFields(session) {
  const fields = [];
  if (session.title) fields.push({ source: t("defaultSessionPrefix"), text: session.title });
  if (session.notes?.trim()) fields.push({ source: t("notesTitle"), text: session.notes });
  for (const bookmark of getSessionBookmarks(session)) {
    const text = `${formatBookmarkTime(bookmark)} ${bookmark.title} ${bookmark.snippet}`.trim();
    if (text) fields.push({ source: t("bookmarksTitle"), text });
  }
  for (const segment of session.segments ?? []) {
    if (segment.text?.trim()) fields.push({ source: t("originalTab"), text: segment.text });
  }
  for (const [languageCode, translation] of Object.entries(session.translations ?? {})) {
    if (translation?.trim()) fields.push({ source: getLanguageLabel(languageCode), text: translation });
  }
  for (const [summaryKey, summary] of Object.entries(getSessionSummaries(session))) {
    if (isReservedSummaryKey(summaryKey)) continue;
    if (summary?.trim()) fields.push({ source: formatSummaryExportLabel(summaryKey), text: summary });
  }
  return fields;
}

function createSearchSnippet(text, term) {
  const compact = String(text ?? "").replace(/\s+/g, " ").trim();
  const index = compact.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return compact.slice(0, 180);
  const start = Math.max(0, index - 70);
  const end = Math.min(compact.length, index + term.length + 110);
  return `${start ? "..." : ""}${compact.slice(start, end)}${end < compact.length ? "..." : ""}`;
}

async function clearTranscript() {
  const session = getActiveSession();
  if (!session) return;
  if (!(await confirmAction(t("clearConfirm")))) return;
  stopSpeechPlayback();
  clearSpeechCacheForSession(session.id);
  session.segments = [];
  session.translations = {};
  session.summary = "";
  session.summaries = {};
  session.bookmarks = [];
  saveLibrary();
  renderAll();
}

function confirmAction(message) {
  confirmMessageElement.textContent = message;
  confirmDialog.showModal();

  return new Promise((resolve) => {
    const complete = (confirmed) => {
      confirmForm.removeEventListener("submit", onSubmit);
      confirmCancelButton.removeEventListener("click", onCancel);
      confirmDialog.removeEventListener("cancel", onCancel);
      resolve(confirmed);
    };
    const onSubmit = (event) => {
      event.preventDefault();
      confirmDialog.close();
      complete(true);
    };
    const onCancel = () => {
      confirmDialog.close();
      complete(false);
    };

    confirmForm.addEventListener("submit", onSubmit);
    confirmCancelButton.addEventListener("click", onCancel);
    confirmDialog.addEventListener("cancel", onCancel);
  });
}

function normalizeLanguageCode(languageCode) {
  if (!languageCode) return "";
  return languageCode.toLowerCase().split("-")[0];
}

function normalizeTextSize(size) {
  return ["small", "medium", "large"].includes(size) ? size : "medium";
}

function hashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function clearSpeechCacheForSession(sessionId, language = "") {
  const prefix = language ? `${sessionId}:${language}:` : `${sessionId}:`;
  for (const [key, url] of speechCache.entries()) {
    if (!key.startsWith(prefix)) continue;
    URL.revokeObjectURL(url);
    speechCache.delete(key);
  }
}

function normalizeSummaryProfile(profileCode) {
  return getSummaryProfiles().some((profile) => profile.code === profileCode) ? profileCode : "student";
}

function getSummaryProfileLabel(profileCode = summaryProfile) {
  const profile = getSummaryProfile(profileCode);
  if (profile?.custom) return profile.name;
  return t(`summaryProfile${toTitleCase(normalizeSummaryProfile(profileCode))}`);
}

function getSummaryProfileDescription(profileCode = summaryProfile) {
  const profile = getSummaryProfile(profileCode);
  if (profile?.custom) return profile.sections.join(" · ");
  return t(`summaryProfile${toTitleCase(normalizeSummaryProfile(profileCode))}Description`);
}

function getSummaryProfile(profileCode = summaryProfile) {
  const normalized = String(profileCode ?? "");
  return getSummaryProfiles().find((profile) => profile.code === normalized) ?? SUMMARY_PROFILES[0];
}

function getSummaryProfiles() {
  return [
    ...SUMMARY_PROFILES,
    ...loadCustomSummaryProfiles().map((profile) => ({
      code: profile.code,
      custom: true,
      name: profile.name,
      sections: profile.sections
    }))
  ];
}

function loadCustomSummaryProfiles() {
  const profiles = loadJSON(CUSTOM_SUMMARY_PROFILES_KEY, []);
  if (!Array.isArray(profiles)) return [];
  return profiles
    .map((profile) => ({
      code: String(profile.code ?? ""),
      name: String(profile.name ?? "").trim(),
      sections: Array.isArray(profile.sections)
        ? profile.sections.map((section) => String(section ?? "").trim()).filter(Boolean)
        : []
    }))
    .filter((profile) => profile.code.startsWith("custom-") && profile.name && profile.sections.length);
}

function saveCustomSummaryProfiles(profiles) {
  localStorage.setItem(CUSTOM_SUMMARY_PROFILES_KEY, JSON.stringify(profiles));
}

function getSummaryStorageKey(languageCode = getActiveSummaryLanguage()) {
  return `${normalizeSummaryProfile(summaryProfile)}:${normalizeLanguageCode(languageCode) || uiLanguage}`;
}

function formatSummaryExportLabel(summaryKey) {
  if (isReservedSummaryKey(summaryKey)) return "";
  const [profileCode, languageCode] = summaryKey.includes(":")
    ? summaryKey.split(":")
    : ["student", summaryKey];
  return `${t("summaryTitle")} - ${getSummaryProfileLabel(profileCode)} - ${getLanguageLabel(languageCode)}`;
}

function isReservedSummaryKey(key) {
  return String(key ?? "").startsWith("__");
}

function normalizeBookmarks(value) {
  return (Array.isArray(value) ? value : [])
    .map((bookmark) => ({
      id: String(bookmark.id ?? crypto.randomUUID()),
      createdAt: bookmark.createdAt ?? new Date().toISOString(),
      offsetMs: Number.isFinite(Number(bookmark.offsetMs)) ? Number(bookmark.offsetMs) : 0,
      title: String(bookmark.title ?? ""),
      snippet: String(bookmark.snippet ?? "")
    }))
    .filter((bookmark) => bookmark.id);
}

function parseBookmarksFromSummaries(summaries) {
  const raw = summaries?.[BOOKMARKS_SUMMARY_KEY];
  if (!raw) return [];
  try {
    return normalizeBookmarks(JSON.parse(raw));
  } catch {
    return [];
  }
}

function getSessionBookmarks(session) {
  if (!session) return [];
  if (!Array.isArray(session.bookmarks)) {
    session.bookmarks = parseBookmarksFromSummaries(session.summaries);
  }
  return session.bookmarks;
}

function setSessionBookmarks(session, bookmarks) {
  if (!session) return;
  session.bookmarks = normalizeBookmarks(bookmarks);
  const summaries = getSessionSummaries(session);
  if (session.bookmarks.length) summaries[BOOKMARKS_SUMMARY_KEY] = JSON.stringify(session.bookmarks);
  else delete summaries[BOOKMARKS_SUMMARY_KEY];
  saveLibrary();
}

function getRecordingOffsetMs() {
  return recordingStartedAt ? Math.max(0, Date.now() - recordingStartedAt) : 0;
}

function createBookmarkSnippet(text) {
  const compact = String(text ?? "").replace(/\s+/g, " ").trim();
  return compact.length > 120 ? `${compact.slice(0, 117)}...` : compact;
}

function formatBookmarkTime(bookmark) {
  const totalSeconds = Math.floor((Number(bookmark.offsetMs) || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function toTitleCase(value) {
  const text = String(value ?? "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function renderMarkdown(markdown) {
  const lines = String(markdown ?? "").split(/\r?\n/);
  const html = [];
  let listType = "";
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };
  const openList = (type) => {
    if (listType === type) return;
    closeList();
    listType = type;
    html.push(`<${type}>`);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length + 2;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      openList("ul");
      html.push(`<li>${renderInlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      openList("ol");
      html.push(`<li>${renderInlineMarkdown(ordered[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();
  return html.join("");
}

function renderInlineMarkdown(text) {
  return escapeHTML(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSummaries(value, legacySummary = "", legacyLanguage = "") {
  const summaries = value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
  const language = normalizeLanguageCode(legacyLanguage) || uiLanguage;
  if (legacySummary && !summaries[language]) summaries[language] = legacySummary;
  return Object.fromEntries(
    Object.entries(summaries)
      .map(([languageCode, text]) => [
        isReservedSummaryKey(languageCode) ? languageCode : normalizeLanguageCode(languageCode),
        typeof text === "string" ? text : ""
      ])
      .filter(([languageCode, text]) => languageCode && text)
  );
}

function getSessionSummaries(session) {
  if (!session) return {};
  const summaries = session.summaries && typeof session.summaries === "object" && !Array.isArray(session.summaries)
    ? session.summaries
    : {};
  const hasStoredSummaries = Object.values(summaries).some((text) => typeof text === "string" && text.trim());
  session.summaries = hasStoredSummaries
    ? normalizeSummaries(summaries)
    : normalizeSummaries(summaries, session.summary, session.summaryLanguage);
  return session.summaries;
}

function serializeSummariesWithBookmarks(session) {
  const summaries = normalizeSummaries(session?.summaries, session?.summary, session?.summaryLanguage);
  const bookmarks = getSessionBookmarks(session);
  if (bookmarks.length) summaries[BOOKMARKS_SUMMARY_KEY] = JSON.stringify(bookmarks);
  else delete summaries[BOOKMARKS_SUMMARY_KEY];
  return summaries;
}

function getActiveSummaryLanguage(session = getActiveSession()) {
  return normalizeLanguageCode(session?.summaryLanguage) || uiLanguage;
}

function getSummaryText(session, language = getActiveSummaryLanguage(session)) {
  if (!session) return "";
  const summaries = getSessionSummaries(session);
  const languageCode = normalizeLanguageCode(language);
  return summaries[getSummaryStorageKey(languageCode)] ?? (summaryProfile === "student" ? summaries[languageCode] : "") ?? "";
}

function getLanguageLabel(languageCode) {
  const normalized = normalizeLanguageCode(languageCode);
  return TRANSLATION_LANGUAGES.find((language) => language.code === normalized)?.label ?? languageCode;
}

function getLanguageShortLabel(languageCode) {
  const normalized = normalizeLanguageCode(languageCode);
  return TRANSLATION_LANGUAGES.find((language) => language.code === normalized)?.shortLabel ?? languageCode;
}

function renderLanguageButton(button, languageCode, { showCode = true } = {}) {
  const normalized = normalizeLanguageCode(languageCode);
  const label = getLanguageLabel(normalized);
  const code = getLanguageShortLabel(normalized);
  button.replaceChildren();

  const flag = document.createElement("img");
  flag.className = "flag";
  flag.src = `./assets/flags/${normalized === "en" ? "gb" : normalized}.svg`;
  flag.alt = "";
  flag.loading = "lazy";
  flag.decoding = "async";
  button.append(flag);

  if (showCode) {
    const text = document.createElement("span");
    text.textContent = code;
    button.append(text);
  }

  button.title = label;
  button.setAttribute("aria-label", label);
}

function getActiveWorkspace() {
  return library.workspaces.find((workspace) => workspace.id === library.activeWorkspaceId) ?? library.workspaces[0];
}

function getActiveSubject() {
  const workspace = getActiveWorkspace();
  return workspace?.subjects.find((subject) => subject.id === library.activeSubjectId) ?? workspace?.subjects[0];
}

function getActiveSession() {
  const subject = getActiveSubject();
  return subject?.sessions.find((session) => session.id === library.activeSessionId) ?? subject?.sessions[0];
}

function getSegments() {
  return getActiveSession()?.segments ?? [];
}

function ensureActiveSession({ createSessionIfMissing = false } = {}) {
  library = normalizeLibrary(library);

  if (!library.workspaces.length) {
    const workspace = createDefaultWorkspace({ withSubject: createSessionIfMissing });
    library.workspaces.push(workspace);
    library.activeWorkspaceId = workspace.id;
    library.activeSubjectId = workspace.subjects[0]?.id ?? "";
    library.activeSessionId = workspace.subjects[0]?.sessions[0]?.id ?? "";
  }

  if (!library.activeWorkspaceId || !library.workspaces.some((item) => item.id === library.activeWorkspaceId)) {
    library.activeWorkspaceId = library.workspaces[0].id;
  }

  let workspace = getActiveWorkspace();
  const activeSubjectLocation = findSubjectLocation(library.activeSubjectId);
  if (activeSubjectLocation && activeSubjectLocation.workspace.id !== workspace.id) {
    library.activeWorkspaceId = activeSubjectLocation.workspace.id;
    workspace = activeSubjectLocation.workspace;
  }

  if (!library.activeSubjectId || !workspace.subjects.some((item) => item.id === library.activeSubjectId)) {
    library.activeSubjectId = workspace.subjects[0]?.id ?? "";
  }

  let subject = getActiveSubject();
  if (createSessionIfMissing && !subject) {
    subject = createDefaultSubject({ withSession: true });
    workspace.subjects.push(subject);
    library.activeSubjectId = subject.id;
  }
  if (!subject) {
    library.activeSessionId = "";
    return;
  }
  if (createSessionIfMissing && !subject.sessions.length) subject.sessions.push(createSessionRecord());
  if (!library.activeSessionId || !subject.sessions.some((session) => session.id === library.activeSessionId)) {
    library.activeSessionId = subject.sessions[0]?.id ?? "";
  }
}

function loadLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? "null");
    if (saved?.workspaces?.length || saved?.subjects?.length) return normalizeLibrary(saved);
  } catch {
    // Fall through to legacy migration.
  }

  const legacySegments = loadJSON(LEGACY_SEGMENTS_KEY, []);
  const legacyTranslations = loadJSON(LEGACY_TRANSLATIONS_KEY, {});
  const subject = createDefaultSubject();
  subject.sessions[0].segments = Array.isArray(legacySegments) ? legacySegments : [];
  subject.sessions[0].translations = legacyTranslations && typeof legacyTranslations === "object" ? legacyTranslations : {};
  const workspace = createDefaultWorkspace({ withSubject: false });
  workspace.subjects = [subject];
  return {
    workspaces: [workspace],
    activeWorkspaceId: workspace.id,
    activeSubjectId: subject.id,
    activeSessionId: subject.sessions[0].id
  };
}

function normalizeLibrary(value) {
  if (Array.isArray(value?.workspaces)) {
    return {
      workspaces: value.workspaces.map((workspace) => ({
        ...workspace,
        createdAt: workspace.createdAt ?? new Date().toISOString(),
        collapsed: Boolean(workspace.collapsed),
        subjects: normalizeSubjects(workspace.subjects)
      })),
      activeWorkspaceId: value.activeWorkspaceId ?? value.workspaces[0]?.id ?? "",
      activeSubjectId: value.activeSubjectId ?? "",
      activeSessionId: value.activeSessionId ?? ""
    };
  }

  const workspace = createDefaultWorkspace({ withSubject: false });
  workspace.subjects = normalizeSubjects(value?.subjects);
  return {
    workspaces: [workspace],
    activeWorkspaceId: workspace.id,
    activeSubjectId: value?.activeSubjectId ?? workspace.subjects[0]?.id ?? "",
    activeSessionId: value?.activeSessionId ?? workspace.subjects[0]?.sessions[0]?.id ?? ""
  };
}

function normalizeSubjects(subjects) {
  return (Array.isArray(subjects) ? subjects : []).map((subject) => ({
    ...subject,
    createdAt: subject.createdAt ?? new Date().toISOString(),
    collapsed: Boolean(subject.collapsed),
    sessions: (Array.isArray(subject.sessions) ? subject.sessions : []).map((session) => ({
      ...session,
      createdAt: session.createdAt ?? new Date().toISOString(),
      notes: session.notes ?? "",
      summary: session.summary ?? "",
      summaryLanguage: normalizeLanguageCode(session.summaryLanguage) || uiLanguage,
      summaryProfile: normalizeSummaryProfile(session.summaryProfile ?? "student"),
      summaries: normalizeSummaries(session.summaries, session.summary, session.summaryLanguage),
      bookmarks: normalizeBookmarks(session.bookmarks ?? parseBookmarksFromSummaries(session.summaries)),
      segments: Array.isArray(session.segments)
        ? session.segments.map((segment) => ({
            ...segment,
            createdAt: segment.createdAt ?? new Date().toISOString()
          }))
        : [],
      translations: session.translations && typeof session.translations === "object" ? session.translations : {}
    }))
  }));
}

function findSubjectLocation(subjectId) {
  for (const workspace of library.workspaces ?? []) {
    const subject = workspace.subjects.find((item) => item.id === subjectId);
    if (subject) return { workspace, subject };
  }
  return undefined;
}

function createDefaultWorkspace({ withSubject = true } = {}) {
  const subjects = withSubject ? [createDefaultSubject()] : [];
  return {
    id: crypto.randomUUID(),
    name: t("defaultWorkspace"),
    collapsed: false,
    createdAt: new Date().toISOString(),
    subjects
  };
}

function createDefaultSubject({ withSession = true } = {}) {
  const sessions = withSession ? [createSessionRecord()] : [];
  return {
    id: crypto.randomUUID(),
    name: t("defaultSubject"),
    collapsed: false,
    createdAt: new Date().toISOString(),
    sessions
  };
}

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)); } catch { return fallback; }
}

function saveLibrary({ defer = false } = {}) {
  ensureActiveSession();
  if (defer) scheduleLocalLibrarySave();
  else flushLocalLibrarySave();
  scheduleCloudSync();
}

function scheduleLocalLibrarySave() {
  window.clearTimeout(localSaveTimer);
  localSaveTimer = window.setTimeout(flushLocalLibrarySave, LIVE_SAVE_DELAY_MS);
}

function flushLocalLibrarySave() {
  window.clearTimeout(localSaveTimer);
  localSaveTimer = undefined;
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

function summarizeMessage(rawMessage) {
  if (rawMessage.length <= 220) return rawMessage;
  return `${rawMessage.slice(0, 220)}…`;
}

function queueAudioChunk(data) {
  queuedAudioChunks.push(data);
  if (queuedAudioChunks.length > MAX_QUEUED_AUDIO_CHUNKS) queuedAudioChunks.shift();
}

function flushQueuedAudio() {
  if (socket?.readyState !== WebSocket.OPEN || !queuedAudioChunks.length) return;
  const chunks = queuedAudioChunks;
  queuedAudioChunks = [];
  for (const chunk of chunks) sendAudioChunk(chunk);
  addDiagnostic(t("audioBufferFlushed", { count: chunks.length }));
}

function sendAudioChunk(data) {
  sendJSON({
    realtimeInput: {
      audio: { data, mimeType: "audio/pcm;rate=16000" }
    }
  });
}

function addDiagnostic(message) {
  const time = new Date().toLocaleTimeString("fr-FR");
  diagnosticLines = [...diagnosticLines.slice(-11), `[${time}] ${message}`];
  diagnosticsElement.textContent = diagnosticLines.join("\n");
}

function sendJSON(value) {
  socket?.send(JSON.stringify(value));
}

function sendJSONToSocket(targetSocket, value) {
  targetSocket?.send(JSON.stringify(value));
}

function resampleAndEncode(input, inputRate, outputRate) {
  const outputLength = Math.max(1, Math.round(input.length * outputRate / inputRate));
  const pcm = new Int16Array(outputLength);
  const ratio = inputRate / outputRate;
  for (let i = 0; i < outputLength; i += 1) {
    const position = i * ratio;
    const left = Math.floor(position);
    const right = Math.min(left + 1, input.length - 1);
    const weight = position - left;
    const sample = input[left] * (1 - weight) + input[right] * weight;
    pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function setStatus(text, state) {
  statusElement.textContent = text;
  statusElement.dataset.state = state;
}

function showError(message) { errorElement.textContent = message; errorElement.hidden = false; }
function clearError() { errorElement.textContent = ""; errorElement.hidden = true; }

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => registration.update())
    .catch(() => {});
}
