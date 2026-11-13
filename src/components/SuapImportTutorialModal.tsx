import React, { useEffect } from 'react';
import { CircleHelp, X } from 'lucide-react';

interface SuapImportTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialVideoUrl = `${import.meta.env.BASE_URL}assets/videos/suap_import.mp4`;

export const SuapImportTutorialModal: React.FC<SuapImportTutorialModalProps> = ({
  isOpen,
  onClose,
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
      aria-labelledby="suap-import-tutorial-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <CircleHelp className="h-4 w-4" />
            </div>
            <div>
              <h3 id="suap-import-tutorial-title" className="text-sm font-semibold text-neutral-900">
                Como importar disciplinas do SUAP
              </h3>
              <p className="text-xs text-neutral-500">
                Assista ao passo a passo antes de selecionar o arquivo MHTML.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Fechar tutorial de importação do SUAP"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <video
          className="mt-4 w-full rounded-xl border border-neutral-200 bg-neutral-950"
          controls
          preload="metadata"
          playsInline
        >
          <source src={tutorialVideoUrl} type="video/mp4" />
          Seu navegador não suporta a reprodução deste vídeo.
        </video>
      </div>
    </div>
  );
};
