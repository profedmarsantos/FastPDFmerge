import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Calendar,
  GraduationCap,
  Layers,
  User,
  UserPlus,
  X,
  Upload,
  CircleHelp,
} from 'lucide-react';
import { AcademicRecord, CourseType, AcademicPeriod } from '../types';
import {
  COURSES,
  isIntegratedCourse,
  getModuleNumberFromPeriod,
} from '../utils/academicStorage';
import {
  COURSES_CATALOG,
  CourseDefinition,
  DisciplineItem,
  loadSavedTeacherName,
  saveTeacherName,
} from '../data/coursesCatalog';
import {
  getAcademicRecordKey,
  parseSuapMhtml,
  SuapImportedRecord,
} from '../utils/suapMhtmlImport';
import { SuapImportTutorialModal } from './SuapImportTutorialModal';

// Anos letivos solicitados até 2030
const ACADEMIC_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

interface AcademicRegistryTabProps {
  records: AcademicRecord[];
  activeRecordId: string | null;
  resetVersion: number;
  persistData: boolean;
  onSelectActiveRecord: (id: string) => void;
  onSaveRecord: (record: Omit<AcademicRecord, 'id' | 'createdAt'> & { id?: string }) => void;
  onImportRecords: (
    records: Array<Omit<AcademicRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ) => { imported: number; skipped: number };
  onDeleteRecord: (id: string) => void;
  onResetApp: () => void;
  onGoToMergeTab: (tab: 'modulos' | 'bimestres' | '2pdfs' | '4pdfs') => void;
}

