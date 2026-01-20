# Zest 🍋

**Zest** (formerly Grocery Meal Helper) is a modern, efficient meal planning and grocery tracking application built with React Native and Expo. It helps users organize their weekly meals, generate automatic grocery lists, and track their adherence to meal plans.

## ✨ Features

- **Weekly Meal Planning**: Visualize and plan meals for the entire week.
- **Smart Grocery List**: Automatically aggregated grocery items based on your meal plan.
- **Execution Mode**: specialized view for "Today's Meals" to check off items as you go.
- **Stats & Insights**: Track your completion rates and consistency/adherence over time.
- **Notifications**: Local reminders for meal times.
- **Data Management**: JSON Import/Export for data backup and sharing.
- **Offline First**: All data is persisted locally (AsyncStorage).
- **Modern UI**: Polished, floating tab bar design with NativeWind (Tailwind CSS) styling.

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Persistence**: `@react-native-async-storage/async-storage`
- **Build Tooling**: Expo Prebuild / EAS Build

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or newer recommended)
- **JDK 17** (Required for Android builds)
- **Android Studio** (for Android Emulator) or **Xcode** (for iOS Simulator)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/zest.git
    cd zest
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Generate Native Directories (Prebuild)**
    Required for NativeWind and other native modules.
    ```bash
    npx expo prebuild
    ```

### Running the App

- **Start Metro Bundler**:
  ```bash
  npx expo start
  ```

- **Run on Android**:
  ```bash
  npm run android
  # or
  npx expo run:android
  ```

- **Run on iOS** (macOS only):
  ```bash
  npm run ios
  # or
  npx expo run:ios
  ```

## 📂 Project Structure

```
zest/
├── app/                 # Expo Router pages and layouts
│   ├── (tabs)/          # Main tab navigation
│   ├── +not-found.tsx   # 404 screen
│   └── _layout.tsx      # Root layout
├── components/          # Reusable UI components
├── store/               # Zustand state management
├── utils/               # Helper functions
├── assets/              # Images and fonts
├── global.css           # Tailwind/NativeWind styles
├── package.json         # Dependencies
└── app.json             # Expo config
```

## ⚠️ Common Issues

- **Android Build Failures**: Ensure you are using **Java 17**. Check by running `java -version`.
- **Metro Config**: If you see `toReversed is not a function`, this is patched in `metro.config.js` for older Node versions.

## 📄 License

This project is licensed under the MIT License.
