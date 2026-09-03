# SuperMarketApp (In Development)

A modern, cross-platform grocery shopping application built with **React Native**, **Expo**, **TypeScript**, and **Firebase**, ported from Flutter with clean feature-first architecture.

## Features

- **Cross-Platform**: Runs natively on iOS and Android.
- **Modern Navigation**: Floating pill bottom navigation bar with real-time badges for cart items and wishlist count.
- **Real-Time Product Catalog**:
  - Live updates from Google Cloud Firestore.
  - Search by localized name.
  - Category filters and multiple sorting options (name, price, discount).
  - Sale badges, discount price calculation, and stock availability indicators.
- **Wishlist**: Quick toggle to save favorite products with cloud persistence.
- **Dynamic Shopping List (Cart)**:
  - Quantity controls with live total computation.
  - Out-of-stock validation.
- **Atomic Checkout**:
  - Validates and decrements product inventory using atomic Firestore transactions.
  - Generates immutable purchase history records with server timestamps.
- **Spending Dashboard**: Real-time weekly and monthly spending calculations on the user profile.
- **Theming**: Full Light and Dark mode support with persistent user preference.
- **Multi-Language (i18n)**: Instant in-app language switching between **English** and **Greek** powered by `i18next`.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 52)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with AsyncStorage persistence
- **Localization**: [i18next](https://www.i18next.com/) & `react-i18next` with `expo-localization`
- **Navigation**: [React Navigation 7](https://reactnavigation.org/) (Bottom Tabs + Native Stack)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Auth & Cloud Firestore modular SDK)
- **Formatting**: [Prettier](https://prettier.io/)

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 22)
- [npm](https://www.npmjs.com/) package manager

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run start
   ```

3. **Run on Android / iOS**:

   ```bash
   npm run android
   # or
   npm run ios
   ```
