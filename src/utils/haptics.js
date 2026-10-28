import * as Haptics from 'expo-haptics';

// Fire-and-forget wrappers: a haptic is polish, never a reason for a
// screen to throw (devices without a taptic engine reject the promise).
const safe = (fn) => () => {
  try {
    Promise.resolve(fn()).catch(() => {});
  } catch {
    // ignore
  }
};

export const hapticTap = safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const hapticSelect = safe(() => Haptics.selectionAsync());
export const hapticSuccess = safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const hapticWarning = safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
