export type PatternType = 'spiral' | 'fractal' | 'wave' | 'circles' | 'voronoi' | 'noise'

export interface DesignParams {
  pattern: PatternType
  seed: number
  iterations: number
  scale: number
  rotation: number
  strokeWidth: number
  opacity: number
  bgColor: string
  palette: string[]
  width: number
  height: number
}

export interface ColorTheme {
  id: string
  name: string
  colors: string[]
}

export interface ParamRange {
  min: number
  max: number
  step: number
  recommended?: { min: number; max: number }
  hint: string
}

export const PARAM_RANGES: Record<string, ParamRange> = {
  seed: { min: 0, max: 99999, step: 1, hint: '随机种子，控制图案随机性' },
  iterations: {
    min: 10, max: 1000, step: 10,
    recommended: { min: 50, max: 500 },
    hint: '过高会导致卡顿，过低图案不完整'
  },
  scale: {
    min: 0.1, max: 5, step: 0.1,
    recommended: { min: 0.3, max: 2.5 },
    hint: '控制图案大小，极端值可能导致图案溢出或不可见'
  },
  rotation: { min: 0, max: 360, step: 1, hint: '旋转角度' },
  strokeWidth: {
    min: 0.1, max: 10, step: 0.1,
    recommended: { min: 0.5, max: 4 },
    hint: '描边宽度，过粗可能导致图案糊成一片'
  },
  opacity: {
    min: 0.01, max: 1, step: 0.01,
    recommended: { min: 0.3, max: 0.95 },
    hint: '透明度，过低可能几乎不可见'
  },
  width: {
    min: 100, max: 4096, step: 1,
    recommended: { min: 400, max: 2000 },
    hint: '画布宽度，过大可能导致导出失败'
  },
  height: {
    min: 100, max: 4096, step: 1,
    recommended: { min: 400, max: 3000 },
    hint: '画布高度，过大可能导致导出失败'
  },
}

export const MAX_EXPORT_SIZE = 3000

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function isInRange(value: number, range: ParamRange): boolean {
  return value >= range.min && value <= range.max
}

export function isInRecommendedRange(value: number, range: ParamRange): boolean {
  if (!range.recommended) return true
  return value >= range.recommended.min && value <= range.recommended.max
}
