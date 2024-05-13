import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { AlertOptions, ConfirmOptions, Dialog } from '@capacitor/dialog';

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

export const showNativeConfirmDialog = async (options: ConfirmOptions) => {
  if (Capacitor.getPlatform() !== 'web') {
    return await Dialog.confirm(options)
  } else {
    return { value: confirm(options.message) }
  }
}
