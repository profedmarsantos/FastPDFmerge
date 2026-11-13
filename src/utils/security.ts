/**
 * Security & Validation Utilities (DevSecOps & OWASP Top 10 Best Practices)
 * Centralizes file validation, filename sanitization, safe URL checking, and error sanitization.
 */

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB per file
export const MAX_TOTAL_MERGE_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB total
export const MAX_PDF_PAGES = 1000; // DoS defense against PDF page bombs

/**
 * Validates whether a file begins with the official PDF magic number: %PDF- (0x25 0x50 0x44 0x46 0x2D).
 * Reads only the first 1024 bytes via FileReader slice to prevent memory exhaustion.
 */
export async function validatePdfMagicBytes(file: File): Promise<{ isValid: boolean; error?: string }> {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo fornecido.' };
  }

  // 1. Enforce size boundaries before reading
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Arquivo muito grande (${sizeMb} MB). O limite máximo por arquivo é de 50 MB.`,
    };
  }

  if (file.size < 8) {
    return {
      isValid: false,
      error: 'Arquivo corrompido ou vazio (tamanho insuficiente para um cabeçalho PDF válido).',
    };
  }

  try {
    const headerSlice = file.slice(0, 1024);
    const buffer = await headerSlice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Convert first 1024 bytes to string to locate %PDF-
    let headerStr = '';
    const readLength = Math.min(bytes.length, 1024);
    for (let i = 0; i < readLength; i++) {
      headerStr += String.fromCharCode(bytes[i]);
    }

    if (!headerStr.includes('%PDF-')) {
      return {
        isValid: false,
        error: 'O arquivo não possui uma assinatura de cabeçalho PDF válida (%PDF-). Verifique se o documento é realmente um PDF.',
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Não foi possível ler os cabeçalhos do arquivo para validação.',
    };
  }
}

/**
 * Sanitizes download and export filenames to prevent path traversal (../),
 * command injection, control characters, or file-clobbering.
 */
export function sanitizeFileName(fileName: string, fallback: string = 'documento_mesclado.pdf'): string {
  if (!fileName || typeof fileName !== 'string') {
    return fallback;
  }

  // Remove path traversal and directory separators (both Windows and Unix)
  let clean = fileName.replace(/[/\\?%*:|"<>]/g, '_');

  // Strip null bytes and non-printable control characters
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Strip leading dots or multiple dots that could emulate path traversal
  clean = clean.replace(/^\.+/, '').replace(/\.{2,}/g, '.');

  // Trim whitespace
  clean = clean.trim();

  // Strip trailing extension if present to enforce length before re-appending
  clean = clean.replace(/\.pdf$/i, '');

  // Enforce reasonable character limit (max 100 characters base name)
  if (clean.length > 100) {
    clean = clean.substring(0, 100).trim();
  }

  if (!clean) {
    clean = fallback.replace(/\.pdf$/i, '');
  }

  return `${clean}.pdf`;
}

/**
 * Validates that an URL is strictly a safe blob: URI or same-origin asset.
 * Prevents javascript:, data: (arbitrary scripts), or external phishing redirects.
 */
export function isSafeDownloadUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();

  // Only allow blob: URLs created in current window context
  if (trimmed.startsWith('blob:')) {
    return true;
  }

  // Allow relative asset URLs (e.g. /assets/...)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  return false;
}

/**
 * Sanitizes user-facing error messages to avoid leaking library internals,
 * stack traces, or server implementation details.
 */
export function sanitizeUserErrorMessage(err: unknown, defaultMessage: string): string {
  if (!err) return defaultMessage;

  const rawMessage = err instanceof Error ? err.message : String(err);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('password') || lower.includes('encrypted')) {
    return 'O arquivo está protegido por senha. Remova a senha antes de mesclar.';
  }

  if (lower.includes('corrupt') || lower.includes('invalid') || lower.includes('failed to parse')) {
    return 'Um ou mais arquivos estão corrompidos ou não puderam ser interpretados como PDFs válidos.';
  }

  if (lower.includes('memory') || lower.includes('out of memory') || lower.includes('allocation')) {
    return 'Memória insuficiente para processar esses arquivos. Tente com arquivos menores.';
  }

  if (lower.includes('tamanho') || lower.includes('size')) {
    return rawMessage;
  }

  return defaultMessage;
}
