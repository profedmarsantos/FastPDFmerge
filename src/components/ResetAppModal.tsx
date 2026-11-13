import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ResetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting?: boolean;
}

export const ResetAppModal: React.FC<ResetAppModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isResetting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isResetting]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs"
    >
      <div
        id="reset-app-modal"
        className="relative w-full max-w-md rounded-xl bg-white border border-neutral-200 p-6 shadow-xl text-neutral-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="reset-modal-title" className="text-sm font-semibold text-neutral-900">
                Redefinir toda a aplicação?
              </h3>
              <p className="text-xs text-neutral-500">Restauração de fábrica e limpeza geral</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 text-xs text-neutral-600 space-y-2.5">
          <p>
            Esta ação irá zerar completamente todos os dados salvos no navegador e redefinir a aplicação para o seu estado padrão inicial:
          </p>
          <ul className="space-y-1.5 pl-2 text-neutral-500 list-disc list-inside">
            <li>Apaga todos os <strong>cadastros acadêmicos</strong> e <strong>PDFs gerados</strong> salvos no navegador;</li>
            <li>Limpa todos os <strong>arquivos PDF carregados</strong> e formulários em aberto;</li>
            <li>Revoga arquivos em memória e limpa os <strong>caches locais</strong> da aplicação;</li>
            <li>Restaura os valores padrões de nomenclatura e configuração.</li>
          </ul>
          <div className="mt-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-800 flex items-start gap-2 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Esta operação é irreversível. Os PDFs gerados serão apagados deste navegador.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 bg-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-full-reset"
            onClick={onConfirm}
            disabled={isResetting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isResetting ? 'Redefinindo...' : 'Zerar e redefinir tudo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
