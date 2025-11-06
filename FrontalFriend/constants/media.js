export const THEME_COLORS = {
  primary: '#4A90E2',
  secondary: '#7B68EE',
  background: '#F5F7FA',
  text: {
    primary: '#2C3E50',
    secondary: '#95A5A6',
    light: '#ECF0F1',
  },
  button: {
    active: '#4A90E2',
    inactive: '#BDC3C7',
  },
};

export const MEDIA_CATEGORIES = [
  {
    id: 'nature',
    label: 'Landscapes',
    videos: [
      {
        id: 'nature-1',
        title: 'Ocean Sunset',
        uri: 'https://archive.org/download/SunsetWavesWideShot/SunsetWavesWideH264.mp4',
      },
      {
        id: 'nature-2',
        title: 'Rain Forest',
        uri: 'https://archive.org/download/4-k-hoh-rain-forest-nature-relaxation-video/4K%2C%20Hoh%20Rain%20Forest%20-%20Nature%20Relaxation%20Video.mp4',
      },
      {
        id: 'nature-3',
        title: 'Autumn Forest',
        uri: 'https://archive.org/download/autumn-forest-relaxing-nature-video-and-river-sounds-no-music-1-hour/Autumn%20Forest%20-%20Relaxing%20Nature%20Video%20and%20River%20Sounds%20-%20NO%20MUSIC%20-%201%20hour.mp4',
      },
    ],
  },
  {
    id: 'calm',
    label: 'Calm',
    videos: [
      {
        id: 'calm-1',
        title: 'Ocean Waves',
        uri: 'https://archive.org/download/GorgeousOceanWavesWithBeautifulRelaxingMusic/GorgeousOceanWavesWithBeautifulRelaxingMusic.mp4',
      },
      {
        id: 'calm-2',
        title: 'Waterfalls',
        uri: 'https://archive.org/download/RiversAndWaterfalls/RiversAndWaterfallsAhVideofactory.mp4',
      },
    ],
  },
];

export const AUDIO_TRACKS = [
  {
    id: 'ocean-waves',
    title: 'Ocean Waves',
    category: 'nature',
    uri: 'https://archive.org/download/relaxingsounds/Waves%203%2010h%20Night%20Beach-Gentle%2C%20NO%20GULLS.mp3',
  },
  {
    id: 'rain-sounds',
    title: 'Gentle Rain',
    category: 'nature',
    uri: 'https://archive.org/download/relaxingsounds/Rain%204%20%28Med.-Light%29%2010h%20LowGentleThunder-Overcast%20Day.mp3',
  },
  {
    id: 'forest-birds',
    title: 'Forest Sounds',
    category: 'nature',
    uri: 'https://archive.org/download/relaxingsounds/Rainforest%205h%20Bubbling%20River%20Falls%28gentle%29%2CBirds%2CInsects%2CAnimals-Daytime%2CSouth%20America.mp3',
  },
  {
    id: 'deep-meditation',
    title: 'Deep Meditation',
    category: 'calm',
    uri: 'https://archive.org/download/va-deep-meditation-50-tracks-healing-sounds-of-nature-2016/Various%20Artists%20-%20Deep%20Meditation%2050%20Tracks%20Healing%20Sounds%20of%20Nature%20%282016%29/01.%20Rebirth%20Yoga%20Music%20Academy%20-%20Deep%20Meditation%20%28Morning%20Birds%2C%20Waterfall%29.mp3',
  },
  {
    id: 'inner-peace',
    title: 'Inner Peace',
    category: 'calm',
    uri: 'https://archive.org/download/va-deep-meditation-50-tracks-healing-sounds-of-nature-2016/Various%20Artists%20-%20Deep%20Meditation%2050%20Tracks%20Healing%20Sounds%20of%20Nature%20%282016%29/23.%20Om%20Meditation%20Music%20Academy%20-%20Inner%20Peace.mp3',
  },
  {
    id: 'peaceful-mind',
    title: 'Peaceful Mind',
    category: 'calm',
    uri: 'https://archive.org/download/va-deep-meditation-50-tracks-healing-sounds-of-nature-2016/Various%20Artists%20-%20Deep%20Meditation%2050%20Tracks%20Healing%20Sounds%20of%20Nature%20%282016%29/25.%20Serenity%20Music%20Relaxation%20-%20Peaceful%20Mind%20%28Soothing%20%26%20Calming%20Music%29.mp3',
  },
];

// NOTE:
// Video URIs are hosted on Archive.org (Internet Archive) - public domain/freely available nature videos.
// Audio URIs are hosted on Archive.org (Internet Archive) - public domain/freely available audio files.
// These are runtime dependencies outside the app's control and may become unavailable.
// Callers should validate remote URIs and provide a local/static fallback (image or
// message) when the CDN is unreachable. See `constants/mediaUtils.js` for a
// small helper used by the Relax screen to sanity-check links and select a
// fallback path when an asset cannot be reached.
//
// Video Attribution:
// - Ocean Sunset: Beachfront Productions (CC BY 3.0)
// - Rain Forest, Autumn Forest: Nature Relaxation content
// - Ocean Waves, Waterfalls: Archive.org community uploads
// All audio: Archive.org public domain collections
