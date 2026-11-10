import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  generateRotatingQRToken,
  getLiveFloorMembers,
  GYM_LOCATION,
} from '../../services/attendanceService';
import {
  QrCode,
  RefreshCw,
  ShieldCheck,
  Users,
  Clock,
  ArrowLeft,
  Tv,
  CheckCircle2,
  Scan,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';

export default function GymReceptionDisplayScreen() {
  const { theme } = useTheme();
  const [tokenData, setTokenData] = useState(generateRotatingQRToken());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const liveMembers = getLiveFloorMembers();

  useEffect(() => {
    const timer = setInterval(() => {
      setTokenData(generateRotatingQRToken());
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="RECEPTION DISPLAY" subtitle="Entrance Tablet / Kiosk Rotating QR" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)/checkin')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.kioskPill}>
            <Tv size={14} color={theme.colors.primary} />
            <Text style={[styles.kioskText, { color: theme.colors.primary }]}>
              KIOSK / TV MODE ACTIVE
            </Text>
          </View>
        </View>

        {/* Main Tablet Display Card */}
        <Card elevated style={styles.kioskCard}>
          <View style={styles.kioskHeader}>
            <View>
              <Text style={[styles.gymName, { color: theme.colors.text }]}>
                IRONCORE FITNESS
              </Text>
              <Text style={[styles.gymLoc, { color: theme.colors.textSecondary }]}>
                {GYM_LOCATION.name}
              </Text>
            </View>
            <View style={styles.clockBox}>
              <Text style={[styles.clockTime, { color: theme.colors.primary }]}>
                {currentTime}
              </Text>
              <Badge label="LIVE HEADCOUNT: 18 / 60" variant="success" />
            </View>
          </View>

          {/* Giant Rotating QR Code */}
          <View style={[styles.giantQrBox, { backgroundColor: '#FFFFFF', borderColor: theme.colors.border }]}>
            <QrCode size={220} color="#000000" />
            <View style={styles.tokenFooter}>
              <ShieldCheck size={16} color="#059669" />
              <Text style={styles.tokenText}>{tokenData.token}</Text>
            </View>
          </View>

          {/* Rotation Progress & Notice */}
          <View style={styles.timerRow}>
            <RefreshCw size={18} color={theme.colors.primary} />
            <Text style={[styles.timerText, { color: theme.colors.text }]}>
              Anti-Screenshot Rotating QR: Code updates in{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 16 }}>
                {tokenData.secondsRemaining}s
              </Text>
            </Text>
          </View>

          <Text style={[styles.scanPrompt, { color: theme.colors.textSecondary }]}>
            Open the GymPulse app on your phone, tap the center Check-In button, and point camera here.
          </Text>

          {/* Quick Switch to Staff Scanner */}
          <View style={styles.staffActionRow}>
            <Button
              title="View Live Floor Roster (18)"
              variant="outline"
              size="sm"
              icon={<Users size={14} color={theme.colors.primary} />}
              onPress={() => router.push('/attendance/live-board')}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Absentees Follow-up (3)"
              variant="secondary"
              size="sm"
              icon={<Clock size={14} color={theme.colors.text} />}
              onPress={() => router.push('/attendance/absentees')}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </Card>

        {/* Live Entrance Feed */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Recent Entrance Check-ins (Floor Feed)
        </Text>

        {liveMembers.slice(0, 4).map((member) => (
          <Card key={member.id} style={styles.feedCard}>
            <View style={styles.feedLeft}>
              <View style={[styles.checkCircle, { backgroundColor: theme.colors.primaryGlow }]}>
                <CheckCircle2 size={18} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.feedName, { color: theme.colors.text }]}>
                  {member.name}
                </Text>
                <Text style={[styles.feedSub, { color: theme.colors.textSecondary }]}>
                  {member.plan} • Checked in {member.elapsedMinutes} mins ago
                </Text>
              </View>
            </View>

            <Badge
              label={member.method === 'qr_scan' ? '📱 Mobile QR' : '🪪 Desk Pass'}
              variant="neutral"
            />
          </Card>
        ))}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  kioskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.4)',
  },
  kioskText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kioskCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 16,
  },
  kioskHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  gymName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gymLoc: {
    fontSize: 12,
    marginTop: 2,
  },
  clockBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  clockTime: {
    fontSize: 18,
    fontWeight: '800',
  },
  giantQrBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    maxWidth: 290,
  },
  tokenFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  tokenText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scanPrompt: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    maxWidth: 320,
    lineHeight: 17,
  },
  staffActionRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  feedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
  },
  feedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedName: {
    fontSize: 15,
    fontWeight: '700',
  },
  feedSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