export const AcademicRegistryTab: React.FC<AcademicRegistryTabProps> = ({
  records,
  activeRecordId,
  resetVersion,
  persistData,
  onSelectActiveRecord,
  onSaveRecord,
  onImportRecords,
  onDeleteRecord,
  onResetApp,
  onGoToMergeTab,
}) => {
  // Estado do formulário
  const [selectedCourse, setSelectedCourse] = useState<CourseType>(COURSES[0]);
  const [selectedSeriesOrModule, setSelectedSeriesOrModule] = useState<string>('1º Ano');
  const [selectedDisciplineCode, setSelectedDisciplineCode] = useState<string>('');
  const [year, setYear] = useState<number>(2026);
  const [teachers, setTeachers] = useState<string[]>(() => [
    persistData ? loadSavedTeacherName() : '',
  ]);

  // Modo de edição e mensagens
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importedRecords, setImportedRecords] = useState<SuapImportedRecord[]>([]);
  const [selectedImportIndexes, setSelectedImportIndexes] = useState<Set<number>>(new Set());
  const [isSuapTutorialOpen, setIsSuapTutorialOpen] = useState<boolean>(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSuccessMessage(null);
  }, [resetVersion]);

  const isIntegrated = isIntegratedCourse(selectedCourse);

  // Localiza a definição do curso no catálogo JSON
  const catalogCourse: CourseDefinition =
    COURSES_CATALOG.find((c) => {
      if (isIntegrated) {
        return (
          c.modality === 'integrado' &&
          ((selectedCourse.includes('Informática') && c.id.includes('informatica')) ||
            (selectedCourse.includes('Automação') && c.id.includes('automacao')))
        );
      } else {
        return (
          c.modality === 'concomitante' &&
          ((selectedCourse.includes('Informática') && c.id.includes('informatica')) ||
            (selectedCourse.includes('Automação') && c.id.includes('automacao')))
        );
      }
    }) || COURSES_CATALOG[0];

  // Grupos de períodos (1º Ano / 2º Ano / etc. ou Módulo 1 / etc.)
  const availablePeriodGroups = catalogCourse.periods;

  // Garante que o período/módulo selecionado exista no curso atual
  const activePeriodGroup =
    availablePeriodGroups.find((p) => p.periodo === selectedSeriesOrModule) ||
    availablePeriodGroups[0];

  // Lista de disciplinas do grupo ativo (sempre ordenadas alfabeticamente)
  const availableDisciplines: DisciplineItem[] = useMemo(() => {
    const list = activePeriodGroup?.disciplinas || [];
    return [...list].sort((a, b) =>
      a.disciplina.localeCompare(b.disciplina, 'pt-BR', { sensitivity: 'base' })
    );
  }, [activePeriodGroup]);

  // Garante uma disciplina selecionada válida
  const currentDiscipline: DisciplineItem =
    availableDisciplines.find((d) => d.codigo === selectedDisciplineCode) ||
    availableDisciplines[0] || {
      codigo: 'SJPALPR',
      disciplina: 'Algoritmo e Lógica de Programação',
    };

  // Lista de cadastros salvos (ordenados alfabeticamente pelo nome e pelo ano letivo)
  const sortedRecords: AcademicRecord[] = useMemo(() => {
    return [...records].sort((a, b) => {
      const comp = a.subject.localeCompare(b.subject, 'pt-BR', { sensitivity: 'base' });
      if (comp !== 0) return comp;
      return (b.year || 0) - (a.year || 0);
    });
  }, [records]);

  // Sincroniza ao trocar de curso
  const handleCourseChange = (newCourse: CourseType) => {
    setSelectedCourse(newCourse);
    const newIsIntegrated = isIntegratedCourse(newCourse);

    const targetCatalogCourse =
      COURSES_CATALOG.find((c) => {
        if (newIsIntegrated) {
          return (
            c.modality === 'integrado' &&
            ((newCourse.includes('Informática') && c.id.includes('informatica')) ||
              (newCourse.includes('Automação') && c.id.includes('automacao')))
          );
        } else {
          return (
            c.modality === 'concomitante' &&
            ((newCourse.includes('Informática') && c.id.includes('informatica')) ||
              (newCourse.includes('Automação') && c.id.includes('automacao')))
          );
        }
      }) || COURSES_CATALOG[0];

    const firstPeriod = targetCatalogCourse.periods[0]?.periodo || (newIsIntegrated ? '1º Ano' : 'Módulo 1');
    setSelectedSeriesOrModule(firstPeriod);

    const firstDisc = targetCatalogCourse.periods[0]?.disciplinas[0];
    if (firstDisc) {
      setSelectedDisciplineCode(firstDisc.codigo);
    }
  };

  // Sincroniza ao trocar a série ou módulo
  const handleSeriesOrModuleChange = (newSeries: string) => {
    setSelectedSeriesOrModule(newSeries);
    const group = availablePeriodGroups.find((p) => p.periodo === newSeries);
    if (group && group.disciplinas.length > 0) {
      const sorted = [...group.disciplinas].sort((a, b) =>
        a.disciplina.localeCompare(b.disciplina, 'pt-BR', { sensitivity: 'base' })
      );
      setSelectedDisciplineCode(sorted[0].codigo);
    }
  };

  // Carrega registro para edição
  const handleStartEdit = (rec: AcademicRecord) => {
    setEditingId(rec.id);
    setSelectedCourse(rec.course);
    setYear(rec.year);
    setTeachers(rec.teachers?.length ? rec.teachers : rec.teacher ? [rec.teacher] : ['']);

    const recIsIntegrated = isIntegratedCourse(rec.course);
    // Tenta encontrar em qual série/módulo essa disciplina está
    const targetCatalog =
      COURSES_CATALOG.find((c) => {
        if (recIsIntegrated) {
          return (
            c.modality === 'integrado' &&
            ((rec.course.includes('Informática') && c.id.includes('informatica')) ||
              (rec.course.includes('Automação') && c.id.includes('automacao')))
          );
        } else {
          return (
            c.modality === 'concomitante' &&
            ((rec.course.includes('Informática') && c.id.includes('informatica')) ||
              (rec.course.includes('Automação') && c.id.includes('automacao')))
          );
        }
      }) || COURSES_CATALOG[0];

    let foundSeries = rec.series || targetCatalog.periods[0]?.periodo || (recIsIntegrated ? '1º Ano' : 'Módulo 1');
    for (const p of targetCatalog.periods) {
      if (p.disciplinas.some((d) => d.codigo === rec.code || d.disciplina.toLowerCase() === rec.subject.toLowerCase())) {
        foundSeries = p.periodo;
        break;
      }
    }
    setSelectedSeriesOrModule(foundSeries);
    setSelectedDisciplineCode(rec.code);

    setErrorMessage(null);
    setSuccessMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSuapFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const parsedRecords = parseSuapMhtml(await file.text());
      const existingKeys = new Set(records.map(getAcademicRecordKey));
      const initialSelection = new Set<number>();
      parsedRecords.forEach((record, index) => {
        const key = getAcademicRecordKey(record);
        if (!existingKeys.has(key)) {
          initialSelection.add(index);
          existingKeys.add(key);
        }
      });
      setImportedRecords(parsedRecords);
      setSelectedImportIndexes(initialSelection);
    } catch (error) {
      setImportedRecords([]);
      setSelectedImportIndexes(new Set());
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível ler o arquivo do SUAP.');
    } finally {
      event.target.value = '';
    }
  };

  const handleConfirmImport = () => {
    const selectedRecords = importedRecords.filter((_, index) => selectedImportIndexes.has(index));
    if (selectedRecords.length === 0) {
      setErrorMessage('Selecione ao menos uma disciplina para importar.');
      return;
    }

    const result = onImportRecords(selectedRecords);
    setImportedRecords([]);
    setSelectedImportIndexes(new Set());
    setSuccessMessage(
      result.skipped > 0
        ? `${result.imported} disciplina(s) importada(s); ${result.skipped} duplicada(s) foi(ram) ignorada(s).`
        : `${result.imported} disciplina(s) importada(s) com sucesso!`
    );
  };

  // Submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const disc = currentDiscipline;
    if (!disc || !disc.disciplina) {
      setErrorMessage('Selecione uma disciplina válida da lista.');
      return;
    }

    // Salva o nome do professor no localStorage para uso futuro
    const savedTeachers = teachers.map((teacher) => teacher.trim()).filter(Boolean);
    if (persistData && savedTeachers[0]) {
      saveTeacherName(savedTeachers[0]);
    }

    // Período derivado: para cursos concomitantes é o próprio Módulo. Para integrados, '1º Bimestre' como padrão.
    const derivedPeriod: AcademicPeriod = isIntegrated
      ? '1º Bimestre'
      : (`Módulo ${getModuleNumberFromPeriod(selectedSeriesOrModule)}` as AcademicPeriod);

    onSaveRecord({
      id: editingId || undefined,
      course: selectedCourse,
      year: Number(year) || 2026,
      period: derivedPeriod,
      series: selectedSeriesOrModule,
      subject: disc.disciplina,
      code: disc.codigo,
      teacher: savedTeachers[0],
      teachers: savedTeachers.length > 0 ? savedTeachers : undefined,
    });

    setSuccessMessage(
      editingId ? 'Cadastro atualizado com sucesso!' : 'Disciplina cadastrada e salva com sucesso!'
    );
    setEditingId(null);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Cadastro / Edição */}
      <section
        aria-labelledby="form-academic-registry-title"
        className="w-full rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="form-academic-registry-title"
                className="text-sm font-semibold tracking-tight text-neutral-900"
              >
                {editingId ? 'Editar Cadastro de Disciplina' : 'Cadastrar Disciplina'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".mhtml,.mht,message/rfc822"
              onChange={handleSuapFileSelection}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Importar diários exportados pelo SUAP"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar do SUAP
            </button>
            <button
              type="button"
              onClick={() => setIsSuapTutorialOpen(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-sky-50 hover:text-sky-700 cursor-pointer"
              title="Ver tutorial de importação do SUAP"
              aria-label="Ver tutorial de importação do SUAP"
            >
              <CircleHelp className="h-4 w-4" />
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-medium px-2.5 py-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {importedRecords.length > 0 && (
          <section
            aria-labelledby="suap-import-preview-title"
            className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 space-y-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 id="suap-import-preview-title" className="text-sm font-semibold text-sky-950">
                  Disciplinas encontradas no SUAP
                </h3>
                <p className="text-xs text-sky-800">
                  Revise os registros selecionados antes de cadastrá-los. A leitura é feita apenas neste navegador.
                </p>
              </div>
              <span className="text-xs font-medium text-sky-800">
                {selectedImportIndexes.size} de {importedRecords.length} selecionada(s)
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-sky-100 bg-white divide-y divide-sky-100">
              {importedRecords.map((record, index) => {
                const isExisting = records.some(
                  (existingRecord) => getAcademicRecordKey(existingRecord) === getAcademicRecordKey(record)
                );
                return (
                  <label
                    key={`${record.diaryId}-${record.code}-${index}`}
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-sky-50/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedImportIndexes.has(index)}
                      onChange={() =>
                        setSelectedImportIndexes((current) => {
                          const next = new Set(current);
                          if (next.has(index)) next.delete(index);
                          else next.add(index);
                          return next;
                        })
                      }
                      className="mt-0.5 accent-neutral-900"
                    />
                    <span className="min-w-0 flex-1 text-xs">
                      <span className="block font-semibold text-neutral-900">
                        [{record.code}] {record.subject}
                      </span>
                      <span className="block mt-0.5 text-neutral-600">
                        {record.course} · {record.series} · {record.teachers.join(', ')}
                      </span>
                      <span className="block mt-0.5 font-mono text-[11px] text-neutral-500">
                        Turma {record.classCode} · Diário {record.diaryId} · {record.stageCount} etapa(s)
                      </span>
                      {isExisting && (
                        <span className="block mt-1 text-[11px] font-medium text-amber-700">
                          Já cadastrado; será ignorado caso seja selecionado.
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportedRecords([]);
                  setSelectedImportIndexes(new Set());
                }}
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 rounded-lg"
              >
                Cancelar importação
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Importar selecionadas
              </button>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Linha 1: Docentes / Professores(as) */}
          <div className="bg-neutral-50/70 p-3.5 sm:p-4 rounded-xl border border-neutral-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <User className="w-3.5 h-3.5 text-neutral-600" />
                <span>Professor(a)</span>
              </span>
              <button
                type="button"
                onClick={() => setTeachers((current) => [...current, ''])}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 hover:text-neutral-950"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Adicionar professor(a)
              </button>
            </div>
            {teachers.map((teacher, index) => (
              <div key={index} className="flex gap-2">
                <input
                  id={index === 0 ? 'input-teacher-name' : undefined}
                  type="text"
                  value={teacher}
                  onChange={(e) =>
                    setTeachers((current) =>
                      current.map((name, currentIndex) =>
                        currentIndex === index ? e.target.value : name
                      )
                    )
                  }
                  placeholder="Ex.: nome do docente"
                  aria-label={`Professor(a) ${index + 1}`}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                />
                {teachers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTeachers((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    aria-label={`Remover professor(a) ${index + 1}`}
                    title="Remover professor(a)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Linha 2: Curso & Ano Letivo (até 2030) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            {/* Curso */}
            <div className="sm:col-span-8">
              <label
                htmlFor="select-course-type"
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 mb-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
                <span>Curso</span>
              </label>
              <select
                id="select-course-type"
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value as CourseType)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer font-medium"
              >
                <optgroup label="Cursos Integrados (Regime Anual · Bimestral)">
                  <option value={COURSES[2]}>{COURSES[2]}</option>
                  <option value={COURSES[0]}>{COURSES[0]}</option>
                </optgroup>
                <optgroup label="Cursos Concomitantes (Regime Modular · Modular)">
                  <option value={COURSES[3]}>{COURSES[3]}</option>
                  <option value={COURSES[1]}>{COURSES[1]}</option>
                </optgroup>
              </select>
            </div>

            {/* Ano Letivo (Lista até 2030) */}
            <div className="sm:col-span-4">
              <label
                htmlFor="select-academic-year"
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Ano Letivo</span>
              </label>
              <select
                id="select-academic-year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer font-mono"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Série / Ano ou Módulo do Curso */}
          <div className="space-y-1.5">
            <label
              htmlFor="select-series-module"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800"
            >
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span>{isIntegrated ? 'Ano do Curso' : 'Módulo do Curso'}</span>
            </label>
            <div className="flex gap-1.5">
              {availablePeriodGroups.map((p) => {
                const isSelected = p.periodo === selectedSeriesOrModule;
                return (
                  <button
                    key={p.periodo}
                    type="button"
                    onClick={() => handleSeriesOrModuleChange(p.periodo)}
                    className={`flex-1 py-2 px-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
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

          {/* Linha 4: Disciplina do JSON Oficial (com Código Automático) */}
          <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="select-discipline"
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                <span>Disciplina</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-500">Código oficial:</span>
                <span className="font-mono text-xs font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded-md shadow-2xs">
                  {currentDiscipline.codigo}
                </span>
              </div>
            </div>

            <select
              id="select-discipline"
              value={currentDiscipline.codigo}
              onChange={(e) => setSelectedDisciplineCode(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
            >
              {availableDisciplines.map((d) => (
                <option key={d.codigo} value={d.codigo} className="font-mono">
                  [{d.codigo}] {d.disciplina}
                </option>
              ))}
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              id="btn-save-academic-record"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{editingId ? 'Atualizar Cadastro' : 'Salvar Cadastro'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Lista de Cadastros Salvos */}
      <section
        aria-labelledby="saved-academic-records-title"
        className="w-full rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="pb-3 border-b border-neutral-100">
          <h2
            id="saved-academic-records-title"
            className="text-sm font-semibold tracking-tight text-neutral-900"
          >
            Disciplinas Cadastradas:
          </h2>
        </div>

        {records.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-neutral-500">
              Nenhuma disciplina cadastrada ainda. Selecione os dados acima e clique em &quot;Salvar Cadastro&quot;.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {sortedRecords.map((rec) => {
              const isActive = rec.id === activeRecordId;
              const isMod = !isIntegratedCourse(rec.course);
              const displaySeries = rec.series || (isMod ? rec.period : 'Anual');

              return (
                <div
                  key={rec.id}
                  className={`py-3.5 px-3 sm:px-4 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive ? 'bg-neutral-50 border border-neutral-200/80 shadow-2xs' : 'hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectActiveRecord(rec.id)}
                      title={isActive ? 'Cadastro ativo' : 'Definir como cadastro ativo'}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'border-2 border-neutral-300 hover:border-neutral-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-200/70 px-1.5 py-0.5 rounded">
                          {rec.code}
                        </span>
                        <span className="font-semibold text-sm text-neutral-900 truncate">
                          {rec.subject}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            Ativo
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span>{isMod ? 'Modular' : 'Integrado'}</span>
                        <span className="text-neutral-300">·</span>
                        <span className="font-mono">{displaySeries}</span>
                        <span className="text-neutral-300">·</span>
                        <span>{rec.year}</span>
                        {(rec.teachers?.length || rec.teacher) && (
                          <>
                            <span className="text-neutral-300">·</span>
                            <span className="text-neutral-600 font-medium truncate">
                              Prof. {(rec.teachers?.length ? rec.teachers : [rec.teacher]).filter(Boolean).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(rec)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar cadastro"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === rec.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteRecord(rec.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-[11px] text-neutral-500 hover:text-neutral-700 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(rec.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir cadastro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section
        aria-labelledby="reset-application-title"
        className="w-full rounded-2xl border border-rose-200/90 bg-rose-50/60 p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="reset-application-title" className="text-sm font-semibold text-rose-950">
                Redefinir toda a aplicação
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-800">
                Apaga todos os cadastros, PDFs gerados e configurações salvas neste navegador.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetApp}
            className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Redefinir app</span>
          </button>
        </div>
      </section>
      <SuapImportTutorialModal
        isOpen={isSuapTutorialOpen}
        onClose={() => setIsSuapTutorialOpen(false)}
      />
    </div>
  );
};
