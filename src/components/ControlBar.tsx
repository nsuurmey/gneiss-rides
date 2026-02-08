import { ColorMode, Units } from '../types';

interface Props {
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  units: Units;
  onUnitsChange: (units: Units) => void;
  showHeartRate: boolean;
  onShowHeartRateChange: (show: boolean) => void;
  showFossils: boolean;
  onShowFossilsChange: (show: boolean) => void;
}

export default function ControlBar({
  colorMode,
  onColorModeChange,
  units,
  onUnitsChange,
  showHeartRate,
  onShowHeartRateChange,
  showFossils,
  onShowFossilsChange,
}: Props) {
  return (
    <div className="flex items-center gap-4 flex-wrap text-sm">
      {/* Color mode toggle */}
      <label className="flex items-center gap-1.5 text-gray-300">
        Color by
        <select
          value={colorMode}
          onChange={(e) => onColorModeChange(e.target.value as ColorMode)}
          className="bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600"
        >
          <option value="age">Geologic Age</option>
          <option value="lithology">Lithology</option>
        </select>
      </label>

      {/* Units toggle */}
      <label className="flex items-center gap-1.5 text-gray-300">
        Units
        <select
          value={units}
          onChange={(e) => onUnitsChange(e.target.value as Units)}
          className="bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600"
        >
          <option value="metric">Metric (km / m)</option>
          <option value="imperial">Imperial (mi / ft)</option>
        </select>
      </label>

      {/* Heart rate toggle */}
      <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={showHeartRate}
          onChange={(e) => onShowHeartRateChange(e.target.checked)}
          className="accent-emerald-500"
        />
        Heart rate
      </label>

      {/* Task 34: Discover Fossils lazy-load toggle */}
      <button
        onClick={() => onShowFossilsChange(!showFossils)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
          showFossils
            ? 'bg-amber-600 text-white'
            : 'bg-amber-600/20 text-amber-400 border border-amber-600/50 hover:bg-amber-600/30'
        }`}
      >
        {showFossils ? '🦴 Fossils On' : '🦴 Discover Fossils'}
      </button>
    </div>
  );
}
