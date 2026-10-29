import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

const WINE = "#7D1733";
const WINE_DEEP = "#21080F";
const BLUSH = "#D94C68";
const GOLD = "#F2C58A";
const MUTED = "#D9AAB7";
const GLASS = "rgba(255,255,255,0.10)";
const BORDER = "rgba(255,255,255,0.18)";

// ضعي ملف الأغنية في assets/audio/ ثم استبدلي null بهذا السطر:
// const SONG_SOURCE = require("../../assets/audio/aishalak.mp3");
const SONG_SOURCE = null;

const memories = [
  { emoji: "✦", title: "أول نظرة", text: "اللحظة التي صار فيها كل شيء أجمل." },
  { emoji: "♡", title: "ضحكتك", text: "تفصيل صغير، لكنه عالمي كله." },
  { emoji: "∞", title: "وعدنا", text: "كل يوم جديد يكتب فصلًا لنا." },
];

function Snowflake({ index }: { index: number }) {
  const fall = useRef(new Animated.Value(-40)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const size = 8 + (index % 4) * 3;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 180),
        Animated.parallel([
          Animated.timing(fall, { toValue: 900, duration: 5200 + (index % 5) * 650, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(fade, { toValue: 0.8, duration: 500, useNativeDriver: true }),
            Animated.delay(3000),
            Animated.timing(fade, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(fall, { toValue: -40, duration: 0, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [fade, fall, index]);
  return <Animated.Text style={[styles.snowflake, { left: 10 + ((index * 31) % 330), fontSize: size, opacity: fade, transform: [{ translateY: fall }] }]}>❄</Animated.Text>;
}

function Snowfall({ active }: { active: boolean }) {
  if (!active) return null;
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}><View style={styles.snowLayer}>{Array.from({ length: 18 }, (_, index) => <Snowflake key={index} index={index} />)}</View></View>;
}

function Pulse({ active }: { active: boolean }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (!active) { scale.stopAnimation(); opacity.stopAnimation(); scale.setValue(0.8); opacity.setValue(0.55); return; }
    const loop = Animated.loop(Animated.parallel([
      Animated.sequence([Animated.timing(scale, { toValue: 1.55, duration: 1350, easing: Easing.out(Easing.quad), useNativeDriver: true }), Animated.timing(scale, { toValue: 0.8, duration: 0, useNativeDriver: true })]),
      Animated.sequence([Animated.timing(opacity, { toValue: 0, duration: 1350, useNativeDriver: true }), Animated.timing(opacity, { toValue: 0.55, duration: 0, useNativeDriver: true })]),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active, opacity, scale]);
  if (!active) return null;
  return <Animated.View pointerEvents="none" style={[styles.pulseRing, { opacity, transform: [{ scale }] }]} />;
}

function MusicNotes({ active }: { active: boolean }) {
  const notes = ["♪", "♫", "♬", "•", "♪"];
  return <View pointerEvents="none" style={styles.notesLayer}>{active && notes.map((note, index) => <FloatingNote key={`${note}-${index}`} note={note} index={index} />)}</View>;
}

function FloatingNote({ note, index }: { note: string; index: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(index * 220),
      Animated.timing(progress, { toValue: 1, duration: 1900 + index * 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [index, progress]);
  return <Animated.Text style={[styles.floatingNote, { left: 12 + index * 28, opacity: progress.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 0.8, 0] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [28, -55] }) }, { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, index % 2 ? -13 : 13, 0] }) }, { rotate: `${index % 2 ? -12 : 12}deg` }] }]}>{note}</Animated.Text>;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [liked, setLiked] = useState(false);
  const [visualPlaying, setVisualPlaying] = useState(false);
  const player = useAudioPlayer(SONG_SOURCE, { updateInterval: 500, downloadFirst: true });
  const status = useAudioPlayerStatus(player);
  const contentWidth = Math.min(width - 36, 560);
  const songReady = Boolean(SONG_SOURCE) && status.isLoaded;
  const isPlaying = songReady ? status.playing : visualPlaying;
  const relationshipLabel = useMemo(() => "3 سنوات", []);

  const toggleMusic = () => {
    if (songReady) {
      if (status.playing) {
        player.pause();
        setVisualPlaying(false);
      } else {
        player.play();
        setVisualPlaying(true);
      }
      return;
    }
    setVisualPlaying((value) => !value);
  };

  useEffect(() => {
    if (songReady && status.didJustFinish) setVisualPlaying(false);
  }, [songReady, status.didJustFinish]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Snowfall active={isPlaying} />
      <MusicNotes active={isPlaying} />
      <ScrollView contentContainerStyle={[styles.scroll, { width: contentWidth }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View><Text style={styles.eyebrow}>إلى حمودي، حبيبي</Text><Text style={styles.brand}>My Love</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="تفضيل التطبيق" onPress={() => setLiked((value) => !value)} style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}><Text style={styles.heart}>{liked ? "♥" : "♡"}</Text></Pressable>
        </View>
        <View style={styles.heroGlow} />
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>رسالة اليوم</Text>
          <Text style={styles.heroTitle}>أنت أجمل صدفة{`\n`}صارت لي قدرًا.</Text>
          <Text style={styles.heroCopy}>هذا المكان صغير، لكنه يحمل لك كل الأشياء التي لا تكفيها رسالة واحدة.</Text>
          <View style={styles.signatureRow}><View style={styles.avatar}><Text style={styles.avatarText}>♥</Text></View><Text style={styles.signature}>من أمونة إلى حمودي</Text></View>
        </View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>أغنيتنا</Text><Text style={styles.sectionHint}>لحظتنا المفضلة</Text></View>
        <View style={styles.musicCard}>
          <View style={styles.musicDisc}><Text style={styles.discText}>♪</Text><Pulse active={isPlaying} /></View>
          <View style={styles.musicMeta}><Text style={styles.musicTitle}>عيشالك</Text><Text style={styles.musicSubtitle}>{songReady ? "تعمل حتى نهاية الأغنية" : "أضيفي ملف الأغنية لتعمل كاملة"}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: status.duration ? `${Math.min(100, (status.currentTime / status.duration) * 100)}%` : "24%" }]} /></View><View style={styles.timeRow}><Text style={styles.time}>{formatTime(status.currentTime)}</Text><Text style={styles.time}>{status.duration ? formatTime(status.duration) : "—:—"}</Text></View></View>
          <Pressable accessibilityRole="button" accessibilityLabel={isPlaying ? "إيقاف الأغنية" : "تشغيل الأغنية"} onPress={toggleMusic} style={({ pressed }) => [styles.playButton, isPlaying && styles.playingButton, pressed && styles.pressed]}><Text style={styles.playIcon}>{isPlaying ? "Ⅱ" : "▶"}</Text></Pressable>
        </View>
        <View style={styles.statsRow}><View style={styles.statCard}><Text style={styles.statValue}>{relationshipLabel}</Text><Text style={styles.statLabel}>من الحب</Text></View><View style={styles.statCard}><Text style={styles.statValue}>19.03.2024</Text><Text style={styles.statLabel}>منذ بدأ كل شيء</Text></View></View>
        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>فصولنا الصغيرة</Text><Text style={styles.sectionHint}>ذكريات تستحق أن تبقى</Text></View>
        {memories.map((memory) => <Pressable key={memory.title} style={({ pressed }) => [styles.memoryCard, pressed && styles.pressed]}><View style={styles.memoryIcon}><Text style={styles.memoryEmoji}>{memory.emoji}</Text></View><View style={styles.memoryText}><Text style={styles.memoryTitle}>{memory.title}</Text><Text style={styles.memoryCopy}>{memory.text}</Text></View><Text style={styles.chevron}>‹</Text></Pressable>)}
        <View style={styles.quoteCard}><Text style={styles.quoteMark}>“</Text><Text style={styles.quote}>أحبك لأنك تجعل الأيام العادية تبدو كأنها عيد.</Text><Text style={styles.quoteFrom}>— مذكّرة حب</Text></View>
        <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}><Text style={styles.ctaText}>افتح رسالة سرّية</Text><Text style={styles.ctaArrow}>←</Text></Pressable>
        <Text style={styles.footer}>صُنع بحب، لشخص واحد فقط.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(seconds: number) {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WINE_DEEP, alignItems: "center", overflow: "hidden" },
  scroll: { paddingTop: 18, paddingBottom: 42, zIndex: 2 },
  snowLayer: { flex: 1, overflow: "hidden" },
  snowflake: { position: "absolute", top: -20, color: "rgba(255,247,250,0.95)", textShadowColor: "rgba(255,255,255,0.65)", textShadowRadius: 8 },
  notesLayer: { position: "absolute", zIndex: 3, top: 435, right: 42, width: 180, height: 90 },
  floatingNote: { position: "absolute", color: "#FFD6E0", fontSize: 25, fontWeight: "800", textShadowColor: "rgba(217,76,104,0.8)", textShadowRadius: 8 },
  pulseRing: { position: "absolute", width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: "rgba(255,179,193,0.65)", backgroundColor: "transparent" },
  topRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  eyebrow: { color: MUTED, fontSize: 12, textAlign: "right", letterSpacing: 0.3 },
  brand: { color: "#FFF3F5", fontSize: 28, fontWeight: "800", marginTop: 3, textAlign: "right" },
  heartButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  heart: { color: "#FFB3C1", fontSize: 25 },
  heroGlow: { position: "absolute", top: 72, right: -100, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(217,76,104,0.18)" },
  heroCard: { backgroundColor: "rgba(125,23,51,0.72)", borderWidth: 1, borderColor: "rgba(255,194,208,0.25)", borderRadius: 30, padding: 24, minHeight: 250, justifyContent: "space-between", overflow: "hidden" },
  heroKicker: { color: GOLD, fontSize: 13, fontWeight: "700", textAlign: "right" },
  heroTitle: { color: "#FFF7F8", fontSize: 31, lineHeight: 40, fontWeight: "800", textAlign: "right", marginTop: 18 },
  heroCopy: { color: "#F1CDD6", fontSize: 14, lineHeight: 24, textAlign: "right", marginTop: 12 },
  signatureRow: { flexDirection: "row-reverse", alignItems: "center", marginTop: 20, gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(242,197,138,0.18)", borderWidth: 1, borderColor: "rgba(242,197,138,0.5)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: GOLD, fontSize: 16 },
  signature: { color: "#F4DCE2", fontSize: 13 },
  sectionHeading: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "baseline", marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: "#FFF2F4", fontSize: 19, fontWeight: "800", textAlign: "right" },
  sectionHint: { color: MUTED, fontSize: 11, textAlign: "left" },
  musicCard: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: GLASS, borderWidth: 1, borderColor: BORDER, borderRadius: 24, padding: 16, gap: 13 },
  musicDisc: { width: 62, height: 62, borderRadius: 31, backgroundColor: WINE, borderWidth: 5, borderColor: "rgba(242,197,138,0.28)", justifyContent: "center", alignItems: "center" },
  discText: { color: GOLD, fontSize: 27 },
  musicMeta: { flex: 1 },
  musicTitle: { color: "#FFF5F6", fontSize: 17, fontWeight: "800", textAlign: "right" },
  musicSubtitle: { color: MUTED, fontSize: 11, textAlign: "right", marginTop: 3 },
  progressTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 3, marginTop: 12, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: BLUSH, borderRadius: 3 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  time: { color: "#B98B98", fontSize: 9 },
  playButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: BLUSH, alignItems: "center", justifyContent: "center", shadowColor: BLUSH, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  playingButton: { backgroundColor: "#F18AA0" },
  playIcon: { color: "#FFF7F8", fontSize: 18, fontWeight: "800" },
  statsRow: { flexDirection: "row-reverse", gap: 12, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingVertical: 14, alignItems: "center" },
  statValue: { color: GOLD, fontSize: 23, fontWeight: "800" },
  statLabel: { color: MUTED, fontSize: 11, marginTop: 3 },
  memoryCard: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: "rgba(255,255,255,0.075)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 13, marginBottom: 9 },
  memoryIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(217,76,104,0.2)", justifyContent: "center", alignItems: "center" },
  memoryEmoji: { color: "#FFB3C1", fontSize: 20 },
  memoryText: { flex: 1, marginHorizontal: 12 },
  memoryTitle: { color: "#FFF2F4", fontSize: 14, fontWeight: "700", textAlign: "right" },
  memoryCopy: { color: MUTED, fontSize: 11, textAlign: "right", marginTop: 4 },
  chevron: { color: "#D8899C", fontSize: 24 },
  quoteCard: { backgroundColor: "rgba(242,197,138,0.10)", borderWidth: 1, borderColor: "rgba(242,197,138,0.22)", borderRadius: 24, padding: 21, marginTop: 18 },
  quoteMark: { color: GOLD, fontSize: 40, height: 32, textAlign: "right" },
  quote: { color: "#FFF1DD", fontSize: 16, lineHeight: 27, textAlign: "right", marginTop: 4 },
  quoteFrom: { color: "#D7B98E", fontSize: 11, textAlign: "right", marginTop: 12 },
  cta: { flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: "#FFF1DD", borderRadius: 18, paddingVertical: 15, marginTop: 18 },
  ctaText: { color: WINE_DEEP, fontSize: 14, fontWeight: "800" },
  ctaArrow: { color: WINE, fontSize: 20 },
  footer: { color: "#9E6473", fontSize: 11, textAlign: "center", marginTop: 18 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
