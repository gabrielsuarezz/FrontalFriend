# Destress/Calm Feature

## Overview
A relaxation feature that provides users with calming video backgrounds and soothing music to help reduce stress and anxiety.

## Features
- Video backgrounds: Ocean waves, forest streams, mountain sunsets, cats, and dogs
- Background music: Three calming ambient tracks
- Category selection: Switch between landscapes and animals
- Play/pause controls
- Continuous looping of both video and audio
- Clean, minimalist UI

## Technical Details

### Dependencies Added
- `expo-av: ~16.0.9` - For audio and video playback

### New Files
- `app/relax.js` - Main relaxation screen component
- `constants/media.js` - Media sources and theme colors configuration

### Media Sources
All videos and audio are sourced from Pixabay, which provides free, copyright-free media for use in projects.

- Videos: MP4 format
- Audio: MP3 format
- All media is streamed via CDN URLs

### Configuration
Theme colors and all media sources can be easily modified in `constants/media.js`:

```javascript
export const THEME_COLORS = {
  primary: '#4A90E2',      // Main accent color
  secondary: '#7B68EE',    // Secondary accent
  background: '#F5F7FA',   // Background color
  // ... more colors
};
```

### Usage
1. Install dependencies: `npm install` (from FrontalFriend directory)
2. Run app: `npm start`
3. Navigate to "Relax" section from home screen
4. Select category (Landscapes/Animals)
5. Choose video scene
6. Choose music track
7. Press Play to start

## Future Enhancements
- Add more video categories
- Add more music tracks
- Implement timer functionality
- Add breathing exercise overlay
- Save user preferences
- Offline mode with downloaded media

## Compatibility
Tested for:
- iOS devices
- Android devices
- Works with Expo SDK 54

## Notes
- Videos are muted; audio comes from separate music tracks
- Both video and audio loop continuously until stopped
- Media cleanup is handled automatically when leaving the screen
