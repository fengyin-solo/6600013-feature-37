import { useDesignStore } from '../store/design'
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

function ParamHint({ paramKey }: { paramKey: string }) {
  const store = useDesignStore()
  const range = PARAM_RANGES[paramKey]
  const warning = store.warnings[paramKey]
  if (!range && !warning) return null
  return (
    <div className="mt-1">
      {range && range.recommended && (
        <div className="text-[10px] text-gray-500">
          推荐: [{range.recommended.min}, {range.recommended.max}]
        </div>
      )}
      {warning && (
        <div className="text-[10px] text-yellow-400 mt-0.5 flex items-start gap-1">
          <span>⚠️</span>
          <span>{warning}</span>
        </div>
      )}
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
        <ParamHint paramKey="seed" />
      </div>

      {/* Iterations */}
      <div>
        <label className="text-xs text-gray-400">迭代数: {store.iterations}</label>
        <input type="range" min={PARAM_RANGES.iterations.min} max={PARAM_RANGES.iterations.max}
          step={PARAM_RANGES.iterations.step} value={store.iterations}
          onChange={e => store.setParam('iterations', Number(e.target.value))} className="w-full accent-purple-500" />
        <ParamHint paramKey="iterations" />
      </div>

      {/* Scale */}
      <div>
        <label className="text-xs text-gray-400">缩放: {store.scale.toFixed(2)}</label>
        <input type="range" min={PARAM_RANGES.scale.min} max={PARAM_RANGES.scale.max}
          step={PARAM_RANGES.scale.step} value={store.scale}
          onChange={e => store.setParam('scale', Number(e.target.value))} className="w-full accent-green-500" />
        <ParamHint paramKey="scale" />
      </div>

      {/* Rotation */}
      <div>
        <label className="text-xs text-gray-400">旋转: {store.rotation}°</label>
        <input type="range" min={PARAM_RANGES.rotation.min} max={PARAM_RANGES.rotation.max}
          step={PARAM_RANGES.rotation.step} value={store.rotation}
          onChange={e => store.setParam('rotation', Number(e.target.value))} className="w-full accent-yellow-500" />
        <ParamHint paramKey="rotation" />
      </div>

      {/* Stroke */}
      <div>
        <label className="text-xs text-gray-400">描边: {store.strokeWidth.toFixed(1)}</label>
        <input type="range" min={PARAM_RANGES.strokeWidth.min} max={PARAM_RANGES.strokeWidth.max}
          step={PARAM_RANGES.strokeWidth.step} value={store.strokeWidth}
          onChange={e => store.setParam('strokeWidth', Number(e.target.value))} className="w-full accent-orange-500" />
        <ParamHint paramKey="strokeWidth" />
      </div>

      {/* Opacity */}
      <div>
        <label className="text-xs text-gray-400">透明度: {store.opacity.toFixed(2)}</label>
        <input type="range" min={PARAM_RANGES.opacity.min} max={PARAM_RANGES.opacity.max}
          step={PARAM_RANGES.opacity.step} value={store.opacity}
          onChange={e => store.setParam('opacity', Number(e.target.value))} className="w-full accent-pink-500" />
        <ParamHint paramKey="opacity" />
      </div>

      {/* Export */}
      <div className="flex gap-2 mt-2">
        <button onClick={() => store.exportSvg()} className="flex-1 py-2 bg-teal-600 rounded text-sm font-medium hover:bg-teal-500 transition">⬇ SVG</button>
        <button onClick={() => store.exportPng()} className="flex-1 py-2 bg-rose-600 rounded text-sm font-medium hover:bg-rose-500 transition">⬇ PNG</button>
      </div>

      <div className="text-[10px] text-gray-500 mt-2 border-t border-gray-700 pt-2">
        💡 提示：参数超出推荐范围时会显示警告，极端值会被自动修正。最大导出尺寸 3000px。
      </div>
    </div>
  )
}
