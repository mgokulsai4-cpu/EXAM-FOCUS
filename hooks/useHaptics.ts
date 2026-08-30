import * as Haptics from 'expo-haptics';
import { useUI } from '@/context';

export function useHaptics() {
  const { hapticsEnabled } = useUI();

  const light = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const medium = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const heavy = () => {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const success = () => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const warning = () => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const error = () => {
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const selection = () => {
    if (hapticsEnabled) Haptics.selectionAsync();
  };

  return { light, medium, heavy, success, warning, error, selection };
}