import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { AlertOptions, Dialog } from '@capacitor/dialog';

export const haptic = (style: ImpactStyle) => {
  if (Capacitor.getPlatform() !== 'web') {
    Haptics.impact({ style });
  }
}

export const showNativeDialog = async (options: AlertOptions) => {
  if (Capacitor.getPlatform() !== 'web') {
    await Dialog.alert(options)
  } else {
    alert(options.message)
  }
}
