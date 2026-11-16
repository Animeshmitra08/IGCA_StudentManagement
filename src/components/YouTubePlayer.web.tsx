import React from 'react';
import { StyleSheet, View } from 'react-native';
import { radius } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { YOUTUBE_IFRAME_ALLOW, youtubeEmbedUrl } from '@/src/utils/youtube';

/** Web build of the player: the browser embeds the iframe directly. */
export function YouTubePlayer({ videoId, title }: { videoId: string; title: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.frame, { backgroundColor: colors.scrim }]}>
      {React.createElement('iframe', {
        src: youtubeEmbedUrl(videoId),
        title,
        allow: YOUTUBE_IFRAME_ALLOW,
        referrerPolicy: 'strict-origin-when-cross-origin',
        allowFullScreen: true,
        style: { width: '100%', height: '100%', border: 0 },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { aspectRatio: 16 / 9, borderRadius: radius.xl, overflow: 'hidden' },
});
