# CS385FZ Mobile Application Development
# English (Technical Summary)

## 1. Work Completed

### 1.1 Authentication (Password + FIDO/Passkey Dual-Mode)
- **[Feature]** Email/password registration
- **[Feature]** Email/password login
- **[Feature]** FIDO2 / Passkey (biometric / system credential) login
- **[Feature]** Session persistence (auto-restore on app relaunch)
- **[Feature]** Auth gating: AuthStack when signed-out, MainTabs when signed-in

### 1.2 Community Chat
- **[Feature]** Chat Home: quick entry, suggested prompts, session actions
- **[Feature]** Persona & Preferences: persona selection + tone/length/pacing/boundary
- **[Feature]** Chat History: list-detail, search, pin/unpin, create, delete, tags/updatedAt

---

## 2. Tech Stack & Libraries / APIs / Services

### 2.1 Core Runtime
- **[Expo]** `expo (~54.0.30)`
- **[React]** `react (19.1.0)`
- **[React Native]** `react-native (0.81.5)`
- **[Status Bar]** `expo-status-bar (~3.0.9)`

### 2.2 Navigation & Interaction Infrastructure
- **[Navigation Core]** `@react-navigation/native (^7.1.26)`
- **[Native Stack]** `@react-navigation/native-stack (^7.9.0)`
- **[Bottom Tabs]** `@react-navigation/bottom-tabs (^7.9.0)`
- **[Screens Optimization]** `react-native-screens (~4.16.0)`
- **[Safe Area]** `react-native-safe-area-context (~5.6.0)`
- **[Gestures]** `react-native-gesture-handler (~2.28.0)`

### 2.3 Persistence & Data Layer
- **[AsyncStorage]** `@react-native-async-storage/async-storage (2.2.0)`
- **[Local Utility]** `kv` wrapper (JSON encode/decode, simulated latency helpers)

### 2.4 Security / Authentication Standards
- **[Password Auth]** Email + Password
- **[FIDO2 / WebAuthn / Passkeys]** challenge-response flow, credential/publicKey storage, signature verification (co-exists with password)
- **[Token Session Model]** access token persisted locally + route guarding

### 2.5 UI Components (In-house)
- **[Layout]** `Screen` (SafeArea + Scroll)
- **[Containers]** `Card`
- **[Inputs]** `TextField`
- **[Buttons]** `PrimaryButton` (primary/ghost/danger)
- **[Theme]** `colors` theme tokens (card/border/text/etc.)

### 2.6 Tooling / Types
- **[TypeScript]** `typescript (~5.9.2)`
- **[React Types]** `@types/react (~19.1.0)`

---

## 3. Deliverables / Evidence
- **[Screens]** Login / Register / ChatHome / Persona / ChatHistory
- **[Navigation]** RootNavigator + AuthStack + MainTabs (Home/Healing/Chat)
- **[Service Layer]** Auth API layer (mock implementation, backend-ready)
- **[Storage]** AsyncStorage + `kv` wrapper for persisted app states

---

## 4. Plan for Next Steps

### 4.1 AI Chat
- **[Goal]** End-to-end AI chat loop: send → API → render → persist history
- **[Integration]** Persona preferences injected as system/prompt or request parameters

### 4.2 Mood Journal
- **[Goal]** Create entry + list view + basic trends/summary
- **[Data Fields]** mood score, tags, note, timestamp
