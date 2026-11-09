import { useHydrated } from "@/hooks/use-hydrated";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, usePathname, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/auth";
import { Support } from "@/components/support";
import { Nav, ui } from "@/components/ui";
import { useRealtime } from "@/hooks/use-realtime";
import { useResource } from "@/hooks/use-resource";
import type { Settings } from "@/services/types";

const navigation = [
  { title: "Trang chủ", href: "/" as const },
  { title: "AI nhận diện", href: "/detection" as const },
  { title: "Tour", href: "/booking/tours" as const },
  { title: "Khách sạn", href: "/booking/hotels" as const },
  { title: "Cộng đồng", href: "/feed" as const },
];

function NotificationBell() {
  const { user } = useAuth();
  const unread = useResource<{ count: number }>(
    user ? `/notifications/unread/${user.id}` : null,
    5000,
  );
  const adminUnread = useResource<{ count: number }>(
    user?.role === "ADMIN" ? "/notifications/unread/0" : null,
    5000,
  );
  const rotation = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const previous = useRef<number | null>(null);
  const count = (unread.data?.count || 0) + (adminUnread.data?.count || 0);
  useRealtime(() => {
    unread.reload();
    adminUnread.reload();
  });
  useEffect(() => {
    if (
      !reducedMotion &&
      previous.current !== null &&
      count > previous.current
    ) {
      rotation.value = withSequence(
        withTiming(-14, { duration: 80 }),
        withTiming(14, { duration: 120 }),
        withTiming(0, { duration: 90 }),
      );
    }
    previous.current = count;
  }, [count, reducedMotion, rotation]);
  const motion = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Link href="/notifications" asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Thông báo, ${count} chưa đọc`}
        style={styles.iconButton}
      >
        <Animated.View style={motion}>
          <Ionicons name="notifications-outline" size={23} color="#334155" />
        </Animated.View>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function AppShell() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const settings = useResource<Settings>("/system-settings", 30_000);
  const maintenance =
    settings.data?.maintenanceMode &&
    user?.role !== "ADMIN" &&
    pathname !== "/login";
  const compact = !useHydrated() || width < 900;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8faff",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.headerTop}>
            <Link href="/" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="TravelAI, trang chủ"
                style={styles.brand}
              >
                <View style={styles.brandMark}>
                  <Ionicons name="compass" size={22} color="#fff" />
                </View>
                <Text style={styles.brandName}>
                  Travel<Text style={styles.brandAccent}>AI</Text>
                </Text>
              </Pressable>
            </Link>
            {!compact && (
              <View style={styles.navRow}>
                {navigation.map((item) => (
                  <Link href={item.href} key={item.href} asChild>
                    <Pressable
                      accessibilityRole="link"
                      style={StyleSheet.flatten([
                        styles.navItem,
                        pathname === item.href && styles.navActive,
                      ])}
                    >
                      <Text
                        style={[
                          styles.navText,
                          pathname === item.href && styles.navTextActive,
                        ]}
                      >
                        {item.title}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
                {user && (
                  <Link href="/settings" asChild>
                    <Pressable style={styles.navItem}>
                      <Text style={styles.navText}>Cài đặt</Text>
                    </Pressable>
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link href="/admin" asChild>
                    <Pressable style={styles.navItem}>
                      <Text style={styles.navText}>Quản trị</Text>
                    </Pressable>
                  </Link>
                )}
              </View>
            )}
            <View style={styles.headerActions}>
              {user && (
                <Link href="/messages" asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Tin nhắn"
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={22}
                      color="#334155"
                    />
                  </Pressable>
                </Link>
              )}
              <NotificationBell />
              <Link href={user ? "/profile" : "/login"} asChild>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={user ? "Hồ sơ" : "Đăng nhập"}
                  style={styles.profileButton}
                >
                  <Ionicons name="person-outline" size={19} color="#2563eb" />
                  {!compact && (
                    <Text style={styles.profileText}>
                      {user ? "Hồ sơ" : "Đăng nhập"}
                    </Text>
                  )}
                </Pressable>
              </Link>
            </View>
          </View>
          {compact && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.compactNav}
            >
              {navigation.map((item) => (
                <Link href={item.href} key={item.href} asChild>
                  <Pressable
                    accessibilityRole="link"
                    style={StyleSheet.flatten([
                      styles.navItem,
                      pathname === item.href && styles.navActive,
                    ])}
                  >
                    <Text
                      style={[
                        styles.navText,
                        pathname === item.href && styles.navTextActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </Pressable>
                </Link>
              ))}
              {user && (
                <Link href="/messages" asChild>
                  <Pressable style={styles.navItem}>
                    <Text style={styles.navText}>Tin nhắn</Text>
                  </Pressable>
                </Link>
              )}
              {user && (
                <Link href="/settings" asChild>
                  <Pressable style={styles.navItem}>
                    <Text style={styles.navText}>Cài đặt</Text>
                  </Pressable>
                </Link>
              )}
              {user?.role === "ADMIN" && (
                <Link href="/admin" asChild>
                  <Pressable style={styles.navItem}>
                    <Text style={styles.navText}>Quản trị</Text>
                  </Pressable>
                </Link>
              )}
            </ScrollView>
          )}
        </View>
      </View>
      {maintenance ? (
        <View style={ui.content}>
          <Text style={ui.title}>Hệ thống đang bảo trì</Text>
          <Text style={ui.text}>Vui lòng quay lại sau.</Text>
          <Nav href="/login">Đăng nhập quản trị</Nav>
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
      {!maintenance && <Support />}
      {!maintenance && pathname !== "/ai-chat" && (
        <Link href={"/ai-chat" as Href} asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Mở trợ lý du lịch AI"
            style={styles.aiButton}
          >
            <Ionicons name="sparkles" color="#fff" size={24} />
          </Pressable>
        </Link>
      )}
    </View>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9eef7",
    zIndex: 5,
  },
  headerInner: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  headerTop: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: "#16233d",
  },
  brandAccent: { color: "#2563eb" },
  navRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  compactNav: { alignItems: "center", gap: 4, paddingBottom: 8 },
  navItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  navActive: { backgroundColor: "#edf4ff" },
  navText: { fontSize: 14, fontWeight: "600", color: "#65718a" },
  navTextActive: { color: "#2563eb" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 5 },
  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#edf4ff",
  },
  profileText: { color: "#2563eb", fontWeight: "700", fontSize: 13 },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  aiButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1d4ed8",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  pressed: { opacity: 0.7 },
});
