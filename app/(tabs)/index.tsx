import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SONG = require("../../assets/audio/aishalak.mp3");
const NIGHT_LAKE = require("../../assets/night-lake-background.jpg");
const PASSWORD = "1932024";
const APK_URL = "https://github.com/immasan16-prog/My-location-/releases/latest/download/MyLove.apk";
const STORAGE_KEY = "mylove_chat_messages_v1";
const BG = "#10050D";
const WINE = "#4B1028";
const RUBY = "#A51F49";
const PINK = "#F36A91";
const GOLD = "#F5D19B";
const SOFT = "#E9B6C8";
const GLASS = "rgba(255,255,255,0.08)";
const BORDER = "rgba(255,255,255,0.18)";

type Gate = "password" | "stop" | "inside";
type ChatMessage = { id: string; author: "أمونة" | "حمودي"; text: string; time: string; reaction?: string };

const reactions = ["💗", "🥰", "😭", "💔", "🙃"];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [gate, setGate] = useState<Gate>("password");
  const [password, setPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const player = useAudioPlayer(SONG, { updateInterval: 100, downloadFirst: false });
  const status = useAudioPlayerStatus(player);
  const contentWidth = Math.min(width - 28, 620);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([{ id: "welcome", author: "أمونة", text: "إلى حمودي… هذه مساحتنا الصغيرة، لا تنسَ أنك أحب شيء عندي.", time: "الآن" }]);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!isPlaying) { setHearts([]); return; }
    const interval = setInterval(() => setHearts((current) => [...current.slice(-8), Date.now()]), 640);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (status.didJustFinish) setIsPlaying(false);
  }, [status.didJustFinish]);

  const toggleSong = () => {
    if (status.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.25)) player.seekTo(0);
      player.volume = 1;
      player.play();
      setIsPlaying(true);
    }
  };

  const checkPassword = () => {
    if (password === PASSWORD) {
      setError("");
      setGate("stop");
    } else setError("كلمة المرور غير صحيحة");
  };

  const enterAfterStop = () => {
    if (answer.trim() === "نعم") {
      setError("");
      setGate("inside");
    } else setError("اكتبي نعم حتى أفتح لك المكان");
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: `${Date.now()}`, author: "أمونة", text, time: "الآن" }]);
    setDraft("");
  };

  const deleteMessage = (id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
    setSelectedMessage(null);
  };

  const reactToMessage = (id: string, reaction: string) => {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, reaction: message.reaction === reaction ? undefined : reaction } : message));
  };

  if (gate === "password") return <GateScreen title="هذا المكان خاص" subtitle="لا يدخل إلا شخص واحد يعرف السر." value={password} setValue={setPassword} button="دخول" onSubmit={checkPassword} error={error} />;
  if (gate === "stop") return <GateScreen title="توقف ✋" subtitle="هممم… انت حمودي؟" value={answer} setValue={setAnswer} button="نعم" onSubmit={enterAfterStop} error={error} answerMode />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <NightBackdrop active={isPlaying} />
      <ScrollView contentContainerStyle={[styles.page, { width: contentWidth }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.nav}><View><Text style={styles.navOverline}>مساحتنا السرية</Text><Text style={styles.logo}>أمونة ♥ حمودي</Text></View><Pressable style={styles.lock}><Text>♡</Text></Pressable></View>
        <View style={styles.hero}>
          <Text style={styles.heroOverline}>من أمونة إلى حمودي</Text>
          <Text style={styles.heroTitle}>بعض الحب لا يُحكى…{`\n`}بل يُعاش.</Text>
          <Text style={styles.heroText}>كل ما في هذا المكان يشبهنا: هادئ، عميق، ولا يراه أحد سوانا.</Text>
          <RomanticScene active={isPlaying} />
        </View>
        <View style={styles.songSection}>
          <View style={styles.sectionLine}><Text style={styles.sectionTitle}>عيشالك</Text><Text style={styles.sectionNote}>أغنيتنا إلى النهاية</Text></View>
          <View style={[styles.songCard, isPlaying && styles.recordPlaying]}>
            <View style={styles.vinyl}><View style={styles.vinylCenter}><Text style={styles.vinylNote}>♪</Text></View></View>
            <View style={styles.songMeta}><Text style={styles.songName}>عيشالك</Text><Text style={styles.songArtist}>أمونة ♥ حمودي</Text><View style={styles.track}><View style={[styles.trackFill, { width: status.duration ? `${Math.min(100, (status.currentTime / status.duration) * 100)}%` : "0%" }]} /></View><Text style={styles.duration}>{formatTime(status.currentTime)} / {formatTime(status.duration)}</Text></View>
            <Pressable onPress={toggleSong} style={({ pressed }) => [styles.play, isPlaying && styles.playActive, pressed && styles.pressed]}><Text style={styles.playIcon}>{isPlaying ? "Ⅱ" : "▶"}</Text></Pressable>
          </View>
          {isPlaying && <View style={styles.heartStage}>{hearts.map((heart) => <FloatingHeart key={heart} />)}</View>}
        </View>
        <View style={styles.loveStatement}><Text style={styles.statementQuote}>“</Text><Text style={styles.statement}>ثلاث سنوات، وما زلت أختارك في كل مرة.</Text><Text style={styles.statementDate}>19.03.2024 · إلى الأبد</Text></View>
        <Pressable onPress={() => Linking.openURL(APK_URL)} style={({ pressed }) => [styles.apkButton, pressed && styles.pressed]}><Text style={styles.apkIcon}>↓</Text><View><Text style={styles.apkTitle}>تحميل التطبيق APK</Text><Text style={styles.apkSub}>خذه معك أينما ذهبت</Text></View></Pressable>
        <Chat messages={messages} draft={draft} setDraft={setDraft} sendMessage={sendMessage} selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage} deleteMessage={deleteMessage} reactToMessage={reactToMessage} />
        <Text style={styles.footer}>صُنع بحب من أمونة إلى حمودي</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function GateScreen({ title, subtitle, value, setValue, button, onSubmit, error, answerMode = false }: { title: string; subtitle: string; value: string; setValue: (value: string) => void; button: string; onSubmit: () => void; error: string; answerMode?: boolean }) {
  return <SafeAreaView style={styles.gate}><View style={styles.gateGlow} /><View style={styles.gateCard}><Text style={styles.gateSymbol}>{answerMode ? "✦" : "♡"}</Text><Text style={styles.gateTitle}>{title}</Text><Text style={styles.gateSubtitle}>{subtitle}</Text><TextInput autoFocus value={value} onChangeText={setValue} onSubmitEditing={onSubmit} secureTextEntry={!answerMode} keyboardType={answerMode ? "default" : "number-pad"} placeholder={answerMode ? "اكتب نعم" : "كلمة المرور"} placeholderTextColor="#A96D83" style={styles.gateInput} textAlign="center" /><Pressable onPress={onSubmit} style={({ pressed }) => [styles.gateButton, pressed && styles.pressed]}><Text style={styles.gateButtonText}>{button}</Text></Pressable>{Boolean(error) && <Text style={styles.error}>{error}</Text>}<Text style={styles.privateNote}>هذا المكان لنا فقط</Text></View></SafeAreaView>;
}

