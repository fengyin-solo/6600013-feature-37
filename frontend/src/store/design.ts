import { create } from 'zustand'
import type { DesignParams, PatternType, AutoCorrectLevel } from '../types'
import { THEMES } from '../themes/palettes'
import { sanitizeNumericParam, clamp, MAX_EXPORT_SIZE, PARAM_RANGES } from '../types'

export interface ParamStatus {
  level: AutoCorrectLevel
  message: string
  originalValue?: number
  correctedTo?: number
  overridden?: boolean
}

interface DesignStore extends DesignParams {
  svgContent: string
  paramStatus: Record<string, ParamStatus>
  setParam: <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => void
  forceParam: <K extends keyof DesignParams>(key: K, value: DesignParams[K]) => void
  setPattern: (p: PatternType) => void
  setTheme: (id: string) => void
  randomSeed: () => void
  setSvgContent: (s: string) => void
  exportSvg: () => void
  exportPng: () => void
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  pattern: 'spiral',
  seed: 42,
  iterations: 200,
  scale: 1.0,
  rotation: 0,
  strokeWidth: 1.5,
  opacity: 0.8,
  bgColor: '#030712',
  palette: THEMES[0].colors,
  width: 800,
  height: 1000,
  svgContent: '',
  paramStatus: {},

  setParam: (key, value) => {
    if (typeof value !== 'number') {
      set({ [key]: value } as any)
      return
    }
    const result = sanitizeNumericParam(key as string, value)
    const status: ParamStatus = {
      level: result.level,
      message: result.message,
    }
    if (result.level === 'safe' || result.level === 'hard') {
      status.originalValue = result.originalValue
      status.correctedTo = result.correctedTo
    }
    set((state) => ({
      [key]: result.finalValue,
      paramStatus: { ...state.paramStatus, [key]: status }
    }) as any)
  },

  forceParam: (key, value) => {
    if (typeof value !== 'number') {
      set({ [key]: value } as any)
      return
    }
    const range = PARAM_RANGES[key as string]
    const finalValue = range ? clamp(value, range.min, range.max) : value
    set((state) => ({
      [key]: finalValue,
      paramStatus: {
        ...state.paramStatus,
        [key]: {
          level: 'warning',
          message: `⚠️ 已强制使用原始值 ${finalValue}，超出安全范围，画面可能异常`,
          overridden: true,
        }
      }
    }) as any)
  },

  setPattern: (p) => set({ pattern: p }),
  setTheme: (id) => {
    const theme = THEMES.find(t => t.id === id)
    if (theme) set({ palette: theme.colors })
  },
  randomSeed: () => set({ seed: Math.floor(Math.random() * 99999) }),
  setSvgContent: (s) => set({ svgContent: s }),

  exportSvg: () => {
    const { svgContent, width, height, seed } = get()
    if (width > MAX_EXPORT_SIZE || height > MAX_EXPORT_SIZE) {
      alert(`画布尺寸过大（${width}x${height}），为避免导出异常，最大支持 ${MAX_EXPORT_SIZE}px。请调整尺寸后重试。`)
      return
    }
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `art-${seed}.svg`; a.click()
    URL.revokeObjectURL(url)
  },

  exportPng: () => {
    const { svgContent, width, height, seed } = get()
    if (width > MAX_EXPORT_SIZE || height > MAX_EXPORT_SIZE) {
      alert(`画布尺寸过大（${width}x${height}），为避免导出异常，最大支持 ${MAX_EXPORT_SIZE}px。请调整尺寸后重试。`)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      alert('Canvas 初始化失败，请尝试减小画布尺寸')
      return
    }
    const img = new Image()
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => {
          if (!blob) {
            alert('PNG 导出失败，可能是画布尺寸过大或内容过于复杂')
            return
          }
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `art-${seed}.png`; a.click()
        })
      } catch (e) {
        URL.revokeObjectURL(url)
        alert('PNG 渲染失败，请尝试减小尺寸或简化图案')
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      alert('SVG 加载失败，请检查参数是否合理')
    }
    img.src = url
  },
}))
