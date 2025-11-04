import React, { useState, useRef, useEffect } from 'react';
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
import { Video, Audio } from 'expo-av';
import { MEDIA_CATEGORIES, AUDIO_TRACKS, THEME_COLORS } from '../constants/media';

const { width, height } = Dimensions.get('window');

export default function RelaxScreen() {
  const router = useRouter();
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(MEDIA_CATEGORIES[0]);
  const [selectedVideo, setSelectedVideo] = useState(MEDIA_CATEGORIES[0].videos[0]);
  const [selectedAudio, setSelectedAudio] = useState(AUDIO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setupAudio();
    return () => {
      cleanupMedia();
    };
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const cleanupMedia = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.stopAsync();
        await videoRef.current.unloadAsync();
      }
      if (audioRef.current) {
        await audioRef.current.stopAsync();
        await audioRef.current.unloadAsync();
      }
    } catch (error) {
      console.error('Error cleaning up media:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      setIsLoading(true);
      if (isPlaying) {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
        if (audioRef.current) {
          await audioRef.current.pauseAsync();
        }
        setIsPlaying(false);
      } else {
        if (videoRef.current) {
          await videoRef.current.playAsync();
        }
        if (audioRef.current) {
          await audioRef.current.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoChange = async (video) => {
    try {
      setIsLoading(true);
      setSelectedVideo(video);
      if (videoRef.current) {
        await videoRef.current.stopAsync();
        await videoRef.current.unloadAsync();
      }
      if (isPlaying) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error changing video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioChange = async (audio) => {
    try {
      setIsLoading(true);
      setSelectedAudio(audio);
      if (audioRef.current) {
        await audioRef.current.stopAsync();
        await audioRef.current.unloadAsync();
      }
      if (isPlaying) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error changing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category.videos.length > 0) {
      handleVideoChange(category.videos[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: selectedVideo.uri }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          shouldPlay={isPlaying}
          isMuted
        />
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
            <Text style={styles.sectionTitle}>Music</Text>
            <View style={styles.buttonRow}>
              {AUDIO_TRACKS.map((audio) => (
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
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color={THEME_COLORS.text.light} />
            ) : (
              <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Audio
        ref={audioRef}
        source={{ uri: selectedAudio.uri }}
        isLooping
        shouldPlay={isPlaying}
      />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text.primary,
    marginBottom: 12,
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
  playButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text.light,
  },
});
