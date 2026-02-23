import { useCallback, useState, DragEvent } from 'react';

interface Props {
  onFileLoaded: (content: string, filename: string) => void;
}

export default function FileDropzone({ onFileLoaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'tcx' && ext !== 'gpx') {
        setError('Please upload a .tcx or .gpx file.');
        return;
      }
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onFileLoaded(reader.result, file.name);
        }
      };
      reader.onerror = () => setError('Failed to read file.');
      reader.readAsText(file);
    },
    [onFileLoaded],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`flex flex-col items-center justify-center h-screen w-full cursor-pointer border-4 border-dashed transition-colors ${
        dragging ? 'border-emerald-400 bg-emerald-900/20' : 'border-gray-600 bg-gray-900'
      }`}
    >
      <h1 className="text-4xl font-bold mb-4 text-emerald-400">Gneiss Rides</h1>
      <p className="text-lg text-gray-300 mb-2">
        Drag &amp; drop a <code>.tcx</code> or <code>.gpx</code> file here
      </p>
      <p className="text-sm text-gray-500">or click to browse</p>
      <input
        type="file"
        accept=".tcx,.gpx"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
    </div>
  );
}
