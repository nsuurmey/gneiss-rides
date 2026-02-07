const GEO_MESSAGES = [
  'Crunching trackpoints...',
  'Mapping your route onto bedrock...',
  'Querying the geologic record...',
  'Correlating elevation with lithology...',
  'Traversing the stratigraphic column...',
  'Calculating eons of erosion...',
  'Aligning tectonic plates...',
  'Reading the rock layers...',
];

interface Props {
  progress: number; // 0–100
}

export default function LoadingScreen({ progress }: Props) {
  const msgIndex = Math.min(
    Math.floor((progress / 100) * GEO_MESSAGES.length),
    GEO_MESSAGES.length - 1,
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-900">
      <h2 className="text-2xl font-semibold text-emerald-400 mb-6">Processing your ride</h2>
      <div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-gray-400 text-sm">{GEO_MESSAGES[msgIndex]}</p>
    </div>
  );
}
