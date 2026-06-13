import { useDesignStore, type ParamStatus } from '../store/design'
import { THEMES } from '../themes/palettes'
import type { PatternType } from '../types'
import { PARAM_RANGES } from '../types'

const PATTERNS: { value: PatternType; label: string }[] = [
  { value: 'spiral',  label: '🌀 螺旋' },
  { value: 'fractal', label: '🌳 分形树' },
  { value: 'wave',    label: '🌊 波浪' },
  { value: 'circles', label: '⭕ 圆环' },
  { value: 'noise',   label: '🎲 噪声场' },
]

function formatValue(v: number, key: string): string {
  if (key === 'scale' || key === 'opacity') return v.toFixed(2)
  if (key === 'strokeWidth') return v.toFixed(1)
  return String(Math.round(v))
}

function ParamStatusBadge({ paramKey }: { paramKey: string }) {
  const store = useDesignStore()
  const status: ParamStatus | undefined = store.paramStatus[paramKey]
  const range = PARAM_RANGES[paramKey]

  if (!status || status.level === 'none') {
    if (range?.recommended) {
      return (
        <div className="text-[10px] text-gray-500 mt-0.5">
          推荐: [{range.recommended.min}, {range.recommended.max}]
        </div>
      )
    }
    return null
  }

  const corrected = status.level === 'safe' || status.level === 'hard'

  return (
    <div className={`mt-1 rounded px-1.5 py-1 text-[10px] ${
      corrected ? 'bg-red-900/40 border border-red-700/60'
                : status.overridden ? 'bg-yellow-900/40 border border-yellow-700/60'
                : 'bg-amber-900/30 border border-amber-700/50'
    }`}>
      <div className={`flex items-start gap-1 ${
        corrected ? 'text-red-300' : 'text-yellow-300'
      }`}>
        <span className="shrink-0">{corrected ? '🛡️' : status.overridden ? '🚧' : '💡'}</span>
        <span className="flex-1 leading-snug">{status.message}</span>
      </div>
      {corrected && status.originalValue !== undefined && status.correctedTo !== undefined && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            {formatValue(status.originalValue, paramKey)} → {formatValue(status.correctedTo, paramKey)}
          </span>
          <button
            onClick={() => store.forceParam(paramKey as any, status.originalValue!)}
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 shrink-0"
          >
            仍用原值
          </button>
        </div>
      )}
    </div>
  )
}

function SliderMarker({ paramKey }: { paramKey: string }) {
  const range = PARAM_RANGES[paramKey]
  if (!range?.safe) return null
  const { min, max, safe } = range
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div className="relative h-0 -mt-1 pointer-events-none">
      <div
        className="absolute h-1 rounded-full bg-green-600/30 border border-green-500/40"
        style={{
          left: `${pct(safe.min)}%`,
          width: `${Math.max(2, pct(safe.max) - pct(safe.min))}%`,
          top: '-3px',
        }}
      />
    </div>
  )
}

