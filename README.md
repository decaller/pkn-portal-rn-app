# PKN Portal Mobile App 📱

Bismillah. Welcome to the official React Native companion for the **PKN Portal**. This app is designed to provide a high-performance, native mobile experience for members of the PKN (Perkumpulan Konsultan Nusantara) portal.

---

## 🏛️ Architecture: "Read Native, Write Hybrid"

Following a core UX strategy to maximize development speed without sacrificing performance:

- **Read-Heavy Surfaces (Native):** Dashboard, Event Lists, News, Notifications, Registration status, and Invoices.
- **Write-Heavy / Complex Logic (Hybrid):** Login, Event Registration, Profile Edits, and Organization Management are handled via an **authenticated WebView bridge** to the existing Laravel + Filament portal.

---

## 🚀 Technical Stack

- **Framework:** [Expo SDK 55](https://expo.dev) + [React Native](https://reactnative.dev)
- **Theming & UI:** [react-native-paper](https://reactnativepaper.com/) (Material 3) + [expo-blur](https://docs.expo.dev/versions/latest/sdk/blur-view/) (Glassmorphism).
- **Form Validation:** `react-hook-form` + `zod` for strictly-typed, high-performance forms.
- **Micro-Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/).
- **Quality & CI/CD:** [EAS Build](https://expo.dev/eas) + GitHub Actions for automated, secret-safe cloud builds.
- **A11y:** `eslint-plugin-react-native-a11y` enforced accessibility auditing.

---

## 🗺️ Implementation Roadmap

A detailed breakdown of the development phases can be found in:
👉 [**FEATURE_ROADMAP.md**](./FEATURE_ROADMAP.md)

---

## 📚 Development Guides

We maintain a comprehensive internal developer guide:
- [PKN Portal AI Agent Context](./react%20native%20dev%20guide/PKN%20Portal%20AI%20Agent%20Context.md)
- [UX Flow Guide](./react%20native%20dev%20guide/UX%20Flow%20Guide.md)
- [API Specification](./react%20native%20dev%20guide/API%20Specification.md)
- [Performance Optimization](./react%20native%20dev%20guide/Performance%20Optimization%20(Simon%20Grimm).md)
- [React Native & Expo UI Tips](./react%20native%20dev%20guide/React%20Native%20&%20Expo%20UI%20Tips%20(Code%20with%20Beto).md)
- [Native Look and Feel Guide](./react%20native%20dev%20guide/Native%20Look%20and%20Feel%20Guide.md)
- [Internationalization (i18n) Guide](./react%20native%20dev%20guide/Internationalization%20(i18n)%20Guide.md)




---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file (if not already present) and set your API base URL:
```env
EXPO_PUBLIC_API_URL=https://your-portal-domain.com/api/v1
```

### 3. Start Development
```bash
npx expo start
```

---

## 📦 Build & Deployment

This project uses **EAS (Expo Application Services)** for cloud builds and updates.

- **Check Updates:** `eas update --branch production`
- **Build Android:** `eas build --platform android`
- **Build iOS:** `eas build --platform ios`

---

Alhamdulillah. Developed with ❤️ for PKN.
