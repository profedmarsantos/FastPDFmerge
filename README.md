# FastPDFmerge

Aplicação web moderna, segura e minimalista para mesclagem de arquivos PDF diretamente no navegador, sem envio para servidores externos.

> **Repositório**: `profedmarsantos/FastPDFmerge`.

---

## 🚀 Funcionalidades

- **100% Processado no Navegador**: Os arquivos PDF nunca saem do seu computador ou dispositivo (privacidade e segurança total).
- **Sequência Rigorosa de Mesclagem**: Garante que o Arquivo 1 (ex.: Avaliação) anteceda o Arquivo 2 (ex.: Recuperação Paralela).
- **Padrão Oficial de Nomenclatura Escolar**:
  - Padrão: `XºBim-SIGLA (Rec. Paral. Nome da Disciplina).pdf`
  - Seletores diretos para **1º**, **2º**, **3º** e **4º** bimestres (`1ºBim`, `2ºBim`, `3ºBim`, `4ºBim`).
  - Caractere ordinal **º** (ALT+167) padronizado.
  - Atalhos para siglas comuns (`HIS1`, `QUI1`, `MAT1`, `FIS1`, `BIO1`, etc.).
- **Deploy Automático no GitHub Pages**: Configurado via GitHub Actions em `.github/workflows/deploy.yml`.

---

## 🛠️ Publicando atualizações no GitHub (`FastPDFmerge`)

Para enviar uma atualização de versão para o repositório no GitHub:

```bash
# 1. Adicione os arquivos alterados
git add .

# 2. Crie o commit com a mensagem da versão
git commit -m "chore: release nova versão"

# 3. (Opcional) Crie uma tag de versão
git tag v1.0.1

# 4. Envie as alterações para o GitHub
git push origin main --tags
```

---

## 🌐 Deploy Automático no GitHub Pages

O arquivo de automação `.github/workflows/deploy.yml` compila e publica o site automaticamente a cada `git push` na branch `main` ou tags de versão `v*`.

Para garantir que o GitHub Pages use o workflow:
1. Acesse o repositório no GitHub: [https://github.com/profedmarsantos/FastPDFmerge](https://github.com/profedmarsantos/FastPDFmerge)
2. Acesse **Settings** > **Pages**.
3. Na seção **Build and deployment** / **Source**, certifique-se de que está selecionado **GitHub Actions**.
4. A aplicação é publicada automaticamente no endereço oficial:
   **[https://profedmarsantos.github.io/FastPDFmerge/](https://profedmarsantos.github.io/FastPDFmerge/)**

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Compilar para produção
npm run build
```
