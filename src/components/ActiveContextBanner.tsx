import React from 'react';
import { AcademicRecord } from '../types';

interface ActiveContextBannerProps {
  activeRecord: AcademicRecord | null;
  records: AcademicRecord[];
  onSelectRecord: (id: string) => void;
  onGoToRegistry: () => void;
  emptyMessage?: string;
}

export const ActiveContextBanner: React.FC<ActiveContextBannerProps> = ({
  activeRecord,
  records,
  onSelectRecord,
  onGoToRegistry,
  emptyMessage,
}) => {
  if (records.length === 0) {
    return (
      <div
        id="active-context-banner"
        className="mb-5 px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between gap-3 min-h-[46px]"
      >
        <span className="text-neutral-500">
          {emptyMessage || 'Nenhuma disciplina cadastrada.'}
        </span>
        <button
          type="button"
          onClick={onGoToRegistry}
          className="font-medium text-neutral-900 hover:underline cursor-pointer"
        >
          Cadastrar em Cadastros
        </button>
      </div>
    );
  }

  const isSelected = Boolean(activeRecord);

  return (
    <div
      id="active-context-banner"
      className="mb-5 px-3.5 py-2.5 rounded-xl bg-white border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs min-h-[46px]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isSelected ? 'bg-emerald-500' : 'bg-neutral-300'
          }`}
          title={isSelected ? 'Disciplina ativa selecionada' : 'Nenhuma disciplina selecionada'}
        />
        <span className="text-xs font-semibold text-neutral-700 whitespace-nowrap">
          Disciplina ativa:
        </span>
        {!isSelected && (
          <span className="text-xs text-neutral-400 italic">
            ( selecione uma disciplina )
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
        <select
          value={activeRecord?.id || ''}
          onChange={(e) => onSelectRecord(e.target.value)}
          className={`px-2.5 py-1 text-xs font-mono rounded-lg border text-neutral-800 focus:outline-none focus:border-neutral-900 cursor-pointer transition-colors max-w-[280px] sm:max-w-[380px] truncate ${
            isSelected
              ? 'bg-neutral-50 hover:bg-white border-neutral-200'
              : 'bg-amber-50/50 border-amber-200 text-neutral-600'
          }`}
          title="Alternar entre disciplinas salvas"
          aria-label="Caixa de seleção da disciplina"
        >
          <option value="" className="font-mono text-neutral-400">
            -- Selecione uma disciplina --
          </option>
          {[...records]
            .sort((a, b) => {
              const subCompare = a.subject.localeCompare(b.subject, 'pt-BR', { sensitivity: 'base' });
              if (subCompare !== 0) return subCompare;
              return (b.year || 0) - (a.year || 0);
            })
            .map((r) => {
              const details = [r.year ? `${r.year}` : '', r.series || (r.period?.includes('Módulo') ? r.period : '')]
                .filter(Boolean)
                .join(' · ');
              return (
                <option key={r.id} value={r.id} className="font-mono">
                  [{r.code}] {r.subject} {details ? `(${details})` : ''}
                </option>
              );
            })}
        </select>

        <button
          type="button"
          onClick={onGoToRegistry}
          className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors cursor-pointer font-medium"
          title="Gerenciar disciplinas cadastradas"
        >
          Cadastros
        </button>
      </div>
    </div>
  );
};
