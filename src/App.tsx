import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Loader2,
  Download,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { PdfFileInfo, MergeResult, MergeStatus, AcademicRecord, GeneratedPdf, GeneratedPdfTab } from './types';
import {
  getPdfInfo,
  mergeMultiplePdfs,
  triggerDownload,
} from './utils/pdfMerger';
import {
  AcademicNamingConfig,
  formatFourBimestersFileName,
} from './utils/namingConfig';
import {
  loadAcademicRecords,
  saveAcademicRecords,
  loadActiveRecordId,
  saveActiveRecordId,
  isIntegratedCourse,
  getModuleNumberFromPeriod,
  clearAllAcademicStorage,
  isModularRecord,
  isIntegratedRecord,
} from './utils/academicStorage';
import {
  clearGeneratedPdfs,
  deleteGeneratedPdf,
  loadGeneratedPdfs,
  saveGeneratedPdf,
} from './utils/generatedPdfStorage';
import { generateRecoveryReportPdf } from './utils/recoveryReportGenerator';
import { loadSavedTeacherName } from './data/coursesCatalog';
import { sanitizeUserErrorMessage } from './utils/security';
import { BUILD_VERSION } from './utils/buildInfo';
import { APP_FOOTER_CREDITS } from './constants/credits';
import { Header } from './components/Header';
import { ResetAppModal } from './components/ResetAppModal';
import { PrivacyModal } from './components/PrivacyModal';
import { NamingConfigPanel } from './components/NamingConfigPanel';
import { AcademicRegistryTab } from './components/AcademicRegistryTab';
import { ActiveContextBanner } from './components/ActiveContextBanner';
import { PeriodMergeCard } from './components/PeriodMergeCard';
import { GeneratedPdfList } from './components/GeneratedPdfList';
import { StorageChoiceModal, StorageMode } from './components/StorageChoiceModal';

type ActiveTab = 'modulos' | 'bimestres' | 'cadastros';
const STORAGE_MODE_KEY = 'fastpdfmerge_storage_mode_v1';

function loadStorageMode(): StorageMode | null {
  try {
    return localStorage.getItem(STORAGE_MODE_KEY) === 'persistent' ? 'persistent' : null;
  } catch {
    return null;
  }
}

export interface PeriodSlot {
  proposta: PdfFileInfo | null;
  relatorio: PdfFileInfo | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cadastros');
  const [storageMode, setStorageMode] = useState<StorageMode | null>(loadStorageMode);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<boolean>(false);
  const [resetVersion, setResetVersion] = useState<number>(0);

  // --------------------------------------------------------------------------
  // ACADEMIC REGISTRY STATE & SEPARATE CONTEXT FOR MODULAR & INTEGRATED
  // --------------------------------------------------------------------------
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  // Listas filtradas: apenas cursos modulares para Módulo, apenas integrados para Bimestres
  const modularRecords = academicRecords.filter(isModularRecord);
  const integratedRecords = academicRecords.filter(isIntegratedRecord);

  const [activeModularRecordId, setActiveModularRecordId] = useState<string | null>(null);
  const [activeIntegratedRecordId, setActiveIntegratedRecordId] = useState<string | null>(null);

  const activeModularRecord =
    (activeModularRecordId && modularRecords.find((r) => r.id === activeModularRecordId)) || null;

  const activeIntegratedRecord =
    (activeIntegratedRecordId && integratedRecords.find((r) => r.id === activeIntegratedRecordId)) || null;

  // Registro acadêmico atualmente ativo na aba corrente
  const activeRecord =
    activeTab === 'modulos'
      ? activeModularRecord
      : activeTab === 'bimestres'
      ? activeIntegratedRecord
      : academicRecords.find((r) => r.id === activeRecordId) || null;

  // --------------------------------------------------------------------------
  // TAB BIMESTRES: 4 Bimestres (1º, 2º, 3º, 4º)
  // Cada bimestre tem seus botões: PROPOSTA e RELATÓRIO
  // --------------------------------------------------------------------------
  const [bimestresData, setBimestresData] = useState<PeriodSlot[]>([
    { proposta: null, relatorio: null },
    { proposta: null, relatorio: null },
    { proposta: null, relatorio: null },
    { proposta: null, relatorio: null },
  ]);

  // --------------------------------------------------------------------------
  // TAB MÓDULOS: Módulos (Módulo 1 a 4)
  // --------------------------------------------------------------------------
  const [selectedModule, setSelectedModule] = useState<number>(() => {
    if (activeModularRecord) {
      return getModuleNumberFromPeriod(activeModularRecord.period);
    }
    return 1;
  });

  const [modulesData, setModulesData] = useState<PeriodSlot[]>([
    { proposta: null, relatorio: null },
    { proposta: null, relatorio: null },
    { proposta: null, relatorio: null },
    { proposta: null, relatorio: null },
  ]);

  // Modo de visualização de módulos: fixo em módulo único (foco)
  const showAllModules = false;

