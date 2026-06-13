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
  safe?: { min: number; max: number }
  recommended?: { min: number; max: number }
  hint: string
}

export const PARAM_RANGES: Record<string, ParamRange> = {
  seed: { min: 0, max: 99999, step: 1, hint: '随机种子，控制图案随机性' },
  iterations: {
    min: 1, max: 2000, step: 10,
    safe: { min: 30, max: 800 },
    recommended: { min: 80, max: 400 },
    hint: '过高会导致严重卡顿，过低图案几乎看不见'
  },
  scale: {
    min: 0.01, max: 10, step: 0.1,
    safe: { min: 0.2, max: 3.5 },
    recommended: { min: 0.5, max: 2.0 },
    hint: '极端值会导致图案溢出画布或缩成不可见的小点'
  },
  rotation: { min: 0, max: 360, step: 1, hint: '旋转角度' },
  strokeWidth: {
    min: 0.01, max: 20, step: 0.1,
    safe: { min: 0.3, max: 6 },
    recommended: { min: 0.8, max: 3 },
    hint: '过粗会糊成一片，过细几乎看不见线条'
  },
  opacity: {
    min: 0.001, max: 1, step: 0.01,
    safe: { min: 0.15, max: 1 },
    recommended: { min: 0.4, max: 0.95 },
    hint: '透明度过低图案几乎完全不可见'
  },
  width: {
    min: 50, max: 8192, step: 1,
    safe: { min: 200, max: 3000 },
    recommended: { min: 600, max: 2000 },
    hint: '尺寸过大会导致内存溢出、导出失败'
  },
  height: {
    min: 50, max: 8192, step: 1,
    safe: { min: 200, max: 3000 },
    recommended: { min: 800, max: 2500 },
    hint: '尺寸过大会导致内存溢出、导出失败'
  },
}

export const MAX_EXPORT_SIZE = 3000

export type AutoCorrectLevel = 'none' | 'warning' | 'safe' | 'hard'

export interface SanitizeResult {
  finalValue: number
  level: AutoCorrectLevel
  originalValue: number
  correctedTo?: number
  message: string
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function isInRange(value: number, range: ParamRange): boolean {
  return value >= range.min && value <= range.max
}

export function isInSafeRange(value: number, range: ParamRange): boolean {
  if (!range.safe) return isInRange(value, range)
  return value >= range.safe.min && value <= range.safe.max
}

export function isInRecommendedRange(value: number, range: ParamRange): boolean {
  if (!range.recommended) return true
  return value >= range.recommended.min && value <= range.recommended.max
}

export function sanitizeNumericParam(key: string, rawValue: number): SanitizeResult {
  const range = PARAM_RANGES[key]
  if (!range) {
    return { finalValue: rawValue, level: 'none', originalValue: rawValue, message: '' }
  }

  const hardClamped = clamp(rawValue, range.min, range.max)
  if (hardClamped !== rawValue) {
    return {
      finalValue: hardClamped,
      level: 'hard',
      originalValue: rawValue,
      correctedTo: hardClamped,
      message: `${key} 超出绝对范围 [${range.min}, ${range.max}]，已自动修正到 ${hardClamped}`
    }
  }

  if (range.safe) {
    const safeClamped = clamp(rawValue, range.safe.min, range.safe.max)
    if (safeClamped !== rawValue) {
      return {
        finalValue: safeClamped,
        level: 'safe',
        originalValue: rawValue,
        correctedTo: safeClamped,
        message: `⚠️ ${range.hint}，${key} 已自动调整到安全范围边界值 ${safeClamped}`
      }
    }
  }

  if (range.recommended && !isInRecommendedRange(rawValue, range)) {
    return {
      finalValue: rawValue,
      level: 'warning',
      originalValue: rawValue,
      message: `💡 ${range.hint}，推荐范围 [${range.recommended.min}, ${range.recommended.max}]`
    }
  }

  return { finalValue: rawValue, level: 'none', originalValue: rawValue, message: '' }
}
