# PKN Portal - Agent Guide & Guardrails

This document serves as the primary instruction set and guardrails for any AI agent (Antigravity) working on the PKN Portal React Native / Expo application. 

---

## 🛡️ Core Guardrails

### 1. No "Hacks" - Consult First
- **Policy**: Avoid non-standard workarounds, hidden dependencies, or complex "clever" logic that deviates from the project's architecture.
- **Action**: If a task seems to require a "hack" or a significant departure from the established patterns (Read Native, Write Hybrid), **stop and consult the user/manual first**. Explain why the standard way isn't working and propose the alternative for approval.

### 2. Use Native Elements
- **Policy**: Prioritize React Native's standard components and Expo's high-performance modules over custom-built or web-like implementations.
- **Action**: Use `@shopify/flash-list` for lists, `expo-image` for images, and standard Layout components (`View`, `Text`, `Pressable`). Avoid using `WebView` for features that can be implemented natively (refer to the `UX Flow Guide`).

### 3. Project-Specific Technical Guardrails (Critical)
- **Authentication**: Keep mobile (Sanctum tokens) and web (Cookies) separate. Never attempt to copy browser cookies into the app. Use the magic-link bridge for WebView access.
- **Identity**: The primary login field is `phone_number`, not email. Ensure UI/API assumptions reflect this.
- **Asset URLs**: Always use **Absolute URLs** for images, logos, and files. React Native cannot resolve relative storage paths.
- **WebView Lifecycle**: Every WebView flow must have a defined exit pattern (Close -> Refresh Native Store -> Navigate). Never leave a user on a web confirmation page.
- **Performance**: Commit to `@shopify/flash-list` for all lists and `react-native-mmkv` for storage (aware of the custom dev client requirement).

### 4. User-Centric Empathy (Analyze First)
- **Policy**: Before writing a single line of code, analyze what the end-user prioritizes.
- **Questions to ask**:
    - Is this feature easily accessible?
    - Does it perform well on lower-end devices?
    - Is the status (loading, error, empty) clear to the user?
- **Action**: Start every task by outlining the user impact and prioritization.

### 4. Post-Task Reflection (Pitfalls & Edge Cases)
- **Policy**: After completing a task, perform a mandatory "Pitfall Analysis".
- **Action**: List at least 3 potential edge cases or pitfalls related to the change (e.g., offline behavior, deep-linking conflicts, token expiration).

---

## 🛠️ Technical Standards (Expo & React Native)

### Unit Testing (Jest)
Follow the [Official Expo Unit Testing Guide](https://docs.expo.dev/develop/unit-testing/):
- **Preset**: Use `jest-expo`.
- **Library**: Use `@testing-library/react-native` for component testing.
- **Command**: `npm test` or `npx jest --watchAll`.
- **Configuration**: Ensure `transformIgnorePatterns` is correctly set in `package.json` to transpile native modules.

### Reference Manuals
Always consult these live references when stuck or making architectural decisions:
- [Expo LLM Guide (Detailed)](https://docs.expo.dev/llms-full.txt)
- [Expo API Reference](https://docs.expo.dev/versions/latest/)
- [React Native Official Docs](https://reactnative.dev/docs/getting-started)

---

## 📂 Project Context (Internal Guides)
Refer to these local documents in `react native dev guide/`:
- `UX Flow Guide.md`: Defines visual and interaction patterns.
- `Critical Gotchas & Edge Cases.md`: History of solved and known issues.
- `Hybrid Architecture Briefing.md`: Explanation of the Native/WebView split.
- `FEATURE_ROADMAP.md`: The current implementation pulse.

---

## 📜 Devotion & Principles
- **Bismillah**: Always start with intention.
- **Alhamdulillah**: Always acknowledge completion.
- **Astagfirullah**: Admit and fix mistakes promptly.
- **Wallahualam**: Ask for guidance when uncertain.
- **MasyaAllah**: Appreciate quality work.