  // --------------------------------------------------------------------------
  // SHARED MERGE & STATUS STATE
  // --------------------------------------------------------------------------
  const [status, setStatus] = useState<MergeStatus>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [generatedPdfs, setGeneratedPdfs] = useState<GeneratedPdf[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const usesPersistentStorage = storageMode === 'persistent';

  useEffect(() => {
    if (!usesPersistentStorage) {
      return;
    }

    const savedRecords = loadAcademicRecords();
    const savedActiveRecordId = loadActiveRecordId();
    setAcademicRecords(savedRecords);
    setActiveRecordId(savedActiveRecordId);

    try {
      const savedModularId = localStorage.getItem('fastpdfmerge_active_modular_id_v1');
      const savedIntegratedId = localStorage.getItem('fastpdfmerge_active_integrated_id_v1');
      setActiveModularRecordId(
        savedModularId && savedRecords.some((record) => record.id === savedModularId && isModularRecord(record))
          ? savedModularId
          : null
      );
      setActiveIntegratedRecordId(
        savedIntegratedId &&
          savedRecords.some((record) => record.id === savedIntegratedId && isIntegratedRecord(record))
          ? savedIntegratedId
          : null
      );
    } catch {
      setActiveModularRecordId(null);
      setActiveIntegratedRecordId(null);
    }

    void loadGeneratedPdfs()
      .then(setGeneratedPdfs)
      .catch((error: unknown) => {
        console.error('Falha ao carregar PDFs gerados:', error);
        setGeneralError('Não foi possível carregar os PDFs gerados salvos neste navegador.');
      });
  }, [usesPersistentStorage]);

  const handleStorageModeSelection = async (mode: StorageMode) => {
    if (mode === 'persistent') {
      try {
        localStorage.setItem(STORAGE_MODE_KEY, 'persistent');
      } catch (error: unknown) {
        console.error('Falha ao salvar a escolha de privacidade:', error);
        throw new Error('Não foi possível salvar sua escolha de privacidade neste navegador. Tente o modo temporário.');
      }
    } else {
      await clearGeneratedPdfs();
      clearAllAcademicStorage();
      localStorage.removeItem(STORAGE_MODE_KEY);
      setAcademicRecords([]);
      setActiveRecordId(null);
      setActiveModularRecordId(null);
      setActiveIntegratedRecordId(null);
      setGeneratedPdfs([]);
    }

    setStorageMode(mode);
  };

  // Naming Configuration
  const [namingConfig, setNamingConfig] = useState<AcademicNamingConfig>(() => ({
    bimester: '1',
    ordinalChar: 'º',
    disciplineCode: activeRecord?.code || '',
    disciplineName: activeRecord?.subject || '',
    year: String(activeRecord?.year || new Date().getFullYear()),
  }));
  const [customNamingMode, setCustomNamingMode] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>('');

  // Atualiza selectedModule se o registro modular ativo mudar
  useEffect(() => {
    if (activeModularRecord) {
      setSelectedModule(getModuleNumberFromPeriod(activeModularRecord.period));
    }
  }, [activeModularRecord?.id, activeModularRecord?.period]);

  // Sincroniza informações da disciplina ativa com base na aba atual
  useEffect(() => {
    const currentRec =
      activeTab === 'modulos'
        ? activeModularRecord
        : activeTab === 'bimestres'
        ? activeIntegratedRecord
        : activeRecord;

    if (currentRec) {
      const isModular = isModularRecord(currentRec);
      const modNum = isModular ? getModuleNumberFromPeriod(currentRec.period) : 1;

      setNamingConfig((prev) => ({
        ...prev,
        disciplineName: currentRec.subject,
        disciplineCode: currentRec.code,
        year: String(currentRec.year),
        periodPrefix: isModular ? `Mod${modNum}` : undefined,
      }));
    } else {
      setNamingConfig((prev) => ({
        ...prev,
        disciplineName: '',
        disciplineCode: '',
        periodPrefix: activeTab === 'modulos' ? `Mod${selectedModule}` : undefined,
      }));
    }
  }, [
    activeTab,
    selectedModule,
    activeRecord?.id,
    activeModularRecord?.id,
    activeModularRecord?.subject,
    activeModularRecord?.code,
    activeModularRecord?.period,
    activeModularRecord?.year,
    activeModularRecord?.course,
    activeIntegratedRecord?.id,
    activeIntegratedRecord?.subject,
    activeIntegratedRecord?.code,
    activeIntegratedRecord?.period,
    activeIntegratedRecord?.year,
    activeIntegratedRecord?.course,
  ]);

  const handleSelectModularRecord = (id: string) => {
    const val = id.trim() || null;
    setActiveModularRecordId(val);
    if (usesPersistentStorage) {
      try {
        if (val) localStorage.setItem('fastpdfmerge_active_modular_id_v1', val);
        else localStorage.removeItem('fastpdfmerge_active_modular_id_v1');
      } catch {}
    }
    if (val) {
      setActiveRecordId(val);
      if (usesPersistentStorage) saveActiveRecordId(val);
    }
    clearModuleUploads();
  };

  const handleSelectIntegratedRecord = (id: string) => {
    const val = id.trim() || null;
    setActiveIntegratedRecordId(val);
    if (usesPersistentStorage) {
      try {
        if (val) localStorage.setItem('fastpdfmerge_active_integrated_id_v1', val);
        else localStorage.removeItem('fastpdfmerge_active_integrated_id_v1');
      } catch {}
    }
    if (val) {
      setActiveRecordId(val);
      if (usesPersistentStorage) saveActiveRecordId(val);
    }
    clearBimestreUploads();
  };

  const handleSelectActiveRecord = (id: string) => {
    setActiveRecordId(id);
    if (usesPersistentStorage) saveActiveRecordId(id);
    const rec = academicRecords.find((r) => r.id === id);
    if (rec) {
      if (isModularRecord(rec)) {
        setActiveModularRecordId(id);
        if (usesPersistentStorage) {
          try {
            localStorage.setItem('fastpdfmerge_active_modular_id_v1', id);
          } catch {}
        }
      } else {
        setActiveIntegratedRecordId(id);
        if (usesPersistentStorage) {
          try {
            localStorage.setItem('fastpdfmerge_active_integrated_id_v1', id);
          } catch {}
        }
      }
    }
  };

  useEffect(() => {
    if (academicRecords.length === 0 || academicRecords.some((record) => record.id === activeRecordId)) {
      return;
    }

    const firstRecord = [...academicRecords].sort((a, b) => {
      const subjectComparison = a.subject.localeCompare(b.subject, 'pt-BR', { sensitivity: 'base' });
      if (subjectComparison !== 0) return subjectComparison;
      return b.year - a.year;
    })[0];

    handleSelectActiveRecord(firstRecord.id);
  }, [academicRecords, activeRecordId]);

  const handleSaveRecord = (
    recordData: Omit<AcademicRecord, 'id' | 'createdAt'> & { id?: string }
  ) => {
    let updatedRecords: AcademicRecord[];
    let targetId: string;

    if (recordData.id) {
      targetId = recordData.id;
      updatedRecords = academicRecords.map((r) =>
        r.id === recordData.id
          ? {
              ...r,
              ...recordData,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
    } else {
      targetId = 'rec-' + Date.now();
      const newRecord: AcademicRecord = {
        id: targetId,
        course: recordData.course,
        year: recordData.year,
        period: recordData.period,
        subject: recordData.subject,
        code: recordData.code,
        teacher: recordData.teacher,
        teachers: recordData.teachers,
        createdAt: new Date().toISOString(),
      };

      updatedRecords = [newRecord, ...academicRecords];
    }

    setAcademicRecords(updatedRecords);
    if (usesPersistentStorage) saveAcademicRecords(updatedRecords);
    setActiveRecordId(targetId);
    if (usesPersistentStorage) saveActiveRecordId(targetId);

    const savedRecord = updatedRecords.find((r) => r.id === targetId);
    if (savedRecord) {
      if (isModularRecord(savedRecord)) {
        setActiveModularRecordId(targetId);
        if (usesPersistentStorage) {
          try {
            localStorage.setItem('fastpdfmerge_active_modular_id_v1', targetId);
          } catch {}
        }
      } else {
        setActiveIntegratedRecordId(targetId);
        if (usesPersistentStorage) {
          try {
            localStorage.setItem('fastpdfmerge_active_integrated_id_v1', targetId);
          } catch {}
        }
      }
    }
  };

  const handleImportRecords = (
    recordsToImport: Array<Omit<AcademicRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): { imported: number; skipped: number } => {
    const recordKey = (record: Pick<AcademicRecord, 'course' | 'year' | 'period' | 'series' | 'code'>) =>
      [record.course, record.year, record.period, record.series || '', record.code].join('|');
    const knownRecordKeys = new Set(academicRecords.map(recordKey));
    const freshRecords: AcademicRecord[] = [];

    for (const record of recordsToImport) {
      const key = recordKey(record);
      if (knownRecordKeys.has(key)) {
        continue;
      }

      knownRecordKeys.add(key);
      freshRecords.push({
        ...record,
        id: `rec-${Date.now()}-${freshRecords.length}`,
        createdAt: new Date().toISOString(),
      });
    }

    if (freshRecords.length === 0) {
      return { imported: 0, skipped: recordsToImport.length };
    }

    const updatedRecords = [...freshRecords, ...academicRecords];
    setAcademicRecords(updatedRecords);
    if (usesPersistentStorage) saveAcademicRecords(updatedRecords);
    const activeImportedRecord = freshRecords[0];
    setActiveRecordId(activeImportedRecord.id);
    if (usesPersistentStorage) saveActiveRecordId(activeImportedRecord.id);
    if (isModularRecord(activeImportedRecord)) {
      setActiveModularRecordId(activeImportedRecord.id);
      if (usesPersistentStorage) {
        try {
          localStorage.setItem('fastpdfmerge_active_modular_id_v1', activeImportedRecord.id);
        } catch (err) {
          console.error('Error saving imported active record id:', err);
        }
      }
    } else {
      setActiveIntegratedRecordId(activeImportedRecord.id);
      if (usesPersistentStorage) {
        try {
          localStorage.setItem('fastpdfmerge_active_integrated_id_v1', activeImportedRecord.id);
        } catch (err) {
          console.error('Error saving imported active record id:', err);
        }
      }
    }

    return {
      imported: freshRecords.length,
      skipped: recordsToImport.length - freshRecords.length,
    };
  };

  const handleDeleteRecord = (id: string) => {
    const filtered = academicRecords.filter((r) => r.id !== id);
    setAcademicRecords(filtered);
    if (usesPersistentStorage) saveAcademicRecords(filtered);

    if (activeRecordId === id) {
      const nextId = filtered[0]?.id || null;
      setActiveRecordId(nextId);
      if (usesPersistentStorage) saveActiveRecordId(nextId);
    }

    if (activeModularRecordId === id) {
      const nextMod = filtered.find(isModularRecord)?.id || null;
      setActiveModularRecordId(nextMod);
      if (usesPersistentStorage) {
        try {
          if (nextMod) localStorage.setItem('fastpdfmerge_active_modular_id_v1', nextMod);
          else localStorage.removeItem('fastpdfmerge_active_modular_id_v1');
        } catch {}
      }
    }

    if (activeIntegratedRecordId === id) {
      const nextInt = filtered.find(isIntegratedRecord)?.id || null;
      setActiveIntegratedRecordId(nextInt);
      if (usesPersistentStorage) {
        try {
          if (nextInt) localStorage.setItem('fastpdfmerge_active_integrated_id_v1', nextInt);
          else localStorage.removeItem('fastpdfmerge_active_integrated_id_v1');
        } catch {}
      }
    }
  };

  // --------------------------------------------------------------------------
  // FILE SELECTION HANDLERS - BIMESTRES
  // --------------------------------------------------------------------------
  const handleSelectBimestreFile = async (
    file: File,
    index: number,
    type: 'proposta' | 'relatorio'
  ) => {
    setGeneralError(null);
    const newInfo: PdfFileInfo = {
      file,
      name: file.name,
      size: file.size,
      pageCount: null,
      isLoadingInfo: true,
    };

    setBimestresData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [type]: newInfo };
      return next;
    });

    const { pageCount, isValid, error } = await getPdfInfo(file);

    setBimestresData((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [type]: {
          file,
          name: file.name,
          size: file.size,
          pageCount: isValid ? pageCount : null,
          isLoadingInfo: false,
          error: isValid ? undefined : error,
        },
      };
      return next;
    });
  };

  const handleRemoveBimestreFile = (index: number, type: 'proposta' | 'relatorio') => {
    setGeneralError(null);
    setBimestresData((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [type]: null };
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // FILE SELECTION HANDLERS - MÓDULOS
  // --------------------------------------------------------------------------
  const handleSelectModuleFile = async (
    file: File,
    modIndex: number,
    type: 'proposta' | 'relatorio'
  ) => {
    setGeneralError(null);
    const newInfo: PdfFileInfo = {
      file,
      name: file.name,
      size: file.size,
      pageCount: null,
      isLoadingInfo: true,
    };

    setModulesData((prev) => {
      const next = [...prev];
      next[modIndex] = { ...next[modIndex], [type]: newInfo };
      return next;
    });

    const { pageCount, isValid, error } = await getPdfInfo(file);

    setModulesData((prev) => {
      const next = [...prev];
      next[modIndex] = {
        ...next[modIndex],
        [type]: {
          file,
          name: file.name,
          size: file.size,
          pageCount: isValid ? pageCount : null,
          isLoadingInfo: false,
          error: isValid ? undefined : error,
        },
      };
      return next;
    });
  };

  const handleRemoveModuleFile = (modIndex: number, type: 'proposta' | 'relatorio') => {
    setGeneralError(null);
    setModulesData((prev) => {
      const next = [...prev];
      next[modIndex] = { ...next[modIndex], [type]: null };
      return next;
    });
  };



  const clearBimestreUploads = () => {
    setBimestresData([
      { proposta: null, relatorio: null },
      { proposta: null, relatorio: null },
      { proposta: null, relatorio: null },
      { proposta: null, relatorio: null },
    ]);
    setStatus('idle');
    setProgressMsg('');
    setGeneralError(null);
  };

  const handleClearBimestres = () => {
    clearBimestreUploads();
  };

  const clearModuleUploads = () => {
    setModulesData([
      { proposta: null, relatorio: null },
      { proposta: null, relatorio: null },
      { proposta: null, relatorio: null },
      { proposta: null, relatorio: null },
    ]);
    setStatus('idle');
    setProgressMsg('');
    setGeneralError(null);
  };

  const handleClearModules = () => {
    clearModuleUploads();
  };

  const persistGeneratedPdf = async (tab: GeneratedPdfTab, result: MergeResult) => {
    triggerDownload(result.url, result.fileName);

    if (!usesPersistentStorage) {
      setGeneratedPdfs((previous) => [
        {
          id: crypto.randomUUID(),
          tab,
          blob: result.blob,
          fileName: result.fileName,
          size: result.size,
          totalPages: result.totalPages,
          createdAt: result.mergedAt.toISOString(),
        },
        ...previous,
      ]);
      window.setTimeout(() => URL.revokeObjectURL(result.url), 0);
      return;
    }

    try {
      const generatedPdf = await saveGeneratedPdf(tab, result);
      setGeneratedPdfs((previous) => [generatedPdf, ...previous]);
    } catch (error: unknown) {
      console.error('Falha ao salvar PDF gerado:', error);
      setGeneralError(
        'O PDF foi gerado e baixado, mas não pôde ser salvo para um novo download neste navegador.'
      );
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(result.url), 0);
    }
  };

  const handleDeleteGeneratedPdf = async (id: string) => {
    if (!usesPersistentStorage) {
      setGeneratedPdfs((previous) => previous.filter((pdf) => pdf.id !== id));
      return;
    }

    try {
      await deleteGeneratedPdf(id);
      setGeneratedPdfs((previous) => previous.filter((pdf) => pdf.id !== id));
    } catch (error: unknown) {
      console.error('Falha ao excluir PDF gerado:', error);
      setGeneralError('Não foi possível excluir o PDF gerado deste navegador.');
    }
  };

  // --------------------------------------------------------------------------
  // MERGE LOGIC: BIMESTRES
  // "Os botões que não forem carregados, ira carregar o documento padrão já implementado."
  // --------------------------------------------------------------------------
  const handleMergeBimestres = async () => {
    if (!activeIntegratedRecord) {
      setGeneralError(
        'Nenhuma disciplina de curso integrado selecionada. Selecione uma disciplina na lista acima ou configure em Cadastros antes de gerar o PDF.'
      );
      setStatus('idle');
      return;
    }

    // Validação estrita: se um card foi carregado, o outro também deve ser carregado!
    const incompleteBimesters: string[] = [];
    for (let i = 0; i < 4; i++) {
      const slot = bimestresData[i];
      const hasProp = Boolean(slot.proposta);
      const hasRel = Boolean(slot.relatorio);
      if ((hasProp && !hasRel) || (!hasProp && hasRel)) {
        const missing = !hasProp ? 'Proposta' : 'Relatório';
        incompleteBimesters.push(`${i + 1}º Bimestre (falta ${missing})`);
      }
    }

    if (incompleteBimesters.length > 0) {
      setGeneralError(
        `Carga incompleta detectada: ${incompleteBimesters.join(', ')}. Para cada bimestre com recuperação, é obrigatório enviar tanto a Proposta quanto o Relatório. Caso o período não tenha tido recuperação, remova o arquivo para gerar o documento padrão oficial.`
      );
      setStatus('idle');
      return;
    }

    try {
      setStatus('merging');
      setGeneralError(null);
      setProgressMsg('Iniciando processamento dos 4 bimestres...');

      const filesToMerge: File[] = [];
      const sequenceParts: string[] = [];

      const courseName = activeIntegratedRecord?.course || 'Técnico em Informática Integrado ao Ensino Médio';
      const year = namingConfig.year || activeIntegratedRecord?.year || new Date().getFullYear();
      const subject = namingConfig.disciplineName || activeIntegratedRecord?.subject || 'Componente Curricular';
      const code = namingConfig.disciplineCode || activeIntegratedRecord?.code || 'DISC';
      const teachers = activeIntegratedRecord?.teachers?.length
        ? activeIntegratedRecord.teachers
        : [activeIntegratedRecord?.teacher || (usesPersistentStorage ? loadSavedTeacherName() : '') || 'Docente responsável'];

      for (let i = 0; i < 4; i++) {
        const bimesterNum = i + 1;
        const slot = bimestresData[i];
        const periodLabel = `${bimesterNum}º Bimestre`;
        const periodUpper = `${bimesterNum}º BIMESTRE`;

        const hasProposta = Boolean(slot.proposta && !slot.proposta.error);
        const hasRelatorio = Boolean(slot.relatorio && !slot.relatorio.error);

        if (hasProposta && hasRelatorio) {
          filesToMerge.push(slot.proposta!.file);
          filesToMerge.push(slot.relatorio!.file);
          sequenceParts.push(`${bimesterNum}º Bim (Proposta + Relatório)`);
        } else if (hasProposta && !hasRelatorio) {
          filesToMerge.push(slot.proposta!.file);
          sequenceParts.push(`${bimesterNum}º Bim (Proposta)`);
        } else if (!hasProposta && hasRelatorio) {
          filesToMerge.push(slot.relatorio!.file);
          sequenceParts.push(`${bimesterNum}º Bim (Relatório)`);
        } else {
          // Ambos vazios -> Carrega o documento padrão oficial já implementado!
          setProgressMsg(`Gerando formulário oficial sem recuperação para o ${periodLabel}...`);
          const defaultReport = await generateRecoveryReportPdf(
            {
              course: courseName,
              year,
              period: periodUpper,
              subject,
              code,
              teachers,
            },
            `Relatorio_Sem_Recuperacao_${bimesterNum}Bim_${code}.pdf`
          );
          filesToMerge.push(defaultReport);
          sequenceParts.push(`${bimesterNum}º Bim (Padrão: Sem rec.)`);
        }
      }

      setProgressMsg('Mesclando todos os arquivos em documento único...');

      let outputFileName: string;
      if (customNamingMode && customFileName.trim()) {
        outputFileName = customFileName.trim();
      } else {
        outputFileName = formatFourBimestersFileName(code, subject, String(year));
      }

      const sequenceDesc = sequenceParts.join(' + ');
      const result = await mergeMultiplePdfs(
        filesToMerge,
        outputFileName,
        (msg) => setProgressMsg(msg),
        sequenceDesc
      );

      await persistGeneratedPdf('bimestres', result);
      setStatus('completed');
    } catch (err: unknown) {
      console.error('Falha ao mesclar bimestres:', err);
      setStatus('error');
      setGeneralError(
        sanitizeUserErrorMessage(err, 'Ocorreu um erro ao processar os arquivos PDF dos bimestres.')
      );
    }
  };

  const handleMergeModulos = async () => {
    if (!activeModularRecord) {
      setGeneralError(
        'Nenhuma disciplina modular selecionada. Selecione uma disciplina na lista acima ou configure em Cadastros antes de gerar o PDF.'
      );
      setStatus('idle');
      return;
    }

    // Validação estrita: se um card foi carregado, o outro também deve ser carregado!
    if (showAllModules) {
      const incompleteModules: string[] = [];
      for (let i = 0; i < 4; i++) {
        const slot = modulesData[i];
        const hasProp = Boolean(slot.proposta);
        const hasRel = Boolean(slot.relatorio);
        if ((hasProp && !hasRel) || (!hasProp && hasRel)) {
          const missing = !hasProp ? 'Proposta' : 'Relatório';
          incompleteModules.push(`Módulo ${i + 1} (falta ${missing})`);
        }
      }
      if (incompleteModules.length > 0) {
        setGeneralError(
          `Carga incompleta detectada: ${incompleteModules.join(', ')}. É obrigatório enviar tanto a Proposta quanto o Relatório para o módulo, ou remover o arquivo para gerar o documento padrão oficial.`
        );
        setStatus('idle');
        return;
      }
    } else {
      const slot = modulesData[selectedModule - 1];
      const hasProp = Boolean(slot.proposta);
      const hasRel = Boolean(slot.relatorio);
      if ((hasProp && !hasRel) || (!hasProp && hasRel)) {
        const missing = !hasProp ? 'a Proposta' : 'o Relatório';
        setGeneralError(
          `Carga incompleta no Módulo ${selectedModule}: falta carregar ${missing}. É obrigatório enviar ambos os arquivos (Proposta + Relatório) do módulo para prosseguir, ou remover o arquivo existente para gerar o formulário padrão oficial.`
        );
        setStatus('idle');
        return;
      }
    }

    try {
      setStatus('merging');
      setGeneralError(null);

      const filesToMerge: File[] = [];
      const sequenceParts: string[] = [];

      const courseName = activeModularRecord?.course || 'Curso Técnico Modular';
      const year = namingConfig.year || activeModularRecord?.year || new Date().getFullYear();
      const subject = namingConfig.disciplineName || activeModularRecord?.subject || 'Componente Curricular';
      const code = namingConfig.disciplineCode || activeModularRecord?.code || 'DISC';
      const teachers = activeModularRecord?.teachers?.length
        ? activeModularRecord.teachers
        : [activeModularRecord?.teacher || (usesPersistentStorage ? loadSavedTeacherName() : '') || 'Docente responsável'];

      if (showAllModules) {
        // Mesclar todos os 4 módulos
        setProgressMsg('Processando todos os módulos...');
        for (let i = 0; i < 4; i++) {
          const modNum = i + 1;
          const slot = modulesData[i];
          const periodLabel = `Módulo ${modNum}`;
          const periodUpper = `MÓDULO ${modNum}`;

          const hasProposta = Boolean(slot.proposta && !slot.proposta.error);
          const hasRelatorio = Boolean(slot.relatorio && !slot.relatorio.error);

          if (hasProposta && hasRelatorio) {
            filesToMerge.push(slot.proposta!.file);
            filesToMerge.push(slot.relatorio!.file);
            sequenceParts.push(`Mod ${modNum} (Proposta + Relatório)`);
          } else if (hasProposta && !hasRelatorio) {
            filesToMerge.push(slot.proposta!.file);
            sequenceParts.push(`Mod ${modNum} (Proposta)`);
          } else if (!hasProposta && hasRelatorio) {
            filesToMerge.push(slot.relatorio!.file);
            sequenceParts.push(`Mod ${modNum} (Relatório)`);
          } else {
            setProgressMsg(`Gerando relatório oficial sem recuperação para o ${periodLabel}...`);
            const defaultReport = await generateRecoveryReportPdf(
              {
                course: courseName,
                year,
                period: periodUpper,
                subject,
                code,
                teachers,
              },
              `Relatorio_Sem_Recuperacao_Mod${modNum}_${code}.pdf`
            );
            filesToMerge.push(defaultReport);
            sequenceParts.push(`Mod ${modNum} (Padrão: Sem rec.)`);
          }
        }
      } else {
        // Foco no Módulo X selecionado (como no esboço)
        setProgressMsg(`Processando Módulo ${selectedModule}...`);
        const slot = modulesData[selectedModule - 1];
        const periodLabel = `Módulo ${selectedModule}`;
        const periodUpper = `MÓDULO ${selectedModule}`;

        const hasProposta = Boolean(slot.proposta && !slot.proposta.error);
        const hasRelatorio = Boolean(slot.relatorio && !slot.relatorio.error);

        if (hasProposta && hasRelatorio) {
          filesToMerge.push(slot.proposta!.file);
          filesToMerge.push(slot.relatorio!.file);
          sequenceParts.push(`Mod ${selectedModule} (Proposta + Relatório)`);
        } else if (hasProposta && !hasRelatorio) {
          filesToMerge.push(slot.proposta!.file);
          sequenceParts.push(`Mod ${selectedModule} (Proposta)`);
        } else if (!hasProposta && hasRelatorio) {
          filesToMerge.push(slot.relatorio!.file);
          sequenceParts.push(`Mod ${selectedModule} (Relatório)`);
        } else {
          // Ambos vazios -> Carrega o documento padrão já implementado!
          setProgressMsg(`Gerando formulário oficial sem recuperação para o ${periodLabel}...`);
          const defaultReport = await generateRecoveryReportPdf(
            {
              course: courseName,
              year,
              period: periodUpper,
              subject,
              code,
              teachers,
            },
            `Relatorio_Sem_Recuperacao_Mod${selectedModule}_${code}.pdf`
          );
          filesToMerge.push(defaultReport);
          sequenceParts.push(`Mod ${selectedModule} (Padrão: Sem rec.)`);
        }
      }

      setProgressMsg('Finalizando e salvando PDF...');

      let outputFileName: string;
      if (customNamingMode && customFileName.trim()) {
        outputFileName = customFileName.trim();
      } else {
        outputFileName = formatFourBimestersFileName(
          code,
          subject,
          String(year),
          showAllModules ? undefined : `Mod${selectedModule}`
        );
      }

      const sequenceDesc = sequenceParts.join(' + ');
      const result = await mergeMultiplePdfs(
        filesToMerge,
        outputFileName,
        (msg) => setProgressMsg(msg),
        sequenceDesc
      );

      await persistGeneratedPdf('modulos', result);
      setStatus('completed');
    } catch (err: unknown) {
      console.error('Falha ao mesclar módulo:', err);
      setStatus('error');
      setGeneralError(
        sanitizeUserErrorMessage(err, 'Ocorreu um erro ao processar os arquivos do módulo.')
      );
    }
  };

  // Full app reset
  const handleFullAppReset = async () => {
    setIsResetting(true);
    try {
      await clearGeneratedPdfs();
      clearAllAcademicStorage();
      localStorage.removeItem(STORAGE_MODE_KEY);
      setGeneratedPdfs([]);

      setAcademicRecords([]);
      setActiveRecordId(null);
      setActiveModularRecordId(null);
      setActiveIntegratedRecordId(null);

      handleClearBimestres();
      handleClearModules();

      setIsResetModalOpen(false);
      setStorageMode(null);
      setResetSuccessNotice(true);
      setResetVersion((currentVersion) => currentVersion + 1);
      setTimeout(() => setResetSuccessNotice(false), 3500);
    } catch (error: unknown) {
      console.error('Falha ao redefinir a aplicação:', error);
      setGeneralError('Não foi possível concluir a limpeza dos dados. Alguns dados ainda podem permanecer neste navegador.');
    } finally {
      setIsResetting(false);
    }
  };

  const hasAnyBimestreFiles = bimestresData.some((b) => b.proposta || b.relatorio);
  const currentModuleSlot = modulesData[selectedModule - 1];

  const hasIncompleteBimestres = bimestresData.some(
    (b) => (b.proposta && !b.relatorio) || (!b.proposta && b.relatorio)
  );

  const hasIncompleteCurrentModule =
    (currentModuleSlot.proposta && !currentModuleSlot.relatorio) ||
    (!currentModuleSlot.proposta && currentModuleSlot.relatorio);

  const hasIncompleteAllModules = modulesData.some(
    (m) => (m.proposta && !m.relatorio) || (!m.proposta && m.relatorio)
  );

  const isModuleIncomplete = showAllModules
    ? hasIncompleteAllModules
    : hasIncompleteCurrentModule;
  const modularGeneratedPdfs = generatedPdfs.filter((pdf) => pdf.tab === 'modulos');
  const bimesterGeneratedPdfs = generatedPdfs.filter((pdf) => pdf.tab === 'bimestres');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-neutral-900 antialiased font-sans">
      {/* Top Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 sm:pb-28 flex flex-col justify-start">
        {/* Navigation Tabs (CADASTROS, MÓDULOS, BIMESTRES) */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div
            role="tablist"
            aria-label="Abas de cadastros e mesclagem"
            className="inline-flex p-1 bg-neutral-100 border border-neutral-200/90 rounded-2xl text-xs font-semibold shadow-2xs"
          >
            <button
              role="tab"
              id="tab-btn-cadastros"
              aria-selected={activeTab === 'cadastros'}
              aria-controls="panel-cadastros"
              type="button"
              onClick={() => setActiveTab('cadastros')}
              data-text="CADASTROS"
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'cadastros'
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 font-medium'
              }`}
            >
              <span>CADASTROS</span>
            </button>

            <button
              role="tab"
              id="tab-btn-modulos"
              aria-selected={activeTab === 'modulos'}
              aria-controls="panel-modulos"
              type="button"
              onClick={() => setActiveTab('modulos')}
              data-text="MÓDULOS"
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'modulos'
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 font-medium'
              }`}
            >
              <span>MÓDULOS</span>
            </button>

            <button
              role="tab"
              id="tab-btn-bimestres"
              aria-selected={activeTab === 'bimestres'}
              aria-controls="panel-bimestres"
              type="button"
              onClick={() => setActiveTab('bimestres')}
              data-text="BIMESTRES"
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'bimestres'
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 font-medium'
              }`}
            >
              <span>BIMESTRES</span>
            </button>
          </div>
        </div>

        {/* Global Reset Success Notice if any */}
        {resetSuccessNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Aplicação redefinida com sucesso.</span>
          </div>
        )}

        {/* Global Error Notice if any */}
        {generalError && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <p className="font-medium">Não foi possível completar a operação</p>
              <p className="text-xs text-rose-700 mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 1: MÓDULOS                                                   */}
        {/* ================================================================ */}
        <div
          role="tabpanel"
          id="panel-modulos"
          aria-labelledby="tab-btn-modulos"
          className={activeTab === 'modulos' ? 'block' : 'hidden'}
        >
          {/* Title & Introduction */}
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Mesclagem de Módulos
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
              Mescla o documento de proposta e o relatório da recuperação paralela dos módulos.
            </p>
          </div>

          {/* Active Context Banner - Apenas disciplinas modulares */}
          <ActiveContextBanner
            activeRecord={activeModularRecord}
            records={modularRecords}
            onSelectRecord={handleSelectModularRecord}
            onGoToRegistry={() => setActiveTab('cadastros')}
            emptyMessage="Nenhuma disciplina de curso modular cadastrada."
          />

          {/* Cards Container */}
          <div className="space-y-4">
            {!showAllModules ? (
              /* Foco no MÓDULO X (Conforme esboço do usuário) */
              <PeriodMergeCard
                periodTitle={`MÓDULO ${selectedModule}`}
                periodBadge="Modular"
                propostaFile={modulesData[selectedModule - 1].proposta}
                relatorioFile={modulesData[selectedModule - 1].relatorio}
                onSelectProposta={(file) => handleSelectModuleFile(file, selectedModule - 1, 'proposta')}
                onRemoveProposta={() => handleRemoveModuleFile(selectedModule - 1, 'proposta')}
                onSelectRelatorio={(file) => handleSelectModuleFile(file, selectedModule - 1, 'relatorio')}
                onRemoveRelatorio={() => handleRemoveModuleFile(selectedModule - 1, 'relatorio')}
                disabled={status === 'merging'}
              />
            ) : (
              /* Visualização expandida de todos os 4 módulos */
              [1, 2, 3, 4].map((modNum) => (
                <PeriodMergeCard
                  key={modNum}
                  periodTitle={`MÓDULO ${modNum}`}
                  periodBadge={`Mod ${modNum}`}
                  propostaFile={modulesData[modNum - 1].proposta}
                  relatorioFile={modulesData[modNum - 1].relatorio}
                  onSelectProposta={(file) => handleSelectModuleFile(file, modNum - 1, 'proposta')}
                  onRemoveProposta={() => handleRemoveModuleFile(modNum - 1, 'proposta')}
                  onSelectRelatorio={(file) => handleSelectModuleFile(file, modNum - 1, 'relatorio')}
                  onRemoveRelatorio={() => handleRemoveModuleFile(modNum - 1, 'relatorio')}
                  disabled={status === 'merging'}
                />
              ))
            )}
          </div>

          {/* Naming Configuration Panel */}
          <div className="mt-5">
            <NamingConfigPanel
              config={{
                ...namingConfig,
                disciplineCode: activeModularRecord?.code || '',
                disciplineName: activeModularRecord?.subject || '',
                year: String(activeModularRecord?.year || namingConfig.year || new Date().getFullYear()),
                periodPrefix: showAllModules ? undefined : `Mod${selectedModule}`,
              }}
              hasActiveDiscipline={Boolean(activeModularRecord)}
              customMode={customNamingMode}
              customFileName={customFileName}
              onChangeConfig={setNamingConfig}
              onToggleCustomMode={setCustomNamingMode}
              onChangeCustomFileName={setCustomFileName}
              disabled={status === 'merging'}
              hideBimester={true}
              periodType="module"
              courseTitle={activeModularRecord?.course}
            />
          </div>

          {/* Primary Action Button: GERAR PDF */}
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              id="btn-gerar-pdf-modulos"
              onClick={handleMergeModulos}
              disabled={status === 'merging' || !activeModularRecord}
              className={`w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm active:scale-[0.99] transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                !activeModularRecord
                  ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                  : isModuleIncomplete
                  ? 'bg-rose-700 text-white hover:bg-rose-800'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {status === 'merging' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span>Gerando PDF...</span>
                </>
              ) : !activeModularRecord ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Selecione uma disciplina</span>
                </>
              ) : isModuleIncomplete ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Carga incompleta (ajuste para gerar)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>GERAR PDF</span>
                </>
              )}
            </button>

            {/* Mensagem informativa com altura fixa para evitar salto vertical */}
            <div className="min-h-[26px] mt-2 flex items-center justify-center text-center">
              {status === 'merging' && progressMsg ? (
                <p className="text-xs text-neutral-500">{progressMsg}</p>
              ) : !activeModularRecord ? (
                <p className="text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Selecione uma disciplina modular ativa acima para habilitar a geração do PDF.</span>
                </p>
              ) : isModuleIncomplete ? (
                <p className="text-xs font-semibold text-rose-600 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Envie o arquivo pendente em vermelho ou remova o existente para prosseguir.</span>
                </p>
              ) : null}
            </div>
          </div>

          <GeneratedPdfList
            generatedPdfs={modularGeneratedPdfs}
            onDelete={handleDeleteGeneratedPdf}
          />
        </div>

        {/* ================================================================ */}
        {/* TAB 2: BIMESTRES                                                 */}
        {/* 1º, 2º, 3º e 4º Bimestres com PROPOSTA + RELATÓRIO               */}
        {/* ================================================================ */}
        <div
          role="tabpanel"
          id="panel-bimestres"
          aria-labelledby="tab-btn-bimestres"
          className={activeTab === 'bimestres' ? 'block' : 'hidden'}
        >
          {/* Title & Introduction */}
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Mesclagem de Bimestres
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
              Mescla o documento de proposta e o relatório de recuperação paralela de todos os bimestres de uma vez.
            </p>
          </div>

          {/* Active Context Banner - Apenas disciplinas integradas */}
          <ActiveContextBanner
            activeRecord={activeIntegratedRecord}
            records={integratedRecords}
            onSelectRecord={handleSelectIntegratedRecord}
            onGoToRegistry={() => setActiveTab('cadastros')}
            emptyMessage="Nenhuma disciplina de curso integrado cadastrada."
          />

          {/* 4 Bimestre Cards (Conforme esboço do usuário) */}
          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((bimNum) => (
              <PeriodMergeCard
                key={bimNum}
                periodTitle={`${bimNum}º BIMESTRE`}
                periodBadge={`${bimNum}º Bim`}
                propostaFile={bimestresData[bimNum - 1].proposta}
                relatorioFile={bimestresData[bimNum - 1].relatorio}
                onSelectProposta={(file) => handleSelectBimestreFile(file, bimNum - 1, 'proposta')}
                onRemoveProposta={() => handleRemoveBimestreFile(bimNum - 1, 'proposta')}
                onSelectRelatorio={(file) => handleSelectBimestreFile(file, bimNum - 1, 'relatorio')}
                onRemoveRelatorio={() => handleRemoveBimestreFile(bimNum - 1, 'relatorio')}
                disabled={status === 'merging'}
              />
            ))}
          </div>

          {/* Barra de ações abaixo dos cards com altura reservada */}
          <div className="mt-3 flex items-center justify-between text-xs min-h-[26px]">
            {hasAnyBimestreFiles ? (
              <button
                type="button"
                onClick={clearBimestreUploads}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 transition-colors cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar todos os arquivos carregados</span>
              </button>
            ) : (
              <span className="text-[11px] text-neutral-400">Nenhum arquivo carregado</span>
            )}
          </div>

          {/* Naming Configuration Panel */}
          <div className="mt-5">
            <NamingConfigPanel
              config={{
                ...namingConfig,
                disciplineCode: activeIntegratedRecord?.code || '',
                disciplineName: activeIntegratedRecord?.subject || '',
                year: String(activeIntegratedRecord?.year || namingConfig.year || new Date().getFullYear()),
                periodPrefix: undefined,
              }}
              hasActiveDiscipline={Boolean(activeIntegratedRecord)}
              customMode={customNamingMode}
              customFileName={customFileName}
              onChangeConfig={setNamingConfig}
              onToggleCustomMode={setCustomNamingMode}
              onChangeCustomFileName={setCustomFileName}
              disabled={status === 'merging'}
              periodType="bimester"
              hideBimester={true}
              courseTitle={activeIntegratedRecord?.course}
            />
          </div>

          {/* Primary Action Button: GERAR PDF */}
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              id="btn-gerar-pdf-bimestres"
              onClick={handleMergeBimestres}
              disabled={status === 'merging' || !activeIntegratedRecord}
              className={`w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm active:scale-[0.99] transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                !activeIntegratedRecord
                  ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                  : hasIncompleteBimestres
                  ? 'bg-rose-700 text-white hover:bg-rose-800'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {status === 'merging' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span>Gerando PDF anual...</span>
                </>
              ) : !activeIntegratedRecord ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Selecione uma disciplina</span>
                </>
              ) : hasIncompleteBimestres ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Carga incompleta (ajuste para gerar)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>GERAR PDF</span>
                </>
              )}
            </button>

            {/* Mensagem informativa com altura fixa para evitar salto vertical */}
            <div className="min-h-[26px] mt-2 flex items-center justify-center text-center">
              {status === 'merging' && progressMsg ? (
                <p className="text-xs text-neutral-500">{progressMsg}</p>
              ) : !activeIntegratedRecord ? (
                <p className="text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Selecione uma disciplina de curso integrado ativa acima para habilitar a geração do PDF.</span>
                </p>
              ) : hasIncompleteBimestres ? (
                <p className="text-xs font-semibold text-rose-600 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Há bimestres com carga incompleta. Complete os arquivos em vermelho ou remova-os para prosseguir.</span>
                </p>
              ) : null}
            </div>
          </div>

          <GeneratedPdfList
            generatedPdfs={bimesterGeneratedPdfs}
            annual
            onDelete={handleDeleteGeneratedPdf}
          />
        </div>

        {/* ================================================================ */}
        {/* TAB 3: CADASTROS ACADÊMICOS                                      */}
        {/* ================================================================ */}
        <div
          role="tabpanel"
          id="panel-cadastros"
          aria-labelledby="tab-btn-cadastros"
          className={activeTab === 'cadastros' ? 'block' : 'hidden'}
        >
          <AcademicRegistryTab
            key={storageMode || 'unselected'}
            records={academicRecords}
            activeRecordId={activeRecordId}
            resetVersion={resetVersion}
            persistData={usesPersistentStorage}
            onSelectActiveRecord={handleSelectActiveRecord}
            onSaveRecord={handleSaveRecord}
            onImportRecords={handleImportRecords}
            onDeleteRecord={handleDeleteRecord}
            onResetApp={() => setIsResetModalOpen(true)}
            onGoToMergeTab={(tab) => {
              if (tab === '2pdfs' || tab === '4pdfs') {
                const isModular = activeRecord && !isIntegratedCourse(activeRecord.course);
                setActiveTab(isModular ? 'modulos' : 'bimestres');
              }
            }}
          />
        </div>
      </main>

      {/* Footer sempre visível fixado na parte inferior */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 w-full border-t border-neutral-200/90 bg-white/95 backdrop-blur-xs py-3 px-6 sm:px-10 text-xs text-neutral-400 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-neutral-500">
            <span>{APP_FOOTER_CREDITS}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-400">v{BUILD_VERSION}</span>
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-neutral-400 transition-colors hover:text-emerald-700"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Privacidade e Dados
            </button>
          </div>
        </div>
      </footer>

      {/* Reset App Confirmation Modal */}
      <ResetAppModal
        isOpen={isResetModalOpen}
        isResetting={isResetting}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleFullAppReset}
      />
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        usesPersistentStorage={usesPersistentStorage}
      />
      <StorageChoiceModal
        isOpen={storageMode === null}
        onSelect={handleStorageModeSelection}
      />
    </div>
  );
}
