import { buildFossilImageUrl, buildFossilFallbackUrl } from '../lib/fossilSearch';

interface Props {
  taxonName: string;
  formationName?: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal that opens a fossil image search in an iframe.
 * Task 46: Falls back to PBDB taxon info page if the primary search fails.
 */
export default function FossilImageModal({
  taxonName,
  formationName,
  open,
  onClose,
}: Props) {
  if (!open) return null;

  const primaryUrl = buildFossilImageUrl(taxonName, formationName);
  const fallbackUrl = buildFossilFallbackUrl(taxonName);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="bg-gray-800 rounded-lg border border-gray-600 w-[90vw] max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-amber-400">
            {taxonName} — Fossil Images
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm px-2"
          >
            Close
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 py-2 border-b border-gray-700 text-xs">
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300"
          >
            Open Image Search
          </a>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            PBDB Taxon Info (fallback)
          </a>
        </div>

        {/* Iframe (best-effort — some sites block framing) */}
        <div className="flex-1 relative">
          <iframe
            src={primaryUrl}
            title={`${taxonName} fossil images`}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
            onError={() => {
              // If iframe fails to load, user can still use the links above
            }}
          />
        </div>
      </div>
    </div>
  );
}
