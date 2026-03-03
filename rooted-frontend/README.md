# 🦷 DentalBot - React Native Mobile App

A production-grade React Native application that provides a mobile interface for the DentalBot AI study companion. Works seamlessly across Android, iOS, and Web platforms.

## ✨ Features

### Core Functionality
- **AI-Powered Chat**: Intelligent conversations with streaming responses
- **Document Analysis**: Search and reference multiple dental documents
- **PDF Viewer**: Built-in PDF viewer with page navigation
- **MCQ Practice**: Interactive multiple-choice questions with scoring
- **Citation Support**: Clickable citations that open relevant PDF pages
- **Conversation Memory**: Persistent chat history across sessions

### Platform Support
- 📱 **Android**: Native Android app with full functionality
- 🍎 **iOS**: Native iOS app with iOS-specific optimizations
- 🌐 **Web**: Progressive Web App (PWA) for web browsers
- 🔄 **Cross-Platform**: Single codebase for all platforms

### AI Features
- 🤖 **Smart Document Selection**: AI chooses relevant documents automatically
- 📄 **Multi-Document Search**: Searches across multiple dental textbooks
- 🎯 **Adaptive Responses**: Tailors answers based on learning context
- 📝 **Practice Questions**: Generates MCQs from document content
- 💭 **Context Awareness**: Remembers conversation history

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or later)
2. **Expo CLI**: `npm install -g @expo/cli`
3. **Backend Server**: Ensure the DentalBot FastAPI server is running

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   npx expo install --fix  # Fix any compatibility issues
   ```

2. **Configure API Endpoint**
   Edit `services/api.js` and update the `API_BASE_URL`:
   ```javascript
   const API_BASE_URL = 'http://your-server-ip:8000'; // Change this to your actual API URL
   ```

3. **Start the Backend Server**
   First, make sure your DentalBot FastAPI server is running:
   ```bash
   python web_chatbot_auto.py
   ```

4. **Test the Setup (Optional)**
   ```bash
   node test_app.js  # Verify API connectivity
   ```

5. **Start the React Native App**
   ```bash
   # For web development
   npm run web

   # For Android emulator/device
   npm run android

   # For iOS simulator (macOS only)
   npm run ios

   # For all platforms (opens Expo DevTools)
   npm start
   ```

### Backend Setup

Ensure your DentalBot FastAPI server is running:

```bash
cd /path/to/your/backend
python web_chatbot_auto.py
```

The server should be accessible at `http://localhost:8000` (or your configured host/port).

## 📱 Platform-Specific Setup

### Android
1. Install Android Studio and Android SDK
2. Set up Android emulator or connect physical device
3. Run `npm run android`

### iOS (macOS only)
1. Install Xcode
2. Run `npm run ios`
3. iOS Simulator will launch automatically

### Web
1. Run `npm run web`
2. Open browser at the provided URL
3. Works as a Progressive Web App (PWA)

## 🏗️ Project Structure

```
dentalbot-mobile/
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── assets/               # App icons and images
├── components/           # Reusable UI components
│   ├── MessageBubble.js  # Chat message component
│   ├── DocumentBadge.js  # Document reference badges
│   └── MCQContainer.js   # MCQ quiz component
├── screens/              # Main screen components
│   ├── ChatScreen.js     # Main chat interface
│   └── PDFViewerScreen.js # PDF document viewer
├── services/             # API and external services
│   └── api.js           # FastAPI backend communication
├── types/                # TypeScript-like type definitions
│   └── index.js         # Constants and enums
└── utils/                # Utilities and helpers
    ├── styles.js        # Responsive styling system
    └── theme.js         # App theme configuration
```

## 🎨 Customization

### Styling
The app uses a comprehensive styling system in `utils/styles.js` with:
- **Responsive scaling** for different screen sizes
- **Platform-specific adjustments**
- **Theme support** via `utils/theme.js`

### API Configuration
Modify `services/api.js` to:
- Change API endpoints
- Add authentication headers
- Configure retry logic
- Add offline support

### Assets
Replace placeholder assets in `assets/`:
- `icon.png`: App icon (1024x1024)
- `splash.png`: Splash screen image
- `adaptive-icon.png`: Android adaptive icon
- `favicon.png`: Web favicon

## 🔧 Development

### Adding New Features

1. **New Components**: Add to `components/` directory
2. **New Screens**: Add to `screens/` directory with navigation
3. **API Calls**: Extend `services/api.js`
4. **Styling**: Update `utils/styles.js`

### Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Type checking (when TypeScript is added)
npm run type-check
```

### Building for Production

```bash
# Build for production
expo build:android
expo build:ios

# Create web build
expo export --platform web
```

## 📚 API Integration

The app communicates with the DentalBot FastAPI backend:

### Endpoints Used
- `POST /chat` - Streaming chat with AI analysis
- `GET /pdf/{doc_index}` - PDF document serving
- `POST /submit_mcq` - MCQ answer submission
- `GET /health` - Health check

### Data Flow
1. **User Input** → ChatScreen → API Service
2. **AI Analysis** → Document selection and chunking
3. **Streaming Response** → Real-time message updates
4. **Citation Clicks** → PDF Viewer navigation

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check backend server is running
   - Verify API_BASE_URL in `services/api.js`
   - Ensure network connectivity

2. **PDF Not Loading**
   - Check document exists on server
   - Verify PDF permissions
   - Try different PDF viewer

3. **Build Errors**
   - Clear Expo cache: `expo r -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check Expo CLI version

4. **Styling Issues**
   - Restart Metro bundler
   - Clear app data on device
   - Check responsive scaling calculations

### Debug Mode

Enable debug logging in `services/api.js`:
```javascript
console.log('API Response:', response);
console.log('Error:', error);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📄 License

This project is part of the DentalBot system. See backend repository for license information.

## 🙏 Acknowledgments

- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- UI components from [React Native Paper](https://reactnativepaper.com/)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- PDF viewing with [React Native WebView](https://github.com/react-native-webview/react-native-webview)

---

**🦷 Happy studying with DentalBot!**
