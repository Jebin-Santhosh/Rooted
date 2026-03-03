/**
 * PDFSidePanel Component
 * Displays PDF reference as a side panel overlay
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import designSystem from '../utils/designSystem';

const { colors, spacing, typography } = designSystem;

const PANEL_WIDTH_DESKTOP = 500;
const PANEL_WIDTH_MOBILE = Dimensions.get('window').width * 0.9;

export default function PDFSidePanel({
  isOpen,
  onClose,
  docIndex,
  pageNumber,
  title,
  url,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const isLargeScreen = Dimensions.get('window').width >= 1024;
  const panelWidth = isLargeScreen ? PANEL_WIDTH_DESKTOP : PANEL_WIDTH_MOBILE;

  if (!isOpen) return null;

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent);
    setIsLoading(false);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      <Text style={styles.loadingText}>Loading document...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={48} color={colors.error.main} />
      <Text style={styles.errorTitle}>Failed to load document</Text>
      <Text style={styles.errorText}>
        {error?.description || 'An error occurred while loading the PDF'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          setError(null);
          setIsLoading(true);
          if (webViewRef.current) {
            webViewRef.current.reload();
          }
        }}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPDFContent = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          src={url}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title={title}
          onLoad={handleLoadEnd}
          onError={() => setError({ description: 'Failed to load PDF' })}
        />
      );
    }

    return (
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowFileAccess={true}
        mixedContentMode="always"
        scalesPageToFit={true}
      />
    );
  };

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panel */}
      <View
        style={[
          styles.panel,
          { width: panelWidth, paddingTop: insets.top },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="description" size={20} color={colors.primary[500]} />
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Document'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        {/* Page indicator */}
        {pageNumber && (
          <View style={styles.pageIndicator}>
            <Text style={styles.pageText}>Page {pageNumber}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {isLoading && renderLoading()}
          {error ? renderError() : renderPDFContent()}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1999,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral[0],
    zIndex: 2000,
    ...Platform.select({
      web: {
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 20,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.neutral[800],
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
  pageIndicator: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  pageText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.error.main,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  retryButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[0],
  },
});
