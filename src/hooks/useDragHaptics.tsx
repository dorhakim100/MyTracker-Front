import { useRef } from "react";
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export function useDragHaptics() {
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

    // every ~18px of drag, give one tiny tick
    if (accRef.current >= 18) {
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