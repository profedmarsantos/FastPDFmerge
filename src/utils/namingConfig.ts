export interface AcademicNamingConfig {
  bimester: '1' | '2' | '3' | '4';
  ordinalChar?: 'º' | 'o'; // 'º' (ALT+167 = \u00BA) is the default
  disciplineCode: string; // e.g., HIS1, QUI1, MAT1, etc.
  disciplineName: string; // e.g., História, Química, Matemática, etc.
  year?: string; // e.g., '2026'
  periodPrefix?: string; // e.g., 'Mod1' or '1ºBim'
}

export function formatAcademicFileName(config: AcademicNamingConfig): string {
  let bim = '';
  if (config.periodPrefix) {
    bim = config.periodPrefix.trim();
  } else {
    const ord = config.ordinalChar === 'o' ? 'o' : 'º';
    bim = config.bimester ? `${config.bimester}${ord}Bim` : `1${ord}Bim`;
  }
  const code = config.disciplineCode.trim().toUpperCase() || 'DISC';
  const name = config.disciplineName.trim() || 'Disciplina';
  return `${bim}-${code} (Rec. Paral. ${name}).pdf`;
}

export function formatFourBimestersFileName(
  disciplineCode: string,
  disciplineName: string,
  year: string = '2026',
  periodPrefix?: string
): string {
  const y = year?.trim() || '2026';
  const code = disciplineCode.trim().toUpperCase() || 'DISC';
  const name = disciplineName.trim() || 'Disciplina';
  if (periodPrefix && periodPrefix.trim()) {
    return `${y}-${periodPrefix.trim()}-${code} (Rec. Paral. ${name}).pdf`;
  }
  return `${y}-${code} (Rec. Paral. ${name}).pdf`;
}

export const COMMON_DISCIPLINES = [
  { code: 'HIS1', name: 'História' },
  { code: 'QUI1', name: 'Química' },
  { code: 'MAT1', name: 'Matemática' },
  { code: 'FIS1', name: 'Física' },
  { code: 'BIO1', name: 'Biologia' },
  { code: 'POR1', name: 'Língua Portuguesa' },
  { code: 'GEO1', name: 'Geografia' },
  { code: 'FIL1', name: 'Filosofia' },
  { code: 'SOC1', name: 'Sociologia' },
  { code: 'ING1', name: 'Língua Inglesa' },
  { code: 'ART1', name: 'Artes' },
  { code: 'EDF1', name: 'Educação Física' },
  { code: 'INF1', name: 'Informática' },
];

/**
 * Try to detect bimester, discipline code and discipline name from file names
 */
export function inferNamingFromFiles(file1Name: string, file2Name: string): Partial<AcademicNamingConfig> {
  const combined = `${file1Name} ${file2Name}`;

  // Check bimester: 1º, 2º, 3º, 4º or 1o, 2o, etc.
  let bimester: '1' | '2' | '3' | '4' = '1';
  let ordinalChar: 'º' | 'o' = 'º';
  const bimMatch = combined.match(/([1-4])\s*(o|º|°)?\s*bim/i);
  if (bimMatch) {
    bimester = bimMatch[1] as '1' | '2' | '3' | '4';
    if (bimMatch[2] === 'o' || bimMatch[2] === 'O') {
      ordinalChar = 'o';
    } else {
      ordinalChar = 'º';
    }
  }

  // Check known disciplines
  for (const disc of COMMON_DISCIPLINES) {
    const codeRegex = new RegExp(`\\b${disc.code}\\b`, 'i');
    const nameRegex = new RegExp(`\\b${disc.name}\\b`, 'i');
    if (codeRegex.test(combined) || nameRegex.test(combined)) {
      return {
        bimester,
        ordinalChar,
        disciplineCode: disc.code,
        disciplineName: disc.name,
      };
    }
  }

  return {
    bimester,
    ordinalChar,
    disciplineCode: '',
    disciplineName: '',
  };
}