function RomanticScene({ active }: { active: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: active ? 720 : 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: active ? 720 : 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const orbitLoop = Animated.loop(Animated.timing(orbit, { toValue: 1, duration: active ? 9000 : 15000, easing: Easing.linear, useNativeDriver: true }));
    pulseLoop.start();
    orbitLoop.start();
    return () => { pulseLoop.stop(); orbitLoop.stop(); };
  }, [active, orbit, pulse]);
  const heartScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] });
  const ringRotate = orbit.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return <View style={styles.scene}><View style={styles.moon} /><MagicSparkles active={active} /><Animated.View style={[styles.orbit, { transform: [{ rotate: ringRotate }] }]}><View style={styles.orbitDot} /><View style={styles.orbitDotTwo} /></Animated.View><Animated.View style={[styles.orbGlow, { transform: [{ scale: heartScale }] }]} /><Animated.View style={[styles.orb, { transform: [{ scale: heartScale }] }]}><Text style={styles.orbHeart}>♥</Text><View style={styles.orbLine} /><View style={styles.orbNames}><Text style={styles.orbName}>أمونة</Text><Text style={styles.orbAmp}>×</Text><Text style={styles.orbName}>حمودي</Text></View></Animated.View><Text style={styles.sceneCaption}>{active ? "قلبي يضيء مع كل نبضة" : "اضغط تشغيل… ليضيء حبنا"}</Text></View>;
}

