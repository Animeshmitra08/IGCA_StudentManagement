/** The 11-character video id from any common YouTube URL (watch, youtu.be, embed, shorts, live). */
export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

/** Address of the embeddable player for a video id. */
export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube.com/embed/${id}?playsinline=1&rel=0`;
}

/** Feature policy the YouTube player asks for on its iframe. */
export const YOUTUBE_IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
