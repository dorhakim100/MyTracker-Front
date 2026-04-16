import { useRef } from "react";
import { Haptics, ImpactStyle } from '@capacitor/haptics'

interface UseDragHapticsProps {
  itemHeight?: number
}

export function useDragHaptics({itemHeight = 18}: UseDragHapticsProps = {itemHeight: 18}) {
  const lastYRef = useRef<number | null>(null);
  const accRef = useRef(0);

  async function onPointerDown(e: React.PointerEvent) {
    await Haptics.impact({ style: ImpactStyle.Light })
    lastYRef.current = e.clientY;
    accRef.current = 0;
  }

  async function onPointerMove(e: React.PointerEvent) {
    if (lastYRef.current == null) return;

    const delta = Math.abs(e.clientY - lastYRef.current);
    lastYRef.current = e.clientY;
    accRef.current += delta;

    // every ~itemHeightpx, default 18px, give one tiny tick
    if (accRef.current >= itemHeight) {
      accRef.current = 0;
      await Haptics.impact({ style: ImpactStyle.Light })
    }
  }

  async function onPointerUp() {
    await Haptics.impact({ style: ImpactStyle.Light })
    lastYRef.current = null;
    accRef.current = 0;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}