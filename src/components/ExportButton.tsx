import { useState } from 'react';
import { ExportPreset, exportImage } from '../lib/exportImage';

interface Props {
  targetRef: React.RefObject<HTMLDivElement | null>;
  rideName: string;
}

export default function ExportButton({ targetRef, rideName }: Props) {
  const [exporting, setExporting] = useState(false);
  const [preset, setPreset] = useState<ExportPreset>('1920x1080');

  const handleExport = async () => {
    if (!targetRef.current) return;
    setExporting(true);
    try {
      const datePart = new Date().toISOString().slice(0, 10);
      const filename = `${rideName || 'gneiss-ride'}-${datePart}-${preset}`;
      await exportImage(targetRef.current, preset, filename);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={preset}
        onChange={(e) => setPreset(e.target.value as ExportPreset)}
        className="bg-gray-700 text-white rounded px-2 py-1 text-xs border border-gray-600"
      >
        <option value="1920x1080">1920 x 1080</option>
        <option value="1080x1080">1080 x 1080</option>
      </select>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-3 py-1 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        {exporting ? 'Exporting...' : 'Export PNG'}
      </button>
    </div>
  );
}
