import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  usesPersistentStorage: boolean;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  usesPersistentStorage,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="text-sm font-semibold text-neutral-900">
                Privacidade e dados
              </h3>
              <p className="text-xs text-neutral-500">Seu trabalho permanece no seu dispositivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Fechar aviso de privacidade"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 py-4 text-xs leading-relaxed text-neutral-600">
          <p>
            Seus PDFs e dados acadêmicos não são enviados a servidores externos.
          </p>
          <p>
            {usesPersistentStorage
              ? 'Os PDFs gerados e os cadastros são armazenados somente no navegador deste dispositivo.'
              : 'Você está usando o modo temporário: os PDFs e cadastros serão descartados ao fechar ou recarregar a página.'}
          </p>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 text-emerald-900">
            Não utilizamos analytics ou telemetria. A interface é servida pelo GitHub Pages, sem
            receber o conteúdo dos seus arquivos ou cadastros.
          </div>
        </div>

        <div className="flex justify-end border-t border-neutral-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
