import React, { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Send, MessageSquare, Loader2, Palmtree, Sparkles, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { supabase } from "./supabaseClient";

const LANGS = [
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "pt", flag: "🇧🇷", name: "Português" },
];

const tr = (obj, lang) => (obj && (obj[lang] || obj.fr)) || "";

const FEATURES = [
  { id: "choix_moraux", label: { fr: "Choix moraux qui changent l'histoire", en: "Moral choices that change the story", es: "Decisiones morales que cambian la historia", de: "Moralische Entscheidungen, die die Geschichte verändern", it: "Scelte morali che cambiano la storia", pt: "Escolhas morais que mudam a história" } },
  { id: "port_armes", label: { fr: "Port limité d'armes (comme dans Red Dead Redemption 2)", en: "Limited weapon carrying (like in Red Dead Redemption 2)", es: "Porte limitado de armas (como en Red Dead Redemption 2)", de: "Begrenztes Waffentragen (wie in Red Dead Redemption 2)", it: "Porto d'armi limitato (come in Red Dead Redemption 2)", pt: "Porte limitado de armas (como em Red Dead Redemption 2)" } },
  { id: "besoins", label: { fr: "Besoins du personnage (faim, sommeil, hygiène)", en: "Character needs (hunger, sleep, hygiene)", es: "Necesidades del personaje (hambre, sueño, higiene)", de: "Bedürfnisse der Figur (Hunger, Schlaf, Hygiene)", it: "Bisogni del personaggio (fame, sonno, igiene)", pt: "Necessidades do personagem (fome, sono, higiene)" } },
  { id: "interieurs", label: { fr: "Intérieurs accessibles partout", en: "Accessible interiors everywhere", es: "Interiores accesibles en todas partes", de: "Überall zugängliche Innenräume", it: "Interni accessibili ovunque", pt: "Interiores acessíveis em todos os lugares" } },
  { id: "reputation", label: { fr: "Système de réputation", en: "Reputation system", es: "Sistema de reputación", de: "Rufsystem", it: "Sistema di reputazione", pt: "Sistema de reputação" } },
  { id: "carte_evolutive", label: { fr: "Une carte qui évolue avec le temps", en: "A map that evolves over time", es: "Un mapa que evoluciona con el tiempo", de: "Eine Karte, die sich mit der Zeit verändert", it: "Una mappa che evolve nel tempo", pt: "Um mapa que evolui com o tempo" } },
  { id: "animations", label: { fr: "Animations plus lentes et réalistes", en: "Slower, more realistic animations", es: "Animaciones más lentas y realistas", de: "Langsamere, realistischere Animationen", it: "Animazioni più lente e realistiche", pt: "Animações mais lentas e realistas" } },
];

const PRIORITIES = [
  { id: "exploration", label: { fr: "Explorer la carte librement, sans se presser", en: "Explore the map freely, without rushing", es: "Explorar el mapa libremente, sin prisa", de: "Die Karte frei erkunden, ohne Eile", it: "Esplorare la mappa liberamente, senza fretta", pt: "Explorar o mapa livremente, sem pressa" } },
  { id: "histoire", label: { fr: "Terminer l'histoire principale le plus vite possible", en: "Finish the main story as fast as possible", es: "Terminar la historia principal lo más rápido posible", de: "Die Hauptgeschichte so schnell wie möglich beenden", it: "Finire la storia principale il più velocemente possibile", pt: "Terminar a história principal o mais rápido possível" } },
  { id: "braquages", label: { fr: "Enchaîner un maximum de braquages", en: "Chain as many heists as possible", es: "Encadenar el máximo de atracos", de: "So viele Raubüberfälle wie möglich hintereinander", it: "Incatenare il maggior numero di rapine possibile", pt: "Encadear o máximo de assaltos possível" } },
  { id: "physique", label: { fr: "Découvrir la nouvelle physique du jeu", en: "Discover the game's new physics", es: "Descubrir la nueva física del juego", de: "Die neue Spielphysik entdecken", it: "Scoprire la nuova fisica del gioco", pt: "Descobrir a nova física do jogo" } },
  { id: "collection", label: { fr: "Collectionner voitures, propriétés et objets", en: "Collect cars, properties and items", es: "Coleccionar coches, propiedades y objetos", de: "Autos, Immobilien und Gegenstände sammeln", it: "Collezionare auto, proprietà e oggetti", pt: "Colecionar carros, propriedades e itens" } },
  { id: "pnj_systeme", label: { fr: "Étudier le nouveau système de PNJ", en: "Study the new NPC system", es: "Estudiar el nuevo sistema de PNJ", de: "Das neue NPC-System erkunden", it: "Studiare il nuovo sistema degli NPC", pt: "Estudar o novo sistema de NPCs" } },
  { id: "police", label: { fr: "Étudier le nouveau système de police", en: "Study the new police system", es: "Estudiar el nuevo sistema policial", de: "Das neue Polizeisystem erkunden", it: "Studiare il nuovo sistema di polizia", pt: "Estudar o novo sistema policial" } },
  { id: "perso", label: { fr: "Personnaliser mon personnage et mes véhicules", en: "Customize my character and vehicles", es: "Personalizar mi personaje y mis vehículos", de: "Meinen Charakter und meine Fahrzeuge anpassen", it: "Personalizzare il mio personaggio e i miei veicoli", pt: "Personalizar meu personagem e meus veículos" } },
];

const FEARS = [
  { id: "microtransactions", label: { fr: "Des micro-transactions abusives", en: "Abusive microtransactions", es: "Microtransacciones abusivas", de: "Missbräuchliche Mikrotransaktionen", it: "Microtransazioni abusive", pt: "Microtransações abusivas" } },
  { id: "retard", label: { fr: "Un retard de sortie", en: "A release delay", es: "Un retraso en el lanzamiento", de: "Eine Verschiebung des Release", it: "Un rinvio dell'uscita", pt: "Um atraso no lançamento" } },
  { id: "censure", label: { fr: "De la censure sur certains contenus", en: "Censorship of certain content", es: "Censura en algunos contenidos", de: "Zensur bei bestimmten Inhalten", it: "Censura su alcuni contenuti", pt: "Censura em certos conteúdos" } },
  { id: "contenu_coupe", label: { fr: "Du contenu coupé, revendu ensuite en DLC", en: "Cut content, later sold as DLC", es: "Contenido recortado, vendido después como DLC", de: "Herausgeschnittene Inhalte, später als DLC verkauft", it: "Contenuti tagliati, poi rivenduti come DLC", pt: "Conteúdo cortado, depois vendido como DLC" } },
  { id: "pc_bacle", label: { fr: "Une version PC bâclée", en: "A rushed, sloppy PC version", es: "Una versión para PC descuidada", de: "Eine schlampige PC-Version", it: "Una versione PC raffazzonata", pt: "Uma versão para PC malfeita" } },
  { id: "monde_vide", label: { fr: "Un monde moins interactif que promis", en: "A world less interactive than promised", es: "Un mundo menos interactivo de lo prometido", de: "Eine weniger interaktive Welt als versprochen", it: "Un mondo meno interattivo del previsto", pt: "Um mundo menos interativo do que prometido" } },
  { id: "bugs", label: { fr: "Des bugs et une optimisation décevante au lancement", en: "Bugs and disappointing optimization at launch", es: "Errores y una optimización decepcionante en el lanzamiento", de: "Bugs und enttäuschende Optimierung zum Start", it: "Bug e un'ottimizzazione deludente al lancio", pt: "Bugs e uma otimização decepcionante no lançamento" } },
  { id: "serveurs", label: { fr: "Des serveurs en ligne surchargés au lancement", en: "Overloaded online servers at launch", es: "Servidores en línea saturados en el lanzamiento", de: "Überlastete Online-Server zum Start", it: "Server online sovraccarichi al lancio", pt: "Servidores online sobrecarregados no lançamento" } },
];

const BAR_COLORS = ["#e8577f", "#f4935f", "#f4b26b", "#a89fd9"];

const CAT_FEATURE = "feature";
const CAT_PRIORITY = "priority";
const CAT_FREEDOM = "freedom";
const CAT_TRAILER = "trailer";
const CAT_PLATFORM = "platform";
const CAT_FEAR = "fear";

async function fetchVotesByCategory(category) {
  const { data, error } = await supabase.from("votes").select("option_id, count").eq("category", category);
  if (error || !data) return {};
  const obj = {};
  data.forEach((row) => { obj[row.option_id] = row.count; });
  return obj;
}

