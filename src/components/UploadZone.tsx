import React, { useRef, useState } from 'react';
import { FileUp, FileText, X, RefreshCw, AlertCircle, FileCheck, Eye, CheckCircle2, Lock } from 'lucide-react';
import { PdfFileInfo } from '../types';
import { formatBytes } from '../utils/pdfMerger';
import { MAX_FILE_SIZE_BYTES } from '../utils/security';

interface UploadZoneProps {
  id: string;
  orderNumber: number;
  title?: string;
  subtitle?: string;
  label?: string;
  periodBadge?: string;
  fileInfo: PdfFileInfo | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
  isExempt?: boolean;
  onToggleExempt?: (exempt: boolean) => void;
  exemptCheckboxLabel?: string;
  onPreviewReport?: () => void;
  isNotApplicable?: boolean;
  notApplicableReason?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  id,
  orderNumber,
  title,
  subtitle,
  label,
  periodBadge,
  fileInfo,
  onFileSelect,
  onFileRemove,
  disabled = false,
  isExempt = false,
  onToggleExempt,
  exemptCheckboxLabel = 'Não incluir',
  onPreviewReport,
  isNotApplicable = false,
  notApplicableReason,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isExempt || isNotApplicable) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragError(null);
  };

  const validateAndProcessFile = (file: File) => {
    setDragError(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setDragError('Apenas arquivos .pdf são permitidos.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setDragError(`Arquivo muito grande (${sizeMb} MB). O limite máximo é 50 MB.`);
      return;
    }
    if (file.size < 8) {
      setDragError('Arquivo vazio ou com tamanho insuficiente.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isExempt || isNotApplicable) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleClickZone = () => {
    if (disabled || isExempt || isNotApplicable) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-1.5 w-full" id={`upload-zone-wrapper-${id}`}>
      {/* Label: PDF 1 or PDF 2 + Checkbox if enabled */}
      <div className="flex items-center justify-between gap-2 h-5">
        <span className={`text-xs font-semibold uppercase tracking-wider truncate ${isNotApplicable ? 'text-neutral-400' : 'text-neutral-500'}`}>
          PDF {orderNumber} {subtitle ? `· ${subtitle}` : ''}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {isNotApplicable ? (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400 border border-neutral-200/60 font-medium">
              Inativo
            </span>
          ) : onToggleExempt ? (
            <label
              htmlFor={`checkbox-exempt-${id}`}
              className={`inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium select-none transition-colors ${
                isExempt ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Se marcado, este PDF não será solicitado para ser mesclado"
            >
              <input
                id={`checkbox-exempt-${id}`}
                type="checkbox"
                checked={Boolean(isExempt)}
                onChange={(e) => onToggleExempt(e.target.checked)}
                disabled={disabled}
                className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900"
              />
              <span data-text={exemptCheckboxLabel}>{exemptCheckboxLabel}</span>
            </label>
          ) : null}
        </div>
      </div>

      {/* Main Container - Fixed baseline height and centered alignment for zero layout shift across all states */}
      <div
        id={`upload-dropzone-${id}`}
        onDragOver={!isExempt && !isNotApplicable ? handleDragOver : undefined}
        onDragLeave={!isExempt && !isNotApplicable ? handleDragLeave : undefined}
        onDrop={!isExempt && !isNotApplicable ? handleDrop : undefined}
        onClick={!fileInfo && !isExempt && !isNotApplicable ? handleClickZone : undefined}
        className={`relative rounded-xl border transition-all duration-150 p-4 sm:p-5 flex flex-col justify-center items-center h-[160px] min-h-[160px] w-full ${
          isNotApplicable
            ? 'bg-neutral-50/50 border-dashed border-neutral-200/80 cursor-not-allowed select-none opacity-60'
            : isExempt
            ? 'bg-neutral-50/70 border-dashed border-neutral-200 cursor-default'
            : fileInfo
            ? 'bg-white border-neutral-200 shadow-xs'
            : isDragOver
            ? 'bg-neutral-50 border-neutral-900 ring-2 ring-neutral-900/5 cursor-pointer'
            : 'bg-white border border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/50 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isExempt || isNotApplicable}
          id={`file-input-${id}`}
        />

        {isNotApplicable ? (
          /* State: Not Applicable / Disabled for this discipline module */
          <div className="flex flex-col items-center justify-center text-center w-full px-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mb-1.5 text-neutral-400">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-neutral-600">
              Módulo inativo
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[240px] leading-relaxed text-center">
              {notApplicableReason || 'Não aplicável para a disciplina selecionada.'}
            </p>
          </div>
        ) : isExempt ? (
          /* State: Exempt / Substituído por relatório oficial de recuperação */
          <div className="flex flex-col items-center justify-center text-center w-full px-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mb-1 text-neutral-700">
              <FileCheck className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-neutral-900">
              Relatório de dispensa gerado
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5 max-w-[260px] leading-relaxed">
              Substituído pelo formulário oficial deste período.
            </p>
            {onPreviewReport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreviewReport();
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 transition-colors cursor-pointer shadow-2xs"
                title="Visualizar e baixar o PDF do relatório oficial gerado para este período"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                <span>Visualizar relatório</span>
              </button>
            )}
          </div>
        ) : fileInfo ? (
          /* State: File Selected (Minimalist, Clean) */
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-700">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate" title={fileInfo.name}>
                  {fileInfo.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                  <span>{formatBytes(fileInfo.size)}</span>
                  <span>·</span>
                  {fileInfo.isLoadingInfo ? (
                    <span className="inline-flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-neutral-400" />
                      Lendo páginas...
                    </span>
                  ) : fileInfo.error ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fileInfo.error}
                    </span>
                  ) : (
                    <span>{fileInfo.pageCount === 1 ? '1 página' : `${fileInfo.pageCount} páginas`}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Replace / Remove */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                id={`btn-replace-${id}`}
                onClick={handleClickZone}
                disabled={disabled}
                className="px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Trocar arquivo"
              >
                Trocar
              </button>
              <button
                type="button"
                id={`btn-remove-${id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                disabled={disabled}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Remover arquivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* State: Empty / Upload Prompt (Rule 48: concise and clean) */
          <div className="flex flex-col items-center justify-center text-center w-full px-2">
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center mb-2 text-neutral-500">
              <FileUp className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-neutral-700 max-w-[260px] text-center leading-snug">
              {label || 'Arraste ou selecione um PDF'}
            </p>
            {periodBadge && (
              <span className="mt-1 inline-block text-[11px] font-mono font-medium text-neutral-500 text-center">
                [ {periodBadge} ]
              </span>
            )}
          </div>
        )}

        {/* Validation or drag error */}
        {dragError && (
          <div className="absolute bottom-2 left-3 right-3 text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1.5 z-10">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{dragError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

