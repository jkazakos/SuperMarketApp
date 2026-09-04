# SuperMarketApp (In Development)

A modern, cross-platform grocery shopping application built with **React Native**, **Expo (SDK 57)**, **TypeScript**, and **Firebase**, ported from Flutter with clean feature-first architecture.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (0.86) with [Expo](https://expo.dev/) (SDK 57)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing, Native Tabs & Native Stack)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with AsyncStorage persistence
- **Localization**: [i18next](https://www.i18next.com/) & `react-i18next` with `expo-localization`
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Auth & Cloud Firestore modular SDK)
- **Formatting**: [Prettier](https://prettier.io/)

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20 / 22)
- [npm](https://www.npmjs.com/) package manager

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run start
   ```

3. **Run on Android / iOS**:

   ```bash
   npm run android
   # or
   npm run ios
   ```

### Additional Commands

- `npm run format` - Format code with Prettier.
- `npm run build:apk` - Build release APK for Android (`cd android && ./gradlew assembleRelease`).
- `npm run build:apk-debug` - Build debug APK for Android.
- `npm run build:aab` - Build Android App Bundle (`cd android && ./gradlew bundleRelease`).
- `npm run android:clean` - Clean Android Gradle build cache.

## License

This project is licensed under the [MIT License](LICENSE).