async function incrementVote(category, optionId) {
  await supabase.rpc("increment_vote", { p_category: category, p_option_id: optionId });
}

async function fetchComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("id, text")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return data;
}

async function addCommentToDb(text) {
  await supabase.from("comments").insert({ text });
}

async function fetchParticipants() {
  const { data, error } = await supabase.from("participants").select("count").eq("id", 1).single();
  if (error || !data) return 0;
  return data.count;
}

async function incrementParticipants() {
  await supabase.rpc("increment_participants");
}

const SLIDES = ["accueil", "formulaire", "priorites", "craintes", "trailer_plateforme", "merci", "resultats", "commentaires"];

const T = {
  fr: {
    badge: "Sondage communautaire non-officiel",
    heroLine1: "QU'ATTENDEZ-VOUS", heroLine2: "DE GTA VI ?",
    heroDesc: "Sortie confirmée le 19 novembre 2026, à Vice City. Avant d'y être, dites-nous ce que la communauté veut vraiment voir dans le jeu.",
    loading: "chargement…",
    giveOpinion: "Donner mon avis",
    releaseIn: "Sortie dans",
    formTitle: "Donnez votre avis",
    formDesc: "Cochez tout ce qui compte pour vous, ajoutez un commentaire si vous voulez développer.",
    addMore: "N'hésitez pas à en rajouter !",
    addMoreFear: "N'hésitez pas à en dire plus !",
    commentPlaceholder1: "Ex : j'aimerais surtout un système d'IA de police plus intelligent...",
    commentPlaceholder2: "Ex : je voudrais aussi pouvoir gérer une entreprise légale en parallèle...",
    commentPlaceholder3: "Ex : j'ai peur surtout que le online soit prioritaire sur le solo...",
    errorFeatures: "Cochez au moins une attente ou écrivez un commentaire.",
    errorGeneric: "L'envoi a échoué. Réessayez dans un instant.",
    sending: "Envoi...",
    submitFeatures: "Envoyer mes attentes",
    successFeatures: "Merci, votre réponse a été prise en compte !",
    priorityTitle: "Quelles seront vos priorités en jeu ?",
    priorityDesc: "Une fois dans GTA VI, qu'est-ce qui comptera le plus pour vous ? Cochez ce qui vous correspond.",
    errorPriorities: "Cochez au moins une priorité ou répondez au sondage.",
    submitPriorities: "Valider mes priorités",
    successPriorities: "Merci, vos priorités ont été enregistrées !",
    freedomQuestion: "Pensez-vous que Rockstar va nous laisser une certaine liberté dans le jeu lors des missions, ou bien le jeu sera très directif et voudra qu'on se concentre plus sur l'histoire ?",
    freedomOui: "Oui, on aura de la liberté",
    freedomNon: "Non, ce sera plus dirigiste",
    fearTitle: "Qu'est-ce qui vous inquiète le plus pour GTA VI ?",
    fearDesc: "On ne parle pas que des attentes positives — cochez ce qui vous fait le plus peur.",
    errorFears: "Cochez au moins une crainte ou écrivez un commentaire.",
    submitFears: "Valider mes craintes",
    successFears: "Merci, vos craintes ont été enregistrées !",
    tpTitle: "Trailers & plateforme",
    tpDesc: "Deux petites questions rapides avant de voir les résultats.",
    trailerQuestion: "Avez-vous préféré le trailer 1 ou le trailer 2 ?",
    trailer1: "Trailer 1",
    trailer2: "Trailer 2",
    platformQuestion: "Allez-vous jouer sur PS5, Xbox ou bien PC ?",
    ps5: "PS5", xbox: "Xbox", pc: "PC 😅",
    errorTp: "Répondez à au moins une des deux questions.",
    submitTp: "Valider mes réponses",
    successTp: "Merci, vos réponses ont été enregistrées !",
    thanksTitle: "MERCI D'AVOIR RÉPONDU !",
    thanksDesc: "Votre avis vient d'être ajouté aux résultats de la communauté. Chaque réponse compte pour vraiment savoir ce que les joueurs attendent de GTA VI.",
    thanksBtn: "Voir les résultats",
    resultsTitle1: "Résultats de la communauté",
    resultsTitle2: "Priorités de jeu de la communauté",
    resultsTitle3: "Liberté ou histoire dirigiste ?",
    resultsTitle4: "Trailer préféré",
    resultsTitle5: "Plateforme de jeu",
    loadingResults: "Chargement des résultats…",
    noVotes: "Aucun vote pour l'instant — soyez le premier à répondre.",
    noAnswers: "Aucune réponse pour l'instant — soyez le premier à répondre.",
    commentsTitle: "Ce que dit la communauté",
    commentsDesc: "Les commentaires laissés par les autres joueurs.",
    loadingComments: "Chargement des commentaires…",
    noComments: "Aucun commentaire pour l'instant. Le vôtre pourrait être le premier.",
    footerDisclaimer: "Site de fans non-officiel — non affilié à Rockstar Games ou Take-Two Interactive.",
    prevSlide: "Diapositive précédente",
    nextSlide: "Diapositive suivante",
    goToSlide: "Aller à la diapositive",
    charCount: "caractères",
  },
  en: {
    badge: "Unofficial community survey",
    heroLine1: "WHAT DO YOU EXPECT", heroLine2: "FROM GTA VI?",
    heroDesc: "Release confirmed for November 19, 2026, in Vice City. Before it arrives, tell us what the community really wants to see in the game.",
    loading: "loading…",
    giveOpinion: "Share my opinion",
    releaseIn: "Releases in",
    formTitle: "Share your expectations",
    formDesc: "Check everything that matters to you, and add a comment if you want to say more.",
    addMore: "Feel free to add more!",
    addMoreFear: "Feel free to say more!",
    commentPlaceholder1: "E.g.: I'd especially like a smarter police AI system...",
    commentPlaceholder2: "E.g.: I'd also like to run a legit business on the side...",
    commentPlaceholder3: "E.g.: I'm mostly afraid online will be prioritized over single-player...",
    errorFeatures: "Check at least one expectation or write a comment.",
    errorGeneric: "Something went wrong. Please try again in a moment.",
    sending: "Sending...",
    submitFeatures: "Send my expectations",
    successFeatures: "Thanks, your answer has been recorded!",
    priorityTitle: "What will your in-game priorities be?",
    priorityDesc: "Once in GTA VI, what will matter most to you? Check what fits.",
    errorPriorities: "Check at least one priority or answer the poll.",
    submitPriorities: "Confirm my priorities",
    successPriorities: "Thanks, your priorities have been recorded!",
    freedomQuestion: "Do you think Rockstar will give us real freedom during missions, or will the game be very linear and want us to focus more on the story?",
    freedomOui: "Yes, we'll have freedom",
    freedomNon: "No, it'll be more linear",
    fearTitle: "What worries you most about GTA VI?",
    fearDesc: "It's not just about positive expectations — check what worries you the most.",
    errorFears: "Check at least one worry or write a comment.",
    submitFears: "Confirm my worries",
    successFears: "Thanks, your worries have been recorded!",
    tpTitle: "Trailers & platform",
    tpDesc: "Two quick questions before you see the results.",
    trailerQuestion: "Did you prefer trailer 1 or trailer 2?",
    trailer1: "Trailer 1",
    trailer2: "Trailer 2",
    platformQuestion: "Will you play on PS5, Xbox, or PC?",
    ps5: "PS5", xbox: "Xbox", pc: "PC 😅",
    errorTp: "Answer at least one of the two questions.",
    submitTp: "Confirm my answers",
    successTp: "Thanks, your answers have been recorded!",
    thanksTitle: "THANKS FOR ANSWERING!",
    thanksDesc: "Your opinion has just been added to the community results. Every answer counts to really know what players expect from GTA VI.",
    thanksBtn: "See the results",
    resultsTitle1: "Community results",
    resultsTitle2: "Community in-game priorities",
    resultsTitle3: "Freedom or a linear story?",
    resultsTitle4: "Favorite trailer",
    resultsTitle5: "Gaming platform",
    loadingResults: "Loading results…",
    noVotes: "No votes yet — be the first to answer.",
    noAnswers: "No answers yet — be the first to answer.",
    commentsTitle: "What the community is saying",
    commentsDesc: "Comments left by other players.",
    loadingComments: "Loading comments…",
    noComments: "No comments yet. Yours could be the first.",
    footerDisclaimer: "Unofficial fan site — not affiliated with Rockstar Games or Take-Two Interactive.",
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    goToSlide: "Go to slide",
    charCount: "characters",
  },
  es: {
    badge: "Encuesta comunitaria no oficial",
    heroLine1: "¿QUÉ ESPERAS", heroLine2: "DE GTA VI?",
    heroDesc: "Lanzamiento confirmado para el 19 de noviembre de 2026, en Vice City. Antes de que llegue, dinos qué quiere realmente la comunidad en el juego.",
    loading: "cargando…",
    giveOpinion: "Dar mi opinión",
    releaseIn: "Sale en",
    formTitle: "Danos tu opinión",
    formDesc: "Marca todo lo que te importa y añade un comentario si quieres explicarte más.",
    addMore: "¡No dudes en añadir más!",
    addMoreFear: "¡No dudes en contar más!",
    commentPlaceholder1: "Ej.: sobre todo me gustaría un sistema de IA policial más inteligente...",
    commentPlaceholder2: "Ej.: también me gustaría poder llevar un negocio legal en paralelo...",
    commentPlaceholder3: "Ej.: me da miedo sobre todo que el online tenga prioridad sobre el solo...",
    errorFeatures: "Marca al menos una expectativa o escribe un comentario.",
    errorGeneric: "El envío falló. Inténtalo de nuevo en un momento.",
    sending: "Enviando...",
    submitFeatures: "Enviar mis expectativas",
    successFeatures: "¡Gracias, tu respuesta ha sido registrada!",
    priorityTitle: "¿Cuáles serán tus prioridades en el juego?",
    priorityDesc: "Una vez en GTA VI, ¿qué será lo más importante para ti? Marca lo que te identifique.",
    errorPriorities: "Marca al menos una prioridad o responde a la encuesta.",
    submitPriorities: "Confirmar mis prioridades",
    successPriorities: "¡Gracias, tus prioridades han sido registradas!",
    freedomQuestion: "¿Crees que Rockstar nos dejará cierta libertad en el juego durante las misiones, o el juego será muy dirigido y querrá que nos centremos más en la historia?",
    freedomOui: "Sí, tendremos libertad",
    freedomNon: "No, será más dirigido",
    fearTitle: "¿Qué es lo que más te preocupa de GTA VI?",
    fearDesc: "No solo hablamos de expectativas positivas — marca lo que más te preocupa.",
    errorFears: "Marca al menos un temor o escribe un comentario.",
    submitFears: "Confirmar mis temores",
    successFears: "¡Gracias, tus temores han sido registrados!",
    tpTitle: "Trailers y plataforma",
    tpDesc: "Dos preguntas rápidas antes de ver los resultados.",
    trailerQuestion: "¿Prefieres el tráiler 1 o el tráiler 2?",
    trailer1: "Tráiler 1",
    trailer2: "Tráiler 2",
    platformQuestion: "¿Vas a jugar en PS5, Xbox o PC?",
    ps5: "PS5", xbox: "Xbox", pc: "PC 😅",
    errorTp: "Responde al menos a una de las dos preguntas.",
    submitTp: "Confirmar mis respuestas",
    successTp: "¡Gracias, tus respuestas han sido registradas!",
    thanksTitle: "¡GRACIAS POR RESPONDER!",
    thanksDesc: "Tu opinión se acaba de añadir a los resultados de la comunidad. Cada respuesta cuenta para saber realmente qué esperan los jugadores de GTA VI.",
    thanksBtn: "Ver resultados",
    resultsTitle1: "Resultados de la comunidad",
    resultsTitle2: "Prioridades de juego de la comunidad",
    resultsTitle3: "¿Libertad o historia dirigida?",
    resultsTitle4: "Tráiler favorito",
    resultsTitle5: "Plataforma de juego",
    loadingResults: "Cargando resultados…",
    noVotes: "Aún no hay votos — sé el primero en responder.",
    noAnswers: "Aún no hay respuestas — sé el primero en responder.",
    commentsTitle: "Lo que dice la comunidad",
    commentsDesc: "Comentarios dejados por otros jugadores.",
    loadingComments: "Cargando comentarios…",
    noComments: "Aún no hay comentarios. El tuyo podría ser el primero.",
    footerDisclaimer: "Sitio de fans no oficial — no afiliado a Rockstar Games ni Take-Two Interactive.",
    prevSlide: "Diapositiva anterior",
    nextSlide: "Siguiente diapositiva",
    goToSlide: "Ir a la diapositiva",
    charCount: "caracteres",
  },
  de: {
    badge: "Inoffizielle Community-Umfrage",
    heroLine1: "WAS ERWARTET IHR", heroLine2: "VON GTA VI?",
    heroDesc: "Release bestätigt für den 19. November 2026, in Vice City. Bevor es soweit ist, sagt uns, was die Community wirklich im Spiel sehen möchte.",
    loading: "lädt…",
    giveOpinion: "Meine Meinung abgeben",
    releaseIn: "Release in",
    formTitle: "Sag uns deine Erwartungen",
    formDesc: "Kreuze alles an, was dir wichtig ist, und füge einen Kommentar hinzu, wenn du mehr sagen möchtest.",
    addMore: "Nur zu, ergänze gerne mehr!",
    addMoreFear: "Nur zu, sag gerne mehr!",
    commentPlaceholder1: "Z. B.: Ich hätte vor allem gerne ein intelligenteres Polizei-KI-System...",
    commentPlaceholder2: "Z. B.: Ich würde auch gerne nebenbei ein legales Geschäft führen...",
    commentPlaceholder3: "Z. B.: Ich habe vor allem Angst, dass Online gegenüber Solo bevorzugt wird...",
    errorFeatures: "Kreuze mindestens eine Erwartung an oder schreibe einen Kommentar.",
    errorGeneric: "Das Senden ist fehlgeschlagen. Versuch es gleich noch einmal.",
    sending: "Wird gesendet...",
    submitFeatures: "Meine Erwartungen senden",
    successFeatures: "Danke, deine Antwort wurde erfasst!",
    priorityTitle: "Was werden eure Prioritäten im Spiel sein?",
    priorityDesc: "Was wird euch in GTA VI am wichtigsten sein? Kreuzt an, was zu euch passt.",
    errorPriorities: "Kreuze mindestens eine Priorität an oder beantworte die Umfrage.",
    submitPriorities: "Meine Prioritäten bestätigen",
    successPriorities: "Danke, eure Prioritäten wurden erfasst!",
    freedomQuestion: "Glaubt ihr, dass Rockstar uns bei Missionen etwas Freiheit lässt, oder wird das Spiel sehr linear sein und will, dass wir uns mehr auf die Geschichte konzentrieren?",
    freedomOui: "Ja, wir werden Freiheit haben",
    freedomNon: "Nein, es wird linearer sein",
    fearTitle: "Was macht euch bei GTA VI am meisten Sorgen?",
    fearDesc: "Es geht nicht nur um positive Erwartungen — kreuzt an, was euch am meisten beunruhigt.",
    errorFears: "Kreuze mindestens eine Sorge an oder schreibe einen Kommentar.",
    submitFears: "Meine Sorgen bestätigen",
    successFears: "Danke, eure Sorgen wurden erfasst!",
    tpTitle: "Trailer & Plattform",
    tpDesc: "Zwei kurze Fragen, bevor ihr die Ergebnisse seht.",
    trailerQuestion: "Habt ihr Trailer 1 oder Trailer 2 bevorzugt?",
    trailer1: "Trailer 1",
    trailer2: "Trailer 2",
    platformQuestion: "Werdet ihr auf PS5, Xbox oder PC spielen?",
    ps5: "PS5", xbox: "Xbox", pc: "PC 😅",
    errorTp: "Beantworte mindestens eine der beiden Fragen.",
    submitTp: "Meine Antworten bestätigen",
    successTp: "Danke, eure Antworten wurden erfasst!",
    thanksTitle: "DANKE FÜRS MITMACHEN!",
    thanksDesc: "Deine Meinung wurde gerade zu den Community-Ergebnissen hinzugefügt. Jede Antwort zählt, um wirklich zu wissen, was Spieler von GTA VI erwarten.",
    thanksBtn: "Ergebnisse ansehen",
    resultsTitle1: "Ergebnisse der Community",
    resultsTitle2: "Prioritäten der Community im Spiel",
    resultsTitle3: "Freiheit oder lineare Geschichte?",
    resultsTitle4: "Lieblingstrailer",
    resultsTitle5: "Spieleplattform",
    loadingResults: "Ergebnisse werden geladen…",
    noVotes: "Noch keine Stimmen — sei der Erste, der antwortet.",
    noAnswers: "Noch keine Antworten — sei der Erste, der antwortet.",
    commentsTitle: "Was die Community sagt",
    commentsDesc: "Kommentare anderer Spieler.",
    loadingComments: "Kommentare werden geladen…",
    noComments: "Noch keine Kommentare. Deiner könnte der erste sein.",
    footerDisclaimer: "Inoffizielle Fanseite — nicht verbunden mit Rockstar Games oder Take-Two Interactive.",
    prevSlide: "Vorherige Folie",
    nextSlide: "Nächste Folie",
    goToSlide: "Zu Folie gehen",
    charCount: "Zeichen",
  },
  it: {
    badge: "Sondaggio comunitario non ufficiale",
    heroLine1: "COSA VI ASPETTATE", heroLine2: "DA GTA VI?",
    heroDesc: "Uscita confermata per il 19 novembre 2026, a Vice City. Prima che arrivi, diteci cosa vuole davvero la community nel gioco.",
    loading: "caricamento…",
    giveOpinion: "Dai la mia opinione",
    releaseIn: "Uscita tra",
    formTitle: "Dacci la tua opinione",
    formDesc: "Seleziona tutto ciò che conta per te, aggiungi un commento se vuoi approfondire.",
    addMore: "Non esitare ad aggiungere altro!",
    addMoreFear: "Non esitare a dire di più!",
    commentPlaceholder1: "Es.: vorrei soprattutto un sistema di IA della polizia più intelligente...",
    commentPlaceholder2: "Es.: vorrei anche poter gestire un'attività legale in parallelo...",
    commentPlaceholder3: "Es.: temo soprattutto che l'online abbia la priorità sul single player...",
    errorFeatures: "Seleziona almeno un'aspettativa o scrivi un commento.",
    errorGeneric: "L'invio non è riuscito. Riprova tra un momento.",
    sending: "Invio...",
    submitFeatures: "Invia le mie aspettative",
    successFeatures: "Grazie, la tua risposta è stata registrata!",
    priorityTitle: "Quali saranno le vostre priorità in gioco?",
    priorityDesc: "Una volta in GTA VI, cosa conterà di più per te? Seleziona ciò che ti rispecchia.",
    errorPriorities: "Seleziona almeno una priorità o rispondi al sondaggio.",
    submitPriorities: "Conferma le mie priorità",
    successPriorities: "Grazie, le tue priorità sono state registrate!",
    freedomQuestion: "Pensi che Rockstar ci lascerà una certa libertà nel gioco durante le missioni, oppure il gioco sarà molto lineare e vorrà farci concentrare di più sulla storia?",
    freedomOui: "Sì, avremo libertà",
    freedomNon: "No, sarà più lineare",
    fearTitle: "Cosa vi preoccupa di più per GTA VI?",
    fearDesc: "Non parliamo solo di aspettative positive — seleziona ciò che ti preoccupa di più.",
    errorFears: "Seleziona almeno una preoccupazione o scrivi un commento.",
    submitFears: "Conferma le mie preoccupazioni",
    successFears: "Grazie, le tue preoccupazioni sono state registrate!",
    tpTitle: "Trailer e piattaforma",
    tpDesc: "Due domande veloci prima di vedere i risultati.",
    trailerQuestion: "Hai preferito il trailer 1 o il trailer 2?",
    trailer1: "Trailer 1",
    trailer2: "Trailer 2",
    platformQuestion: "Giocherai su PS5, Xbox o PC?",
    ps5: "PS5", xbox: "Xbox", pc: "PC 😅",
    errorTp: "Rispondi ad almeno una delle due domande.",
    submitTp: "Conferma le mie risposte",
    successTp: "Grazie, le tue risposte sono state registrate!",
    thanksTitle: "GRAZIE PER AVER RISPOSTO!",
    thanksDesc: "La tua opinione è appena stata aggiunta ai risultati della community. Ogni risposta conta per sapere davvero cosa si aspettano i giocatori da GTA VI.",
    thanksBtn: "Vedi i risultati",
    resultsTitle1: "Risultati della community",
    resultsTitle2: "Priorità di gioco della community",
    resultsTitle3: "Libertà o storia lineare?",
    resultsTitle4: "Trailer preferito",
    resultsTitle5: "Piattaforma di gioco",
    loadingResults: "Caricamento risultati…",
    noVotes: "Nessun voto per ora — sii il primo a rispondere.",
    noAnswers: "Nessuna risposta per ora — sii il primo a rispondere.",
    commentsTitle: "Cosa dice la community",
    commentsDesc: "Commenti lasciati da altri giocatori.",
    loadingComments: "Caricamento commenti…",
    noComments: "Nessun commento per ora. Il tuo potrebbe essere il primo.",
    footerDisclaimer: "Sito di fan non ufficiale — non affiliato a Rockstar Games o Take-Two Interactive.",
    prevSlide: "Diapositiva precedente",
    nextSlide: "Diapositiva successiva",
    goToSlide: "Vai alla diapositiva",
    charCount: "caratteri",
  },
  pt: {
    badge: "Pesquisa comunitária não oficial",
    heroLine1: "O QUE VOCÊ ESPERA", heroLine2: "DE GTA VI?",
    heroDesc: "Lançamento confirmado para 19 de novembro de 2026, em Vice City. Antes de chegar, diga-nos o que a comunidade realmente quer ver no jogo.",
    loading: "carregando…",
    giveOpinion: "Dar minha opinião",
    releaseIn: "Lança em",
    formTitle: "Dê sua opinião",
    formDesc: "Marque tudo o que é importante para você, adicione um comentário se quiser detalhar.",
    addMore: "Sinta-se à vontade para adicionar mais!",
    addMoreFear: "Sinta-se à vontade para dizer mais!",
    commentPlaceholder1: "Ex.: eu gostaria principalmente de um sistema de IA policial mais inteligente...",
    commentPlaceholder2: "Ex.: eu também gostaria de administrar um negócio legal em paralelo...",
    commentPlaceholder3: "Ex.: meu maior medo é que o online tenha prioridade sobre o single player...",
    errorFeatures: "Marque pelo menos uma expectativa ou escreva um comentário.",
    errorGeneric: "O envio falhou. Tente novamente em instantes.",
    sending: "Enviando...",
    submitFeatures: "Enviar minhas expectativas",
    successFeatures: "Obrigado, sua resposta foi registrada!",
    priorityTitle: "Quais serão suas prioridades no jogo?",
    priorityDesc: "Uma vez em GTA VI, o que será mais importante para você? Marque o que combina com você.",
    errorPriorities: "Marque pelo menos uma prioridade ou responda à pesquisa.",
    submitPriorities: "Confirmar minhas prioridades",
    successPriorities: "Obrigado, suas prioridades foram registradas!",
    freedomQuestion: "Você acha que a Rockstar vai nos dar certa liberdade no jogo durante as missões, ou o jogo será bem linear e vai querer que a gente foque mais na história?",
    freedomOui: "Sim, teremos liberdade",
    freedomNon: "Não, será mais linear",
    fearTitle: "O que mais te preocupa em GTA VI?",
    fearDesc: "Não é só sobre expectativas positivas — marque o que mais te preocupa.",
    errorFears: "Marque pelo menos um medo ou escreva um comentário.",
    submitFears: "Confirmar meus medos",
    successFears: "Obrigado, seus medos foram registrados!",
    tpTitle: "Trailers e plataforma",
    tpDesc: "Duas perguntas rápidas antes de ver os resultados.",
    trailerQuestion: "Você preferiu o trailer 1 ou o trailer 2?",
    trailer1: "Trailer 1",
    trailer2: "Trailer 2",
    platformQuestion: "Você vai jogar no PS5, Xbox ou PC?",
    ps5: "PS5", xbox: "Xbox", pc: "PC 😅",
    errorTp: "Responda pelo menos uma das duas perguntas.",
    submitTp: "Confirmar minhas respostas",
    successTp: "Obrigado, suas respostas foram registradas!",
    thanksTitle: "OBRIGADO POR RESPONDER!",
    thanksDesc: "Sua opinião acabou de ser adicionada aos resultados da comunidade. Cada resposta conta para saber de verdade o que os jogadores esperam de GTA VI.",
    thanksBtn: "Ver os resultados",
    resultsTitle1: "Resultados da comunidade",
    resultsTitle2: "Prioridades de jogo da comunidade",
    resultsTitle3: "Liberdade ou história linear?",
    resultsTitle4: "Trailer favorito",
    resultsTitle5: "Plataforma de jogo",
    loadingResults: "Carregando resultados…",
    noVotes: "Ainda sem votos — seja o primeiro a responder.",
    noAnswers: "Ainda sem respostas — seja o primeiro a responder.",
    commentsTitle: "O que a comunidade está dizendo",
    commentsDesc: "Comentários deixados por outros jogadores.",
    loadingComments: "Carregando comentários…",
    noComments: "Ainda sem comentários. O seu pode ser o primeiro.",
    footerDisclaimer: "Site de fãs não oficial — não afiliado à Rockstar Games ou Take-Two Interactive.",
    prevSlide: "Slide anterior",
    nextSlide: "Próximo slide",
    goToSlide: "Ir para o slide",
    charCount: "caracteres",
  },
};

