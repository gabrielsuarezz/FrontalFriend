# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FrontalFriend is a mental health support mobile application built with React Native and Expo. The app provides AI-powered chat support, relaxation features, and wellness tools for users seeking emotional support and stress relief.

**Key Project Context:**
- Student project developed during INIT Build Mobile Development Fall 2025
- Open-source, small-scale educational project
- Team Lead: Eric T. Campillo

## Development Setup

### Working Directory
The main application code is in the `FrontalFriend/` subdirectory. Always run commands from `FrontalFriend/`:

```bash
cd FrontalFriend
```

### Essential Commands

**Install dependencies:**
```bash
npm install
```

**Start development server:**
```bash
npx expo start
# or
npm start
```

**Platform-specific development:**
```bash
npm run ios          # Launch iOS simulator
npm run android      # Launch Android emulator
npm run web          # Launch web version
```

**Linting:**
```bash
npm run lint
```

**Media validation (custom script):**
```bash
npm run check-media
```

### Environment Configuration

Create a `.env` file based on `.env.example`:
```
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
```

The Chat feature requires an OpenAI API key from https://platform.openai.com/api-keys

## Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router's file-based routing system. Routes are defined by the file structure in `app/`:

- `app/_layout.js` - Root layout configuration, defines navigation stack
- `app/index.js` - Home screen with navigation to all sections
- `app/chat.js` - Mental health chat feature with GPT-4 integration
- `app/relax.js` - Destress/calm feature with videos and music
- `app/reminders.js` - Placeholder for reminder features
- `app/physical-health.js` - Placeholder for physical wellness tracking

Navigation is handled via `expo-router`'s `useRouter()` hook:
```javascript
const router = useRouter();
router.push('/chat');  // Navigate to chat screen
router.back();         // Go back
```

### Feature Structure

**1. Chat Feature (AI Mental Health Companion)**
- Location: `app/chat.js`
- Dependencies: OpenAI SDK (`openai`)
- Architecture:
  - Maintains conversation history in state
  - System prompt defines AI personality and behavior
  - Uses GPT-4 model with temperature 0.7
  - Handles errors gracefully with user-friendly messages
  - Message format: `{ id, role, content, timestamp }`

**2. Relax/Destress Feature**
- Location: `app/relax.js`
- Dependencies: `expo-av` for audio/video playback
- Media Configuration: `constants/media.js`
- Architecture:
  - Uses `Video` component for background visuals
  - Uses `Audio.Sound` API for music playback (programmatic control)
  - Media sources are external CDN URLs (Pixabay)
  - Implements URI validation via `constants/mediaUtils.js`
  - Graceful fallback when CDN media is unavailable
  - Proper cleanup of media on component unmount
  - Refs: `videoRef` for video, `soundRef` for audio

**Media Validation Pattern:**
```javascript
import { resolveRemoteUri } from '../constants/mediaUtils';

// Validates URI and provides fallback
const resolved = await resolveRemoteUri(uri, { timeout: 3000, fallback: null });
if (resolved) {
  // Load media
} else {
  // Show fallback UI
}
```

### Constants and Configuration

**`constants/media.js`** - Centralized media and theme configuration:
- `THEME_COLORS` - Color scheme for the Relax feature (easily modifiable)
- `MEDIA_CATEGORIES` - Video content organized by category (Landscapes, Animals)
- `AUDIO_TRACKS` - Background music tracks
- All media URIs are hosted on Pixabay CDN

**`constants/mediaUtils.js`** - Media URI validation utility:
- `resolveRemoteUri()` - Performs HEAD request to check if remote media is accessible
- Used by Relax screen to detect broken CDN links
- Implements timeout and fallback mechanisms

**`constants/theme.ts`** - TypeScript theme constants (may be used by other features)

### Component Organization

Reusable components in `components/`:
- `external-link.tsx` - Link component
- `haptic-tab.tsx` - Tab with haptic feedback
- `hello-wave.tsx` - Animated wave component
- `parallax-scroll-view.tsx` - Parallax scrolling container
- `themed-text.tsx` - Text component with theme support
- `themed-view.tsx` - View component with theme support
- `components/ui/` - UI-specific components (collapsible, icon-symbol)