function MagicSparkles({ active }: { active: boolean }) {
  if (!active) return null;
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{Array.from({ length: 10 }, (_, index) => <Sparkle key={index} index={index} />)}</View>;
}

function Sparkle({ index }: { index: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.delay(index * 170), Animated.timing(pulse, { toValue: 1, duration: 900 + index * 80, easing: Easing.inOut(Easing.sin), useNativeDriver: true }), Animated.timing(pulse, { toValue: 0, duration: 900 + index * 80, easing: Easing.inOut(Easing.sin), useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [index, pulse]);
  return <Animated.Text style={[styles.magicSpark, { top: 30 + ((index * 31) % 130), left: 22 + ((index * 47) % 255), opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.9] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.35] }) }] }]}>✦</Animated.Text>;
}

function NightBackdrop({ active }: { active: boolean }) {
  if (!active) return null;
  return <View pointerEvents="none" style={styles.nightBackdropWrap}><Image source={NIGHT_LAKE} resizeMode="cover" style={styles.nightBackdrop} /><View style={styles.nightTint} /><View style={styles.nightGlass} /></View>;
}

function FloatingHeart() {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(progress, { toValue: 1, duration: 1700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); }, [progress]);
  return <Animated.Text style={[styles.floatingHeart, { opacity: progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [15, -90] }) }, { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -16, 12] }) }] }]}>♥</Animated.Text>;
}

function Chat({ messages, draft, setDraft, sendMessage, selectedMessage, setSelectedMessage, deleteMessage, reactToMessage }: { messages: ChatMessage[]; draft: string; setDraft: (value: string) => void; sendMessage: () => void; selectedMessage: string | null; setSelectedMessage: (id: string | null) => void; deleteMessage: (id: string) => void; reactToMessage: (id: string, reaction: string) => void }) {
  return <View style={styles.chat}><View style={styles.sectionLine}><Text style={styles.sectionTitle}>شاتنا</Text><Text style={styles.sectionNote}>رسائل تبقى دائمًا</Text></View><View style={styles.chatBox}>{messages.map((message) => <View key={message.id} style={[styles.messageRow, message.author === "أمونة" ? styles.myRow : styles.hisRow]}><Pressable onLongPress={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)} style={[styles.messageBubble, message.author === "أمونة" ? styles.myBubble : styles.hisBubble]}><Text style={styles.messageAuthor}>{message.author}</Text><Text style={styles.messageText}>{message.text}</Text><Text style={styles.messageTime}>{message.time}</Text>{message.reaction && <Text style={styles.reaction}>{message.reaction}</Text>}</Pressable>{selectedMessage === message.id && <View style={styles.messageActions}><View style={styles.reactions}>{reactions.map((reaction) => <Pressable key={reaction} onPress={() => reactToMessage(message.id, reaction)} style={styles.reactionButton}><Text>{reaction}</Text></Pressable>)}</View><Pressable onPress={() => deleteMessage(message.id)}><Text style={styles.deleteText}>حذف الرسالة</Text></Pressable></View>}</View>)}</View><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.chatComposer}><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={sendMessage} placeholder="اكتب رسالة لحمودي…" placeholderTextColor="#A96D83" style={styles.chatInput} textAlign="right" /><Pressable onPress={sendMessage} style={styles.send}><Text style={styles.sendText}>إرسال</Text></Pressable></KeyboardAvoidingView><Text style={styles.chatHint}>اضغط مطولًا على الرسالة للحذف أو التفاعل</Text></View>;
}

