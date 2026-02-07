import { useState, useCallback, useRef } from 'react';
import FileDropzone from './components/FileDropzone';
import LoadingScreen from './components/LoadingScreen';
import MapView from './components/MapView';
import GeoProfile from './components/GeoProfile';
import Legend from './components/Legend';
import ControlBar from './components/ControlBar';
import ExportButton from './components/ExportButton';
import { parseTcx } from './lib/parseTcx';
import { parseGpx } from './lib/parseGpx';
import { enrichWithGeology } from './lib/macrostrat';
import { EnrichedPoint, ColorMode, Units } from './types';

type AppState = 'upload' | 'loading' | 'dashboard' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('upload');
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState<EnrichedPoint[]>([]);
  const [rideName, setRideName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Phase 2 state
  const [colorMode, setColorMode] = useState<ColorMode>('age');
  const [units, setUnits] = useState<Units>('metric');
  const [mapOpacity, setMapOpacity] = useState(0.85);
  const [showHeartRate, setShowHeartRate] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(async (content: string, filename: string) => {
    try {
      setState('loading');
      setProgress(0);
      setErrorMsg('');
      setRideName(filename.replace(/\.\w+$/, ''));

      // Choose parser based on file extension
      const ext = filename.split('.').pop()?.toLowerCase();
      let trackPoints;
      if (ext === 'gpx') {
        trackPoints = parseGpx(content);
      } else {
        trackPoints = parseTcx(content);
      }

      const enriched = await enrichWithGeology(trackPoints, (done, total) => {
        setProgress(Math.round((done / total) * 100));
      });

      setPoints(enriched);
      setState('dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process file');
      setState('error');
    }
  }, []);

  const reset = () => {
    setPoints([]);
    setErrorMsg('');
    setState('upload');
  };

  if (state === 'upload') {
    return <FileDropzone onFileLoaded={handleFile} />;
  }

  if (state === 'loading') {
    return <LoadingScreen progress={progress} />;
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
        <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
        <p className="text-gray-400 text-sm max-w-md text-center">{errorMsg}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm transition-colors"
        >
          Try another file
        </button>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 gap-3 flex-wrap">
        <h1 className="text-lg font-bold text-emerald-400">Gneiss Rides</h1>
        <span className="text-sm text-gray-400 truncate">{rideName}</span>
        <div className="flex items-center gap-3">
          <ExportButton targetRef={dashboardRef} rideName={rideName} />
          <button
            className="text-sm text-gray-400 hover:text-white transition-colors"
            onClick={reset}
          >
            New ride
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between gap-4 flex-wrap">
        <ControlBar
          colorMode={colorMode}
          onColorModeChange={setColorMode}
          units={units}
          onUnitsChange={setUnits}
          showHeartRate={showHeartRate}
          onShowHeartRateChange={setShowHeartRate}
        />
        <label className="flex items-center gap-2 text-xs text-gray-400">
          Path opacity
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={mapOpacity}
            onChange={(e) => setMapOpacity(parseFloat(e.target.value))}
            className="w-24 accent-emerald-500"
          />
        </label>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        <MapView points={points} colorMode={colorMode} opacity={mapOpacity} />
      </div>

      {/* Profile + Legend */}
      <div className="bg-gray-850 border-t border-gray-700 p-4 space-y-3">
        <GeoProfile
          points={points}
          colorMode={colorMode}
          units={units}
          showHeartRate={showHeartRate}
        />
        <Legend points={points} colorMode={colorMode} />
      </div>
    </div>
  );
}
