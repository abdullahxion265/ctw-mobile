import { useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing } from '../theme/theme';
import { getImageUrl } from '../utils/imageUrl';
import { hapticSelect } from '../utils/haptics';
import ImagePlaceholder from './ImagePlaceholder';

/**
 * Swipeable photo strip for the product screen (web: ImageCarousel with
 * thumbnails). Swipe sideways or tap a thumbnail. One photo shows no
 * thumbnails; no photo shows the CTW placeholder; a photo that fails to
 * load falls back to the placeholder for that slide only.
 */
export default function PhotoGallery({ photos, width, height, label }) {
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState({});
  const count = photos.length;

  if (count === 0) return <ImagePlaceholder style={{ width, height }} />;

  const go = (i) => {
    hapticSelect();
    scroller.current?.scrollTo({ x: i * width, animated: true });
    setIndex(i);
  };

  return (
    <View style={{ width, height }}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        scrollEnabled={count > 1}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        accessibilityLabel={count > 1 ? `${label}, ${count} photos` : label}
      >
        {photos.map((path) => {
          const uri = getImageUrl(path);
          return (
            <View key={path} style={{ width, height }}>
              {broken[path] || !uri ? (
                <ImagePlaceholder style={{ width, height }} />
              ) : (
                <Image
                  source={{ uri }}
                  style={{ width, height }}
                  contentFit="cover"
                  transition={250}
                  cachePolicy="memory-disk"
                  onError={() => setBroken((b) => ({ ...b, [path]: true }))}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {count > 1 ? (
        <View style={styles.thumbs} pointerEvents="box-none">
          {photos.map((path, i) => {
            const uri = getImageUrl(path);
            const active = i === index;
            return (
              <TouchableOpacity
                key={path}
                style={[styles.thumb, active && styles.thumbActive]}
                onPress={() => go(i)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Show photo ${i + 1} of ${count}`}
                accessibilityState={{ selected: active }}
              >
                {uri && !broken[path] ? (
                  <Image source={{ uri }} style={styles.thumbImage} contentFit="cover" cachePolicy="memory-disk" />
                ) : (
                  <ImagePlaceholder style={styles.thumbImage} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  thumbs: { position: 'absolute', left: spacing.xl, bottom: 46, flexDirection: 'row', gap: spacing.sm },
  thumb: {
    width: 46,
    height: 58,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    opacity: 0.75,
  },
  thumbActive: { borderColor: colors.gold, opacity: 1 },
  thumbImage: { width: '100%', height: '100%' },
});