export default function Sidebar() {
  const store = useDesignStore()

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto flex flex-col gap-4">
      <h2 className="text-lg font-bold">🎨 SVG 海报设计器</h2>

      {/* Pattern */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">图案类型</label>
        <div className="grid grid-cols-2 gap-2">
          {PATTERNS.map(p => (
            <button key={p.value} onClick={() => store.setPattern(p.value)}
              className={`px-2 py-1.5 rounded text-xs font-medium ${store.pattern===p.value?'bg-indigo-600':'bg-gray-700 hover:bg-gray-600'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">颜色主题</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => store.setTheme(t.id)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600">
              <div className="flex">{t.colors.map((c,i) => (
                <div key={i} style={{background:c}} className="w-3 h-3 rounded-full" />
              ))}</div>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Seed */}
      <div>
        <label className="text-xs text-gray-400">种子: {store.seed}</label>
        <div className="flex gap-2 mt-1">
          <input type="range" min={PARAM_RANGES.seed.min} max={PARAM_RANGES.seed.max} value={store.seed}
            onChange={e => store.setParam('seed', Number(e.target.value))} className="flex-1 accent-indigo-500" />
          <button onClick={() => store.randomSeed()} className="px-2 bg-indigo-600 rounded text-xs">🎲</button>
        </div>
        <ParamStatusBadge paramKey="seed" />
      </div>

      {/* Iterations */}
      <div>
        <label className="text-xs text-gray-400 flex items-center justify-between">
          <span>迭代数: {store.iterations}</span>
          {store.paramStatus.iterations?.correctedTo !== undefined && (
            <span className="text-[10px] text-red-400">(输入 {store.paramStatus.iterations.originalValue})</span>
          )}
        </label>
        <input type="range" min={PARAM_RANGES.iterations.min} max={PARAM_RANGES.iterations.max}
          step={PARAM_RANGES.iterations.step} value={store.iterations}
          onChange={e => store.setParam('iterations', Number(e.target.value))} className="w-full accent-purple-500" />
        <SliderMarker paramKey="iterations" />
        <ParamStatusBadge paramKey="iterations" />
      </div>

      {/* Scale */}
      <div>
        <label className="text-xs text-gray-400 flex items-center justify-between">
          <span>缩放: {store.scale.toFixed(2)}</span>
          {store.paramStatus.scale?.correctedTo !== undefined && (
            <span className="text-[10px] text-red-400">(输入 {store.paramStatus.scale.originalValue?.toFixed(2)})</span>
          )}
        </label>
        <input type="range" min={PARAM_RANGES.scale.min} max={PARAM_RANGES.scale.max}
          step={PARAM_RANGES.scale.step} value={store.scale}
          onChange={e => store.setParam('scale', Number(e.target.value))} className="w-full accent-green-500" />
        <SliderMarker paramKey="scale" />
        <ParamStatusBadge paramKey="scale" />
      </div>

      {/* Rotation */}
      <div>
        <label className="text-xs text-gray-400">旋转: {store.rotation}°</label>
        <input type="range" min={PARAM_RANGES.rotation.min} max={PARAM_RANGES.rotation.max}
          step={PARAM_RANGES.rotation.step} value={store.rotation}
          onChange={e => store.setParam('rotation', Number(e.target.value))} className="w-full accent-yellow-500" />
        <ParamStatusBadge paramKey="rotation" />
      </div>

      {/* Stroke */}
      <div>
        <label className="text-xs text-gray-400 flex items-center justify-between">
          <span>描边: {store.strokeWidth.toFixed(1)}</span>
          {store.paramStatus.strokeWidth?.correctedTo !== undefined && (
            <span className="text-[10px] text-red-400">(输入 {store.paramStatus.strokeWidth.originalValue?.toFixed(1)})</span>
          )}
        </label>
        <input type="range" min={PARAM_RANGES.strokeWidth.min} max={PARAM_RANGES.strokeWidth.max}
          step={PARAM_RANGES.strokeWidth.step} value={store.strokeWidth}
          onChange={e => store.setParam('strokeWidth', Number(e.target.value))} className="w-full accent-orange-500" />
        <SliderMarker paramKey="strokeWidth" />
        <ParamStatusBadge paramKey="strokeWidth" />
      </div>

      {/* Opacity */}
      <div>
        <label className="text-xs text-gray-400 flex items-center justify-between">
          <span>透明度: {store.opacity.toFixed(2)}</span>
          {store.paramStatus.opacity?.correctedTo !== undefined && (
            <span className="text-[10px] text-red-400">(输入 {store.paramStatus.opacity.originalValue?.toFixed(2)})</span>
          )}
        </label>
        <input type="range" min={PARAM_RANGES.opacity.min} max={PARAM_RANGES.opacity.max}
          step={PARAM_RANGES.opacity.step} value={store.opacity}
          onChange={e => store.setParam('opacity', Number(e.target.value))} className="w-full accent-pink-500" />
        <SliderMarker paramKey="opacity" />
        <ParamStatusBadge paramKey="opacity" />
      </div>

      {/* Export */}
      <div className="flex gap-2 mt-2">
        <button onClick={() => store.exportSvg()} className="flex-1 py-2 bg-teal-600 rounded text-sm font-medium hover:bg-teal-500 transition">⬇ SVG</button>
        <button onClick={() => store.exportPng()} className="flex-1 py-2 bg-rose-600 rounded text-sm font-medium hover:bg-rose-500 transition">⬇ PNG</button>
      </div>

      <div className="text-[10px] text-gray-500 mt-1 border-t border-gray-700 pt-2 space-y-1">
        <div>🛡️ <span className="text-red-400">红框</span> = 极端值已自动拉回安全边界</div>
        <div>🟢 滑块上的绿色段 = 推荐安全范围</div>
        <div>🚧 黄色 = 已强制使用原始值（风险自负）</div>
        <div>最大导出尺寸 3000px</div>
      </div>
    </div>
  )
}