### State Management

This app uses React's built-in state management:
- `useState` for component-local state
- `useEffect` for side effects and cleanup
- `useRef` for media player references and mutable values
- No Redux or global state library

### Media Playback Architecture

**Video:**
- Controlled via `Video` component from `expo-av`
- Use `shouldPlay` prop to control playback state
- Set `isLooping={true}` for continuous playback
- Set `isMuted={true}` when using separate audio

**Audio:**
- Use `Audio.Sound.createAsync()` for programmatic control
- Store sound instance in a ref: `soundRef.current`
- Call `playAsync()`, `pauseAsync()`, `unloadAsync()` methods
- Always unload in cleanup to prevent memory leaks

**Critical Pattern:**
```javascript
useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
  };
}, []);
```

## Branch Strategy

**Important:** When working on new features:
1. Create a new feature branch from the most recent development branch (usually `chat-section`)
2. Use descriptive branch names: `feature/feature-name`
3. DO NOT commit directly to `main`
4. Features will be merged to `main` carefully by the team

**Active branches:**
- `main` - Production/stable code
- `chat-section` - Most developed feature branch
- `gaby` - Early development branch
- `feature/*` - Feature-specific branches

## Key Dependencies

**Core:**
- `expo` (~54.0.13) - React Native framework
- `expo-router` (~6.0.11) - File-based routing
- `react-native` (0.81.4)

**Features:**
- `openai` (^6.6.0) - GPT-4 integration for chat
- `expo-av` (~16.0.9) - Audio/video playback for relax feature

**Navigation:**
- `@react-navigation/native` (^7.1.8)
- `@react-navigation/bottom-tabs` (^7.4.0)

**Storage:**
- `@react-native-async-storage/async-storage` (^2.2.0)

## Code Style and Standards

### Attribution Policy
- No AI attribution in code comments
- No contributor attribution to Claude or AI tools
- Code should appear as if written by human developers

### No Emoji Policy
- Do NOT use emojis in code, comments, or commit messages
- Exception: The Chat feature's AI system prompt uses emojis as part of the conversational design

### TypeScript/JavaScript
- Project supports both `.ts`/`.tsx` and `.js`/`.jsx` files
- TypeScript is configured with `strict: true`
- Path alias `@/*` maps to project root
- Uses Expo's ESLint configuration

### Component Patterns
- Functional components with hooks
- StyleSheet API for styling (no CSS-in-JS libraries)
- Inline styles discouraged; use `StyleSheet.create()`

## Remote Media and CDN Dependencies

The Relax feature uses external CDN-hosted media (Pixabay). These are runtime dependencies outside the app's control.

**Best Practices:**
- Always validate remote URIs using `resolveRemoteUri()` before loading
- Provide fallback UI when media is unavailable
- Show user-friendly error messages
- Consider implementing local fallback assets for critical features

## Testing and Validation

Before committing changes to features using external media:
1. Test with network connectivity issues
2. Verify fallback UI displays correctly
3. Ensure proper media cleanup (check for memory leaks)
4. Test on both iOS and Android if possible

## Platform-Specific Considerations

**iOS:**
- Audio plays in silent mode: `playsInSilentModeIOS: true`
- Supports tablets: `"supportsTablet": true` in app.json

**Android:**
- Package: `com.anonymous.aihealthapp`
- Edge-to-edge enabled
- Predictive back gesture disabled

**Both:**
- Portrait orientation only
- Expo's new architecture enabled: `"newArchEnabled": true`

## Expo Configuration

Key settings in `app.json`:
- App slug: `FrontalFriend`
- Scheme: `frontalfriend://`
- Typed routes enabled (experimental)
- React compiler enabled (experimental)

## Common Pitfall: Git Configuration

This repository may not have git user configuration set. Before committing, ensure:
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

## Documentation

- `DESTRESS_FEATURE.md` - Detailed documentation for the Relax/Destress feature
- `README.md` - General project overview (mostly Expo boilerplate)
