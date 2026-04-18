# SuperMarketApp

A modern, feature-rich Android application built with Kotlin and Firebase, designed to streamline your grocery shopping experience. Manage your shopping lists, track your purchase history, and discover products with ease.

## Features

- **Secure Authentication**: Full user authentication system powered by Firebase Auth (Sign In/Sign Up/Sign Out).
- **Product Catalog**: Browse a wide range of products with localized names, descriptions, and categories.
- **Wishlist**: Save your favorite items for later with a dedicated wishlist feature.
- **Dynamic Shopping List**: Create and manage an active shopping list with quantity tracking.
- **Shopping History**: Keep track of all your past purchases with detailed history logs.
- **Multi-language Support**: Native support for localized content (English and more).
- **Cloud Sync**: All your data is synced in real-time across devices using Google Cloud Firestore.

## Tech Stack

- **Language**: [Kotlin](https://kotlinlang.org/)
- **UI Framework**: Hybrid [Jetpack Compose](https://developer.android.com/compose) & XML Views (Material Design 3)
- **Backend**: [Firebase](https://firebase.google.com/)
  - Authentication
  - Cloud Firestore
- **Architecture**: MVVM (Model-View-ViewModel) with Repository Pattern
- **Dependency Management**: Gradle Kotlin DSL
- **Image Loading**: [Glide](https://github.com/bumptech/glide)

## Project Structure

```text
app/src/main/java/com/jason/supermarketapp/
├── data/
│   ├── entities/      # Data classes (Product, ShoppingList, etc.)
│   ├── firestore/     # Firestore management logic
│   └── repositories/  # Abstracted data access layer
├── ui/
│   ├── activities/    # Activity controllers
│   ├── theme/         # Compose theme definitions
│   └── viewmodels/    # Business logic for UI components
└── MainActivity.kt    # App entry point
```

## Getting Started

### Prerequisites

- Android Studio
- JDK 11+
- A Firebase project (for Firestore and Auth)

### Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/jkazakos/SuperMarketApp.git
   ```

2. **Setup Firebase**:
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
   - Add an Android app with the package name `com.jason.supermarketapp`.
   - Download the `google-services.json` file and place it in the `app/` directory.
   - Enable **Email/Password** authentication.
   - Initialize **Cloud Firestore** in test mode or with appropriate rules.

3. **Build and Run**:
   - Open the project in Android Studio.
   - Sync Gradle files.
   - Run the app on an emulator or physical device.
