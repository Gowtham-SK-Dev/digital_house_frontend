# Digital House - React Native Frontend

Mobile app for Digital House - Community-based Social Networking Platform

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── navigation/      # Navigation setup and stacks
├── screens/         # Screen components
├── services/        # API, Socket, Storage services
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── config/          # Configuration files
├── assets/          # Images, fonts, etc.
└── App.tsx          # Root app component
```

## Services

- **API Service**: Backend communication with axios interceptors
- **Socket Service**: Real-time messaging and notifications
- **Storage Service**: Local data persistence with AsyncStorage

## State Management

Zustand stores for:
- Authentication
- Feed/Posts
- Chat/Messages

## Features

- OTP-based email authentication
- Real-time messaging with Socket.io
- Feed/Post creation and interaction
- User profiles and follow system
- Push notifications
- Image upload support

## Environment Variables

See `.env.example` for all required environment variables.

## Dependencies

- React Native 0.72+
- React Navigation 6+
- Socket.io Client 4+
- Zustand for state management
- Axios for API calls
- AsyncStorage for persistence
