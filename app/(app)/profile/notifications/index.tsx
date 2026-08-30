import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/GlassCard';
import { useStaggeredEntrance } from '@/hooks/useAnimations';
import { mockNotifications } from '@/utils/mockData';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <View style={styles.notificationsList}>
          {mockNotifications.map((notification, i) => (
            <NotificationCard key={notification.id} notification={notification} index={i} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function NotificationCard({ notification, index }: any) {
  const entranceStyle = useStaggeredEntrance(index, 60);

  const typeConfig: Record<string, { icon: string; color: string }> = {
    exam_reminder: { icon: 'calendar-outline', color: '#0ea5e9' },
    study_reminder: { icon: 'book-outline', color: '#8b5cf6' },
    quiz_reminder: { icon: 'help-circle-outline', color: '#f59e0b' },
    streak_reminder: { icon: 'flame-outline', color: '#ef4444' },
    reward_unlocked: { icon: 'gift-outline', color: '#ec4899' },
    weak_topic: { icon: 'alert-circle-outline', color: '#ef4444' },
    achievement: { icon: 'trophy-outline', color: '#f59e0b' },
    focus_complete: { icon: 'timer-outline', color: '#22c55e' },
  };

  const config = typeConfig[notification.type] || typeConfig.study_reminder;

  return (
    <Animated.View style={entranceStyle}>
      <TouchableOpacity style={[styles.notificationCard, !notification.isRead && styles.unread]} onPress={() => {}} activeOpacity={0.8}>
        <View style={[styles.notificationIcon, { backgroundColor: config.color + '30' }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationTime}>{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
        {!notification.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#03060a' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 16 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  notificationsList: { gap: 10 },
  notificationCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, gap: 12 },
  unread: { backgroundColor: 'rgba(14, 165, 233, 0.05)', borderColor: 'rgba(14, 165, 233, 0.2)' },
  notificationIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notificationContent: { flex: 1, gap: 4 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationTitle: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: 'SpaceGrotesk_700Bold' },
  notificationTime: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter_500Medium' },
  notificationMessage: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 20, fontFamily: 'Inter_500Medium' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0ea5e9', marginTop: 6 },
});