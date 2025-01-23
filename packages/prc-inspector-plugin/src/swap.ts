import { SWAP_KEY } from './const';
import { InspectorInstance } from './instance';

interface RenderData {
  instance: InspectorInstance;
  name?: string;
}

export interface DataSwap {
  renderPopoverContent(anchor: HTMLElement, data: RenderData, onClose?: () => void): void;
  destroyPopoverContent(anchor?: HTMLElement): void;
  sniffActive(handler: (isActive: boolean) => void): void;
  isActive(): boolean;
}

export function getDataSwap(): DataSwap {
  const swap = Reflect.get(window, SWAP_KEY) || {};
  return swap;
}