import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocus } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';
import { AppBlockerConfig } from '@/types';
import { mockBlockedApps } from '@/utils/mockData';

export default function AppBlockerScreen() {
  const { blockedApps, toggleAppBlock } = useFocus();
  const { medium } = useHaptics();

  const [apps, setApps] = useState<AppBlockerConfig[]>(blockedApps);
  const [showAddApp, setShowAddApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');

  const entrance1 = useStaggeredEntrance(0, 80);
  const entrance2 = useStaggeredEntrance(1, 80);
  const entrance3 = useStaggeredEntrance(2, 80);

  const handleToggle = (appId: string) => {
    medium();
    const updated = apps.map(app => 
      app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app
    );
    setApps(updated);
    toggleAppBlock(appId);
  };

  const handleAddApp = () => {
    if (!newAppName.trim()) return;
    medium();
    const newApp: AppBlockerConfig = {
      id: `custom-${Date.now()}`,
      name: newAppName,
      packageName: `com.custom.${newAppName.toLowerCase().replace(/\s+/g, '')}`,
      icon: '📱',
      isBlocked: true,
      category: 'other',
    };
    setApps([newApp, ...apps]);
    setNewAppName('');
    setShowAddApp(false);
  };

  const categories = [
    { id: 'all', label: 'All Apps' },
    { id: 'social', label: 'Social' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'other', label: 'Other' },
  ];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredApps = activeCategory === 'all' 
    ? apps 
    : apps.filter(a => a.category === activeCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>App Blocker</Text>
          <Text style={styles.headerSubtitle}>Choose apps to block during focus</Text>
        </View>
        <TouchableOpacity onPress={() => { medium(); setShowAddApp(true); }} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#0ea5e9" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={entrance1}>
          <View style={styles.categoryTabs}>
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, activeCategory === cat.id && styles.categoryActive, { borderColor: activeCategory === cat.id ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={[styles.categoryTabText, { color: activeCategory === cat.id ? '#0ea5e9' : 'rgba(255,255,255,0.5)' }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entrance2}>
          <View style={styles.appsList}>
            {filteredApps.map((app, i) => (
              <AppBlockerCard 
                key={app.id} 
                app={app} 
                index={i} 
                onToggle={() => handleToggle(app.id)} 
              />
            ))}
            {filteredApps.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No apps in this category</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View style={entrance3}>
          <GlassCard style={styles.infoCard} glow="#0ea5e9">
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color="#0ea5e9" />
              <Text style={styles.infoText}>Blocked apps cannot be opened during Focus Mode. Emergency unlock available with a 30-second delay.</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {showAddApp && (
        <AddAppModal onClose={() => setShowAddApp(false)} onAdd={handleAddApp} appName={newAppName} setAppName={setNewAppName} />
      )}
    </View>
  );
}

function AppBlockerCard({ app, index, onToggle }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);
  const pressScale = useSharedValue(1);
  
  const pressIn = () => pressScale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  const pressOut = () => pressScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const categoryColors: Record<string, string> = {
    social: '#ec4899',
    entertainment: '#f59e0b',
    gaming: '#8b5cf6',
    other: '#64748b',
  };

  const categoryColor = categoryColors[app.category] || '#64748b';

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity
        style={styles.appCard}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onToggle}
        activeOpacity={1}
      >
        <Animated.View style={animatedStyle}>
          <View style={[styles.appIconWrapper, { backgroundColor: categoryColor + '30' }]}>
            <Text style={styles.appIcon}>{app.icon}</Text>
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>{app.name}</Text>
            <View style={styles.appMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30', borderColor: categoryColor }]}>
                <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>{app.category}</Text>
              </View>
              <Text style={styles.packageName}>{app.packageName}</Text>
            </View>
          </View>
          <View style={[styles.toggleWrapper, app.isBlocked && styles.toggleActive]}>
            <Animated.View style={[styles.toggleThumb, { backgroundColor: app.isBlocked ? '#22c55e' : 'rgba(255,255,255,0.4)' }]} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function AddAppModal({ onClose, onAdd, appName, setAppName }: any) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [{ scale }],
  }));

  return (
    <Animated.View style={[styles.modalOverlay, { opacity }]} onTouchEnd={onClose}>
      <Animated.View style={[styles.modalContainer, containerStyle]}>
        <GlassCard style={styles.modalCard} glow="#0ea5e9">
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Custom App</Text>
            <Text style={styles.modalSubtitle}>Enter the app name to block during focus sessions</Text>
            <TextInput
              style={styles.modalInput}
              value={appName}
              onChangeText={setAppName}
              placeholder="App name (e.g., Twitter, Spotify)"
              autoCapitalize="words"
              maxLength={30}
            />
            <View style={styles.modalButtons}>
              <AnimatedButton title="CANCEL" onPress={onClose} variant="ghost" size="md" />
              <AnimatedButton title="ADD APP" onPress={onAdd} variant="gradient" size="md" />
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  addButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100, gap: 20 },
  categoryTabs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  categoryTab: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 100 },
  categoryActive: { backgroundColor: 'rgba(14, 165, 233, 0.1)' },
  categoryTabText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  appsList: { gap: 10 },
  appCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 16 },
  appIconWrapper: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  appIcon: { fontSize: 24 },
  appInfo: { flex: 1, gap: 4 },
  appName: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  appMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100, borderWidth: 1 },
  categoryBadgeText: { fontSize: 10, fontWeight: '600', fontFamily: 'SpaceGrotesk_700Bold' },
  packageName: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
  toggleWrapper: { width: 52, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 2 },
  toggleActive: { backgroundColor: '#22c55e30', borderColor: '#22c55e' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_500Medium' },
  infoCard: { width: '100%' },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 20, fontFamily: 'Inter_500Medium' },
  bottomSpacer: { height: 40 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, zIndex: 1000 },
  modalContainer: { width: '100%' },
  modalCard: { width: '100%', padding: 24 },
  modalContent: { gap: 16 },
  modalClose: { position: 'absolute', top: 8, right: 8, padding: 4 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  modalSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_500Medium' },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#fff', fontFamily: 'Inter_500Medium' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
});