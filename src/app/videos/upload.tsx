import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { VideoCategory, VideoAccessLevel } from '../../types/trainer';
import {
  ArrowLeft,
  Upload,
  Video,
  FileVideo,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';

export default function VideoUploadScreen() {
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('form_tutorial');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [accessLevel, setAccessLevel] = useState<VideoAccessLevel>('members_only');
  const [duration, setDuration] = useState('12');
  const [selectedFile, setSelectedFile] = useState<string | null>('bench_press_form_4k.mp4 (142 MB)');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectVideo = () => {
    setSelectedFile('deadlift_breakdown_1080p.mp4 (98 MB)');
    Alert.alert('Video Selected', 'File "deadlift_breakdown_1080p.mp4" (98 MB) staged for upload.');
  };

  const handleStartUpload = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a video title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate chunked resumable upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(100);
            setIsUploading(false);
            Alert.alert(
              'Video Published!',
              `'${title}' has been processed and published to the GymPulse Video Hub.`,
              [{ text: 'OK', onPress: () => safeGoBack('/videos') }]
            );
          }, 600);
          return 95;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="UPLOAD VIDEO" subtitle="Cloudflare Stream / Resumable Uploader" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/videos')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        {/* Video File Staging Card */}
        <Card elevated style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Video File & Source
          </Text>

          <TouchableOpacity
            onPress={handleSelectVideo}
            style={[styles.dropZone, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.primary }]}
          >
            <FileVideo size={36} color={theme.colors.primary} />
            <Text style={[styles.dropZoneTitle, { color: theme.colors.text }]}>
              {selectedFile || 'Select Video File (MP4, MOV up to 2GB)'}
            </Text>
            <Text style={[styles.dropZoneSub, { color: theme.colors.textSecondary }]}>
              Tap to browse device gallery or phone camera
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Video Details Form */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Video Metadata
          </Text>

          <Input
            label="Video Title"
            placeholder="e.g. Barbell Squat: Eliminating Butt Wink & Knee Collapse"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Description & Key Takeaways"
            placeholder="Explain form cues, sets/reps context, and mistakes to watch for..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ height: 75 }}
          />

          <Input
            label="Duration (Minutes)"
            placeholder="12"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          {/* Category Picker */}
          <Text style={[styles.formLabel, { color: theme.colors.textSecondary, marginTop: 8 }]}>
            Category
          </Text>
          <View style={styles.pillsRow}>
            {[
              { id: 'form_tutorial', label: '🏋️ Form Tutorial' },
              { id: 'mobility', label: '🧘 Mobility' },
              { id: 'strength', label: '💪 Strength' },
              { id: 'hiit', label: '🔥 HIIT' },
              { id: 'nutrition', label: '🥗 Nutrition' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id as any)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: category === cat.id ? theme.colors.primary : theme.colors.cardElevated,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: category === cat.id ? theme.colors.primaryContrast : theme.colors.text,
                      fontWeight: category === cat.id ? '700' : '500',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Access Level Picker */}
          <Text style={[styles.formLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
            Access & Monetization Level
          </Text>
          <View style={styles.pillsRow}>
            {[
              { id: 'free', label: '🌐 Free for All' },
              { id: 'members_only', label: '🪪 Active Members Only' },
              { id: 'premium_pt', label: '⭐ Premium PT Clients' },
            ].map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setAccessLevel(acc.id as any)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: accessLevel === acc.id ? theme.colors.primary : theme.colors.cardElevated,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    {
                      color: accessLevel === acc.id ? theme.colors.primaryContrast : theme.colors.text,
                      fontWeight: accessLevel === acc.id ? '700' : '500',
                    },
                  ]}
                >
                  {acc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Upload Progress Bar (if uploading) */}
        {isUploading && (
          <Card elevated style={styles.progressCard}>
            <View style={styles.progressTopRow}>
              <Text style={[styles.uploadingText, { color: theme.colors.text }]}>
                Uploading & Processing Chunks...
              </Text>
              <Text style={[styles.progressPct, { color: theme.colors.primary }]}>
                {uploadProgress}%
              </Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: theme.colors.cardElevated }]}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${uploadProgress}%`, backgroundColor: theme.colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressSub, { color: theme.colors.textSecondary }]}>
              Uploading in background via Cloudflare Stream. Adaptive HLS streaming will be ready in seconds.
            </Text>
          </Card>
        )}

        <Button
          title={isUploading ? `Uploading (${uploadProgress}%)...` : "Publish Video to Gym Hub"}
          variant="primary"
          size="lg"
          icon={<Upload size={18} color={theme.colors.primaryContrast} />}
          disabled={isUploading}
          loading={isUploading}
          onPress={handleStartUpload}
          style={{ marginTop: 14 }}
        />
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  dropZone: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dropZoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  dropZoneSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
  },
  progressCard: {
    padding: 16,
    marginBottom: 14,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressPct: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 11,
    marginTop: 6,
  },
});
