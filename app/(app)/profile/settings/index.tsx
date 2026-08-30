import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context';
import { GlassCard } from '@/components/GlassCard';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { useHaptics } from '@/hooks/useHaptics';

export default function SettingsScreen() {
  const { user, updatePreferences } = useAuth();
  const { medium } = useHaptics();

  if (!user) return null;

  const [notifications, setNotifications] = useState(user.preferences.notificationsEnabled);
  const [haptics, setHaptics] = useState(user.preferences.hapticsEnabled);
  const [sound, setSound] = useState(user.preferences.soundEnabled);
  const [reducedMotion, setReducedMotion] = useState(user.preferences.reducedMotion);
  const [focusDuration, setFocusDuration] = useState(user.preferences.focusDuration);
  const [breakDuration, setBreakDuration] = useState(user.preferences.breakDuration);
  const [dailyGoal, setDailyGoal] = useState(user.preferences.dailyGoal);

  const handleToggle = (key: string, value: boolean) => {
    medium();
    updatePreferences({ [key]: value });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <GlassCard style={styles.sectionCard} glow="#0ea5e9">
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Study reminders & alerts"
            value={notifications}
            onValueChange={v => handleToggle('notificationsEnabled', v)}
          />
          <SettingItem
            icon="vibrate-outline"
            title="Haptic Feedback"
            subtitle="Vibration on actions"
            value={haptics}
            onValueChange={v => handleToggle('hapticsEnabled', v)}
          />
          <SettingItem
            icon="volume-high-outline"
            title="Sound Effects"
            subtitle="Audio feedback"
            value={sound}
            onValueChange={v => handleToggle('soundEnabled', v)}
          />
          <SettingItem
            icon="accessibility-outline"
            title="Reduced Motion"
            subtitle="Minimize animations"
            value={reducedMotion}
            onValueChange={v => handleToggle('reducedMotion', v)}
          />
        </GlassCard>

        <GlassCard style={styles.sectionCard} glow="#8b5cf6">
          <Text style={styles.sectionTitle}>FOCUS SETTINGS</Text>
          <SettingInput
            icon="timer-outline"
            title="Focus Duration"
            subtitle="Minutes per session"
            value={focusDuration}
            onValueChange={v => { setFocusDuration(v); updatePreferences({ focusDuration: v }); }}
          />
          <SettingInput
            icon="timer-off-outline"
            title="Break Duration"
            subtitle="Minutes per break"
            value={breakDuration}
            onValueChange={v => { setBreakDuration(v); updatePreferences({ breakDuration: v }); }}
          />
          <SettingInput
            icon="target-outline"
            title="Daily Goal"
            subtitle="Minutes per day"
            value={dailyGoal}
            onValueChange={v => { setDailyGoal(v); updatePreferences({ dailyGoal: v }); }}
          />
        </GlassCard>

        <GlassCard style={styles.sectionCard} glow="#22c55e">
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Always dark theme"
            value={true}
            onValueChange={() => {}}
            disabled
          />
        </GlassCard>

        <GlassCard style={styles.sectionCard} glow="#ef4444">
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <TouchableOpacity style={styles.dangerItem} onPress={() => {}} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <View style={styles.dangerInfo}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.dangerSubtitle}>Permanently remove all data</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function SettingItem({ icon, title, subtitle, value, onValueChange, disabled }: any) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={() => !disabled && onValueChange(!value)} activeOpacity={0.8}>
      <View style={[styles.settingIcon, { backgroundColor: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(14, 165, 233, 0.1)' }]}>
        <Ionicons name={icon} size={20} color={disabled ? 'rgba(255,255,255,0.3)' : '#0ea5e9'} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: disabled ? 'rgba(255,255,255,0.3)' : '#fff' }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)' }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#0ea5e9' }}
        thumbColor={value ? '#fff' : 'rgba(255,255,255,0.5)'}
      />
    </TouchableOpacity>
  );
}

function SettingInput({ icon, title, subtitle, value, onValueChange }: any) {
  return (
    <View style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
        <Ionicons name={icon} size={20} color="#8b5cf6" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <TextInput
        style={styles.settingInput}
        value={value.toString()}
        onChangeText={text => onValueChange(parseInt(text) || 0)}
        keyboardType="numeric"
        maxLength={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  sectionCard: { width: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, marginBottom: 16 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  settingIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1, paddingHorizontal: 12, gap: 2 },
  settingTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  settingSubtitle: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  settingInput: { width: 60, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#fff', textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold' },
  dangerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 16, gap: 12 },
  dangerInfo: { flex: 1, gap: 2 },
  dangerTitle: { fontSize: 15, fontWeight: '600', color: '#ef4444', fontFamily: 'Inter_600SemiBold' },
  dangerSubtitle: { fontSize: 12, color: 'rgba(239, 68, 68, 0.6)', fontFamily: 'Inter_500Medium' },
});