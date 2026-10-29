import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WINE = "#7D1733";
const WINE_DEEP = "#21080F";
const BLUSH = "#D94C68";
const GOLD = "#F2C58A";
const MUTED = "#D9AAB7";
const GLASS = "rgba(255,255,255,0.10)";
const BORDER = "rgba(255,255,255,0.18)";

const memories = [
  { emoji: "✦", title: "أول نظرة", text: "اللحظة التي صار فيها كل شيء أجمل." },
  { emoji: "♡", title: "ضحكتك", text: "تفصيل صغير، لكنه عالمي كله." },
  { emoji: "∞", title: "وعدنا", text: "كل يوم جديد يكتب فصلًا لنا." },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const contentWidth = Math.min(width - 36, 560);

  const daysTogether = useMemo(() => 128, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { width: contentWidth }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>إلى الشخص الذي أحبّه</Text>
            <Text style={styles.brand}>My Love</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="تفضيل التطبيق"
            onPress={() => setLiked((value) => !value)}
            style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}
          >
            <Text style={styles.heart}>{liked ? "♥" : "♡"}</Text>
          </Pressable>
        </View>

        <View style={styles.heroGlow} />
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>رسالة اليوم</Text>
          <Text style={styles.heroTitle}>أنت أجمل صدفة{`\n`}صارت لي قدرًا.</Text>
          <Text style={styles.heroCopy}>
            هذا المكان صغير، لكنه يحمل لك كل الأشياء التي لا تكفيها رسالة واحدة.
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>♥</Text></View>
            <Text style={styles.signature}>من قلبي إلى قلبك</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>أغنيتنا</Text>
          <Text style={styles.sectionHint}>لحظتنا المفضلة</Text>
        </View>
        <View style={styles.musicCard}>
          <View style={styles.musicDisc}><Text style={styles.discText}>♪</Text></View>
          <View style={styles.musicMeta}>
            <Text style={styles.musicTitle}>عيشالك</Text>
            <Text style={styles.musicSubtitle}>أضيفي ملف الأغنية هنا لاحقًا</Text>
            <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
            <View style={styles.timeRow}><Text style={styles.time}>00:00</Text><Text style={styles.time}>—:—</Text></View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "إيقاف الأغنية" : "تشغيل الأغنية"}
            onPress={() => setIsPlaying((value) => !value)}
            style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
          >
            <Text style={styles.playIcon}>{isPlaying ? "Ⅱ" : "▶"}</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>{daysTogether}</Text><Text style={styles.statLabel}>يوم من الحب</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>∞</Text><Text style={styles.statLabel}>لحظة لا تنسى</Text></View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>فصولنا الصغيرة</Text>
          <Text style={styles.sectionHint}>ذكريات تستحق أن تبقى</Text>
        </View>
        {memories.map((memory) => (
          <Pressable key={memory.title} style={({ pressed }) => [styles.memoryCard, pressed && styles.pressed]}>
            <View style={styles.memoryIcon}><Text style={styles.memoryEmoji}>{memory.emoji}</Text></View>
            <View style={styles.memoryText}><Text style={styles.memoryTitle}>{memory.title}</Text><Text style={styles.memoryCopy}>{memory.text}</Text></View>
            <Text style={styles.chevron}>‹</Text>
          </Pressable>
        ))}

        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quote}>أحبك لأنك تجعل الأيام العادية تبدو كأنها عيد.</Text>
          <Text style={styles.quoteFrom}>— مذكّرة حب</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>افتحي رسالة سرّية</Text>
          <Text style={styles.ctaArrow}>←</Text>
        </Pressable>
        <Text style={styles.footer}>صُنع بحب، لشخص واحد فقط.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WINE_DEEP, alignItems: "center" },
  scroll: { paddingTop: 18, paddingBottom: 42 },
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
  progressFill: { width: "24%", height: 4, backgroundColor: BLUSH, borderRadius: 3 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  time: { color: "#B98B98", fontSize: 9 },
  playButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: BLUSH, alignItems: "center", justifyContent: "center", shadowColor: BLUSH, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
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
