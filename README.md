# ExamFocus

A mobile study tracking app helping students manage exams, focus sessions, and earn screen time rewards.

## 📱 Features

- **Onboarding Flow** - 5-step interactive introduction with animations
- **Authentication** - Login/Signup with mock backend & AsyncStorage
- **Splash Screen** - Animated gradient logo with progress loading bar
- **Focus Orb** - Animated circular progress with status & particles
- **Subject Tracking** - Color-coded subjects with progress rings
- **Mission Cards** - Goal tracking with XP rewards
- **Study Statistics** - Count-up animations for metrics
- **Progress Rings** - Circular progress indicators with gradients
- **Glassmorphism UI** - Blurred card designs with gradient glows
- **Animated Buttons** - Gradient/primary/secondary variants with haptics

## 🛠️ Tech Stack

- **Framework:** React Native with Expo (v57)
- **Navigation:** expo-router (file-based routing)
- **Styling:** Tailwind CSS v4, NativeWind
- **Animations:** react-native-reanimated
- **State Management:** React Context + AsyncStorage
- **Data:** Mock backend with JSON storage

## 📂 Project Structure

```
app/
  _layout.tsx        # Root navigation with (auth)/(app) stacks
  onboarding.tsx     # 5-step onboarding flow
  splash.tsx         # Animated launch screen
  (auth)/
    login.tsx        # Email/password login
    signup.tsx       # Name/email/password signup
  (app)/
    _layout.tsx      # Main tab navigation
    home.tsx         # Dashboard
    study.tsx        # Subject browser
    focus.tsx        # Focus mode
    rewards.tsx      # Reward system
    profile.tsx      # User profile & analytics

components/
  AnimatedButton.tsx # Animated gradient/primary buttons
  FocusOrb.tsx       # Circular progress with particles
  GlassCard.tsx      # Blurred card component
  MissionCard.tsx    # Goal tracking cards
  ProgressRing.tsx   # Circular progress rings
  StatCard.tsx       # Metric statistic cards
  SubjectCard.tsx    # Subject browser cards

context/
  Providers.tsx      # Auth + all context providers
  AIContext.tsx      # AI tutor context
  FocusContext.tsx   # Focus session context
  RewardsContext.tsx # Rewards/unlock context
  StudyContext.tsx   # Study data context
  UIContext.tsx      # UI state context

hooks/
  useAnimations.ts   # useFocusOrbAnimation, useCountUpAnimation, etc.
  useHaptics.ts      # Haptic feedback hooks
  useQueries.ts      # Query utilities
  useStorage.ts      # AsyncStorage wrapper hooks

types/
  index.ts           # 400+ lines of TypeScript interfaces
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Or web version
npx expo start --web
```

Available scripts:
- `npm start` - expo start
- `npm run android` - expo start --android
- `npm run ios` - expo start --ios
- `npm run web` - expo start --web

## 🌐 Local URLs

- **Expo Web:** `http://localhost:19002`
- **Metro Bundler:** `http://localhost:8081`
- **QR Code:** Scan with Expo Go app

## 📦 Build

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 🧩 Key Features Detail

### Onboarding (5 steps)
1. Track exams with countdown timers
2. Block distractions (Instagram, YouTube, Games)
3. AI tutor for explanations & quizzes
4. Game-like quizzes with timers & XP
5. Earn screen time as rewards

### Auth Screens
- Email/password validation
- Social login placeholders (Google, Apple)
- Mock backend with AsyncStorage persistence

### UI Components
- **GlassCard** - Frosted glass effect with blur
- **FocusOrb** - Animated circular progress with status
- **ProgressRing** - Gradient circular progress
- **StatCard** - Count-up animated statistics
- **SubjectCard** - Subject browser with progress
- **MissionCard** - Goal tracking with XP rewards

## 📚 Type Definitions

Comprehensive TypeScript interfaces covering:
- User profiles with XP, levels, streaks
- Exams, subjects, topics, topics progress
- Quiz sessions & questions
- Focus sessions & app blockers
- Rewards & achievements
- AI insights & messages
- Notifications & analytics data

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/foo`)
3. Commit changes (`git commit -m 'feat: add foo'`)
4. Push to branch (`git push origin feature/foo`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.