function formatTime(seconds: number) { if (!seconds) return "00:00"; const minutes = Math.floor(seconds / 60); const rest = Math.floor(seconds % 60).toString().padStart(2, "0"); return `${minutes}:${rest}`; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, alignItems: "center", overflow: "hidden" },
  page: { paddingTop: 18, paddingBottom: 44, zIndex: 2 },
  nav: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  navOverline: { color: "#A96D83", fontSize: 11, textAlign: "right" },
  logo: { color: "#FFF3F6", fontSize: 22, fontWeight: "800", textAlign: "right", marginTop: 3 },
  lock: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: BORDER, backgroundColor: GLASS, alignItems: "center", justifyContent: "center" },
  hero: { minHeight: 450, backgroundColor: "rgba(82,12,39,0.72)", borderRadius: 32, borderWidth: 1, borderColor: "rgba(255,182,207,0.25)", padding: 22, overflow: "hidden" },
  heroOverline: { color: GOLD, fontSize: 13, fontWeight: "700", textAlign: "right" },
  heroTitle: { color: "#FFF6F8", fontSize: 30, lineHeight: 39, fontWeight: "800", textAlign: "right", marginTop: 18 },
  heroText: { color: SOFT, fontSize: 13, lineHeight: 23, textAlign: "right", marginTop: 10 },
  scene: { height: 235, marginTop: 9, position: "relative", alignItems: "center", justifyContent: "flex-end" },
  moon: { position: "absolute", width: 155, height: 155, borderRadius: 78, backgroundColor: "rgba(201,70,112,0.18)", top: 18, left: 65 },
  princessFigure: { position: "absolute", width: 112, height: 205, bottom: 11, left: 82 },
  princeFigure: { position: "absolute", width: 112, height: 205, bottom: 11, right: 78 },
  orbit: { position: "absolute", width: 230, height: 104, borderRadius: 115, borderWidth: 1, borderColor: "rgba(255,172,204,0.42)", top: 62, left: 28 },
  orbitDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, top: -4, left: 108, shadowColor: GOLD, shadowRadius: 8, shadowOpacity: 0.9 },
  orbitDotTwo: { position: "absolute", width: 5, height: 5, borderRadius: 3, backgroundColor: PINK, bottom: 8, right: 32, shadowColor: PINK, shadowRadius: 7, shadowOpacity: 0.9 },
  orbGlow: { position: "absolute", width: 150, height: 150, borderRadius: 75, top: 38, left: 68, backgroundColor: "rgba(255,55,125,0.26)", shadowColor: PINK, shadowRadius: 28, shadowOpacity: 0.95, elevation: 15 },
  orb: { position: "absolute", width: 132, height: 132, borderRadius: 66, top: 47, left: 77, backgroundColor: "rgba(104,12,57,0.58)", borderWidth: 1, borderColor: "rgba(255,202,221,0.58)", alignItems: "center", justifyContent: "center", shadowColor: PINK, shadowRadius: 22, shadowOpacity: 0.85, elevation: 14 },
  orbHeart: { color: "#FF8CAF", fontSize: 49, lineHeight: 55, textShadowColor: "#FF2E78", textShadowRadius: 19 },
  orbLine: { width: 47, height: 1, backgroundColor: "rgba(245,209,155,0.65)", marginTop: 3 },
  orbNames: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 7 },
  orbName: { color: "#FFE7EE", fontSize: 10, fontWeight: "800" },
  orbAmp: { color: GOLD, fontSize: 11 },
  girl: { position: "absolute", left: 92, bottom: 12, width: 72, height: 164, alignItems: "center" },
  princessCrown: { color: "#170711", fontSize: 20, position: "absolute", top: -12, zIndex: 4 },
  girlHead: { width: 30, height: 35, borderRadius: 18, backgroundColor: "#150811", marginLeft: 10, zIndex: 2 },
  hair: { position: "absolute", top: 2, left: 19, width: 50, height: 60, borderRadius: 32, backgroundColor: "#090409", transform: [{ rotate: "-8deg" }] },
  girlBody: { position: "absolute", top: 47, width: 24, height: 55, borderRadius: 13, backgroundColor: "#0A0509" },
  girlDress: { position: "absolute", bottom: 0, width: 72, height: 90, borderTopLeftRadius: 27, borderTopRightRadius: 27, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, backgroundColor: "#080309", alignItems: "center" },
  dressRibbon: { width: 39, height: 5, borderRadius: 3, backgroundColor: "#1B0712", marginTop: 27 },
  man: { position: "absolute", right: 68, bottom: 12, width: 70, height: 162, alignItems: "center" },
  princeCrown: { color: "#170711", fontSize: 19, position: "absolute", top: -13, zIndex: 4 },
  manHead: { width: 34, height: 38, borderRadius: 20, backgroundColor: "#080309", marginRight: 3, zIndex: 2 },
  manBody: { position: "absolute", top: 48, width: 57, height: 114, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: "#070207", alignItems: "center" },
  princeCoat: { width: 4, height: 88, backgroundColor: "#180712", marginTop: 14 },
  kiss: { position: "absolute", bottom: 145, left: 137, color: "#FFB6CC", fontSize: 29, textShadowColor: "#F36A91", textShadowRadius: 12 },
  sceneCaption: { color: "#A96D83", fontSize: 11, marginBottom: -4 },
  songSection: { marginTop: 26 },
  sectionLine: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 },
  sectionTitle: { color: "#FFF1F5", fontSize: 20, fontWeight: "800", textAlign: "right" },
  sectionNote: { color: "#A96D83", fontSize: 11 },
  songCard: { flexDirection: "row-reverse", alignItems: "center", gap: 13, padding: 15, borderRadius: 25, backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER },
  recordPlaying: { backgroundColor: "rgba(165,31,73,0.30)", borderColor: "rgba(255,106,145,0.72)", shadowColor: PINK, shadowOpacity: 0.65, shadowRadius: 20, shadowOffset: { width: 0, height: 0 }, elevation: 12 },
  vinyl: { width: 66, height: 66, borderRadius: 33, backgroundColor: "#17070F", borderWidth: 6, borderColor: "#8C2349", alignItems: "center", justifyContent: "center" },
  vinylCenter: { width: 27, height: 27, borderRadius: 14, backgroundColor: RUBY, alignItems: "center", justifyContent: "center" },
  vinylNote: { color: GOLD, fontSize: 17 },
  songMeta: { flex: 1 },
  songName: { color: "#FFF5F7", fontSize: 17, fontWeight: "800", textAlign: "right" },
  songArtist: { color: SOFT, fontSize: 11, textAlign: "right", marginTop: 2 },
  track: { height: 4, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 3, marginTop: 10, overflow: "hidden" },
  trackFill: { height: 4, backgroundColor: PINK, borderRadius: 3 },
  duration: { color: "#A96D83", fontSize: 9, textAlign: "left", marginTop: 4 },
  play: { width: 49, height: 49, borderRadius: 25, backgroundColor: PINK, alignItems: "center", justifyContent: "center", shadowColor: PINK, shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  playActive: { backgroundColor: "#FF9CB7" },
  playIcon: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  heartStage: { height: 82, alignItems: "center", justifyContent: "center", marginTop: 2, overflow: "hidden" },
  lyricStage: { height: 105, alignItems: "center", justifyContent: "center", marginTop: 4, overflow: "hidden" },
  lyricText: { color: "#FFB8CB", fontSize: 25, fontWeight: "900", textShadowColor: "#F36A91", textShadowRadius: 10 },
  floatingWord: { position: "absolute", color: "#FFB8CB", fontSize: 19, lineHeight: 27, maxWidth: 260, textAlign: "center", fontWeight: "900", textShadowColor: "#F36A91", textShadowRadius: 12 },
  magicSpark: { position: "absolute", color: GOLD, fontSize: 12, textShadowColor: PINK, textShadowRadius: 9 },
  floatingHeart: { position: "absolute", color: "#B82D5B", fontSize: 22, right: 75, bottom: 5, textShadowColor: "#F36A91", textShadowRadius: 9 },
  nightBackdropWrap: { ...StyleSheet.absoluteFill, zIndex: 0, overflow: "hidden" },
  nightBackdrop: { ...StyleSheet.absoluteFill, width: "100%", height: "100%", opacity: 0.42 },
  nightTint: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(37,7,60,0.52)" },
  nightGlass: { ...StyleSheet.absoluteFill, borderWidth: 1, borderColor: "rgba(255,190,220,0.12)", backgroundColor: "rgba(255,255,255,0.025)" },
  loveStatement: { backgroundColor: "rgba(245,209,155,0.08)", borderWidth: 1, borderColor: "rgba(245,209,155,0.2)", borderRadius: 25, padding: 20, marginTop: 17 },
  statementQuote: { color: GOLD, fontSize: 38, height: 31, textAlign: "right" },
  statement: { color: "#FFF2E0", fontSize: 17, lineHeight: 28, fontWeight: "700", textAlign: "right" },
  statementDate: { color: "#C8A57B", fontSize: 11, textAlign: "right", marginTop: 10 },
  apkButton: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#FFF0DB", borderRadius: 19, paddingVertical: 14, marginTop: 17 },
  apkIcon: { color: BG, fontSize: 25, fontWeight: "800" },
  apkTitle: { color: BG, fontWeight: "800", fontSize: 14, textAlign: "right" },
  apkSub: { color: "#794052", fontSize: 10, textAlign: "right", marginTop: 2 },
  chat: { marginTop: 30 },
  chatBox: { backgroundColor: "rgba(255,255,255,0.045)", borderRadius: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", padding: 13, minHeight: 150 },
  messageRow: { marginBottom: 10, maxWidth: "88%" },
  myRow: { alignSelf: "flex-end", alignItems: "flex-end" },
  hisRow: { alignSelf: "flex-start", alignItems: "flex-start" },
  messageBubble: { padding: 11, borderRadius: 17, minWidth: 130 },
  myBubble: { backgroundColor: "rgba(165,31,73,0.78)", borderBottomRightRadius: 4 },
  hisBubble: { backgroundColor: "rgba(255,255,255,0.10)", borderBottomLeftRadius: 4 },
  messageAuthor: { color: GOLD, fontSize: 10, fontWeight: "700", textAlign: "right" },
  messageText: { color: "#FFF0F4", fontSize: 13, lineHeight: 21, textAlign: "right", marginTop: 3 },
  messageTime: { color: "#C98DA0", fontSize: 9, textAlign: "left", marginTop: 5 },
  reaction: { position: "absolute", bottom: -10, left: 8, fontSize: 18 },
  messageActions: { alignItems: "flex-end", marginTop: 7 },
  reactions: { flexDirection: "row", gap: 4, marginBottom: 5 },
  reactionButton: { backgroundColor: "rgba(255,255,255,0.11)", borderRadius: 14, paddingHorizontal: 6, paddingVertical: 3 },
  deleteText: { color: "#F889A0", fontSize: 11 },
  chatComposer: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginTop: 10 },
  chatInput: { flex: 1, color: "#FFF1F5", backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER, borderRadius: 17, paddingHorizontal: 13, paddingVertical: 11, fontSize: 13 },
  send: { backgroundColor: RUBY, borderRadius: 17, paddingHorizontal: 15, paddingVertical: 12 },
  sendText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  chatHint: { color: "#8F5368", fontSize: 10, textAlign: "right", marginTop: 8 },
  footer: { color: "#8F5368", fontSize: 11, textAlign: "center", marginTop: 23 },
  snow: { position: "absolute", top: -20, color: "#FFF", fontSize: 12, textShadowColor: "#FFF", textShadowRadius: 7 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  gate: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden" },
  gateGlow: { position: "absolute", width: 330, height: 330, borderRadius: 165, backgroundColor: "rgba(165,31,73,0.17)", top: "18%" },
  gateCard: { width: "100%", maxWidth: 440, padding: 28, borderRadius: 32, backgroundColor: "rgba(93,15,45,0.58)", borderWidth: 1, borderColor: "rgba(255,183,207,0.26)", alignItems: "center" },
  gateSymbol: { color: PINK, fontSize: 42, marginBottom: 10 },
  gateTitle: { color: "#FFF4F7", fontSize: 28, fontWeight: "800", textAlign: "center" },
  gateSubtitle: { color: SOFT, fontSize: 14, textAlign: "center", marginTop: 10, lineHeight: 23 },
  gateInput: { width: "100%", color: "#FFF", backgroundColor: "rgba(0,0,0,0.18)", borderWidth: 1, borderColor: "rgba(255,183,207,0.22)", borderRadius: 17, paddingVertical: 14, paddingHorizontal: 14, marginTop: 25, fontSize: 18 },
  gateButton: { width: "100%", backgroundColor: PINK, borderRadius: 17, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  gateButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  error: { color: "#FF9EB5", fontSize: 12, marginTop: 12, textAlign: "center" },
  privateNote: { color: "#8F5368", fontSize: 11, marginTop: 25 },
});
