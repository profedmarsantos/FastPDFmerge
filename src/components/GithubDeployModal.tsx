import React, { useState } from 'react';
import { X, Github, Check, Copy, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

interface GithubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubDeployModal: React.FC<GithubDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Repositório no GitHub: "FastPDFmerge"',
      desc: 'Para subir alterações de código e uma nova versão no repositório configurado:',
      cmd: `git add .\ngit commit -m "chore: atualizacao de versao"\ngit push origin main`,
    },
    {
      title: '2. Deploy Automático no GitHub Pages',
      desc: 'O GitHub Actions (.github/workflows/deploy.yml) compila e publica automaticamente a cada push na branch main ou tags de versão (v*). Verifique se em Settings > Pages a opção Source está como "GitHub Actions".',
      cmd: null,
    },
    {
      title: '3. Acesso à aplicação publicada',
      desc: 'Após a execução do workflow, acesse a URL de produção configurada no GitHub Pages.',
      cmd: null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div
        id="github-deploy-modal"
        className="relative w-full max-w-lg rounded-xl bg-white border border-neutral-200 p-6 shadow-xl text-neutral-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Configuração GitHub Pages</h3>
              <p className="text-xs text-neutral-500">Deploy automatizado no repositório FastPDFmerge</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900">Processamento local no navegador:</span> Nenhum backend é necessário. O workflow <code className="px-1 py-0.5 bg-white rounded border border-neutral-200 font-mono text-[11px]">.github/workflows/deploy.yml</code> já está configurado.
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {steps.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                <p className="font-medium text-neutral-900 text-xs">{step.title}</p>
                <p className="text-neutral-500 leading-relaxed">{step.desc}</p>
                {step.cmd && (
                  <div className="relative mt-2">
                    <pre className="p-2.5 rounded-md bg-white border border-neutral-200 font-mono text-[11px] text-neutral-800 overflow-x-auto">
                      {step.cmd}
                    </pre>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(step.cmd!, idx)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                      title="Copiar comando"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
