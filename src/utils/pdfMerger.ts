import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { MergeResult } from '../types';
import {
  validatePdfMagicBytes,
  sanitizeFileName,
  isSafeDownloadUrl,
  MAX_TOTAL_MERGE_SIZE_BYTES,
  MAX_PDF_PAGES,
} from './security';

export async function getPdfInfo(file: File): Promise<{ pageCount: number; isValid: boolean; error?: string }> {
  try {
    // 1. Validate magic bytes and individual file size boundaries first
    const magicCheck = await validatePdfMagicBytes(file);
    if (!magicCheck.isValid) {
      return {
        pageCount: 0,
        isValid: false,
        error: magicCheck.error,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const count = pdf.getPageCount();

    if (count > MAX_PDF_PAGES) {
      return {
        pageCount: 0,
        isValid: false,
        error: `O documento excede o limite seguro de ${MAX_PDF_PAGES} páginas.`,
      };
    }

    return {
      pageCount: count,
      isValid: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Não foi possível ler este arquivo PDF.';
    return {
      pageCount: 0,
      isValid: false,
      error: message.includes('password')
        ? 'O arquivo está protegido por senha. Remova a senha antes de mesclar.'
        : 'Arquivo inválido ou corrompido.',
    };
  }
}

export async function mergeMultiplePdfs(
  files: File[],
  outputName: string = 'documento_mesclado.pdf',
  onProgress?: (message: string) => void,
  sequenceLabel?: string
): Promise<MergeResult> {
  if (files.length === 0) {
    throw new Error('Nenhum arquivo fornecido para mesclagem.');
  }

  // Check cumulative file size boundary to prevent browser out-of-memory crash
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_MERGE_SIZE_BYTES) {
    const totalMb = (totalSize / (1024 * 1024)).toFixed(1);
    throw new Error(
      `O tamanho conjunto dos arquivos (${totalMb} MB) excede o limite máximo seguro de 150 MB.`
    );
  }

  const mergedPdf = await PDFDocument.create();
  const pageCounts: number[] = [];
  let totalCumulativePages = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(`Carregando arquivo ${i + 1} de ${files.length}...`);

    // Verify magic bytes for defense-in-depth
    const magic = await validatePdfMagicBytes(file);
    if (!magic.isValid) {
      throw new Error(`Arquivo ${i + 1} (${file.name}): ${magic.error}`);
    }

    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer);
    const count = pdf.getPageCount();
    totalCumulativePages += count;

    if (totalCumulativePages > MAX_PDF_PAGES) {
      throw new Error(
        `A soma das páginas excede o limite seguro de ${MAX_PDF_PAGES} páginas para processamento no navegador.`
      );
    }

    pageCounts.push(count);

    onProgress?.(`Copiando ${count} página(s) do Arquivo ${i + 1}...`);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  onProgress?.('Finalizando e salvando PDF...');
  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const totalPages = pageCounts.reduce((acc, c) => acc + c, 0);
  const safeOutputName = sanitizeFileName(outputName, 'documento_mesclado.pdf');

  return {
    blob,
    url,
    fileName: safeOutputName,
    size: blob.size,
    pageCount1: pageCounts[0] || 0,
    pageCount2: pageCounts[1] || 0,
    filePageCounts: pageCounts,
    sequenceLabel: sequenceLabel || (files.length === 2 ? 'PDF 1 + PDF 2' : '1º Bim + 2º Bim + 3º Bim + 4º Bim'),
    totalPages,
    mergedAt: new Date(),
  };
}

export async function mergePdfs(
  file1OrFiles: File | File[],
  file2OrOutputName?: File | string,
  outputName: string = 'documento_mesclado.pdf',
  onProgress?: (message: string) => void
): Promise<MergeResult> {
  if (Array.isArray(file1OrFiles)) {
    const outName = typeof file2OrOutputName === 'string' ? file2OrOutputName : outputName;
    return mergeMultiplePdfs(file1OrFiles, outName, onProgress);
  }
  const file2 = file2OrOutputName as File;
  return mergeMultiplePdfs([file1OrFiles, file2], outputName, onProgress, 'PDF 1 + PDF 2');
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function triggerDownload(url: string, fileName: string) {
  if (!isSafeDownloadUrl(url)) {
    console.error('Security blocked unsafe download URL scheme:', url);
    return;
  }

  const safeName = sanitizeFileName(fileName, 'documento_mesclado.pdf');
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function createSamplePdf(title: string, subtitle: string, pages: number = 2, customFileName?: string): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pages; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in pt
    page.drawText(title, {
      x: 50,
      y: 780,
      size: 20,
      font,
      color: rgb(0.1, 0.1, 0.12),
    });

    page.drawText(`${subtitle} — Página ${i} de ${pages}`, {
      x: 50,
      y: 750,
      size: 13,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.45),
    });

    page.drawText(
      `Avaliação / Instrumento referente à Recuperação Paralela. Documento processado localmente no navegador.`,
      {
        x: 50,
        y: 700,
        size: 11,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3),
      }
    );

    page.drawRectangle({
      x: 45,
      y: 45,
      width: 505.28,
      height: 751.89,
      borderColor: rgb(0.85, 0.85, 0.88),
      borderWidth: 1,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const fileName = customFileName || `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.pdf`;
  return new File([pdfBytes], fileName, { type: 'application/pdf' });
}

export async function createFourBimesterSamples(disciplineName: string = 'História', disciplineCode: string = 'HIS1'): Promise<File[]> {
  const f1 = await createSamplePdf(`Recuperação Paralela - 1º Bimestre`, `${disciplineName} (${disciplineCode})`, 2, `1Bim_Recuperacao_${disciplineCode}.pdf`);
  const f2 = await createSamplePdf(`Recuperação Paralela - 2º Bimestre`, `${disciplineName} (${disciplineCode})`, 2, `2Bim_Recuperacao_${disciplineCode}.pdf`);
  const f3 = await createSamplePdf(`Recuperação Paralela - 3º Bimestre`, `${disciplineName} (${disciplineCode})`, 3, `3Bim_Recuperacao_${disciplineCode}.pdf`);
  const f4 = await createSamplePdf(`Recuperação Paralela - 4º Bimestre`, `${disciplineName} (${disciplineCode})`, 2, `4Bim_Recuperacao_${disciplineCode}.pdf`);
  return [f1, f2, f3, f4];
}

