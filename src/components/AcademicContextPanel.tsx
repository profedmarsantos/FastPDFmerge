import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  User,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  COURSES_CATALOG,
  CourseDefinition,
  DisciplineItem,
  loadSavedTeacherName,
  saveTeacherName,
  loadSavedSelection,
  saveCourseSelection,
} from '../data/coursesCatalog';

export interface AcademicSelectionState {
  teacher: string;
  course: CourseDefinition;
  periodName: string; // ex: '1º Ano' ou 'Módulo 1'
  discipline: DisciplineItem;
  year: number;
  bimester: '1' | '2' | '3' | '4'; // relevante para cursos integrados
}

interface AcademicContextPanelProps {
  selection: AcademicSelectionState;
  onChangeSelection: (newSel: AcademicSelectionState) => void;
  activeTab: '2pdfs' | '4pdfs';
}

export const AcademicContextPanel: React.FC<AcademicContextPanelProps> = ({
  selection,
  onChangeSelection,
  activeTab,
}) => {
  const [teacherInput, setTeacherInput] = useState<string>(selection.teacher);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // Sync internal teacher input if external selection changes
  useEffect(() => {
    setTeacherInput(selection.teacher);
  }, [selection.teacher]);

  const handleTeacherChange = (val: string) => {
    setTeacherInput(val);
    saveTeacherName(val);
    setShowSavedFeedback(true);
    onChangeSelection({
      ...selection,
      teacher: val,
    });
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2000);
  };

  const handleCourseChange = (courseId: string) => {
    const course = COURSES_CATALOG.find((c) => c.id === courseId) || COURSES_CATALOG[0];
    const firstPeriod = course.periods[0];
    const firstDiscipline = firstPeriod?.disciplinas[0] || { codigo: 'DISC', disciplina: 'Componente' };

    const newSel: AcademicSelectionState = {
      ...selection,
      course,
      periodName: firstPeriod ? firstPeriod.periodo : '1º Ano',
      discipline: firstDiscipline,
    };
    onChangeSelection(newSel);
    saveCourseSelection({
      teacherName: selection.teacher,
      courseId: course.id,
      periodName: newSel.periodName,
      disciplineCode: firstDiscipline.codigo,
      year: selection.year,
      bimester: selection.bimester,
    });
  };

  const handlePeriodChange = (periodName: string) => {
    const periodGroup = selection.course.periods.find((p) => p.periodo === periodName);
    const firstDiscipline = periodGroup?.disciplinas[0] || selection.discipline;

    const newSel: AcademicSelectionState = {
      ...selection,
      periodName,
      discipline: firstDiscipline,
    };
    onChangeSelection(newSel);
    saveCourseSelection({
      teacherName: selection.teacher,
      courseId: selection.course.id,
      periodName,
      disciplineCode: firstDiscipline.codigo,
      year: selection.year,
      bimester: selection.bimester,
    });
  };

  const handleDisciplineChange = (disciplineCode: string) => {
    const currentPeriodGroup = selection.course.periods.find((p) => p.periodo === selection.periodName);
    const disc = currentPeriodGroup?.disciplinas.find((d) => d.codigo === disciplineCode);
    if (!disc) return;

    const newSel: AcademicSelectionState = {
      ...selection,
      discipline: disc,
    };
    onChangeSelection(newSel);
    saveCourseSelection({
      teacherName: selection.teacher,
      courseId: selection.course.id,
      periodName: selection.periodName,
      disciplineCode: disc.codigo,
      year: selection.year,
      bimester: selection.bimester,
    });
  };

  const handleBimesterChange = (b: '1' | '2' | '3' | '4') => {
    const newSel: AcademicSelectionState = {
      ...selection,
      bimester: b,
    };
    onChangeSelection(newSel);
    saveCourseSelection({
      teacherName: selection.teacher,
      courseId: selection.course.id,
      periodName: selection.periodName,
      disciplineCode: selection.discipline.codigo,
      year: selection.year,
      bimester: b,
    });
  };

  const currentPeriodGroup = selection.course.periods.find((p) => p.periodo === selection.periodName) || selection.course.periods[0];
  const isModular = selection.course.modality === 'concomitante';

  return (
    <section
      aria-label="Configuração Acadêmica do Diário"
      className="mb-6 rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all space-y-4"
    >
      {/* Linha 1: Docente & Ano Letivo */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        {/* Professor(a) - O ÚNICO campo digitado pelo usuário */}
        <div className="sm:col-span-8">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="teacher-name-input"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800"
            >
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>Docente / Professor(a)</span>
              <span className="text-[11px] font-normal text-neutral-400">
                (único campo a digitar)
              </span>
            </label>
            {showSavedFeedback && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 animate-fade-in">
                <Check className="w-3 h-3" />
                Salvo no navegador
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="teacher-name-input"
              type="text"
              value={teacherInput}
              onChange={(e) => handleTeacherChange(e.target.value)}
              placeholder="Digite o nome do docente"
              className="w-full px-3.5 py-2 text-sm bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>
        </div>

        {/* Ano Letivo */}
        <div className="sm:col-span-4">
          <label
            htmlFor="academic-year-select"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>Ano Letivo</span>
          </label>
          <select
            id="academic-year-select"
            value={selection.year}
            onChange={(e) => {
              const y = Number(e.target.value) || 2026;
              onChangeSelection({ ...selection, year: y });
            }}
            className="w-full px-3 py-2 text-sm bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer transition-colors"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Linha 2: Curso & Regime (Integrado anual/bimestral vs Concomitante modular) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end pt-1 border-t border-neutral-100">
        {/* Seleção do Curso */}
        <div className="sm:col-span-7">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="course-select"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800"
            >
              <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
              <span>Curso Oficial</span>
            </label>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                isModular
                  ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                  : 'bg-blue-50 text-blue-700 border-blue-200/80'
              }`}
            >
              {isModular ? 'Modular (Concomitante)' : 'Bimestral (Integrado)'}
            </span>
          </div>
          <select
            id="course-select"
            value={selection.course.id}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer transition-colors font-medium"
          >
            <optgroup label="Cursos Integrados (Regime Anual · Bimestral)">
              {COURSES_CATALOG.filter((c) => c.modality === 'integrado').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Cursos Concomitantes (Regime Modular)">
              {COURSES_CATALOG.filter((c) => c.modality === 'concomitante').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Ano ou Módulo */}
        <div className="sm:col-span-5">
          <label
            htmlFor="period-select"
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 mb-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            <span>{isModular ? 'Módulo' : 'Série / Ano'}</span>
          </label>
          <div className="flex gap-1.5">
            {selection.course.periods.map((p) => {
              const isSelected = p.periodo === selection.periodName;
              return (
                <button
                  key={p.periodo}
                  type="button"
                  onClick={() => handlePeriodChange(p.periodo)}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs font-semibold'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {p.periodo}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Linha 3: Disciplina (JSON carregado) & Bimestre (se Integrado na aba 2 PDFs) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end pt-1 border-t border-neutral-100">
        {/* Disciplina (Componente Curricular do JSON) */}
        <div className={!isModular && activeTab === '2pdfs' ? 'sm:col-span-8' : 'sm:col-span-12'}>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="discipline-select"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800"
            >
              <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
              <span>Disciplina (Componente Curricular)</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-neutral-400">Código oficial:</span>
              <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                {selection.discipline.codigo}
              </span>
            </div>
          </div>
          <select
            id="discipline-select"
            value={selection.discipline.codigo}
            onChange={(e) => handleDisciplineChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer transition-colors"
          >
            {[...(currentPeriodGroup?.disciplinas || [])]
              .sort((a, b) => a.disciplina.localeCompare(b.disciplina, 'pt-BR', { sensitivity: 'base' }))
              .map((d) => (
                <option key={d.codigo} value={d.codigo}>
                  [{d.codigo}] {d.disciplina}
                </option>
              ))}
          </select>
        </div>

        {/* Seletor de Bimestre (exibido apenas se curso Integrado na aba 2 PDFs) */}
        {!isModular && activeTab === '2pdfs' && (
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Bimestre do Documento
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl">
              {(['1', '2', '3', '4'] as const).map((b) => {
                const isSelected = selection.bimester === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBimesterChange(b)}
                    className={`py-1 text-xs font-medium rounded-lg transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    {b}º
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resumo Institucional Ativo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-neutral-500 bg-neutral-50/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-5 rounded-b-2xl border-t border-neutral-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-neutral-700 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Configuração Ativa:</span>
          </span>
          <span className="font-semibold text-neutral-900">
            {selection.discipline.disciplina}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="font-mono text-[11px] bg-white border border-neutral-200/90 text-neutral-700 px-1.5 py-0.5 rounded">
            {selection.discipline.codigo}
          </span>
          <span className="text-neutral-300">·</span>
          <span>
            {isModular
              ? selection.periodName
              : `${selection.periodName}${activeTab === '2pdfs' ? ` (${selection.bimester}º Bim)` : ''}`}
          </span>
        </div>

        {selection.teacher ? (
          <span className="text-neutral-600 font-medium">
            Docente: <strong className="text-neutral-900">{selection.teacher}</strong>
          </span>
        ) : (
          <span className="text-amber-600 font-medium text-[11px]">
            ⚠️ Digite seu nome acima para os relatórios
          </span>
        )}
      </div>
    </section>
  );
};
