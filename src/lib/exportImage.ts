import html2canvas from 'html2canvas';

export type ExportPreset = '1080x1080' | '1920x1080';

const PRESETS: Record<ExportPreset, { width: number; height: number }> = {
  '1080x1080': { width: 1080, height: 1080 },
  '1920x1080': { width: 1920, height: 1080 },
};

/**
 * Render a DOM element to a PNG blob at the given preset resolution.
 * Returns a downloadable blob URL.
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
