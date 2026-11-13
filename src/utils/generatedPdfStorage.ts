import { GeneratedPdf, GeneratedPdfTab, MergeResult } from '../types';

const DATABASE_NAME = 'fastpdfmerge_generated_pdfs_v1';
const STORE_NAME = 'generated-pdfs';
const DATABASE_VERSION = 1;
const MAX_GENERATED_PDFS = 50;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        const store = request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-tab-and-created-at', ['tab', 'createdAt']);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o armazenamento de PDFs gerados.'));
  });
}

function createGeneratedPdf(tab: GeneratedPdfTab, result: MergeResult): GeneratedPdf {
  return {
    id: crypto.randomUUID(),
    tab,
    blob: result.blob,
    fileName: result.fileName,
    size: result.size,
    totalPages: result.totalPages,
    createdAt: result.mergedAt.toISOString(),
  };
}

export async function saveGeneratedPdf(tab: GeneratedPdfTab, result: MergeResult): Promise<GeneratedPdf> {
  const generatedPdf = createGeneratedPdf(tab, result);
  const database = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(generatedPdf);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível salvar o PDF gerado.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('O salvamento do PDF gerado foi interrompido.'));
    });

    await trimGeneratedPdfs(database);
    return generatedPdf;
  } finally {
    database.close();
  }
}

export async function loadGeneratedPdfs(): Promise<GeneratedPdf[]> {
  const database = await openDatabase();

  try {
    return await new Promise<GeneratedPdf[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.onsuccess = () =>
        resolve(
          (request.result as GeneratedPdf[]).sort(
            (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)
          )
        );
      request.onerror = () => reject(request.error ?? new Error('Não foi possível carregar os PDFs gerados.'));
    });
  } finally {
    database.close();
  }
}

export async function deleteGeneratedPdf(id: string): Promise<void> {
  const database = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível excluir o PDF gerado.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('A exclusão do PDF gerado foi interrompida.'));
    });
  } finally {
    database.close();
  }
}

export async function clearGeneratedPdfs(): Promise<void> {
  const database = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível limpar os PDFs gerados.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('A limpeza dos PDFs gerados foi interrompida.'));
    });
  } finally {
    database.close();
  }
}

async function trimGeneratedPdfs(database: IDBDatabase): Promise<void> {
  const generatedPdfs = await new Promise<GeneratedPdf[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as GeneratedPdf[]);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível organizar os PDFs gerados.'));
  });

  const excessPdfs = generatedPdfs
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
    .slice(0, Math.max(0, generatedPdfs.length - MAX_GENERATED_PDFS));

  if (excessPdfs.length === 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    excessPdfs.forEach((pdf) => store.delete(pdf.id));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Não foi possível remover PDFs antigos.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('A limpeza dos PDFs antigos foi interrompida.'));
  });
}
