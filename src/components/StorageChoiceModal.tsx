import React, { useEffect, useState } from 'react';
import { HardDrive, ShieldCheck } from 'lucide-react';

export type StorageMode = 'persistent' | 'temporary';

interface StorageChoiceModalProps {
  isOpen: boolean;
  onSelect: (mode: StorageMode) => Promise<void>;
}

export const StorageChoiceModal: React.FC<StorageChoiceModalProps> = ({ isOpen, onSelect }) => {
  const [selectedMode, setSelectedMode] = useState<StorageMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedMode(null);
      setSelectionError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleContinue = async () => {
    if (!selectedMode || isSubmitting) return;

    setIsSubmitting(true);
    setSelectionError(null);
    try {
      await onSelect(selectedMode);
    } catch (error) {
      setSelectionError(
        error instanceof Error ? error.message : 'Não foi possível aplicar esta escolha de armazenamento.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="storage-choice-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl">
        <div className="flex items-start gap-3 border-b border-neutral-100 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 id="storage-choice-title" className="text-sm font-semibold text-neutral-900">
              Como deseja usar seus dados?
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600">
              PDFs e cadastros acadêmicos podem conter informações pessoais. Escolha como eles serão
              tratados nesta sessão.
            </p>
          </div>
        </div>

        <fieldset className="mt-4 space-y-3">
          <legend className="sr-only">Modo de armazenamento</legend>
          <label
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
              selectedMode === 'persistent'
                ? 'border-emerald-400 bg-emerald-50/70'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <input
              type="radio"
              name="storage-mode"
              value="persistent"
              checked={selectedMode === 'persistent'}
              disabled={isSubmitting}
              onChange={() => setSelectedMode('persistent')}
              className="mt-0.5 h-4 w-4 accent-emerald-600"
            />
            <span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <HardDrive className="h-3.5 w-3.5 text-emerald-700" />
                Salvar neste navegador
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-neutral-600">
                Recomendado apenas em computador privado. Seus cadastros e PDFs poderão estar
                disponíveis nas próximas sessões.
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
              selectedMode === 'temporary'
                ? 'border-sky-400 bg-sky-50/70'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <input
              type="radio"
              name="storage-mode"
              value="temporary"
              checked={selectedMode === 'temporary'}
              disabled={isSubmitting}
              onChange={() => setSelectedMode('temporary')}
              className="mt-0.5 h-4 w-4 accent-sky-600"
            />
            <span>
              <span className="text-xs font-semibold text-neutral-900">Usar somente nesta sessão</span>
              <span className="mt-1 block text-xs leading-relaxed text-neutral-600">
                Recomendado em computador público. Ao continuar, os dados deste app salvos
                anteriormente neste navegador serão apagados. Os novos dados ficarão apenas nesta
                sessão e serão descartados ao fechar ou recarregar a página.
              </span>
            </span>
          </label>
        </fieldset>

        {selectionError && (
          <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            {selectionError}
          </p>
        )}

        <button
          type="button"
          disabled={!selectedMode || isSubmitting}
          onClick={() => void handleContinue()}
          className="mt-5 w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? 'Preparando armazenamento...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};
