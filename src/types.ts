export interface PdfFileInfo {
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
  isLoadingInfo: boolean;
  error?: string;
}

export interface MergeResult {
  blob: Blob;
  url: string;
  fileName: string;
  size: number;
  pageCount1: number;
  pageCount2: number;
  filePageCounts?: number[];
  sequenceLabel?: string;
  totalPages: number;
  mergedAt: Date;
}

export type GeneratedPdfTab = 'modulos' | 'bimestres';

export interface GeneratedPdf {
  id: string;
  tab: GeneratedPdfTab;
  blob: Blob;
  fileName: string;
  size: number;
  totalPages: number;
  createdAt: string;
}

export type MergeStatus = 'idle' | 'merging' | 'completed' | 'error';

export type CourseType =
  | 'Técnico em Automação Industrial Integrado ao Ensino Médio (bimestral)'
  | 'Técnico em Automação Industrial Concomitante/Subsequente ao Ensino Médio (modular)'
  | 'Técnico em Informática Integrado ao Ensino Médio (bimestral)'
  | 'Técnico em Informática Concomitante/Subsequente ao Ensino Médio (modular)';

export type IntegratedPeriod = '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre';
export type ModularPeriod = 'Módulo 1' | 'Módulo 2' | 'Módulo 3' | 'Módulo 4';
export type AcademicPeriod = IntegratedPeriod | ModularPeriod;

export interface AcademicRecord {
  id: string;
  course: CourseType;
  year: number;
  period: AcademicPeriod;
  series?: string; // ex: '1º Ano', '2º Ano', '3º Ano', 'Optativas' ou 'Módulo 1'
  subject: string; // Componente Curricular
  code: string; // Sigla/Abreviação (ex: HIS1, INF1)
  teacher?: string; // Nome do Docente / Professor(a)
  teachers?: string[]; // Nomes dos Docentes / Professores(as)
  createdAt: string;
  updatedAt?: string;
}
