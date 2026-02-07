import html2canvas from 'html2canvas';

export type ExportPreset = '1080x1080' | '1920x1080';

const PRESETS: Record<ExportPreset, { width: number; height: number }> = {
  '1080x1080': { width: 1080, height: 1080 },
  '1920x1080': { width: 1920, height: 1080 },
};

/**
 * Compute the ride bounding box with a percentage buffer on each side.
 * Used to lock the CRS viewport before capture (task 30).
 */
export function rideBBox(
  points: { lat: number; lon: number }[],
  bufferPct = 0.1,
) {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latPad = (maxLat - minLat) * bufferPct;
  const lonPad = (maxLon - minLon) * bufferPct;
  return {
    south: minLat - latPad,
    north: maxLat + latPad,
    west: minLon - lonPad,
    east: maxLon + lonPad,
  };
}

/**
 * Render a DOM element to a PNG blob at the given preset resolution.
 *
 * Task 30: Before capture the caller should ensure the map is fitted to
 * the ride bbox so tiles are locked to the correct CRS viewport.
 * Task 31: The bbox is padded with a 10 % buffer via rideBBox().
 */
export async function exportImage(
  element: HTMLElement,
  preset: ExportPreset,
  filename: string,
): Promise<void> {
  const { width, height } = PRESETS[preset];

  const canvas = await html2canvas(element, {
    width,
    height,
    scale: 2, // 2x for high-res
    backgroundColor: '#111827', // gray-900
    useCORS: true,
    logging: false,
    // Fit-to-bounds cropping: html2canvas respects element scroll/clip, so
    // the caller fits the map to the ride bbox before we capture.
    windowWidth: width,
    windowHeight: height,
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );

  if (!blob) throw new Error('Failed to render image');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
