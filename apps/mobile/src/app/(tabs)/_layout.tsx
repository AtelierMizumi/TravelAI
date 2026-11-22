import { Tabs, useSegments } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon } from '@/components/tab-icon';
import { useCompactNavigation } from '@/hooks/use-compact-navigation';
import { primaryTabs } from '@/navigation/tabs';

export default function TabsLayout() {
  const compact = useCompactNavigation();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const activeTab = segments[0] === '(tabs)' ? segments[1] ?? 'index' : null;
  return <Tabs backBehavior="history" safeAreaInsets={{ top: 0, bottom: compact ? insets.bottom : 0 }} screenOptions={({ route }) => ({
    headerShown: false, lazy: true, popToTopOnBlur: false, animation: 'none',
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: '#087fba', tabBarInactiveTintColor: '#54738b',
    tabBarActiveBackgroundColor: '#e0f4fc',
    tabBarItemStyle: { borderRadius: 14, marginHorizontal: 2, marginVertical: 4 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    tabBarStyle: compact ? { height: 60 + insets.bottom, paddingTop: 2, paddingBottom: insets.bottom, backgroundColor: 'rgba(246,252,255,0.97)', borderTopColor: '#cee5f0', borderTopWidth: 1, elevation: 3, shadowColor: '#075782', shadowOpacity: 0.06, shadowRadius: 8 } : { display: 'none' },
    // react-native-screens is off on web, so a blurred tab stays mounted underneath; with the transparent scene it would show through
    sceneStyle: { backgroundColor: 'transparent', ...(Platform.OS === 'web' && activeTab !== null && route.name !== activeTab ? { display: 'none' as const } : null) },
  })}>
    {primaryTabs.map(tab => <Tabs.Screen key={tab.id} name={tab.screen} options={{
      title: tab.label, tabBarAccessibilityLabel: tab.label,
      tabBarIcon: ({ focused, color }) => <TabIcon icon={tab.icon} morph={'morph' in tab ? tab.morph : undefined} focused={focused} color={typeof color === 'string' ? color : '#087fba'} />,
    }} />)}
  </Tabs>;
}