function participantsText(n, lang, suffix) {
  switch (lang) {
    case "en": return `${n} player${n > 1 ? "s have" : " has"} already answered${suffix ? " this survey" : ""}`;
    case "es": return `${n} jugador${n > 1 ? "es han" : " ha"} respondido${suffix ? " a esta encuesta" : ""}`;
    case "de": return `${n} Spieler ${n > 1 ? "haben" : "hat"} bereits ${suffix ? "an dieser Umfrage teilgenommen" : "geantwortet"}`;
    case "it": return `${n} giocator${n > 1 ? "i hanno" : "e ha"} già risposto${suffix ? " a questo sondaggio" : ""}`;
    case "pt": return `${n} jogador${n > 1 ? "es já responderam" : " já respondeu"}${suffix ? " a esta pesquisa" : ""}`;
    default: return `${n} joueur${n > 1 ? "s ont" : " a"} déjà répondu${suffix ? " à ce sondage" : ""}`;
  }
}

function votesCountText(n, lang) {
  switch (lang) {
    case "en": return `${n} vote${n > 1 ? "s" : ""} in total, updated live.`;
    case "es": return `${n} voto${n > 1 ? "s" : ""} en total, actualizado en directo.`;
    case "de": return `${n} Stimme${n > 1 ? "n" : ""} insgesamt, live aktualisiert.`;
    case "it": return `${n} vot${n > 1 ? "i" : "o"} in totale, aggiornato in diretta.`;
    case "pt": return `${n} voto${n > 1 ? "s" : ""} no total, atualizado ao vivo.`;
    default: return `${n} vote${n > 1 ? "s" : ""} au total, mis à jour en direct.`;
  }
}

