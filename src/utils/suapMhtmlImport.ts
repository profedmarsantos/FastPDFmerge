import { AcademicPeriod, AcademicRecord, CourseType } from '../types';
import { formatDisciplineName } from './academicStorage';

export interface SuapImportedRecord extends Omit<AcademicRecord, 'id' | 'createdAt' | 'updatedAt'> {
  diaryId: string;
  classCode: string;
  stageCount: number;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function decodeQuotedPrintable(value: string): string {
  const unfolded = value.replace(/=\r?\n/g, '');
  const bytes: number[] = [];

  for (let index = 0; index < unfolded.length; index += 1) {
    if (unfolded[index] === '=' && /^[0-9A-Fa-f]{2}$/.test(unfolded.slice(index + 1, index + 3))) {
      bytes.push(Number.parseInt(unfolded.slice(index + 1, index + 3), 16));
      index += 2;
    } else {
      bytes.push(...new TextEncoder().encode(unfolded[index]));
    }
  }

  return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}

function getHtmlFromMhtml(mhtml: string): string {
  const boundary = mhtml.match(/boundary="([^"]+)"/i)?.[1];
  if (!boundary) {
    throw new Error('O arquivo não possui uma estrutura MHTML válida.');
  }

  const htmlSection = mhtml
    .split(`--${boundary}`)
    .find((section) => /^\s*Content-Type:\s*text\/html(?:;|[\r\n])/im.test(section));
  const bodyStart = htmlSection?.search(/\r?\n\r?\n/);

  if (!htmlSection || bodyStart === undefined || bodyStart < 0) {
    throw new Error('O arquivo não contém uma página HTML do SUAP válida.');
  }

  return decodeQuotedPrintable(htmlSection.slice(bodyStart).replace(/^\r?\n\r?\n/, ''));
}

function getDefinitionValue(table: HTMLTableElement, label: string): string {
  const definitionTerm = Array.from(table.querySelectorAll('dt')).find(
    (term) => term.textContent?.trim() === label
  );
  return definitionTerm?.nextElementSibling?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function parseTeachers(value: string): string[] {
  return value
    .replace(/\([^)]*\)/g, '')
    .split(',')
    .map((teacher) => teacher.trim())
    .filter(Boolean);
}

function resolveCourse(courseLabel: string, classCode: string, stageCount: number): CourseType | null {
  const normalized = normalizeText(`${courseLabel} ${classCode}`);
  const program = normalized.includes('AUTOMACAO') || normalized.includes('.ATI.')
    ? 'automacao'
    : normalized.includes('INFORMATICA') || normalized.includes('.INF.')
    ? 'informatica'
    : null;

  if (!program) {
    return null;
  }

  const integrated = stageCount >= 4;
  if (program === 'automacao') {
    return integrated
      ? 'Técnico em Automação Industrial Integrado ao Ensino Médio (bimestral)'
      : 'Técnico em Automação Industrial Concomitante/Subsequente ao Ensino Médio (modular)';
  }

  return integrated
    ? 'Técnico em Informática Integrado ao Ensino Médio (bimestral)'
    : 'Técnico em Informática Concomitante/Subsequente ao Ensino Médio (modular)';
}

function parseCaption(caption: string): { diaryId: string; code: string; subject: string } | null {
  const match = caption.match(/^\s*(\d+)\s*-\s*.+?\(([^)]+)\)\s*-\s*(.*?)\s*-\s*[^\[]+\[/);
  if (!match) {
    return null;
  }

  const [, diaryId, code, subject] = match;
  return {
    diaryId: diaryId.trim(),
    code: code.trim(),
    subject: formatDisciplineName(subject.replace(/\s+/g, ' ').trim()),
  };
}

function parseClassData(classCode: string): { year: number; level: number } | null {
  const match = classCode.match(/^(\d{4})\d\.(\d)/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const level = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(level) || level < 1 || level > 4) {
    return null;
  }

  return { year, level };
}

function getClassTables(classHeader: HTMLHeadingElement): HTMLTableElement[] {
  const tables: HTMLTableElement[] = [];
  let sibling = classHeader.nextElementSibling;

  while (sibling && sibling.tagName !== 'H4') {
    if (sibling instanceof HTMLTableElement && sibling.classList.contains('marginBottom20')) {
      tables.push(sibling);
    }
    sibling = sibling.nextElementSibling;
  }

  return tables;
}

export function getAcademicRecordKey(record: Pick<AcademicRecord, 'course' | 'year' | 'period' | 'series' | 'code'>): string {
  return [record.course, record.year, record.period, record.series || '', record.code].join('|');
}

export function parseSuapMhtml(mhtml: string): SuapImportedRecord[] {
  const document = new DOMParser().parseFromString(getHtmlFromMhtml(mhtml), 'text/html');
  const importedRecords: SuapImportedRecord[] = [];

  for (const box of Array.from(document.querySelectorAll('.box'))) {
    const courseLabel = box.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim();
    if (!courseLabel) {
      continue;
    }

    for (const classHeader of Array.from(box.querySelectorAll<HTMLHeadingElement>('h4'))) {
      const classCode = classHeader.textContent?.replace(/\s+/g, ' ').trim();
      const classData = classCode ? parseClassData(classCode) : null;
      if (!classCode || !classData) {
        continue;
      }

      for (const table of getClassTables(classHeader)) {
        const stageCount = Number.parseInt(getDefinitionValue(table, 'Quantidade de Etapas:'), 10);
        const caption = table.querySelector('caption')?.textContent?.replace(/\s+/g, ' ').trim() || '';
        const parsedCaption = parseCaption(caption);
        const teachers = parseTeachers(getDefinitionValue(table, 'Professores:'));
        const course = Number.isInteger(stageCount) ? resolveCourse(courseLabel, classCode, stageCount) : null;

        if (!parsedCaption || !course || teachers.length === 0) {
          continue;
        }

        const integrated = stageCount >= 4;
        const period: AcademicPeriod = integrated
          ? '1º Bimestre'
          : (`Módulo ${classData.level}` as AcademicPeriod);

        importedRecords.push({
          course,
          year: classData.year,
          period,
          series: integrated ? `${classData.level}º Ano` : `Módulo ${classData.level}`,
          subject: parsedCaption.subject,
          code: parsedCaption.code,
          teacher: teachers[0],
          teachers,
          diaryId: parsedCaption.diaryId,
          classCode,
          stageCount,
        });
      }
    }
  }

  if (importedRecords.length === 0) {
    throw new Error(
      'Nenhum diário compatível foi encontrado. Exporte a página "Meus Diários" do SUAP como arquivo MHTML.'
    );
  }

  return importedRecords;
}
