# ThinkB

ThinkB is an AI-powered mobile learning application that transforms user-provided study materials into interactive quizzes. The app focuses on automated knowledge reinforcement through daily quiz generation, reminders, and personalized study workflows, while maintaining a cost-efficient and scalable architecture.

---

## Application Overview

ThinkB enables users to:
- Upload or store study materials (PDFs or text)
- Automatically generate quizzes using AI models
- Receive daily quiz reminders via notifications
- Store and review quizzes locally
- Unlock premium features such as higher generation limits and advanced AI models

The system is designed to minimize infrastructure cost by prioritizing local processing and selectively using backend services only when required.

---

## Architecture Overview

ThinkB follows a **mobile-first, modular architecture** composed of three core layers:

---

### 1. Mobile Client (React Native / Expo)

- Built with **React Native and Expo**
- Handles UI rendering, navigation, and user interactions
- Performs **local PDF text extraction** using a WebView-based parser
- Stores quizzes, settings, and study materials using **AsyncStorage**
- Schedules and triggers **local notifications** for daily quiz reminders
- Manages subscription and entitlement state using **RevenueCat**

This design allows the application to remain responsive and functional even with limited network connectivity.

---

### 2. AI & Quiz Generation Layer

ThinkB supports multiple AI backends depending on user tier:

- **Self-hosted Local LLM**
  - Quantized LLaMA-based models deployed on a Linux VPS
  - Used for cost-efficient quiz generation for standard users

- **Cloud-based LLM (OpenAI API)**
  - Used for advanced and premium tiers
  - Supports higher-quality generation and larger context windows

The quiz generation pipeline includes:
- Text preprocessing and normalization
- Prompt-driven quiz generation
- Robust parsing logic to handle inconsistent AI output formats
- Conversion into structured quiz objects for display and storage

---

### 3. Backend & Middleware Services

- Lightweight **Node.js middleware server**
- Acts as a gateway between the mobile client and AI models
- Enforces **rate limiting and daily quotas** by user tier
- Uses **Redis** for request tracking
- Routes requests to different AI backends (standard, advanced, pro)

This layer ensures scalability, abuse prevention, and flexible model routing without increasing mobile client complexity.

---

## Data Flow

1. User uploads or selects study material
2. Text is extracted locally on the device
3. A quiz generation request is sent to the middleware server
4. The appropriate AI model generates quiz content
5. The response is parsed and structured
6. Quizzes are stored locally and scheduled for reminders

---

## Design Principles

- **Cost Efficiency** – Prefer local processing and self-hosted models
- **Offline-First** – Core features work without constant connectivity
- **Scalability** – Modular backend with tier-based routing
- **Privacy-Focused** – Study materials remain local unless processed by AI
- **Extensibility** – Easily supports new models, quiz formats, and study modes

---

## Use Cases

- Students preparing for exams
- Self-learners building consistent study habits
- Users seeking automated, AI-driven revision without manual quiz creation

---

## Project Status

ThinkB is actively developed and deployed, with ongoing improvements to:
- Quiz generation quality and parsing reliability
- Background quiz generation workflows
- Notification intelligence
- Model efficiency and cost optimization
