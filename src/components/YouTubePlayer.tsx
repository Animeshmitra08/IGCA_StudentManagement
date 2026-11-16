import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { radius } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { YOUTUBE_IFRAME_ALLOW, youtubeEmbedUrl } from '@/src/utils/youtube';

/**
 * YouTube refuses to play in an embed that sends no referrer ("error 153"). A web view
 * has none of its own, so the player page is given the app id as its https origin,
 * which is the form YouTube asks apps to use.
 */
const appId =
  Constants.expoConfig?.android?.package ?? Constants.expoConfig?.ios?.bundleIdentifier ?? 'app.local';
const ORIGIN = `https://${appId.toLowerCase()}`;

/** Links inside the player that lead to youtube.com itself (logo, title, channel). */
const LEAVES_PLAYER = /^https?:\/\/((www|m)\.)?(youtube\.com\/(watch|channel|c\/|@|results|shorts|playlist)|youtu\.be\/)/;

/** A YouTube video embedded in a 16:9 container. */
export function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const { colors } = useAppTheme();

  const html = `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; height: 100%; background: ${colors.scrim}; overflow: hidden; }
      iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="${youtubeEmbedUrl(videoId)}"
      title="YouTube video player"
      allow="${YOUTUBE_IFRAME_ALLOW}"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </body>
</html>`;

  return (
    <View style={[styles.frame, { backgroundColor: colors.scrim }]} accessibilityLabel={`Video: ${title}`}>
      <WebView
        source={{ html, baseUrl: ORIGIN }}
        originWhitelist={['*']}
        style={[styles.web, { backgroundColor: colors.scrim }]}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: colors.scrim }]}>
            <ActivityIndicator color={colors.inverseOnSurface} />
          </View>
        )}
        onShouldStartLoadWithRequest={(request) => {
          // Keep the player in place; YouTube's own pages open in the YouTube app or browser.
          if (LEAVES_PLAYER.test(request.url)) {
            Linking.openURL(request.url).catch(() => {});
            return false;
          }
          return true;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { aspectRatio: 16 / 9, borderRadius: radius.xl, overflow: 'hidden' },
  // Slightly under 1: an Android web view inside an animating screen can otherwise crash.
  web: { flex: 1, opacity: 0.99 },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
