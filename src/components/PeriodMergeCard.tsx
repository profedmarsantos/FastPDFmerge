import React, { useRef } from 'react';
import { Upload, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import { PdfFileInfo } from '../types';
import { formatBytes } from '../utils/pdfMerger';

interface PeriodMergeCardProps {
  periodTitle: string;
  periodBadge?: string;
  propostaFile: PdfFileInfo | null;
  relatorioFile: PdfFileInfo | null;
  onSelectProposta: (file: File) => void;
  onRemoveProposta: () => void;
  onSelectRelatorio: (file: File) => void;
  onRemoveRelatorio: () => void;
  disabled?: boolean;
}

export const PeriodMergeCard: React.FC<PeriodMergeCardProps> = ({
  periodTitle,
  periodBadge,
  propostaFile,
  relatorioFile,
  onSelectProposta,
  onRemoveProposta,
  onSelectRelatorio,
  onRemoveRelatorio,
  disabled = false,
}) => {
  const propostaInputRef = useRef<HTMLInputElement>(null);
  const relatorioInputRef = useRef<HTMLInputElement>(null);

  const handlePropostaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      onSelectProposta(file);
    }
  };

  const handleRelatorioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      onSelectRelatorio(file);
    }
  };

  const hasProposta = Boolean(propostaFile);
  const hasRelatorio = Boolean(relatorioFile);
  const isPropostaMissing = hasRelatorio && !hasProposta;
  const isRelatorioMissing = hasProposta && !hasRelatorio;
  const isIncomplete = isPropostaMissing || isRelatorioMissing;

  return (
    <div
      className={`bg-white rounded-2xl border transition-colors p-4 sm:p-5 ${
        isIncomplete
          ? 'border-rose-300 shadow-2xs'
          : 'border-neutral-200/90 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Period Label */}
        <div className="min-w-0 sm:w-44 shrink-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-neutral-900">
              {periodTitle}
            </h3>
            {periodBadge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 uppercase tracking-wider">
                {periodBadge}
              </span>
            )}
          </div>

          {/* Status notice - Altura fixa de 20px para eliminar qualquer deslocamento de layout */}
          <div className="h-5 mt-1.5 flex items-center">
            {isIncomplete ? (
              <p className="text-xs text-rose-600 font-semibold inline-flex items-center gap-1 truncate">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Carga incompleta</span>
              </p>
            ) : hasProposta && hasRelatorio ? (
              <p className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Pronto para mesclar</span>
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: PROPOSTA & RELATÓRIO Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 min-w-0">
          {/* Hidden File Inputs */}
          <input
            ref={propostaInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelectProposta(f);
              e.target.value = '';
            }}
          />
          <input
            ref={relatorioInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onSelectRelatorio(f);
              e.target.value = '';
            }}
          />

          {/* 1. BUTTON PROPOSTA */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handlePropostaDrop}
            onClick={() => {
              if (!disabled && !propostaFile) {
                propostaInputRef.current?.click();
              }
            }}
            className={`relative rounded-xl border p-3 flex flex-col justify-between transition-colors select-none h-[84px] ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${
              propostaFile
                ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400 text-neutral-900'
                : isPropostaMissing
                ? 'bg-rose-50/80 border-rose-300 hover:border-rose-400 hover:bg-rose-100/70 text-rose-950'
                : 'bg-neutral-50/70 border-neutral-200/90 hover:bg-neutral-100/80 hover:border-neutral-300 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 h-6">
              <div className="flex items-center gap-1.5">
                {propostaFile ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isPropostaMissing ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
                <span
                  className={`font-semibold text-xs tracking-wider uppercase ${
                    isPropostaMissing ? 'text-rose-900' : 'text-neutral-800'
                  }`}
                >
                  Proposta
                </span>
              </div>

              {propostaFile ? (
                <button
                  type="button"
                  title="Remover arquivo de proposta"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveProposta();
                  }}
                  className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : isPropostaMissing ? (
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/90 border border-rose-200 px-1.5 py-0.5 rounded leading-none">
                  Pendente
                </span>
              ) : (
                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200/80 px-1.5 py-0.5 rounded leading-none">
                  Sem arquivo
                </span>
              )}
            </div>

            <div className="min-w-0 h-9 flex flex-col justify-center">
              {propostaFile ? (
                <>
                  <p className="text-xs font-semibold text-neutral-900 truncate leading-tight" title={propostaFile.name}>
                    {propostaFile.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-tight mt-0.5 truncate">
                    {propostaFile.isLoadingInfo
                      ? 'Lendo informações...'
                      : propostaFile.error
                      ? propostaFile.error
                      : `${propostaFile.pageCount || 0} pág · ${formatBytes(propostaFile.size)}`}
                  </p>
                </>
              ) : isPropostaMissing ? (
                <>
                  <p className="text-xs font-semibold text-rose-700 leading-tight">Carregar documento pendente</p>
                  <p className="text-[10px] font-medium text-rose-500 leading-tight mt-0.5">Obrigatório para este período</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-700 font-medium leading-tight">Carregar PDF</p>
                  <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">Clique ou arraste o arquivo</p>
                </>
              )}
            </div>
          </div>

          {/* 2. BUTTON RELATÓRIO */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleRelatorioDrop}
            onClick={() => {
              if (!disabled && !relatorioFile) {
                relatorioInputRef.current?.click();
              }
            }}
            className={`relative rounded-xl border p-3 flex flex-col justify-between transition-colors select-none h-[84px] ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${
              relatorioFile
                ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400 text-neutral-900'
                : isRelatorioMissing
                ? 'bg-rose-50/80 border-rose-300 hover:border-rose-400 hover:bg-rose-100/70 text-rose-950'
                : 'bg-neutral-50/70 border-neutral-200/90 hover:bg-neutral-100/80 hover:border-neutral-300 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 h-6">
              <div className="flex items-center gap-1.5">
                {relatorioFile ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isRelatorioMissing ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
                <span
                  className={`font-semibold text-xs tracking-wider uppercase ${
                    isRelatorioMissing ? 'text-rose-900' : 'text-neutral-800'
                  }`}
                >
                  Relatório
                </span>
              </div>

              {relatorioFile ? (
                <button
                  type="button"
                  title="Remover arquivo de relatório"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRelatorio();
                  }}
                  className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : isRelatorioMissing ? (
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/90 border border-rose-200 px-1.5 py-0.5 rounded leading-none">
                  Pendente
                </span>
              ) : (
                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200/80 px-1.5 py-0.5 rounded leading-none">
                  Sem arquivo
                </span>
              )}
            </div>

            <div className="min-w-0 h-9 flex flex-col justify-center">
              {relatorioFile ? (
                <>
                  <p className="text-xs font-semibold text-neutral-900 truncate leading-tight" title={relatorioFile.name}>
                    {relatorioFile.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-tight mt-0.5 truncate">
                    {relatorioFile.isLoadingInfo
                      ? 'Lendo informações...'
                      : relatorioFile.error
                      ? relatorioFile.error
                      : `${relatorioFile.pageCount || 0} pág · ${formatBytes(relatorioFile.size)}`}
                  </p>
                </>
              ) : isRelatorioMissing ? (
                <>
                  <p className="text-xs font-semibold text-rose-700 leading-tight">Carregar documento pendente</p>
                  <p className="text-[10px] font-medium text-rose-500 leading-tight mt-0.5">Obrigatório para este período</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-neutral-700 font-medium leading-tight">Carregar PDF</p>
                  <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">Clique ou arraste o arquivo</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
