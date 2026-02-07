import { useState, useCallback } from 'react';
import FileDropzone from './components/FileDropzone';
import LoadingScreen from './components/LoadingScreen';
import MapView from './components/MapView';
import GeoProfile from './components/GeoProfile';
import Legend from './components/Legend';
import { parseTcx } from './lib/parseTcx';
import { enrichWithGeology } from './lib/macrostrat';
import { EnrichedPoint } from './types';

type AppState = 'upload' | 'loading' | 'dashboard';

export default function App() {
  const [state, setState] = useState<AppState>('upload');
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState<EnrichedPoint[]>([]);
  const [rideName, setRideName] = useState('');

  const handleFile = useCallback(async (content: string, filename: string) => {
    try {
      setState('loading');
      setProgress(0);
      setRideName(filename.replace(/\.\w+$/, ''));

      const trackPoints = parseTcx(content);

      const enriched = await enrichWithGeology(trackPoints, (done, total) => {
        setProgress(Math.round((done / total) * 100));
      });

      setPoints(enriched);
      setState('dashboard');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process file');
      setState('upload');
    }
  }, []);

  if (state === 'upload') {
    return <FileDropzone onFileLoaded={handleFile} />;
  }

  if (state === 'loading') {
    return <LoadingScreen progress={progress} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h1 className="text-lg font-bold text-emerald-400">Gneiss Rides</h1>
        <span className="text-sm text-gray-400">{rideName}</span>
        <button
          className="text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => {
            setPoints([]);
            setState('upload');
          }}
        >
          New ride
        </button>
      </header>

      {/* Map */}
      <div className="flex-1 min-h-0">
        <MapView points={points} />
      </div>

      {/* Profile + Legend */}
      <div className="bg-gray-850 border-t border-gray-700 p-4 space-y-3">
        <GeoProfile points={points} />
        <Legend points={points} />
      </div>
    </div>
  );
}
