// 按需 Tree-shake 仅打包全站实际使用的 14 个 Lucide 矢量图标（替代 347.63 KB 全量 vendor 脚本）
import {
  createIcons,
  ArrowRight,
  BookOpen,
  ClipboardCopy,
  FileText,
  ImageDown,
  Mail,
  Maximize2,
  PanelRightClose,
  Printer,
  RotateCcw,
  Sliders,
  Sparkles,
  Wand2,
  X
} from 'lucide';

export const USED_LUCIDE_ICONS = {
  ArrowRight,
  BookOpen,
  ClipboardCopy,
  FileText,
  ImageDown,
  Mail,
  Maximize2,
  PanelRightClose,
  Printer,
  RotateCcw,
  Sliders,
  Sparkles,
  Wand2,
  X
};

export function createLucideIcons(options = {}) {
  return createIcons({ icons: USED_LUCIDE_ICONS, ...options });
}

export const lucideLite = {
  createIcons: createLucideIcons,
  icons: USED_LUCIDE_ICONS
};

if (typeof window !== 'undefined') {
  window.lucide = lucideLite;
}

export default lucideLite;
