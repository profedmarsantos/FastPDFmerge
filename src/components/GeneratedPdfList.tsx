import React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { GeneratedPdf } from '../types';
import { formatBytes, triggerDownload } from '../utils/pdfMerger';

interface GeneratedPdfListProps {
  generatedPdfs: GeneratedPdf[];
  annual?: boolean;
  onDelete: (id: string) => void;
}

function downloadGeneratedPdf(pdf: GeneratedPdf) {
  const url = URL.createObjectURL(pdf.blob);
  triggerDownload(url, pdf.fileName);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const GeneratedPdfList: React.FC<GeneratedPdfListProps> = ({
  generatedPdfs,
  annual = false,
  onDelete,
}) => {
  if (generatedPdfs.length === 0) {
    return null;
  }

  return (
    <section className="mt-6" aria-label="PDFs gerados">
      <h2 className="mb-2 text-sm font-semibold text-neutral-800">PDFs gerados</h2>
      <div className="space-y-2">
        {generatedPdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 truncate" title={pdf.fileName}>
                  {pdf.fileName}
                </p>
                <p className="text-xs text-neutral-500">
                  {annual ? 'PDF anual gerado' : 'PDF gerado'} · {pdf.totalPages} página{pdf.totalPages !== 1 ? 's' : ''} · {formatBytes(pdf.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadGeneratedPdf(pdf)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar novamente</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(pdf.id)}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Excluir PDF gerado"
                aria-label={`Excluir ${pdf.fileName}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