function answersCountText(n, lang) {
  switch (lang) {
    case "en": return `${n} response${n > 1 ? "s" : ""} in total.`;
    case "es": return `${n} respuesta${n > 1 ? "s" : ""} en total.`;
    case "de": return `${n} Antwort${n > 1 ? "en" : ""} insgesamt.`;
    case "it": return `${n} rispost${n > 1 ? "e" : "a"} in totale.`;
    case "pt": return `${n} resposta${n > 1 ? "s" : ""} no total.`;
    default: return `${n} réponse${n > 1 ? "s" : ""} au total.`;
  }
}

export default function App() {
  const [lang, setLang] = useState("fr");
  const t = T[lang];

  const [votes, setVotes] = useState(null);
  const [priorityVotes, setPriorityVotes] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [freedomVotes, setFreedomVotes] = useState(null);
  const [freedomAnswer, setFreedomAnswer] = useState(null);
  const [trailerVotes, setTrailerVotes] = useState(null);
  const [trailerAnswer, setTrailerAnswer] = useState(null);
  const [platformVotes, setPlatformVotes] = useState(null);
  const [platformAnswer, setPlatformAnswer] = useState(null);
  const [tpSubmitting, setTpSubmitting] = useState(false);
  const [tpSubmitted, setTpSubmitted] = useState(false);
  const [tpError, setTpError] = useState("");
  const [fearVotes, setFearVotes] = useState(null);
  const [selectedFears, setSelectedFears] = useState([]);
  const [fearSubmitting, setFearSubmitting] = useState(false);
  const [fearSubmitted, setFearSubmitted] = useState(false);
  const [fearError, setFearError] = useState("");
  const [fearCommentText, setFearCommentText] = useState("");
  const [prioritySubmitting, setPrioritySubmitting] = useState(false);
  const [prioritySubmitted, setPrioritySubmitted] = useState(false);
  const [priorityError, setPriorityError] = useState("");
  const [comments, setComments] = useState([]);
  const [participants, setParticipants] = useState(0);
  const [selected, setSelected] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [priorityCommentText, setPriorityCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [slide, setSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const releaseDate = new Date("2026-11-19T00:00:00");
    const tick = () => {
      const diff = releaseDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [voteData, priorityVoteData, freedomVoteData, trailerVoteData, platformVoteData, fearVoteData, commentData, count] =
        await Promise.all([
          fetchVotesByCategory(CAT_FEATURE),
          fetchVotesByCategory(CAT_PRIORITY),
          fetchVotesByCategory(CAT_FREEDOM),
          fetchVotesByCategory(CAT_TRAILER),
          fetchVotesByCategory(CAT_PLATFORM),
          fetchVotesByCategory(CAT_FEAR),
          fetchComments(),
          fetchParticipants(),
        ]);

      setVotes(voteData);
      setPriorityVotes(priorityVoteData);
      setFreedomVotes({ oui: freedomVoteData.oui || 0, non: freedomVoteData.non || 0 });
      setTrailerVotes({ trailer1: trailerVoteData.trailer1 || 0, trailer2: trailerVoteData.trailer2 || 0 });
      setPlatformVotes({ ps5: platformVoteData.ps5 || 0, xbox: platformVoteData.xbox || 0, pc: platformVoteData.pc || 0 });
      setFearVotes(fearVoteData);
      setComments(commentData);
      setParticipants(count);
    } catch (e) {
      setErrorMsg(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const goNext = () => setSlide((s) => Math.min(s + 1, SLIDES.length - 1));
  const goPrev = () => setSlide((s) => Math.max(s - 1, 0));

  const toggleFeature = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const togglePriority = (id) => {
    setSelectedPriorities((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    if (selectedPriorities.length === 0 && !freedomAnswer) {
      setPriorityError(t.errorPriorities);
      return;
    }
    setPriorityError("");
    setPrioritySubmitting(true);
    try {
      const newPriorityVotes = { ...(priorityVotes || {}) };
      await Promise.all(selectedPriorities.map(async (id) => {
        newPriorityVotes[id] = (newPriorityVotes[id] || 0) + 1;
        await incrementVote(CAT_PRIORITY, id);
      }));
      setPriorityVotes(newPriorityVotes);

      let newFreedomVotes = freedomVotes || { oui: 0, non: 0 };
      if (freedomAnswer) {
        newFreedomVotes = { ...newFreedomVotes, [freedomAnswer]: (newFreedomVotes[freedomAnswer] || 0) + 1 };
        await incrementVote(CAT_FREEDOM, freedomAnswer);
        setFreedomVotes(newFreedomVotes);
      }

      let newComments = comments;
      if (priorityCommentText.trim() !== "") {
        await addCommentToDb(priorityCommentText.trim());
        newComments = [
          { id: Date.now().toString(), text: priorityCommentText.trim() },
          ...comments,
        ].slice(0, 100);
        setComments(newComments);
      }

      setSelectedPriorities([]);
      setFreedomAnswer(null);
      setPriorityCommentText("");
      setPrioritySubmitted(true);
      setTimeout(() => setPrioritySubmitted(false), 3500);
      setTimeout(() => setSlide(3), 900);
    } catch (e) {
      setPriorityError(t.errorGeneric);
    } finally {
      setPrioritySubmitting(false);
    }
  };

  const toggleFear = (id) => {
    setSelectedFears((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleFearSubmit = async (e) => {
    e.preventDefault();
    if (selectedFears.length === 0 && fearCommentText.trim() === "") {
      setFearError(t.errorFears);
      return;
    }
    setFearError("");
    setFearSubmitting(true);
    try {
      const newFearVotes = { ...(fearVotes || {}) };
      await Promise.all(selectedFears.map(async (id) => {
        newFearVotes[id] = (newFearVotes[id] || 0) + 1;
        await incrementVote(CAT_FEAR, id);
      }));
      setFearVotes(newFearVotes);

      let newComments = comments;
      if (fearCommentText.trim() !== "") {
        await addCommentToDb(fearCommentText.trim());
        newComments = [
          { id: Date.now().toString(), text: fearCommentText.trim() },
          ...comments,
        ].slice(0, 100);
        setComments(newComments);
      }

      setSelectedFears([]);
      setFearCommentText("");
      setFearSubmitted(true);
      setTimeout(() => setFearSubmitted(false), 3500);
      setTimeout(() => setSlide(4), 900);
    } catch (e) {
      setFearError(t.errorGeneric);
    } finally {
      setFearSubmitting(false);
    }
  };

  const handleTpSubmit = async (e) => {
    e.preventDefault();
    if (!trailerAnswer && !platformAnswer) {
      setTpError(t.errorTp);
      return;
    }
    setTpError("");
    setTpSubmitting(true);
    try {
      let newTrailerVotes = trailerVotes || { trailer1: 0, trailer2: 0 };
      if (trailerAnswer) {
        newTrailerVotes = { ...newTrailerVotes, [trailerAnswer]: (newTrailerVotes[trailerAnswer] || 0) + 1 };
        await incrementVote(CAT_TRAILER, trailerAnswer);
        setTrailerVotes(newTrailerVotes);
      }

      let newPlatformVotes = platformVotes || { ps5: 0, xbox: 0, pc: 0 };
      if (platformAnswer) {
        newPlatformVotes = { ...newPlatformVotes, [platformAnswer]: (newPlatformVotes[platformAnswer] || 0) + 1 };
        await incrementVote(CAT_PLATFORM, platformAnswer);
        setPlatformVotes(newPlatformVotes);
      }

      setTrailerAnswer(null);
      setPlatformAnswer(null);
      setTpSubmitted(true);
      setTimeout(() => setTpSubmitted(false), 3500);
      setTimeout(() => setSlide(5), 900);
    } catch (e) {
      setTpError(t.errorGeneric);
    } finally {
      setTpSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0 && commentText.trim() === "") {
      setErrorMsg(t.errorFeatures);
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      const newVotes = { ...(votes || {}) };
      await Promise.all(selected.map(async (id) => {
        newVotes[id] = (newVotes[id] || 0) + 1;
        await incrementVote(CAT_FEATURE, id);
      }));

      let newComments = comments;
      if (commentText.trim() !== "") {
        await addCommentToDb(commentText.trim());
        newComments = [
          { id: Date.now().toString(), text: commentText.trim() },
          ...comments,
        ].slice(0, 100);
      }

      await incrementParticipants();
      const newCount = participants + 1;

      setVotes(newVotes);
      setComments(newComments);
      setParticipants(newCount);
      setSelected([]);
      setCommentText("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
      setTimeout(() => setSlide(2), 900);
    } catch (e) {
      setErrorMsg(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = FEATURES.map((f) => ({
    name: tr(f.label, lang),
    votes: votes?.[f.id] || 0,
  })).sort((a, b) => b.votes - a.votes);

  const totalVotes = chartData.reduce((sum, d) => sum + d.votes, 0);

  const priorityChartData = PRIORITIES.map((p) => ({
    name: tr(p.label, lang),
    votes: priorityVotes?.[p.id] || 0,
  })).sort((a, b) => b.votes - a.votes);

  const totalPriorityVotes = priorityChartData.reduce((sum, d) => sum + d.votes, 0);

  const freedomOui = freedomVotes?.oui || 0;
  const freedomNon = freedomVotes?.non || 0;
  const totalFreedomVotes = freedomOui + freedomNon;
  const freedomOuiPct = totalFreedomVotes > 0 ? Math.round((freedomOui / totalFreedomVotes) * 100) : 0;
  const freedomNonPct = totalFreedomVotes > 0 ? 100 - freedomOuiPct : 0;

  const trailer1Votes = trailerVotes?.trailer1 || 0;
  const trailer2Votes = trailerVotes?.trailer2 || 0;
  const totalTrailerVotes = trailer1Votes + trailer2Votes;
  const trailer1Pct = totalTrailerVotes > 0 ? Math.round((trailer1Votes / totalTrailerVotes) * 100) : 0;
  const trailer2Pct = totalTrailerVotes > 0 ? 100 - trailer1Pct : 0;

  const ps5Votes = platformVotes?.ps5 || 0;
  const xboxVotes = platformVotes?.xbox || 0;
  const pcVotes = platformVotes?.pc || 0;
  const totalPlatformVotes = ps5Votes + xboxVotes + pcVotes;
  const ps5Pct = totalPlatformVotes > 0 ? Math.round((ps5Votes / totalPlatformVotes) * 100) : 0;
  const xboxPct = totalPlatformVotes > 0 ? Math.round((xboxVotes / totalPlatformVotes) * 100) : 0;
  const pcPct = totalPlatformVotes > 0 ? Math.max(0, 100 - ps5Pct - xboxPct) : 0;

  const fearChartData = FEARS.map((f) => ({
    name: tr(f.label, lang),
    votes: fearVotes?.[f.id] || 0,
  })).sort((a, b) => b.votes - a.votes);

  const totalFearVotes = fearChartData.reduce((sum, d) => sum + d.votes, 0);

  return (
    <div
      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}
      className="h-screen w-full overflow-hidden bg-[#201436] text-[#f7eef9] flex flex-col"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="border-b border-[#4a3b6b] bg-[#201436] shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <span
            className="text-2xl shrink-0"
            style={{ fontFamily: "'Anton', sans-serif", letterSpacing: "0.03em" }}
          >
            <span className="text-[#f7eef9]">MY</span>{" "}
            <span className="text-[#e8577f]">GTA</span>
          </span>

          {timeLeft && (
            <div
              className="hidden sm:flex items-center gap-3 bg-[#f7eef9] text-[#201436] rounded-full px-4 py-1.5 shrink-0"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="text-[10px] uppercase tracking-wide text-[#6f5f92]">{t.releaseIn}</span>
              <span className="text-sm font-bold tabular-nums">
                {String(timeLeft.days).padStart(2, "0")}j {String(timeLeft.hours).padStart(2, "0")}h{" "}
                {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center gap-1.5 bg-[#2b1f47] border border-[#4a3b6b] rounded-full pl-2.5 pr-1.5 py-1">
              <Globe size={13} className="text-[#b3a8d1]" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Language"
                className="bg-transparent text-xs text-[#f7eef9] focus:outline-none cursor-pointer appearance-none pr-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#2b1f47] text-[#f7eef9]">
                    {l.flag} {l.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setSlide(i)}
                  aria-label={`${t.goToSlide} ${i + 1}`}
                  style={i === slide ? { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] } : undefined}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? "w-6" : "w-2 bg-[#4a3b6b] hover:bg-[#6f5f92]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slides track */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #4a3b8f 0%, #7a4f8f 22%, #e8577f 48%, #f4935f 68%, #372a5e 88%, #201436 100%)",
        }}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ width: `${SLIDES.length * 100}%`, transform: `translateX(-${slide * (100 / SLIDES.length)}%)` }}
        >
          {/* Slide 1 : Accueil */}
          <div className="h-full overflow-y-auto shrink-0" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="relative h-full flex items-center justify-center overflow-hidden">
              <div className="relative max-w-2xl mx-auto px-6 text-center">
                <div
                  className="flex items-center justify-center gap-2 text-sm tracking-[0.2em] uppercase text-[#f7eef9]/80 mb-6"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Palmtree size={16} />
                  {t.badge}
                </div>
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl mb-6 leading-[0.95]"
                  style={{ fontFamily: "'Anton', sans-serif", letterSpacing: "0.02em", textShadow: "0 6px 30px rgba(0,0,0,0.35)" }}
                >
                  {t.heroLine1}<br />{t.heroLine2}
                </h1>
                <p className="text-lg text-[#f7eef9]/90 max-w-xl mx-auto mb-2">
                  {t.heroDesc}
                </p>

                <p className="text-sm text-[#f7eef9]/70 mb-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {loading ? t.loading : participantsText(participants, lang, false)}
                </p>
                <button
                  onClick={() => setSlide(1)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f7eef9] text-[#201436] font-bold px-7 py-3 hover:bg-[#f7eef9]/90 transition-colors"
                >
                  {t.giveOpinion} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Slide 2 : Formulaire */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-14 w-full">
              <section className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-1">{t.formTitle}</h2>
                <p className="text-[#b3a8d1] text-sm mb-6">{t.formDesc}</p>

                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {FEATURES.map((f) => {
                      const isChecked = selected.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#e8577f] bg-[#e8577f]/10"
                              : "border-[#4a3b6b] hover:border-[#5c3f8c]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFeature(f.id)}
                            className="appearance-none w-4 h-4 shrink-0 rounded border-2 border-[#6f5f92] bg-[#201436] checked:bg-[#e8577f] checked:border-[#e8577f] cursor-pointer"
                          />
                          <span className="text-sm">{tr(f.label, lang)}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <label htmlFor="comment" className="text-sm text-[#b3a8d1] mb-2 block">
                      {t.addMore}
                    </label>
                    <textarea
                      id="comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={t.commentPlaceholder1}
                      rows={3}
                      maxLength={280}
                      className="w-full rounded-lg bg-[#201436] border border-[#4a3b6b] px-4 py-3 text-sm placeholder:text-[#6f5f92] focus:outline-none focus:ring-2 focus:ring-[#e8577f] resize-none"
                    />
                    <div className="text-right text-xs text-[#6f5f92] mt-1">{commentText.length}/280</div>
                  </div>

                  {errorMsg && (
                    <div className="text-sm text-[#f4b26b] bg-[#f4b26b]/10 border border-[#f4b26b]/30 rounded-lg px-4 py-2">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8577f] hover:bg-[#e8577f]/90 disabled:opacity-60 text-white font-bold px-6 py-3 transition-colors w-fit"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {submitting ? t.sending : t.submitFeatures}
                  </button>

                  {submitted && (
                    <div className="flex items-center gap-2 text-sm text-[#a89fd9]">
                      <Sparkles size={16} /> {t.successFeatures}
                    </div>
                  )}
                </form>
              </section>
            </div>
          </div>

          {/* Slide 3 : Priorités de jeu */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-14 w-full">
              <section className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-1">{t.priorityTitle}</h2>
                <p className="text-[#b3a8d1] text-sm mb-6">{t.priorityDesc}</p>

                <form onSubmit={handlePrioritySubmit} className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {PRIORITIES.map((p) => {
                      const isChecked = selectedPriorities.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#e8577f] bg-[#e8577f]/10"
                              : "border-[#4a3b6b] hover:border-[#5c3f8c]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePriority(p.id)}
                            className="appearance-none w-4 h-4 shrink-0 rounded border-2 border-[#6f5f92] bg-[#201436] checked:bg-[#e8577f] checked:border-[#e8577f] cursor-pointer"
                          />
                          <span className="text-sm">{tr(p.label, lang)}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <label htmlFor="priority-comment" className="text-sm text-[#b3a8d1] mb-2 block">
                      {t.addMore}
                    </label>
                    <textarea
                      id="priority-comment"
                      value={priorityCommentText}
                      onChange={(e) => setPriorityCommentText(e.target.value)}
                      placeholder={t.commentPlaceholder2}
                      rows={3}
                      maxLength={280}
                      className="w-full rounded-lg bg-[#201436] border border-[#4a3b6b] px-4 py-3 text-sm placeholder:text-[#6f5f92] focus:outline-none focus:ring-2 focus:ring-[#e8577f] resize-none"
                    />
                    <div className="text-right text-xs text-[#6f5f92] mt-1">{priorityCommentText.length}/280</div>
                  </div>

                  <div className="pt-2 border-t border-[#4a3b6b]">
                    <p className="text-sm text-[#f7eef9] mb-3 mt-4">
                      {t.freedomQuestion}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "oui", label: t.freedomOui },
                        { id: "non", label: t.freedomNon },
                      ].map((opt) => {
                        const isChecked = freedomAnswer === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                              isChecked
                                ? "border-[#e8577f] bg-[#e8577f]/10"
                                : "border-[#4a3b6b] hover:border-[#5c3f8c]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="freedom"
                              checked={isChecked}
                              onChange={() => setFreedomAnswer(opt.id)}
                              className="appearance-none w-4 h-4 shrink-0 rounded-full border-2 border-[#6f5f92] bg-[#201436] checked:bg-[#e8577f] checked:border-[#e8577f] cursor-pointer"
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {priorityError && (
                    <div className="text-sm text-[#f4b26b] bg-[#f4b26b]/10 border border-[#f4b26b]/30 rounded-lg px-4 py-2">
                      {priorityError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={prioritySubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8577f] hover:bg-[#e8577f]/90 disabled:opacity-60 text-white font-bold px-6 py-3 transition-colors w-fit"
                  >
                    {prioritySubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {prioritySubmitting ? t.sending : t.submitPriorities}
                  </button>

                  {prioritySubmitted && (
                    <div className="flex items-center gap-2 text-sm text-[#a89fd9]">
                      <Sparkles size={16} /> {t.successPriorities}
                    </div>
                  )}
                </form>
              </section>
            </div>
          </div>

          {/* Slide 4 : Craintes */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-14 w-full">
              <section className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-1">{t.fearTitle}</h2>
                <p className="text-[#b3a8d1] text-sm mb-6">{t.fearDesc}</p>

                <form onSubmit={handleFearSubmit} className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {FEARS.map((f) => {
                      const isChecked = selectedFears.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                            isChecked
                              ? "border-[#e8577f] bg-[#e8577f]/10"
                              : "border-[#4a3b6b] hover:border-[#5c3f8c]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFear(f.id)}
                            className="appearance-none w-4 h-4 shrink-0 rounded border-2 border-[#6f5f92] bg-[#201436] checked:bg-[#e8577f] checked:border-[#e8577f] cursor-pointer"
                          />
                          <span className="text-sm">{tr(f.label, lang)}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <label htmlFor="fear-comment" className="text-sm text-[#b3a8d1] mb-2 block">
                      {t.addMoreFear}
                    </label>
                    <textarea
                      id="fear-comment"
                      value={fearCommentText}
                      onChange={(e) => setFearCommentText(e.target.value)}
                      placeholder={t.commentPlaceholder3}
                      rows={3}
                      maxLength={280}
                      className="w-full rounded-lg bg-[#201436] border border-[#4a3b6b] px-4 py-3 text-sm placeholder:text-[#6f5f92] focus:outline-none focus:ring-2 focus:ring-[#e8577f] resize-none"
                    />
                    <div className="text-right text-xs text-[#6f5f92] mt-1">{fearCommentText.length}/280</div>
                  </div>

                  {fearError && (
                    <div className="text-sm text-[#f4b26b] bg-[#f4b26b]/10 border border-[#f4b26b]/30 rounded-lg px-4 py-2">
                      {fearError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={fearSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8577f] hover:bg-[#e8577f]/90 disabled:opacity-60 text-white font-bold px-6 py-3 transition-colors w-fit"
                  >
                    {fearSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {fearSubmitting ? t.sending : t.submitFears}
                  </button>

                  {fearSubmitted && (
                    <div className="flex items-center gap-2 text-sm text-[#a89fd9]">
                      <Sparkles size={16} /> {t.successFears}
                    </div>
                  )}
                </form>
              </section>
            </div>
          </div>

          {/* Slide 5 : Trailer & Plateforme */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-14 w-full">
              <section className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-1">{t.tpTitle}</h2>
                <p className="text-[#b3a8d1] text-sm mb-6">{t.tpDesc}</p>

                <form onSubmit={handleTpSubmit} className="grid gap-8">
                  <div>
                    <p className="text-sm text-[#f7eef9] mb-3">{t.trailerQuestion}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "trailer1", label: t.trailer1 },
                        { id: "trailer2", label: t.trailer2 },
                      ].map((opt) => {
                        const isChecked = trailerAnswer === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                              isChecked
                                ? "border-[#e8577f] bg-[#e8577f]/10"
                                : "border-[#4a3b6b] hover:border-[#5c3f8c]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="trailer"
                              checked={isChecked}
                              onChange={() => setTrailerAnswer(opt.id)}
                              className="appearance-none w-4 h-4 shrink-0 rounded-full border-2 border-[#6f5f92] bg-[#201436] checked:bg-[#e8577f] checked:border-[#e8577f] cursor-pointer"
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-[#f7eef9] mb-3">{t.platformQuestion}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "ps5", label: t.ps5 },
                        { id: "xbox", label: t.xbox },
                        { id: "pc", label: t.pc },
                      ].map((opt) => {
                        const isChecked = platformAnswer === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 cursor-pointer transition-colors ${
                              isChecked
                                ? "border-[#e8577f] bg-[#e8577f]/10"
                                : "border-[#4a3b6b] hover:border-[#5c3f8c]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="platform"
                              checked={isChecked}
                              onChange={() => setPlatformAnswer(opt.id)}
                              className="appearance-none w-4 h-4 shrink-0 rounded-full border-2 border-[#6f5f92] bg-[#201436] checked:bg-[#e8577f] checked:border-[#e8577f] cursor-pointer"
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {tpError && (
                    <div className="text-sm text-[#f4b26b] bg-[#f4b26b]/10 border border-[#f4b26b]/30 rounded-lg px-4 py-2">
                      {tpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={tpSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#e8577f] hover:bg-[#e8577f]/90 disabled:opacity-60 text-white font-bold px-6 py-3 transition-colors w-fit"
                  >
                    {tpSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {tpSubmitting ? t.sending : t.submitTp}
                  </button>

                  {tpSubmitted && (
                    <div className="flex items-center gap-2 text-sm text-[#a89fd9]">
                      <Sparkles size={16} /> {t.successTp}
                    </div>
                  )}
                </form>
              </section>
            </div>
          </div>

          {/* Slide 6 : Merci */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center justify-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-lg mx-auto px-6 py-14 w-full text-center">
              <div className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-8 sm:p-10">
                <div className="w-14 h-14 rounded-full bg-[#e8577f]/15 flex items-center justify-center mx-auto mb-5">
                  <Sparkles size={26} className="text-[#e8577f]" />
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: "0.02em" }}>
                  {t.thanksTitle}
                </h2>
                <p className="text-[#b3a8d1] text-sm mb-6">
                  {t.thanksDesc}
                </p>
                <p
                  className="text-sm text-[#f7eef9] mb-8"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {loading ? t.loading : participantsText(participants, lang, true)}
                </p>
                <button
                  onClick={() => setSlide(6)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#e8577f] hover:bg-[#e8577f]/90 text-white font-bold px-7 py-3 transition-colors"
                >
                  {t.thanksBtn} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Slide 7 : Résultats */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-14 w-full">
              <h2 className="text-xl font-bold mb-1 text-[#f7eef9]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{t.resultsTitle1}</h2>
              <p className="text-[#f7eef9]/85 text-sm mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                {totalVotes > 0 ? votesCountText(totalVotes, lang) : t.noVotes}
              </p>

              {loading ? (
                <div className="flex items-center gap-2 text-[#b3a8d1] text-sm py-10 justify-center">
                  <Loader2 size={18} className="animate-spin" /> {t.loadingResults}
                </div>
              ) : (
                <div className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6">
                  <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 38)}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={220}
                        tick={{ fill: "#f7eef9", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ background: "#201436", border: "1px solid #4a3b6b", borderRadius: 8, fontSize: 13 }}
                        labelStyle={{ color: "#f7eef9" }}
                      />
                      <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <h2 className="text-xl font-bold mb-1 mt-10 text-[#f7eef9]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{t.resultsTitle2}</h2>
              <p className="text-[#f7eef9]/85 text-sm mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                {totalPriorityVotes > 0 ? votesCountText(totalPriorityVotes, lang) : t.noVotes}
              </p>

              {loading ? (
                <div className="flex items-center gap-2 text-[#b3a8d1] text-sm py-10 justify-center">
                  <Loader2 size={18} className="animate-spin" /> {t.loadingResults}
                </div>
              ) : (
                <div className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6">
                  <ResponsiveContainer width="100%" height={Math.max(280, priorityChartData.length * 38)}>
                    <BarChart data={priorityChartData} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={220}
                        tick={{ fill: "#f7eef9", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ background: "#201436", border: "1px solid #4a3b6b", borderRadius: 8, fontSize: 13 }}
                        labelStyle={{ color: "#f7eef9" }}
                      />
                      <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                        {priorityChartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[(i + 1) % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <h2 className="text-xl font-bold mb-1 mt-10 text-[#f7eef9]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{t.resultsTitle3}</h2>
              <p className="text-[#f7eef9]/85 text-sm mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                {totalFreedomVotes > 0 ? answersCountText(totalFreedomVotes, lang) : t.noAnswers}
              </p>

              {loading ? (
                <div className="flex items-center gap-2 text-[#b3a8d1] text-sm py-10 justify-center">
                  <Loader2 size={18} className="animate-spin" /> {t.loadingResults}
                </div>
              ) : (
                <div className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 grid gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.freedomOui}</span>
                      <span className="text-[#b3a8d1]">{freedomOuiPct}% ({freedomOui})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${freedomOuiPct}%`, backgroundColor: "#e8577f" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.freedomNon}</span>
                      <span className="text-[#b3a8d1]">{freedomNonPct}% ({freedomNon})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${freedomNonPct}%`, backgroundColor: "#a89fd9" }} />
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold mb-1 mt-10 text-[#f7eef9]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{t.resultsTitle4}</h2>
              <p className="text-[#f7eef9]/85 text-sm mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                {totalTrailerVotes > 0 ? answersCountText(totalTrailerVotes, lang) : t.noAnswers}
              </p>

              {loading ? (
                <div className="flex items-center gap-2 text-[#b3a8d1] text-sm py-10 justify-center">
                  <Loader2 size={18} className="animate-spin" /> {t.loadingResults}
                </div>
              ) : (
                <div className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 grid gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.trailer1}</span>
                      <span className="text-[#b3a8d1]">{trailer1Pct}% ({trailer1Votes})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${trailer1Pct}%`, backgroundColor: "#f4935f" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.trailer2}</span>
                      <span className="text-[#b3a8d1]">{trailer2Pct}% ({trailer2Votes})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${trailer2Pct}%`, backgroundColor: "#f4b26b" }} />
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold mb-1 mt-10 text-[#f7eef9]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{t.resultsTitle5}</h2>
              <p className="text-[#f7eef9]/85 text-sm mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                {totalPlatformVotes > 0 ? answersCountText(totalPlatformVotes, lang) : t.noAnswers}
              </p>

              {loading ? (
                <div className="flex items-center gap-2 text-[#b3a8d1] text-sm py-10 justify-center">
                  <Loader2 size={18} className="animate-spin" /> {t.loadingResults}
                </div>
              ) : (
                <div className="bg-[#2b1f47] border border-[#4a3b6b] rounded-2xl p-6 grid gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.ps5}</span>
                      <span className="text-[#b3a8d1]">{ps5Pct}% ({ps5Votes})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${ps5Pct}%`, backgroundColor: "#e8577f" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.xbox}</span>
                      <span className="text-[#b3a8d1]">{xboxPct}% ({xboxVotes})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${xboxPct}%`, backgroundColor: "#f4935f" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t.pc}</span>
                      <span className="text-[#b3a8d1]">{pcPct}% ({pcVotes})</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#201436] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pcPct}%`, backgroundColor: "#a89fd9" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slide 8 : Commentaires */}
          <div className="h-full overflow-y-auto shrink-0 flex items-center" style={{ width: `${100 / SLIDES.length}%` }}>
            <div className="max-w-2xl mx-auto px-6 py-14 w-full">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-[#f7eef9]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>
                <MessageSquare size={20} /> {t.commentsTitle}
              </h2>
              <p className="text-[#f7eef9]/85 text-sm mb-6" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}>{t.commentsDesc}</p>

              {loading ? (
                <div className="flex items-center gap-2 text-[#b3a8d1] text-sm py-6 justify-center">
                  <Loader2 size={18} className="animate-spin" /> {t.loadingComments}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-[#6f5f92] text-sm border border-dashed border-[#4a3b6b] rounded-2xl py-10 text-center">
                  {t.noComments}
                </div>
              ) : (
                <div className="grid gap-3">
                  {comments.map((c, i) => (
                    <div
                      key={c.id}
                      style={{ borderLeftColor: BAR_COLORS[i % BAR_COLORS.length], borderLeftWidth: 4 }}
                      className="bg-[#2b1f47] border border-[#4a3b6b] rounded-xl px-5 py-4 text-sm text-[#f7eef9]/90"
                    >
                      {c.text}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#6f5f92] text-center mt-10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {t.footerDisclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {slide > 0 && (
          <button
            onClick={goPrev}
            aria-label={t.prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#2b1f47]/90 border border-[#4a3b6b] flex items-center justify-center hover:bg-[#2b1f47] transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {slide < SLIDES.length - 1 && (
          <button
            onClick={goNext}
            aria-label={t.nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#2b1f47]/90 border border-[#4a3b6b] flex items-center justify-center hover:bg-[#2b1f47] transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
