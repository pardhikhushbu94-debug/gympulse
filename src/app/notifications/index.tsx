import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useNutritionStore } from '@/store/nutritionStore';
import { safeGoBack } from '@/utils/navigation';
import { AppNotification } from '@/types/nutritionAndGoals';
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  AlertTriangle,
  Flame,
  Dumbbell,
  CreditCard,
  CheckCheck,
  Sliders,
  Clock,
  Droplets,
  Moon,
  Sparkles,
} from 'lucide-react-native';

export default function NotificationsCenterScreen() {
  const { theme } = useTheme();
  const {
    notifications,
    preferences,
    markNotificationAsRead,
    markAllNotificationsRead,
    updatePreferences,
  } = useNutritionStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'trainer' | 'expiry'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    if (activeFilter === 'trainer') return item.type === 'trainer';
    if (activeFilter === 'expiry') return item.type === 'expiry';
    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'trainer':
        return <MessageSquare size={18} color="#38BDF8" />;
      case 'expiry':
        return <AlertTriangle size={18} color="#EF4444" />;
      case 'streak':
        return <Flame size={18} color="#FF6B00" />;
      case 'workout_reminder':
        return <Dumbbell size={18} color={theme.colors.primary} />;
      case 'payment':
        return <CreditCard size={18} color="#10B981" />;
      default:
        return <Bell size={18} color={theme.colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="NOTIFICATIONS" subtitle="Alerts, Coach Updates & Reminders" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: showSettings
                    ? theme.colors.primary
                    : theme.colors.cardElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Sliders
                size={16}
                color={showSettings ? theme.colors.primaryContrast : theme.colors.text}
              />
            </TouchableOpacity>

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllNotificationsRead}
                style={[styles.markReadBtn, { borderColor: theme.colors.border }]}
              >
                <CheckCheck size={14} color={theme.colors.primary} />
                <Text style={[styles.markReadText, { color: theme.colors.primary }]}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Push Notification Preferences Drawer */}
        {showSettings && (
          <Card elevated style={styles.settingsCard}>
            <View style={styles.settingsHeader}>
              <Sliders size={18} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Notification Preferences
              </Text>
            </View>

            {/* Master Push Toggle */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefTitle, { color: theme.colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.prefDesc, { color: theme.colors.textSecondary }]}>
                  Receive real-time alerts on your device
                </Text>
              </View>
              <Switch
                value={preferences.pushEnabled}
                onValueChange={(val) => updatePreferences({ pushEnabled: val })}
                thumbColor={preferences.pushEnabled ? theme.colors.primary : '#ccc'}
              />
            </View>

            {/* Workout Reminder */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefTitle, { color: theme.colors.text }]}>
                  Workout Daily Reminder
                </Text>
                <Text style={[styles.prefDesc, { color: theme.colors.textSecondary }]}>
                  Daily at {preferences.workoutReminderTime}
                </Text>
              </View>
              <Badge variant="primary" label={preferences.workoutReminderTime} />
            </View>

            {/* Quiet Hours */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Moon size={14} color="#A78BFA" />
                  <Text style={[styles.prefTitle, { color: theme.colors.text }]}>
                    Quiet Hours
                  </Text>
                </View>
                <Text style={[styles.prefDesc, { color: theme.colors.textSecondary }]}>
                  Mute alerts between {preferences.quietHoursStart} - {preferences.quietHoursEnd}
                </Text>
              </View>
              <Switch
                value={preferences.quietHoursEnabled}
                onValueChange={(val) => updatePreferences({ quietHoursEnabled: val })}
                thumbColor={preferences.quietHoursEnabled ? '#A78BFA' : '#ccc'}
              />
            </View>

            {/* Membership Expiry Alerts */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefTitle, { color: theme.colors.text }]}>
                  Expiry & Dues Reminders
                </Text>
                <Text style={[styles.prefDesc, { color: theme.colors.textSecondary }]}>
                  7, 3, and 1 days before plan expiration
                </Text>
              </View>
              <Switch
                value={preferences.membershipExpiryAlerts}
                onValueChange={(val) => updatePreferences({ membershipExpiryAlerts: val })}
                thumbColor={preferences.membershipExpiryAlerts ? theme.colors.primary : '#ccc'}
              />
            </View>
          </Card>
        )}

        {/* Filter Pills */}
        <View style={styles.filtersRow}>
          {[
            { key: 'all', label: `All (${notifications.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'trainer', label: 'Trainer' },
            { key: 'expiry', label: 'Expiry & Bills' },
          ].map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveFilter(tab.key as any)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.cardElevated,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    {
                      color: isSelected
                        ? theme.colors.primaryContrast
                        : theme.colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card elevated style={styles.emptyCard}>
            <Bell size={36} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              All Caught Up!
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              No notifications matching the selected filter.
            </Text>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              activeOpacity={0.8}
              onPress={() => {
                if (!notif.isRead) markNotificationAsRead(notif.id);
              }}
            >
              <Card
                elevated
                style={[
                  styles.notifCard,
                  !notif.isRead && {
                    borderColor: theme.colors.primary,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <View style={styles.notifRow}>
                  {/* Type Icon */}
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: theme.colors.cardElevated,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {getNotificationIcon(notif.type)}
                  </View>

                  {/* Body Text */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.notifTitleRow}>
                      <Text
                        style={[
                          styles.notifTitle,
                          {
                            color: theme.colors.text,
                            fontWeight: notif.isRead ? '600' : '800',
                          },
                        ]}
                      >
                        {notif.title}
                      </Text>

                      {!notif.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
                    </View>

                    <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]}>
                      {notif.body}
                    </Text>

                    <Text style={[styles.notifTime, { color: theme.colors.textSecondary }]}>
                      {notif.timestamp}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33333330',
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  prefDesc: {
    fontSize: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  notifCard: {
    marginBottom: 10,
    padding: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
  },
});
