import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Check, Copy } from 'lucide-react';
import {
  AcademicNamingConfig,
  formatAcademicFileName,
  formatFourBimestersFileName,
} from '../utils/namingConfig';

const ACADEMIC_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

interface NamingConfigPanelProps {
  config: AcademicNamingConfig;
  customMode: boolean;
  customFileName: string;
  onChangeConfig: (newConfig: AcademicNamingConfig) => void;
  onToggleCustomMode: (custom: boolean) => void;
  onChangeCustomFileName: (name: string) => void;
  disabled?: boolean;
  hideBimester?: boolean;
  formattedPreviewName?: string;
  periodType?: 'bimester' | 'module';
  courseTitle?: string;
  hasActiveDiscipline?: boolean;
}

export const NamingConfigPanel: React.FC<NamingConfigPanelProps> = ({
  config,
  customMode,
  customFileName,
  onChangeConfig,
  onToggleCustomMode,
  onChangeCustomFileName,
  disabled = false,
  hideBimester = false,
  formattedPreviewName,
  periodType = 'bimester',
  hasActiveDiscipline,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasDiscipline =
    hasActiveDiscipline !== undefined
      ? hasActiveDiscipline
      : Boolean(config.disciplineCode && config.disciplineName);

  const formattedName = !hasDiscipline
    ? '( selecione uma disciplina )'
    : formattedPreviewName ||
      (hideBimester
        ? formatFourBimestersFileName(
            config.disciplineCode,
            config.disciplineName,
            config.year || '2026',
            config.periodPrefix
          )
        : formatAcademicFileName(config));

  const handleCopyName = () => {
    if (!hasDiscipline && !customMode) return;
    const text = customMode && customFileName ? customFileName : formattedName;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBimesterChange = (b: '1' | '2' | '3' | '4') => {
    if (periodType === 'module') {
      onChangeConfig({ ...config, bimester: b, periodPrefix: `Mod${b}` });
    } else {
      onChangeConfig({ ...config, bimester: b, periodPrefix: undefined });
    }
  };

  return (
    <div
      id="naming-config-panel"
      className="w-full rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all space-y-4"
    >
      {/* Cabeçalho do Painel */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Configuração do Nome do Arquivo
        </h3>
        <button
          type="button"
          id="btn-toggle-custom-name"
          onClick={() => {
            if (!customMode && !customFileName) {
              onChangeCustomFileName(formattedName);
            }
            onToggleCustomMode(!customMode);
          }}
          disabled={disabled}
          className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors cursor-pointer"
        >
          {customMode ? 'Usar padrão automático' : 'Personalizar nome'}
        </button>
      </div>

      {!customMode ? (
        <div className="space-y-3.5">
          {/* Controles de Período (apenas na aba de Proposta + Relatório) */}
          {!hideBimester && (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  {periodType === 'module' ? 'Módulo do Arquivo' : 'Bimestre do Arquivo'}
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl">
                  {(['1', '2', '3', '4'] as const).map((b) => {
                    const isSelected = config.bimester === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        id={`btn-bimester-${b}`}
                        onClick={() => handleBimesterChange(b)}
                        disabled={disabled}
                        className={`py-1 text-xs font-medium rounded-lg transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        <span>{periodType === 'module' ? `M${b}` : `${b}º`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informações da Disciplina Ativa */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Disciplina Selecionada
                </label>
                <div className="px-3.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 truncate flex items-center gap-2">
                  <span className="font-mono font-bold bg-neutral-200/70 px-1.5 py-0.5 rounded text-[11px]">
                    {config.disciplineCode || 'DISC'}
                  </span>
                  <span className="truncate">{config.disciplineName || 'Selecione em Cadastros'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Nome do arquivo gerado institucionalmente */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Nome do arquivo a ser gerado
            </label>
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm select-all truncate ${
                  !hasDiscipline
                    ? 'bg-neutral-50/80 border-dashed border-neutral-300 text-neutral-400 italic font-sans'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 font-mono'
                }`}
              >
                {formattedName}
              </div>
              <button
                type="button"
                onClick={handleCopyName}
                disabled={disabled || (!hasDiscipline && !customMode)}
                title={hasDiscipline ? 'Copiar nome do arquivo' : 'Selecione uma disciplina'}
                className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Opção avançada de símbolo ordinal */}
          {!hideBimester && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showAdvanced ? 'Ocultar opções de formatação' : 'Opções de formatação'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="mt-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-neutral-600">Símbolo do ordinal do bimestre:</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ ...config, ordinalChar: 'º' })}
                      disabled={disabled}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        (config.ordinalChar || 'º') === 'º'
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      º (ALT+167)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ ...config, ordinalChar: 'o' })}
                      disabled={disabled}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        config.ordinalChar === 'o'
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      o (minúscula)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Modo de Nome Livre Customizado */
        <div className="space-y-1.5">
          <label htmlFor="input-custom-filename" className="block text-xs font-semibold text-neutral-800">
            Digite o nome desejado para o arquivo:
          </label>
          <div className="flex items-center gap-2">
            <input
              id="input-custom-filename"
              type="text"
              value={customFileName}
              onChange={(e) => onChangeCustomFileName(e.target.value)}
              disabled={disabled}
              placeholder="Ex: documento_final.pdf"
              className="flex-1 px-3.5 py-2 text-sm font-mono bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={handleCopyName}
              title="Copiar nome do arquivo"
              className="p-2 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
