import automacaoConcomitanteJson from '../../courses/automacao-concomitante.json';
import automacaoIntegradoJson from '../../courses/automacao-integrado.json';
import informaticaConcomitanteJson from '../../courses/informatica-concomitante.json';
import informaticaIntegradoJson from '../../courses/informatica-integrado.json';

export type CourseModality = 'integrado' | 'concomitante';
export type CourseEvaluation = 'bimestral' | 'modular';

export interface DisciplineItem {
  codigo: string;
  disciplina: string;
}

export interface CoursePeriodGroup {
  periodo: string; // ex: '1º Ano', '2º Ano', 'Módulo 1', etc.
  modulo?: number;
  ano?: number;
  disciplinas: DisciplineItem[];
}

export interface CourseDefinition {
  id: string;
  name: string; // Nome oficial para relatórios e formulários
  shortLabel: string;
  modality: CourseModality; // 'integrado' ou 'concomitante'
  regime: 'anual' | 'modular';
  evaluation: CourseEvaluation; // 'bimestral' ou 'modular'
  periods: CoursePeriodGroup[];
}

function sortDisciplines(groups: CoursePeriodGroup[]): CoursePeriodGroup[] {
  return groups.map((g) => ({
    ...g,
    disciplinas: [...(g.disciplinas || [])].sort((a, b) =>
      a.disciplina.localeCompare(b.disciplina, 'pt-BR', { sensitivity: 'base' })
    ),
  }));
}

export const COURSES_CATALOG: CourseDefinition[] = [
  {
    id: 'informatica-integrado',
    name: 'Técnico em Informática Integrado ao Ensino Médio',
    shortLabel: 'Informática - Integrado (Bimestral)',
    modality: 'integrado',
    regime: 'anual',
    evaluation: 'bimestral',
    periods: sortDisciplines(informaticaIntegradoJson as CoursePeriodGroup[]),
  },
  {
    id: 'informatica-concomitante',
    name: 'Técnico em Informática Concomitante ao Ensino Médio',
    shortLabel: 'Informática - Concomitante (Modular)',
    modality: 'concomitante',
    regime: 'modular',
    evaluation: 'modular',
    periods: sortDisciplines(informaticaConcomitanteJson as CoursePeriodGroup[]),
  },
  {
    id: 'automacao-integrado',
    name: 'Técnico em Automação Industrial Integrado ao Ensino Médio',
    shortLabel: 'Automação - Integrado (Bimestral)',
    modality: 'integrado',
    regime: 'anual',
    evaluation: 'bimestral',
    periods: sortDisciplines(automacaoIntegradoJson as CoursePeriodGroup[]),
  },
  {
    id: 'automacao-concomitante',
    name: 'Técnico em Automação Industrial Concomitante ao Ensino Médio',
    shortLabel: 'Automação - Concomitante (Modular)',
    modality: 'concomitante',
    regime: 'modular',
    evaluation: 'modular',
    periods: sortDisciplines(automacaoConcomitanteJson as CoursePeriodGroup[]),
  },
];

export function getCourseById(id: string): CourseDefinition {
  return COURSES_CATALOG.find((c) => c.id === id) || COURSES_CATALOG[0];
}

export interface SavedTeacherSelection {
  teacherName: string;
  courseId: string;
  periodName: string;
  disciplineCode: string;
  year: number;
  bimester: '1' | '2' | '3' | '4';
}

const TEACHER_NAME_KEY = 'fastpdfmerge_teacher_name_v2';
const COURSE_SELECTION_KEY = 'fastpdfmerge_course_selection_v2';

export function loadSavedTeacherName(): string {
  try {
    return localStorage.getItem(TEACHER_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function saveTeacherName(name: string): void {
  try {
    localStorage.setItem(TEACHER_NAME_KEY, name.trim());
  } catch (err) {
    console.error('Error saving teacher name:', err);
  }
}

export function loadSavedSelection(): SavedTeacherSelection | null {
  try {
    const raw = localStorage.getItem(COURSE_SELECTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as SavedTeacherSelection;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCourseSelection(sel: SavedTeacherSelection): void {
  try {
    localStorage.setItem(COURSE_SELECTION_KEY, JSON.stringify(sel));
  } catch (err) {
    console.error('Error saving course selection:', err);
  }
}
