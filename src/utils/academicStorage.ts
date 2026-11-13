import { AcademicRecord, CourseType, AcademicPeriod, IntegratedPeriod, ModularPeriod } from '../types';

export const COURSES: CourseType[] = [
  'Técnico em Automação Industrial Integrado ao Ensino Médio (bimestral)',
  'Técnico em Automação Industrial Concomitante/Subsequente ao Ensino Médio (modular)',
  'Técnico em Informática Integrado ao Ensino Médio (bimestral)',
  'Técnico em Informática Concomitante/Subsequente ao Ensino Médio (modular)',
];

export const INTEGRATED_PERIODS: IntegratedPeriod[] = [
  '1º Bimestre',
  '2º Bimestre',
  '3º Bimestre',
  '4º Bimestre',
];

export const MODULAR_PERIODS: ModularPeriod[] = [
  'Módulo 1',
  'Módulo 2',
  'Módulo 3',
  'Módulo 4',
];

export function isIntegratedCourse(course: string): boolean {
  return course.toLowerCase().includes('integrado');
}

export function isModularCourse(course: string): boolean {
  return !isIntegratedCourse(course);
}

export function isModularRecord(record: AcademicRecord): boolean {
  if (record.period && record.period.toLowerCase().includes('módulo')) {
    return true;
  }
  if (record.period && record.period.toLowerCase().includes('bimestre')) {
    return false;
  }
  return isModularCourse(record.course);
}

export function isIntegratedRecord(record: AcademicRecord): boolean {
  return !isModularRecord(record);
}

export function getPeriodsForCourse(course: string): AcademicPeriod[] {
  return isIntegratedCourse(course) ? INTEGRATED_PERIODS : MODULAR_PERIODS;
}

export function getModuleNumberFromPeriod(period?: string): number {
  if (!period) return 1;
  if (period.includes('1')) return 1;
  if (period.includes('2')) return 2;
  if (period.includes('3')) return 3;
  if (period.includes('4')) return 4;
  return 1;
}

/**
 * Generate a short discipline code/abbreviation from a subject name.
 * e.g., 'História' -> 'HIS1', 'Lógica de Programação' -> 'LP1', 'Banco de Dados' -> 'BD1'
 */
export function generateDisciplineCode(subject: string): string {
  const clean = subject.trim();
  if (!clean) return 'DISC1';

  // Check if subject already contains a short code or numbers
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const w = words[0].replace(/[^a-zA-ZÀ-ÿ0-9]/g, '');
    if (w.length <= 4) {
      return (w + (/\d$/.test(w) ? '' : '1')).toUpperCase();
    }
    return (w.slice(0, 3) + '1').toUpperCase();
  }

  // Multi-word: take initials of significant words (skip prepositions)
  const stopWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'ao', 'à']);
  const initials = words
    .filter((w) => !stopWords.has(w.toLowerCase()))
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  if (initials.length >= 2 && initials.length <= 4) {
    return (initials + '1').toUpperCase();
  }

  // Fallback: first 3 characters of first word + 1
  const first = words[0].replace(/[^a-zA-ZÀ-ÿ]/g, '').slice(0, 3);
  return (first + '1').toUpperCase();
}

const STORAGE_KEY = 'fastpdfmerge_academic_records_v1';
const ACTIVE_ID_KEY = 'fastpdfmerge_active_record_id_v1';
const MAX_ACADEMIC_RECORDS = 200;

export const DEFAULT_RECORDS: AcademicRecord[] = [];

function sanitizeStringField(value: unknown, maxLen = 150): string {
  if (typeof value !== 'string') return '';
  // Remove non-printable control characters and trim
  return value.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim().slice(0, maxLen);
}

export function formatDisciplineName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toLocaleUpperCase('pt-BR') + word.slice(1))
    .join(' ');
}

