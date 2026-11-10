import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { initialVideos } from '../../services/trainerService';
import { WorkoutVideo, VideoCategory } from '../../types/trainer';
import {
  ArrowLeft,
  Play,
  Upload,
  Search,
  Clock,
  Eye,
  Lock,
  Sparkles,
  X,
  Share2,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';

export default function VideoLibraryScreen() {
  const { theme } = useTheme();
  const { role } = useAuthStore();
  const [videos, setVideos] = useState<WorkoutVideo[]>(initialVideos);
  const [selectedCategory, setSelectedCategory] = useState<'all' | VideoCategory>('all');
  const [search, setSearch] = useState('');
  const [activePlayingVideo, setActivePlayingVideo] = useState<WorkoutVideo | null>(null);

  const canUpload = role === 'trainer' || role === 'admin';

  const filteredVideos = videos.filter((v) => {
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePlayVideo = (video: WorkoutVideo) => {
    setActivePlayingVideo(video);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="VIDEO HUB" subtitle="Coach Tutorials, Mobility & HIIT Streams" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>

          {canUpload && (
            <Button
              title="+ Upload Video"
              size="sm"
              variant="primary"
              icon={<Upload size={14} color={theme.colors.primaryContrast} />}
              onPress={() => router.push('/videos/upload')}
            />
          )}
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
          ]}
        >
          <Search size={18} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search squat form, deadlift setup, mobility..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {[
            { id: 'all', label: 'All Videos' },
            { id: 'form_tutorial', label: '🏋️ Form Tutorials' },
            { id: 'mobility', label: '🧘 Mobility' },
            { id: 'strength', label: '💪 Strength' },
            { id: 'hiit', label: '🔥 HIIT Complex' },
            { id: 'nutrition', label: '🥗 Nutrition & Meal Prep' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id as any)}
              style={[
                styles.catPill,
                {
                  backgroundColor: selectedCategory === cat.id ? theme.colors.primary : theme.colors.cardElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.catPillText,
                  {
                    color: selectedCategory === cat.id ? theme.colors.primaryContrast : theme.colors.textSecondary,
                    fontWeight: selectedCategory === cat.id ? '700' : '500',
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Video Cards Grid */}
        <View style={styles.videoList}>
          {filteredVideos.map((vid) => (
            <Card key={vid.id} elevated style={styles.videoCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handlePlayVideo(vid)}
                style={styles.thumbnailWrapper}
              >
                <Image source={{ uri: vid.thumbnailUrl }} style={styles.thumbnailImg} />
                <View style={styles.playIconOverlay}>
                  <Play size={24} color="#000" fill="#000" />
                </View>

                <View style={styles.durationPill}>
                  <Clock size={11} color="#FFF" />
                  <Text style={styles.durationText}>{vid.durationMinutes} mins</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.videoContent}>
                <View style={styles.badgeRow}>
                  <Badge
                    label={vid.accessLevel === 'free' ? 'FREE' : vid.accessLevel === 'members_only' ? 'MEMBERS ONLY' : '⭐ PREMIUM PT'}
                    variant={vid.accessLevel === 'free' ? 'success' : vid.accessLevel === 'members_only' ? 'primary' : 'warning'}
                  />
                  <Badge label={vid.difficulty.toUpperCase()} variant="neutral" />
                </View>

                <Text style={[styles.videoTitle, { color: theme.colors.text }]}>
                  {vid.title}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[styles.videoDesc, { color: theme.colors.textSecondary }]}
                >
                  {vid.description}
                </Text>

                <View style={[styles.videoFooter, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.trainerName, { color: theme.colors.text }]}>
                    {vid.trainerName}
                  </Text>
                  <View style={styles.viewsRow}>
                    <Eye size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.viewsCount, { color: theme.colors.textSecondary }]}>
                      {vid.viewsCount} views
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Video Streaming Player Modal */}
      <Modal visible={!!activePlayingVideo} transparent animationType="slide">
        <View style={styles.playerOverlay}>
          <View style={[styles.playerContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.playerTopBar}>
              <Text numberOfLines={1} style={[styles.playingTitle, { color: theme.colors.text }]}>
                {activePlayingVideo?.title}
              </Text>
              <TouchableOpacity onPress={() => setActivePlayingVideo(null)}>
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Video Viewport Simulation */}
            <View style={styles.viewport}>
              <Image source={{ uri: activePlayingVideo?.thumbnailUrl }} style={styles.viewportImg} />
              <View style={styles.bigPlayOverlay}>
                <Play size={48} color="#CCFF00" fill="#CCFF00" />
              </View>
              <View style={styles.videoControls}>
                <Text style={styles.controlTime}>04:12 / {activePlayingVideo?.durationMinutes}:00</Text>
                <View style={styles.progressTrack}>
                  <View style={styles.progressFill} />
                </View>
              </View>
            </View>

            <View style={styles.playerInfo}>
              <Text style={[styles.playerDesc, { color: theme.colors.textSecondary }]}>
                {activePlayingVideo?.description}
              </Text>
              <Text style={[styles.playerCoach, { color: theme.colors.primary }]}>
                Instructor: {activePlayingVideo?.trainerName}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  catScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  catPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
  },
  videoList: {
    gap: 14,
  },
  videoCard: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  playIconOverlay: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#CCFF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoContent: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  videoDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  videoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  trainerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsCount: {
    fontSize: 11,
  },
  playerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  playerContainer: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  playerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  playingTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
  },
  viewport: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewportImg: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  bigPlayOverlay: {
    position: 'absolute',
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  controlTime: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '35%',
    backgroundColor: '#CCFF00',
  },
  playerInfo: {
    padding: 16,
  },
  playerDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  playerCoach: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
});
