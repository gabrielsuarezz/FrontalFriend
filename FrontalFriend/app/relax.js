import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { MEDIA_CATEGORIES, AUDIO_TRACKS, THEME_COLORS } from '../constants/media';
import { resolveRemoteUri } from '../constants/mediaUtils';

const { width, height } = Dimensions.get('window');

export default function RelaxScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(MEDIA_CATEGORIES[0]);
  const [selectedVideo, setSelectedVideo] = useState(MEDIA_CATEGORIES[0].videos[0]);
  const [selectedAudio, setSelectedAudio] = useState(
    AUDIO_TRACKS.find(track => track.category === MEDIA_CATEGORIES[0].id) || AUDIO_TRACKS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUri, setVideoUri] = useState(MEDIA_CATEGORIES[0].videos[0].uri);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [audioUri, setAudioUri] = useState(
    AUDIO_TRACKS.find(track => track.category === MEDIA_CATEGORIES[0].id)?.uri || AUDIO_TRACKS[0].uri
  );
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  const availableAudioTracks = AUDIO_TRACKS.filter(
    track => track.category === selectedCategory.id
  );

  const videoPlayer = useVideoPlayer(MEDIA_CATEGORIES[0].videos[0].uri, (player) => {
    player.loop = true;
    player.muted = true;
  });

  const audioPlayer = useAudioPlayer(
    AUDIO_TRACKS.find(track => track.category === MEDIA_CATEGORIES[0].id)?.uri || AUDIO_TRACKS[0].uri
  );

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.error('Error configuring audio mode:', error);
      }
    };

    configureAudio();
  }, []);

  useEffect(() => {
    if (audioPlayer) {
      audioPlayer.loop = true;
      audioPlayer.volume = 1.0;
    }
  }, [audioPlayer]);

  useEffect(() => {
    return () => {
      try {
        if (videoPlayer && typeof videoPlayer.pause === 'function') {
          videoPlayer.pause();
        }
      } catch (error) {
        // Silently ignore cleanup errors
      }

      try {
        if (audioPlayer && typeof audioPlayer.pause === 'function') {
          audioPlayer.pause();
        }
      } catch (error) {
        // Silently ignore cleanup errors
      }
    };
  }, [videoPlayer, audioPlayer]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setIsPlaying(false);

      try {
        const resolved = await resolveRemoteUri(selectedVideo.uri, { timeout: 3000, fallback: null });
        if (!mounted) return;

        if (resolved) {
          setVideoUri(resolved);
          setVideoUnavailable(false);

          if (videoPlayer) {
            try {
              videoPlayer.replace(resolved);
            } catch (err) {
              console.error('Error replacing video source:', err);
              setVideoUnavailable(true);
            }
          }
        } else {
          setVideoUri(null);
          setVideoUnavailable(true);
        }
      } catch (e) {
        console.error('Error resolving video URI:', e);
        if (mounted) {
          setVideoUri(null);
          setVideoUnavailable(true);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedVideo, videoPlayer]);

  useEffect(() => {
    if (isPlaying && !videoUnavailable && videoPlayer) {
      videoPlayer.play();
    } else if (videoPlayer) {
      videoPlayer.pause();
    }
  }, [isPlaying, videoPlayer, videoUnavailable]);

  useEffect(() => {
    const controlAudio = async () => {
      if (isPlaying && audioPlayer) {
        try {
          await audioPlayer.play();
          console.log('Audio playing:', selectedAudio.title);
        } catch (err) {
          console.error('Error playing audio:', err);
        }
      } else if (audioPlayer) {
        try {
          await audioPlayer.pause();
        } catch (err) {
          console.error('Error pausing audio:', err);
        }
      }
    };

    controlAudio();
  }, [isPlaying, audioPlayer, selectedAudio.title]);

  useEffect(() => {
    let mounted = true;

    const changeAudio = async () => {
      if (!selectedAudio) return;

      setIsPlaying(false);

      try {
        console.log('Loading audio:', selectedAudio.title, selectedAudio.uri);

        if (!mounted) return;

        setAudioUri(selectedAudio.uri);
        setAudioUnavailable(false);

        if (audioPlayer) {
          try {
            await audioPlayer.pause();
            audioPlayer.replace(selectedAudio.uri);
            console.log('Audio source changed to:', selectedAudio.title);
          } catch (err) {
            console.error('Error replacing audio source:', err, selectedAudio.uri);
            setAudioUnavailable(true);
          }
        }
      } catch (err) {
        console.error('Error loading audio:', err);
        if (mounted) {
          setAudioUri(null);
          setAudioUnavailable(true);
        }
      }
    };

    changeAudio();

    return () => {
      mounted = false;
    };
  }, [selectedAudio, audioPlayer]);

  const handlePlayPause = () => {
    if (videoUnavailable || audioUnavailable) {
      console.warn('Cannot play: Video or audio unavailable');
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoChange = (video) => {
    setSelectedVideo(video);
  };

  const handleAudioChange = (audio) => {
    setSelectedAudio(audio);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category.videos.length > 0) {
      handleVideoChange(category.videos[0]);
    }
    const categoryAudio = AUDIO_TRACKS.find(track => track.category === category.id);
    if (categoryAudio) {
      handleAudioChange(categoryAudio);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {videoUri && !videoUnavailable ? (
          <VideoView
            player={videoPlayer}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <View style={[styles.video, styles.videoPlaceholder]}>
            <Text style={styles.placeholderText}>
              Scene unavailable. Try a different scene.
            </Text>
          </View>
        )}
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Calm Space</Text>
            <View style={styles.placeholder} />
          </View>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.buttonRow}>
              {MEDIA_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory.id === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategoryChange(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory.id === category.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scene</Text>
            <View style={styles.buttonRow}>
              {selectedCategory.videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={[
                    styles.optionButton,
                    selectedVideo.id === video.id && styles.optionButtonActive,
                  ]}
                  onPress={() => handleVideoChange(video)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedVideo.id === video.id && styles.optionButtonTextActive,
                    ]}
                  >
                    {video.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Music</Text>
              {audioUnavailable && (
                <Text style={styles.statusWarning}>Audio unavailable</Text>
              )}
            </View>
            <View style={styles.buttonRow}>
              {availableAudioTracks.map((audio) => (
                <TouchableOpacity
                  key={audio.id}
                  style={[
                    styles.optionButton,
                    selectedAudio.id === audio.id && styles.optionButtonActive,
                  ]}
                  onPress={() => handleAudioChange(audio)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedAudio.id === audio.id && styles.optionButtonTextActive,
                    ]}
                  >
                    {audio.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.playControlContainer}>
          {(videoUnavailable || audioUnavailable) && (
            <Text style={styles.unavailableText}>
              {videoUnavailable && audioUnavailable
                ? 'Video and audio unavailable. Try different selections.'
                : videoUnavailable
                ? 'Video unavailable. Try a different scene.'
                : 'Audio unavailable. Try a different track.'}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.playButton,
              (videoUnavailable || audioUnavailable) && styles.playButtonDisabled,
            ]}
            onPress={handlePlayPause}
            disabled={isLoading || videoUnavailable || audioUnavailable}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={THEME_COLORS.text.light} />
            ) : (
              <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  videoContainer: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  placeholderText: {
    color: THEME_COLORS.text.light,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: THEME_COLORS.text.light,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.text.light,
  },
  placeholder: {
    width: 60,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text.primary,
  },
  statusWarning: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: THEME_COLORS.button.inactive,
  },
  categoryButtonActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text.secondary,
  },
  categoryButtonTextActive: {
    color: THEME_COLORS.text.light,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: THEME_COLORS.button.inactive,
  },
  optionButtonActive: {
    backgroundColor: THEME_COLORS.secondary,
    borderColor: THEME_COLORS.secondary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME_COLORS.text.secondary,
  },
  optionButtonTextActive: {
    color: THEME_COLORS.text.light,
  },
  playControlContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: THEME_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  unavailableText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  playButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  playButtonDisabled: {
    backgroundColor: THEME_COLORS.button.inactive,
    opacity: 0.5,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text.light,
  },
});