function validateAndSanitizeRecord(raw: unknown): AcademicRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  const id = sanitizeStringField(obj.id, 64);
  const rawCourse = sanitizeStringField(obj.course, 120);
  const subject = formatDisciplineName(sanitizeStringField(obj.subject, 100));
  const code = sanitizeStringField(obj.code, 30);
  const period = sanitizeStringField(obj.period, 50) as AcademicPeriod;
  const rawYear = Number(obj.year);
  const year = Number.isInteger(rawYear) && rawYear >= 2000 && rawYear <= 2100 ? rawYear : new Date().getFullYear();

  if (!id || !subject || !code || !period) {
    return null;
  }

  // Resolve course safely to valid CourseType
  let resolvedCourse: CourseType = COURSES[0];
  if (COURSES.includes(rawCourse as CourseType)) {
    resolvedCourse = rawCourse as CourseType;
  } else if (rawCourse.toLowerCase().includes('automação') && rawCourse.toLowerCase().includes('modular')) {
    resolvedCourse = 'Técnico em Automação Industrial Concomitante/Subsequente ao Ensino Médio (modular)';
  } else if (rawCourse.toLowerCase().includes('informática') && rawCourse.toLowerCase().includes('modular')) {
    resolvedCourse = 'Técnico em Informática Concomitante/Subsequente ao Ensino Médio (modular)';
  } else if (rawCourse.toLowerCase().includes('automação')) {
    resolvedCourse = 'Técnico em Automação Industrial Integrado ao Ensino Médio (bimestral)';
  } else {
    resolvedCourse = 'Técnico em Informática Integrado ao Ensino Médio (bimestral)';
  }

  const sanitized: AcademicRecord = {
    id,
    course: resolvedCourse,
    year,
    period,
    subject,
    code,
    createdAt: sanitizeStringField(obj.createdAt, 40) || new Date().toISOString(),
  };

  const teachers = Array.isArray(obj.teachers)
    ? obj.teachers
        .map((teacher) => sanitizeStringField(teacher, 100))
        .filter(Boolean)
        .slice(0, 10)
    : [];
  const legacyTeacher = sanitizeStringField(obj.teacher, 100);

  if (teachers.length > 0) {
    sanitized.teachers = teachers;
    sanitized.teacher = teachers[0];
  } else if (legacyTeacher) {
    sanitized.teacher = legacyTeacher;
    sanitized.teachers = [legacyTeacher];
  }

  return sanitized;
}

export function loadAcademicRecords(): AcademicRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sanitizedRecords: AcademicRecord[] = [];

      for (const item of parsed) {
        const validated = validateAndSanitizeRecord(item);
        if (!validated) continue;

        // Expurga registros de teste padrões antigos se ainda existirem
        const isDefaultHist =
          validated.id === 'rec-default-1' &&
          validated.subject === 'História' &&
          (!validated.teacher || validated.teacher === 'Seu Nome Aqui');
        const isDefaultAut =
          validated.id === 'rec-default-2' &&
          validated.subject === 'Automação Industrial' &&
          (!validated.teacher || validated.teacher === 'Seu Nome Aqui');

        if (!isDefaultHist && !isDefaultAut) {
          sanitizedRecords.push(validated);
        }

        if (sanitizedRecords.length >= MAX_ACADEMIC_RECORDS) {
          break;
        }
      }

      // Se dados inválidos ou de teste foram expurgados, sincroniza localStorage
      if (sanitizedRecords.length !== parsed.length) {
        saveAcademicRecords(sanitizedRecords);
      }

      return sanitizedRecords;
    }
    return [];
  } catch (err) {
    console.warn('Error loading academic records from localStorage:', err);
    return [];
  }
}

export function saveAcademicRecords(records: AcademicRecord[]): void {
  try {
    const safeList = records.slice(0, MAX_ACADEMIC_RECORDS).map((record) => ({
      ...record,
      subject: formatDisciplineName(sanitizeStringField(record.subject, 100)),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeList));
  } catch (err) {
    console.error('Error saving academic records to localStorage:', err);
  }
}

export function loadActiveRecordId(): string | null {
  try {
    const id = localStorage.getItem(ACTIVE_ID_KEY);
    if (id === 'rec-default-1' || id === 'rec-default-2') {
      return null;
    }
    return id || null;
  } catch {
    return null;
  }
}

export function saveActiveRecordId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_ID_KEY);
    }
  } catch (err) {
    console.error('Error saving active record id:', err);
  }
}

/**
 * Completely wipe all academic data and active context from localStorage.
 */
export function clearAllAcademicStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACTIVE_ID_KEY);
  localStorage.removeItem('fastpdfmerge_active_modular_id_v1');
  localStorage.removeItem('fastpdfmerge_active_integrated_id_v1');
  localStorage.removeItem('fastpdfmerge_teacher_name_v2');
  localStorage.removeItem('fastpdfmerge_course_selection_v2');
}

