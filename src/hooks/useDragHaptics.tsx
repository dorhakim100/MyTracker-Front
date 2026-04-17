import { useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { capacitorService } from "../services/capacitor.service";

interface UseDragHapticsProps {
  itemHeight?: number
  style?: 'Light' | 'Medium' | 'Heavy'
}

export function useDragHaptics({itemHeight = 18, style = 'Light'}: UseDragHapticsProps = {itemHeight: 18, style: 'Light'}) {
  const lastYRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const isNative = Capacitor.isNativePlatform();

  async function onPointerDown(e: React.PointerEvent) {
    if(!isNative) return;
    capacitorService.vibrate(style)
    lastYRef.current = e.clientY;
    accRef.current = 0;
  }

  async function onPointerMove(e: React.PointerEvent) {
    if(!isNative) return;
    if (lastYRef.current == null) return;

    const delta = Math.abs(e.clientY - lastYRef.current);
    lastYRef.current = e.clientY;
    accRef.current += delta;

    // every ~itemHeightpx, default 18px, give one tiny tick
    if (accRef.current >= itemHeight) {
      accRef.current = 0;
      capacitorService.vibrate(style)
    }
  }

  async function onPointerUp() {
    if(!isNative) return;
    capacitorService.vibrate(style)
    lastYRef.current = null;
    accRef.current = 0;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}