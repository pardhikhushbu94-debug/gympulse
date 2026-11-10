import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  generateRotatingQRToken,
  processCheckIn,
  processCheckOut,
  GYM_LOCATION,
} from '../../services/attendanceService';
import {
  QrCode,
  Camera,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Clock,
  MapPin,
  Calendar,
  LogOut,
  Sparkles,
  Tv,
  Zap,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function CheckinScreen() {
  const { theme } = useTheme();
  const { user, membership } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'scan_camera' | 'show_pass'>('scan_camera');
  const [tokenData, setTokenData] = useState(generateRotatingQRToken());
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [sessionMinutes, setSessionMinutes] = useState(42);
  const [streak, setStreak] = useState(15);
  const [geofenceBypass, setGeofenceBypass] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Rotating token timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTokenData(generateRotatingQRToken());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Workout stopwatch
  useEffect(() => {
    if (isCheckedIn) {
      const timer = setInterval(() => {
        setSessionMinutes((m) => m + 1);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [isCheckedIn]);

  const handleSimulateCameraScan = () => {
    if (!user) return;

    // Check-in coordinates
    const userCoords = geofenceBypass
      ? undefined
      : { latitude: GYM_LOCATION.latitude, longitude: GYM_LOCATION.longitude };

    const result = processCheckIn(user, membership, 'qr_scan', userCoords, geofenceBypass);

    if (result.success) {
      setIsCheckedIn(true);
      setSessionMinutes(1);
      if (result.newStreak) setStreak(result.newStreak);
      setStatusMessage(result.message);
      Alert.alert('Attendance Marked', result.message);
    } else {
      Alert.alert('Check-In Failed', result.message);
    }
  };

  const handleCheckOut = () => {
    if (!user) return;
    const res = processCheckOut(user.id);
    setIsCheckedIn(false);
    setStatusMessage(null);
    Alert.alert(
      'Session Finished & Checked Out',
      `Great workout, ${user.fullName.split(' ')[0]}! You trained for ${sessionMinutes} minutes today.\n15-day streak recorded 🔥`
    );
  };

  const isActiveMembership = membership?.status === 'active';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="GYM CHECK-IN" subtitle="Dynamic Rotating QR & Geofenced Attendance" />
      <QuickRoleSwitcher />

      {/* Mode Switcher */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('scan_camera')}
          style={[
            styles.tabBtn,
            activeTab === 'scan_camera' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'scan_camera'
                    ? theme.colors.primaryContrast
                    : theme.colors.textSecondary,
                fontWeight: activeTab === 'scan_camera' ? '700' : '500',
              },
            ]}
          >
            📷 Scan Gym Desk QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('show_pass')}
          style={[
            styles.tabBtn,
            activeTab === 'show_pass' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'show_pass'
                    ? theme.colors.primaryContrast
                    : theme.colors.textSecondary,
                fontWeight: activeTab === 'show_pass' ? '700' : '500',
              },
            ]}
          >
            🪪 My Dynamic Pass
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Active Session Card (If currently in gym) */}
        {isCheckedIn && (
          <Card elevated style={[styles.activeSessionCard, { borderColor: theme.colors.primary, borderWidth: 1.5 }]}>
            <View style={styles.activeTopRow}>
              <View style={styles.pulseRow}>
                <View style={styles.greenPulseDot} />
                <Text style={[styles.activeStatusText, { color: theme.colors.primary }]}>
                  CURRENTLY ON GYM FLOOR
                </Text>
              </View>
              <Badge label="IN SESSION" variant="success" />
            </View>

            <View style={styles.sessionCounterRow}>
              <View>
                <Text style={[styles.sessionElapsed, { color: theme.colors.text }]}>
                  {sessionMinutes} <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>MINS</Text>
                </Text>
                <Text style={[styles.sessionStartSub, { color: theme.colors.textSecondary }]}>
                  Checked in today at {new Date(Date.now() - sessionMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <Button
                title="Check Out"
                variant="danger"
                size="sm"
                icon={<LogOut size={14} color="#FFF" />}
                onPress={handleCheckOut}
              />
            </View>
          </Card>
        )}

        {/* Tab 1: Camera Viewfinder Scanner Simulation */}
        {activeTab === 'scan_camera' ? (
          <Card elevated style={styles.cameraCard}>
            <View style={styles.scannerHeader}>
              <View>
                <Text style={[styles.scannerTitle, { color: theme.colors.text }]}>
                  Scan Reception Counter QR
                </Text>
                <Text style={[styles.scannerSub, { color: theme.colors.textSecondary }]}>
                  Point camera at the rotating code displayed at gym entrance
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/attendance/gym-display')}
                style={[styles.kioskLinkBtn, { borderColor: theme.colors.border }]}
              >
                <Tv size={14} color={theme.colors.primary} />
                <Text style={[styles.kioskLinkText, { color: theme.colors.primary }]}>
                  Kiosk Mode
                </Text>
              </TouchableOpacity>
            </View>

            {/* Viewfinder Graphic */}
            <View style={[styles.viewfinderBox, { backgroundColor: '#000000', borderColor: theme.colors.border }]}>
              <View style={[styles.targetFrame, { borderColor: theme.colors.primary }]}>
                <QrCode size={100} color="rgba(255,255,255,0.25)" />
                <View style={[styles.laserBeam, { backgroundColor: theme.colors.primary }]} />
              </View>
              <Text style={styles.viewfinderPrompt}>
                Align reception QR inside frame
              </Text>
            </View>

            {/* Geofence Status Pill */}
            <View style={[styles.geofenceBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
              <MapPin size={16} color={theme.colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.geofenceTitle, { color: theme.colors.text }]}>
                  Geofence: IronCore Andheri (Verified Within 50m)
                </Text>
                <Text style={[styles.geofenceSub, { color: theme.colors.textSecondary }]}>
                  Anti-fraud GPS verification active. Prevents remote scans.
                </Text>
              </View>
            </View>

            <Button
              title="Simulate Instant QR Scan"
              variant="primary"
              size="lg"
              icon={<Camera size={18} color={theme.colors.primaryContrast} />}
              onPress={handleSimulateCameraScan}
              style={{ marginTop: 14 }}
            />
          </Card>
        ) : (
          /* Tab 2: Member Personal Dynamic QR Pass */
          <Card elevated style={styles.passCard}>
            <View style={styles.passHeader}>
              <View>
                <Text style={[styles.passName, { color: theme.colors.text }]}>
                  {user?.fullName || 'Rajesh Kumar'}
                </Text>
                <Text style={[styles.passPlan, { color: theme.colors.textSecondary }]}>
                  {membership?.planName || '6 Months Gold'} • ID #{user?.id.slice(-6)}
                </Text>
              </View>
              <Badge
                label={isActiveMembership ? 'VALID PASS' : 'EXPIRED'}
                variant={isActiveMembership ? 'success' : 'danger'}
              />
            </View>

            {/* Dynamic White QR Box */}
            <View style={[styles.qrDisplayBox, { backgroundColor: '#FFFFFF', borderColor: theme.colors.border }]}>
              <QrCode size={190} color="#000000" />
              <View style={styles.tokenPill}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.tokenText}>{tokenData.token}</Text>
              </View>
            </View>

            {/* Rotating Timer */}
            <View style={styles.rotationRow}>
              <RefreshCw size={14} color={theme.colors.primary} />
              <Text style={[styles.rotationText, { color: theme.colors.textSecondary }]}>
                Anti-Screenshot security: Rotates in{' '}
                <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>
                  {tokenData.secondsRemaining}s
                </Text>
              </Text>
            </View>

            <Text style={[styles.passSubtext, { color: theme.colors.textSecondary }]}>
              Show this screen to the trainer or front desk staff scanner at entry.
            </Text>
          </Card>
        )}

        {/* Streak & Consistency Card */}
        <Card style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View style={styles.streakLeft}>
              <View style={[styles.fireBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Flame size={28} color="#F59E0B" fill="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.streakNum, { color: theme.colors.text }]}>
                  {streak} Days Streak 🔥
                </Text>
                <Text style={[styles.streakSub, { color: theme.colors.textSecondary }]}>
                  Personal Record: 24 Days • 84 Total Visits in 2026
                </Text>
              </View>
            </View>
          </View>

          {/* Monthly Attendance Matrix */}
          <Text style={[styles.matrixTitle, { color: theme.colors.textSecondary }]}>
            NOVEMBER 2026 ATTENDANCE HEATMAP
          </Text>
          <View style={styles.matrixGrid}>
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const attended = day <= streak;
              const isToday = day === 15;

              return (
                <View
                  key={day}
                  style={[
                    styles.matrixCell,
                    {
                      backgroundColor: attended
                        ? theme.colors.primary
                        : theme.colors.cardElevated,
                      borderColor: isToday ? theme.colors.text : theme.colors.border,
                      borderWidth: isToday ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: attended ? theme.colors.primaryContrast : theme.colors.textMuted,
                        fontWeight: attended ? '800' : '500',
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.matrixLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                Attended (15)
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border, borderWidth: 1 }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                Upcoming / Rest
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Staff Navigation Links */}
        <View style={styles.quickLinksRow}>
          <Button
            title="Live Floor Headcount (18)"
            variant="outline"
            size="sm"
            icon={<Tv size={14} color={theme.colors.primary} />}
            onPress={() => router.push('/attendance/live-board')}
            style={{ flex: 1, marginRight: 6 }}
          />
          <Button
            title="Absentees Follow-up (3)"
            variant="outline"
            size="sm"
            icon={<Clock size={14} color={theme.colors.primary} />}
            onPress={() => router.push('/attendance/absentees')}
            style={{ flex: 1, marginLeft: 6 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  activeSessionCard: {
    padding: 16,
    marginBottom: 12,
  },
  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sessionCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionElapsed: {
    fontSize: 28,
    fontWeight: '900',
  },
  sessionStartSub: {
    fontSize: 12,
    marginTop: 2,
  },
  cameraCard: {
    padding: 18,
    marginBottom: 14,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scannerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scannerSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  kioskLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  kioskLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewfinderBox: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  targetFrame: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  laserBeam: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  viewfinderPrompt: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
  },
  geofenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  geofenceTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  geofenceSub: {
    fontSize: 11,
    marginTop: 1,
  },
  passCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  passHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passName: {
    fontSize: 18,
    fontWeight: '800',
  },
  passPlan: {
    fontSize: 12,
    marginTop: 2,
  },
  qrDisplayBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 250,
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10,
  },
  tokenText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  rotationText: {
    fontSize: 12,
  },
  passSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  streakCard: {
    padding: 18,
    marginBottom: 14,
  },
  streakTop: {
    marginBottom: 14,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fireBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  streakSub: {
    fontSize: 12,
    marginTop: 2,
  },
  matrixTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  matrixCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 11,
  },
  matrixLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
  },
  quickLinksRow: {
    flexDirection: 'row',
  },
});
