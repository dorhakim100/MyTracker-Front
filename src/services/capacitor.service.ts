import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor } from "@capacitor/core";

const isNative = Capacitor.isNativePlatform();

type HapticsStyle = 'Light' | 'Medium' | 'Heavy' ;

export const capacitorService = {
    vibrate,

}


async function vibrate(style: HapticsStyle) {
    if (isNative) {
        await Haptics.impact({ style: ImpactStyle[style as keyof typeof ImpactStyle] })
    }
}