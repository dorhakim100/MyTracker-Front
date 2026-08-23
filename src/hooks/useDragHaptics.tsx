import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { capacitorService } from "../services/capacitor.service";

interface UseDragHapticsProps {
  itemHeight?: number
  style?: 'Light' | 'Medium' | 'Heavy'
  value?: string | number
  getDragValue?: (deltaY: number) => string | number | null
}

export function useDragHaptics({itemHeight = 18, style = 'Light', value, getDragValue}: UseDragHapticsProps = {itemHeight: 18, style: 'Light'}) {
  const lastYRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const accRef = useRef(0);
  const lastValueRef = useRef(value);
  const isValueMode = value !== undefined;
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isValueMode || !isNative) return;
    if (lastValueRef.current === value) return;
    lastValueRef.current = value;
    capacitorService.vibrate(style);
  }, [value, isValueMode, style, isNative]);

  async function onPointerDown(e: React.PointerEvent) {
    lastYRef.current = e.clientY;
    startYRef.current = e.clientY;
    accRef.current = 0;
    if(isValueMode) return;
    if(!isNative) return;
    capacitorService.vibrate(style)
  }

  async function onPointerMove(e: React.PointerEvent) {
    if(!isNative) return;
    if (lastYRef.current == null) return;

    if (isValueMode) {
      if (!getDragValue || startYRef.current == null) return;
      const next = getDragValue(e.clientY - startYRef.current);
      if (next == null || next === lastValueRef.current) return;
      lastValueRef.current = next;
      capacitorService.vibrate(style);
      return;
    }

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
    lastYRef.current = null;
    startYRef.current = null;
    accRef.current = 0;
    if(isValueMode) return;
    if(!isNative) return;
    capacitorService.vibrate(style)
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
