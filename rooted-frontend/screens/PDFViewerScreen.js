import React, { useState, useRef } from 'react';
import {
  View,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

export default function PDFViewerScreen({ route, navigation }) {
  const { docIndex, pageNumber, title, url } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent);
    setIsLoading(false);
    console.error('WebView error: ', nativeEvent);
  };

  const handleShare = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
        return;
      }

      // For sharing, we could download the PDF first, but for now just share the URL
      await Sharing.shareAsync(url, {
        dialogTitle: `Share ${title}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
      console.error('Sharing error:', error);
    }
  };

  const injectJavaScript = () => {
    // Inject JavaScript to scroll to the specific page
    if (pageNumber && webViewRef.current) {
      const script = `
        // Try to scroll to the page
        setTimeout(() => {
          // This is a basic implementation - PDF.js or similar libraries would be better
          const pageElement = document.querySelector('[data-page-number="${pageNumber}"]') ||
                             document.getElementById('page${pageNumber}') ||
                             document.querySelector('.page[data-page="${pageNumber}"]');

          if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Fallback: try to find page by searching for page number text
            const elements = document.querySelectorAll('*');
            for (let element of elements) {
              if (element.textContent && element.textContent.includes('Page ${pageNumber}')) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
              }
            }
          }
        }, 2000); // Wait for PDF to load

        true; // Required for WebView to know the injection succeeded
      `;

      webViewRef.current.injectJavaScript(script);
    }
  };

  const renderLoading = () => (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      zIndex: 10,
    }}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={{ marginTop: 16, color: '#64748b' }}>
        Loading document...
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <Text style={{ fontSize: 18, color: '#ef4444', marginBottom: 16 }}>
        Failed to load document
      </Text>
      <Text style={{ textAlign: 'center', color: '#64748b', marginBottom: 20 }}>
        {error?.description || 'An error occurred while loading the PDF'}
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          setError(null);
          setIsLoading(true);
          // Reload WebView
          if (webViewRef.current) {
            webViewRef.current.reload();
          }
        }}
      >
        Try Again
      </Button>
    </View>
  );

  // For web platform, we can use a more direct approach
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#667eea',
        }}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            textColor="white"
          >
            ← Back
          </Button>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
            {title}
          </Text>
          <Button
            mode="text"
            onPress={handleShare}
            textColor="white"
          >
            Share
          </Button>
        </View>

        {error ? renderError() : (
          <iframe
            src={url}
            style={{
              flex: 1,
              width: '100%',
              border: 'none',
            }}
            title={title}
            onLoad={handleLoadEnd}
            onError={() => setError({ description: 'Failed to load PDF' })}
          />
        )}
      </SafeAreaView>
    );
  }

  // For mobile platforms, use WebView
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#667eea',
        paddingTop: Platform.OS === 'ios' ? 0 : 16,
      }}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          textColor="white"
        >
          ← Back
        </Button>
        <Text style={{
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
          flex: 1,
          textAlign: 'center',
          marginHorizontal: 16,
        }}>
          {title}
        </Text>
        <Button
          mode="text"
          onPress={handleShare}
          textColor="white"
        >
          Share
        </Button>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading && renderLoading()}

        {error ? renderError() : (
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={{ flex: 1 }}
            onLoadStart={handleLoadStart}
            onLoadEnd={() => {
              handleLoadEnd();
              // Inject JavaScript to scroll to page after PDF loads
              setTimeout(injectJavaScript, 3000);
            }}
            onError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={renderLoading}
            // Allow file access for PDFs
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            // Handle PDF viewing
            mixedContentMode="always"
            scalesPageToFit={true}
            bounces={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}






