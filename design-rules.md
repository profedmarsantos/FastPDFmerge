# Design System Global — Padrão Visual da Aplicação

## Objetivo

Este documento define o **padrão visual e de experiência de usuário obrigatório** para toda a aplicação.

Toda interface nova, tela, funcionalidade, modal, formulário, configuração, fluxo, componente ou página deve seguir estas regras.

O objetivo é garantir que a aplicação inteira pareça ter sido criada por uma única equipe de design, mesmo quando novas funcionalidades forem implementadas posteriormente.

### Direção visual

A referência estética é a linguagem visual de produtos como:

- ChatGPT em Light Mode
- Linear
- Vercel
- Stripe

Não copiar literalmente nenhuma dessas interfaces.

A referência deve servir apenas para estabelecer uma direção:

> **clean + minimalista + funcional + elegante + discreta + excelente hierarquia visual.**

---

# 1. PRINCÍPIO CENTRAL

A aplicação deve sempre priorizar:

> **clareza antes de decoração.**

E também:

> **simplicidade antes de complexidade.**

> **hierarquia antes de quantidade.**

> **função antes de ornamentação.**

> **espaço em branco antes de elementos desnecessários.**

Uma interface não deve ficar mais bonita simplesmente adicionando elementos.

Ela deve ficar mais bonita quando os elementos necessários estiverem:

- bem organizados;
- bem espaçados;
- visualmente equilibrados;
- semanticamente claros;
- consistentes.

---

# 2. REGRA DE OURO

Antes de adicionar qualquer elemento visual, perguntar:

1. Isso é necessário para executar a tarefa?
2. Isso melhora significativamente a compreensão?
3. Isso melhora significativamente a navegação?

Se a resposta for "não" para todos:

> **Não adicionar.**

Aplicar essa regra a:

- cards;
- badges;
- ícones;
- textos;
- divisores;
- botões;
- links;
- títulos;
- subtítulos;
- indicadores;
- mensagens;
- animações;
- menus;
- configurações.

---

# 3. PERSONALIDADE VISUAL

A aplicação deve transmitir:

- confiança;
- simplicidade;
- precisão;
- modernidade;
- profissionalismo;
- leveza;
- organização.

Evitar aparência:

- excessivamente colorida;
- infantil;
- gamer;
- futurista;
- pesada;
- ornamental;
- excessivamente corporativa;
- semelhante a dashboards administrativos tradicionais.

---

# 4. LIGHT MODE

O Light Mode é o padrão visual principal.

A interface deve utilizar uma base clara e neutra.

Fundos preferenciais:

```text
#FFFFFF
#FAFAFA
#F9F9F9
```

Não utilizar grandes áreas com:

- gradientes;
- texturas;
- imagens decorativas;
- padrões;
- ruído;
- efeitos luminosos.

---

# 5. CORES

Utilizar predominantemente uma escala de cinzas.

Estrutura conceitual:

```text
Background
Surface
Surface Elevated
Border
Text Primary
Text Secondary
Text Tertiary
Accent
Success
Warning
Error
```

Todos os componentes devem utilizar tokens compartilhados.

Não criar cores diferentes para cada componente.

---

# 6. COR DE DESTAQUE

Utilizar **uma única cor principal de accent**.

Ela deve ser usada principalmente para:

- CTA principal;
- estado ativo;
- links importantes;
- seleção;
- foco;
- elementos interativos prioritários.

Não utilizar várias cores fortes simultaneamente.

A cor de destaque não deve dominar a interface.

---

# 7. CORES SEMÂNTICAS

Utilizar cores semânticas somente quando necessário.

### Success

- conclusão;
- confirmação;
- arquivo processado;
- operação bem-sucedida.

### Error

- erro;
- falha;
- validação inválida;
- ação destrutiva.

### Warning

- atenção;
- situação potencialmente problemática.

Não transformar toda mensagem em um alerta colorido.

---

# 8. NÃO USAR CORES DECORATIVAS

Não utilizar cores apenas para deixar a interface mais bonita.

Evitar:

- gradientes;
- neon;
- glow;
- múltiplas cores;
- backgrounds coloridos sem função;
- badges multicoloridos.

A interface deve continuar elegante mesmo em escala de cinza.

---

# 9. TIPOGRAFIA

Utilizar uma fonte moderna e altamente legível.

Preferência:

```text
Inter
```

ou equivalente de sistema com características semelhantes.

Não utilizar múltiplas famílias tipográficas sem necessidade.

---

# 10. HIERARQUIA TIPOGRÁFICA

Estabelecer níveis claros:

```text
Display
H1
H2
H3
Body
Body Small
Caption
```

O tamanho deve refletir a importância.

Não utilizar títulos enormes em telas que não precisam de destaque.

Não utilizar textos pequenos para informações importantes.

---

# 11. TÍTULOS

Títulos devem ser:

- curtos;
- objetivos;
- claros;
- descritivos.

Preferir:

```text
Mescle dois PDFs
```

em vez de:

```text
Mescle seus arquivos PDF com facilidade e rapidez
```

---

# 12. SUBTÍTULOS

Subtítulos devem existir somente quando realmente ajudarem.

Um subtítulo deve responder:

> "O que preciso saber para entender esta tela?"

Não utilizar subtítulos apenas para preencher espaço.

---

# 13. MICROCOPY

Todo texto deve ser curto e funcional.

Preferir:

```text
Selecionar arquivo
```

em vez de:

```text
Clique aqui para selecionar o arquivo que deseja utilizar
```

Preferir:

```text
Nome do arquivo
```

em vez de:

```text
Nome personalizado do arquivo final
```

Preferir:

```text
Salvar alterações
```

em vez de:

```text
Clique no botão abaixo para salvar as alterações realizadas
```

---

# 14. EVITAR REDUNDÂNCIA

Nunca comunicar a mesma informação várias vezes.

Exemplo ruim:

```text
Processamento local

Seus arquivos são processados localmente.

Processamento local.
Seus arquivos permanecem no navegador.

100% Local
```

Escolher apenas uma comunicação.

Exemplo correto:

```text
Processamento local. Seus arquivos permanecem no navegador.
```

---

# 15. INTERFACE AUTOEXPLICATIVA

A interface deve explicar seu funcionamento principalmente através de:

- posição;
- hierarquia;
- nomenclatura;
- affordance;
- estado visual;
- proximidade entre elementos.

Não depender de grandes blocos de texto explicativo.

---

# 16. ESPAÇO EM BRANCO

O espaço em branco é parte do design.

Não preencher espaços vazios apenas porque existem.

Utilizar espaço para:

- separar grupos;
- estabelecer hierarquia;
- reduzir carga cognitiva;
- criar foco.

Uma interface limpa deve respirar.

---

# 17. SISTEMA DE ESPAÇAMENTO

Utilizar um sistema consistente baseado preferencialmente em múltiplos de 4 ou 8.

Exemplo:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
```

Evitar valores aleatórios.

Componentes semelhantes devem possuir espaçamentos semelhantes.

---

# 18. DENSIDADE

A interface deve possuir densidade moderada.

Não deixar tudo comprimido.

Também não transformar uma operação simples em uma página excessivamente espaçada.

Usar o espaço para criar hierarquia.

---

# 19. LAYOUT

Utilizar layouts centralizados quando a aplicação for focada em uma tarefa.

Preferência:

```css
max-width: 960px;
```

ou largura equivalente adequada ao conteúdo.

Interfaces complexas podem utilizar larguras maiores somente quando justificadas.

---

# 20. GRID

Utilizar grids simples e previsíveis.

Preferir:

```text
1 coluna
2 colunas
2 × 2
```

Evitar layouts excessivamente fragmentados.

O grid deve ajudar o usuário a compreender a estrutura.

---

# 21. RESPONSIVIDADE

Toda nova interface deve funcionar em:

- desktop;
- notebook;
- tablet;
- mobile.

Não criar primeiro uma interface desktop e simplesmente "encolher".

Pensar no conteúdo e na prioridade de cada elemento em telas menores.

---

# 22. MOBILE

No mobile:

- manter apenas o essencial;
- empilhar componentes quando necessário;
- reduzir títulos;
- manter áreas de toque confortáveis;
- evitar tabelas largas;
- evitar scroll horizontal;
- evitar controles minúsculos.

---

# 23. CONTAINER

Utilizar um container consistente.

Exemplo conceitual:

```css
width: 100%;
max-width: 960px;
margin: 0 auto;
padding: 0 24px;
```

Os valores podem variar conforme o contexto, mas devem seguir o mesmo sistema global.

---

# 24. CARDS

Cards devem ser usados com moderação.

Um card deve existir quando houver uma razão estrutural para agrupar conteúdo.

Não transformar cada elemento em card.

Evitar:

```text
Card
  Card
    Card
      Input
```

Preferir:

```text
Seção
    Input
    Input
    Select
```

---

# 25. BORDAS

As bordas devem ser sutis.

Exemplo:

```css
border: 1px solid #E5E5E5;
```

ou token equivalente.

Evitar bordas:

- pretas;
- muito grossas;
- excessivamente contrastantes.

---

# 26. BORDER RADIUS

Utilizar cantos discretamente arredondados.

Manter consistência.

Exemplo de escala:

```text
6px
8px
10px
12px
```

Não misturar dezenas de raios diferentes.

---

# 27. SOMBRAS

Sombras devem ser discretas.

Preferir:

- sombra quase imperceptível;
- borda + superfície;
- elevação mínima.

Evitar:

- sombras fortes;
- sombras coloridas;
- glow;
- efeitos 3D.

---

# 28. BOTÕES

Os botões devem possuir hierarquia.

### Primary

Para a ação principal:

```text
Mesclar PDFs
Salvar
Continuar
Criar
```

### Secondary

Para ações importantes, mas não principais.

### Tertiary / Ghost

Para ações secundárias.

### Destructive

Somente para ações realmente destrutivas.

---

# 29. UM CTA PRINCIPAL

Cada tela deve possuir uma ação principal claramente identificável.

Evitar várias ações sólidas competindo visualmente.

Escolher uma ação principal.

---

# 30. ESTADOS DOS BOTÕES

Todo botão interativo deve considerar:

```text
Default
Hover
Active
Focus
Disabled
Loading
Success
Error
```

Quando aplicável.

---

# 31. LOADING

O loading deve comunicar o que está acontecendo.

Preferir:

```text
Mesclando...
Salvando...
Processando...
```

em vez de:

```text
Aguarde...
```

---

# 32. INPUTS

Inputs devem ser simples e consistentes.

Estrutura:

```text
Label

[ valor ]
```

Não adicionar textos explicativos em excesso.

---

# 33. LABELS

Labels devem ser curtos.

Preferir:

```text
Disciplina
```

em vez de:

```text
Selecione abaixo a disciplina que deseja utilizar
```

---

# 34. PLACEHOLDERS

Placeholder não deve substituir label.

Utilizar placeholder somente para:

- exemplo;
- formato;
- orientação curta.

---

# 35. SELECTS

Selects devem parecer com os inputs do restante da aplicação.

Não criar um estilo de dropdown diferente em cada tela.

---

# 36. CHECKBOXES E RADIOS

Utilizar componentes consistentes.

Estados:

- default;
- hover;
- checked;
- disabled;
- focus.

---

# 37. TABS

Tabs devem ser utilizadas para alternar entre conteúdos relacionados.

Devem ser:

- discretas;
- claras;
- compactas;
- acessíveis;
- **estáticas em largura (zero layout shift):** alternar para a tab ativa em negrito/semibold nunca deve alterar a largura do botão ou empurrar as tabs vizinhas.

Evitar tabs gigantes.

A tab ativa deve possuir contraste suficiente.

---

# 38. MENUS

Menus devem ser simples.

Utilizar menus para:

- ações secundárias;
- configurações avançadas;
- ações contextuais.

Não esconder em menus aquilo que é essencial para completar a tarefa.

---

# 39. "MAIS OPÇÕES"

Utilizar "Mais opções" para esconder configurações avançadas que não são necessárias para todos os usuários.

Exemplo:

```text
Mais opções
```

Ao expandir:

```text
Configurações avançadas
...
```

---

# 40. MODAIS

Modais devem ser usados somente quando o usuário precisa tomar uma decisão ou concluir uma tarefa isolada.

Estrutura:

```text
Título

Conteúdo essencial

[Cancelar] [Confirmar]
```

Não colocar páginas inteiras dentro de modais.

---

# 41. TOOLTIP

Tooltips devem explicar informações que não são óbvias.

Não utilizar tooltip para informações fundamentais.

Se algo é essencial, deve estar visível.

---

# 42. ÍCONES

Preferir uma biblioteca consistente, como:

```text
Lucide Icons
```

ou equivalente.

Não misturar diferentes estilos de ícones.

---

# 43. ÍCONES COMO APOIO

Ícones devem apoiar a compreensão.

Não utilizar ícones apenas para decorar.

Se um ícone não acrescenta significado, remover.

---

# 44. TAMANHO DOS ÍCONES

Utilizar escala consistente:

```text
14px
16px
18px
20px
24px
```

Evitar ícones gigantes em interfaces funcionais.

---

# 45. BADGES

Badges devem ser usados apenas para estados ou categorias relevantes.

Exemplos:

```text
Ativo
Novo
Beta
Local
```

Não usar badges apenas porque existe espaço disponível.

---

# 46. STATUS

Status devem ser objetivos:

```text
Processado
Pendente
Erro
Concluído
```

Evitar frases longas dentro de badges.

---

# 47. DIVISORES

Divisores devem ser sutis.

Utilizar somente quando ajudarem a separar grupos.

Não colocar uma linha entre cada componente.

---

# 48. UPLOADS

Todos os componentes de upload devem seguir o mesmo padrão global.

Estado vazio:

```text
Ícone

Arraste ou selecione um arquivo
```

Estado preenchido:

```text
Ícone
nome-do-arquivo.pdf
tamanho

Remover
```

Não repetir instruções quando o arquivo já estiver selecionado.

**Consistência Dimensional e Zero Layout Shift:**
Cards de upload com múltiplos estados (ex.: vazio, arquivo carregado, período dispensado com formulário oficial, ou erro) **devem possuir uma altura padrão (baseline height) consistente e estática** (ex.: `h-[160px] min-h-[160px]`). A transição entre estados não deve alterar a altura do container nem deslocar cards vizinhos em layouts de grade (ex.: 2x2 ou colunas emparelhadas). Todo o conteúdo deve ser alinhado e centralizado vertical e horizontalmente dentro dos limites fixos do container.

---

# 49. DRAG AND DROP

O drag and drop deve possuir:

- área claramente identificável;
- estado de arraste;
- feedback visual;
- fallback por seleção manual.

---

# 50. MENSAGENS DE ERRO

Erros devem ser:

- específicos;
- curtos;
- acionáveis.

Preferir:

```text
Selecione os 4 PDFs para continuar.
```

em vez de mensagens técnicas ou longas.

---

# 51. MENSAGENS DE SUCESSO

Sucesso também deve ser curto.

Preferir:

```text
PDF criado com sucesso.
```

ou:

```text
Alterações salvas.
```

Não criar grandes banners para operações simples.

---

# 52. EMPTY STATES

Empty states devem explicar:

1. o que está vazio;
2. o que o usuário pode fazer.

Exemplo:

```text
Nenhum arquivo selecionado.

[ Selecionar arquivo ]
```

---

# 53. CONFIRMAÇÕES

Não pedir confirmação para ações reversíveis ou triviais.

Usar confirmação principalmente para:

- exclusão definitiva;
- perda de dados;
- ações irreversíveis.

---

# 54. NAVEGAÇÃO

A navegação deve ser previsível.

O usuário deve saber:

- onde está;
- o que pode fazer;
- como voltar;
- qual é a ação principal.

---

# 55. HEADER GLOBAL

O header deve ser simples.

Preferência:

```text
Logo + Nome

             Navegação / ações
```

Não colocar dezenas de elementos.

---

# 56. FOOTER GLOBAL

O footer deve ser discreto.

Informações secundárias podem aparecer nele.

Não utilizar o footer como depósito de informações que deveriam estar na interface principal.

---

# 57. INFORMAÇÕES TÉCNICAS

Informações técnicas devem ser ocultadas ou reduzidas quando não forem necessárias ao usuário comum.

Exemplos:

- detalhes de processamento;
- formatos internos;
- identificadores;
- regras técnicas;
- informações de implementação.

Se forem importantes, utilizar:

```text
Mais opções
```

ou tooltip.

---

# 58. PRIVACIDADE

Informações de privacidade devem aparecer de maneira clara, mas sem repetição.

Exemplo:

```text
Processamento local. Seus arquivos permanecem no navegador.
```

Mostrar uma vez no contexto apropriado.

---

# 59. HIERARQUIA DE INFORMAÇÃO

Cada tela deve ter aproximadamente esta ordem:

```text
1. Objetivo
2. Ação principal
3. Conteúdo necessário
4. Configurações
5. Informações secundárias
```

Nunca inverter sem uma razão clara.

---

# 60. PROGRESSIVE DISCLOSURE

Mostrar primeiro o essencial.

Configurações avançadas devem aparecer somente quando necessárias.

Exemplo:

```text
Configurações básicas
...

Mais opções
    Configurações avançadas
```

---

# 61. CONSISTÊNCIA ENTRE TELAS

Componentes equivalentes devem ser visualmente equivalentes.

Se existir um:

```text
Botão Primary
```

ele deve ter a mesma aparência em todas as telas.

Se existir um:

```text
Input
```

não criar uma nova aparência de input para uma nova funcionalidade sem justificativa.

---

# 62. DESIGN TOKENS

Centralizar, sempre que possível:

- cores;
- tipografia;
- espaçamentos;
- border radius;
- sombras;
- tamanhos;
- breakpoints;
- transições.

Exemplo conceitual:

```text
--color-background
--color-surface
--color-border
--color-text-primary
--color-text-secondary
--color-accent
--color-success
--color-error

--space-1
--space-2
--space-3
--space-4

--radius-sm
--radius-md
--radius-lg
```

Não espalhar valores arbitrários pelo código.

---

# 63. COMPONENTES REUTILIZÁVEIS

Novas funcionalidades devem reutilizar componentes existentes.

Antes de criar um componente visual novo, verificar:

> Já existe um componente que resolve isso?

Se existir, reutilizar.

Se não existir, criar um novo componente dentro do mesmo design system.

---

# 64. NÃO DUPLICAR COMPONENTES

Evitar criar múltiplos componentes que fazem essencialmente a mesma coisa:

```text
PrimaryButton
PrimaryButtonNew
NewButton
ModernButton
ActionButton
```

Criar um componente único e reutilizável.

---

# 65. VARIAÇÕES CONTROLADAS

Quando um componente precisar de variações, utilizar variantes.

Exemplo:

```text
Button
  variant="primary"
  variant="secondary"
  variant="ghost"
  variant="destructive"
```

Não criar componentes completamente diferentes para pequenas diferenças visuais.

---

# 66. DESIGN SYSTEM COMO FONTE ÚNICA

O design system deve ser tratado como a fonte oficial da aparência da aplicação.

Antes de implementar uma nova interface:

1. verificar componentes existentes;
2. verificar tokens;
3. reutilizar padrões;
4. somente então criar o que estiver faltando.

---

# 67. NOVAS FUNCIONALIDADES

Toda nova funcionalidade deve seguir este processo:

### Etapa 1 — Entender a tarefa

Identificar:

- objetivo;
- ação principal;
- informações obrigatórias;
- informações opcionais.

### Etapa 2 — Remover excesso

Eliminar:

- textos redundantes;
- campos desnecessários;
- configurações pouco utilizadas;
- elementos decorativos.

### Etapa 3 — Mapear componentes

Reutilizar:

- buttons;
- inputs;
- selects;
- tabs;
- cards;
- uploads;
- alerts;
- modals;
- menus.

### Etapa 4 — Aplicar o design system

Usar:

- tokens;
- espaçamentos;
- tipografia;
- cores;
- componentes.

### Etapa 5 — Revisar

Comparar a nova tela com as telas existentes.

Ela deve parecer parte do mesmo produto.

---

# 68. REESTILIZAÇÃO DE INTERFACES EXISTENTES

Se uma interface estiver fora do padrão, não preservar a inconsistência apenas porque ela já existe.

### Preservar

- lógica;
- regras de negócio;
- dados;
- funcionalidades;
- integrações;
- fluxos necessários.

### Alterar quando necessário

- layout;
- hierarquia;
- espaçamento;
- tipografia;
- cores;
- bordas;
- sombras;
- componentes;
- microcopy;
- densidade visual.

---

# 69. AUDITORIA VISUAL

Toda interface nova ou reestilizada deve passar por uma auditoria.

Perguntar:

```text
Existe algum elemento redundante?
Existe algum texto desnecessário?
Existe algum card que poderia ser removido?
Existe alguma cor sem função?
Existe alguma borda excessiva?
Existe alguma sombra excessiva?
Existe algum botão competindo com o CTA principal?
Existe alguma informação repetida?
Existe alguma configuração que poderia estar em "Mais opções"?
Existe algum componente diferente de outro equivalente?
Existe algum espaçamento inconsistente?
```

Se a resposta for sim, corrigir.

---

# 70. TESTE DE REMOÇÃO

Depois de concluir uma tela, tente remover aproximadamente 20% dos elementos sem prejudicar a funcionalidade.

Se a interface continuar funcionando melhor, manter a versão simplificada.

---

# 71. TESTE DE 5 SEGUNDOS

Ao abrir uma tela, o usuário deve conseguir identificar rapidamente:

```text
Onde estou?
O que posso fazer?
Qual é a ação principal?
```

Se isso não estiver claro, simplificar a interface.

---

# 72. TESTE DE CONSISTÊNCIA

Comparar a nova interface com outras interfaces do produto.

Verificar:

```text
Tipografia
Cores
Inputs
Botões
Tabs
Cards
Ícones
Espaçamento
Bordas
Sombras
Mensagens
Estados
```

Se algo parece pertencer a outro produto, corrigir.

---

# 73. ANIMAÇÕES

Animações devem ser discretas.

Utilizar somente quando ajudam a:

- indicar transição;
- mostrar estado;
- orientar o usuário;
- fornecer feedback.

Evitar efeitos chamativos ou movimento constante.

---

# 74. TRANSIÇÕES

Preferir transições rápidas e naturais.

Exemplo conceitual:

```css
transition: 150ms ease;
```

ou equivalente coerente com o design system.

---

# 75. HOVER

Hover deve ser sutil.

Não alterar drasticamente:

- tamanho;
- posição;
- cor;
- sombra.

**Zero Layout Shift:**
Nunca alterar o peso da fonte (`font-weight`) em hover de maneira que aumente a largura do texto e desloque elementos adjacentes. Se o texto precisar de destaque, utilize soluções com largura reservada (`data-text`), placeholders invisíveis, variação de cor ou `text-shadow`.

---

# 76. FOCUS

Todo elemento interativo deve possuir estado de foco visível.

Nunca remover o outline sem fornecer uma alternativa acessível.

---

# 77. ACESSIBILIDADE

A estética clean não pode prejudicar acessibilidade.

Preservar:

- contraste;
- foco;
- navegação por teclado;
- labels;
- semântica;
- áreas de toque;
- mensagens de erro;
- estados.

---

# 78. SEMÂNTICA HTML

Utilizar elementos semânticos adequados:

```text
header
nav
main
section
article
form
label
button
input
footer
```

Não utilizar `div` para tudo quando um elemento semântico existir.

---

# 79. ÍCONES E ACESSIBILIDADE

Ícones que representam ações devem possuir:

- label;
- tooltip;
- aria-label;
- ou texto visível.

Não depender apenas do significado visual de um ícone.

---

# 80. FORMULÁRIOS

Formulários devem seguir uma ordem lógica:

```text
Informação principal
↓
Informações secundárias
↓
Configurações
↓
Ação
```

Não colocar a ação principal antes das informações necessárias.

---

# 81. FORMULÁRIOS LONGOS

Se uma tela possuir muitos campos:

- agrupar por contexto;
- esconder opções avançadas;
- utilizar seções;
- evitar grandes blocos de texto.

Se ainda estiver complexa, considerar dividir em etapas.

---

# 82. DASHBOARDS

Não transformar automaticamente uma funcionalidade em dashboard.

Uma ferramenta focada em uma tarefa deve continuar sendo uma ferramenta focada em uma tarefa.

Dashboard somente quando existir necessidade real de monitoramento ou análise.

---

# 83. MARKETING VS PRODUTO

Não transformar a interface da ferramenta em uma landing page.

Dentro do produto:

- reduzir slogans;
- reduzir marketing;
- reduzir chamadas promocionais;
- priorizar a tarefa.

---

# 84. NOVOS COMPONENTES

Antes de criar um novo componente:

```text
1. Existe componente equivalente?
2. Existe variante que resolve?
3. Posso reutilizar um padrão existente?
4. Posso resolver sem criar um novo componente?
```

Somente se todas as respostas forem negativas criar um novo padrão.

---

# 85. NOVAS TELAS

Antes de criar uma nova tela:

```text
1. Qual é a tarefa principal?
2. Qual é a ação principal?
3. Quais dados são realmente necessários?
4. O que pode ser ocultado?
5. O que pode ser removido?
6. Quais componentes existentes posso reutilizar?
7. Como essa tela se encaixa no design system?
```

---

# 86. REGRA DE REESTILIZAÇÃO

Quando receber uma interface fora do padrão:

> Não apenas "embelezar".

Fazer uma verdadeira normalização visual.

Corrigir:

- inconsistências;
- excesso de informação;
- hierarquia;
- espaçamento;
- componentes;
- cores;
- tipografia;
- estados.

Preservar a funcionalidade.

---

# 87. CHECKLIST GLOBAL

## Visual

- [ ] Light Mode consistente.
- [ ] Paleta predominantemente neutra.
- [ ] Uma cor de accent.
- [ ] Tipografia consistente.
- [ ] Zero layout shift: textos em negrito/ativos/hover não alteram largura nem deslocam componentes vizinhos.
- [ ] Dimensões uniformes em cards multi-estados (altura consistente e estática em estados vazio, carregado e dispensado).
- [ ] Bordas sutis.
- [ ] Sombras discretas.
- [ ] Border radius consistente.
- [ ] Ícones consistentes.
- [ ] Espaçamento consistente.

## UX

- [ ] Objetivo da tela está claro.
- [ ] Ação principal está clara.
- [ ] Não existem elementos redundantes.
- [ ] Não existem textos desnecessários.
- [ ] Configurações avançadas estão ocultas quando apropriado.
- [ ] Fluxo é simples.
- [ ] Estados estão claros.

## Componentes

- [ ] Componentes existentes foram reutilizados.
- [ ] Não existem componentes duplicados.
- [ ] Variantes são utilizadas corretamente.
- [ ] Tokens são utilizados.
- [ ] Não existem estilos arbitrários desnecessários.

## Responsividade

- [ ] Desktop funciona.
- [ ] Tablet funciona.
- [ ] Mobile funciona.
- [ ] Não existe scroll horizontal.
- [ ] Áreas de toque são adequadas.
- [ ] Formulários se reorganizam corretamente.

## Acessibilidade

- [ ] Navegação por teclado funciona.
- [ ] Foco é visível.
- [ ] Contraste é adequado.
- [ ] Labels são claros.
- [ ] Ícones possuem alternativa acessível.
- [ ] Estados não dependem apenas de cor.

---

# 88. CRITÉRIO FINAL DE APROVAÇÃO

Uma nova interface somente deve ser considerada pronta quando puder responder "sim" às perguntas:

```text
Ela parece pertencer ao mesmo produto?

Ela utiliza os mesmos componentes das outras telas?

Ela possui a mesma linguagem visual?

Ela é mais simples do que poderia ser?

O usuário entende o objetivo rapidamente?

Existe apenas uma ação principal clara?

Há alguma informação repetida?

Existe algum elemento que poderia ser removido?

As configurações avançadas estão escondidas quando apropriado?

A interface funciona bem no mobile?

A acessibilidade foi preservada?
```

Se alguma resposta for "não", revisar antes de finalizar.

---

# 89. INSTRUÇÃO PERMANENTE PARA IA

Ao criar, modificar ou reestilizar qualquer interface desta aplicação, trate este documento como o **Design System Global obrigatório**.

Não criar uma nova linguagem visual.

Não inventar novos padrões sem necessidade.

Não introduzir novas cores arbitrariamente.

Não criar componentes visualmente inconsistentes.

Não adicionar elementos apenas para preencher espaço.

Não aumentar a quantidade de informação sem necessidade.

Não transformar ferramentas simples em dashboards.

Sempre reutilizar padrões existentes.

Sempre priorizar clareza.

Sempre remover redundâncias.

Sempre manter a experiência:

> **clean, minimalista, profissional, leve e consistente com a linguagem visual do ChatGPT em Light Mode.**

---

# 90. FRASE-MESTRA

Toda decisão de design deve seguir estas duas regras:

> **Se pode ser mais simples sem perder funcionalidade, faça mais simples.**

E:

> **Se uma nova interface não parece fazer parte do mesmo produto, ela precisa ser reestilizada antes de ser considerada pronta.**

---

# 91. PREVENÇÃO DE LAYOUT SHIFT EM TEXTO EM NEGRITO E ESTADOS INTERATIVOS

Elementos interativos (como tabs, botões segmentados, links, opções de filtro e itens de navegação) **nunca devem alterar a largura do elemento nem deslocar o layout ao redor quando seu peso de fonte (`font-weight`) mudar para negrito/semibold** durante hover, seleção (`selected`) ou estado ativo (`active`).

### O Problema (Layout Shift / Jitter Indesejado)
Quando o texto de um botão ou aba altera dinamicamente seu peso de normal/médio (400/500) para semibold/bold (600/700), os glifos tornam-se fisicamente mais largos. Em elementos com dimensionamento intrínseco (auto width baseado em padding), isso faz a aba ou botão expandir, empurrando as abas vizinhas e desestabilizando todo o alinhamento horizontal.

### Requisito Obrigatório
Garantir que a transição para negrito/ativo **NÃO altere a largura do componente** nem desloque outros componentes do layout.

### Soluções Padrão Adotadas:

1. **Pseudo-elemento com `data-text` (Reserva Antecipada de Largura)**
   O elemento utiliza um pseudo-elemento oculto (`::after`) com a propriedade `font-weight: 600` contendo o mesmo texto (`attr(data-text)`), forçando a caixa a já nascer com a largura exata do estado em negrito:
   ```css
   [data-text] {
     display: inline-flex;
     flex-direction: column;
     align-items: center;
     justify-content: center;
     text-align: center;
   }
   [data-text]::after {
     content: attr(data-text);
     height: 0;
     line-height: 0;
     visibility: hidden;
     overflow: hidden;
     user-select: none;
     pointer-events: none;
     font-weight: 600; /* Reserva a largura máxima */
   }
   ```
   **Uso no componente:**
   ```tsx
   <button data-text="Mesclar 2 PDFs" className="...">
     <span>Mesclar 2 PDFs</span>
   </button>
   ```

2. **Placeholder Invisível**
   Inserir um elemento oculto (`aria-hidden="true"`) com `font-semibold` e `height: 0; visibility: hidden; overflow: hidden;` para fixar a largura do container na dimensão máxima.

3. **Simulação de Peso via `text-shadow`**
   Em contextos onde pseudo-elementos não são ideais, simular o aspecto de negrito sem alterar as dimensões métricas dos caracteres:
   ```css
   text-shadow: 0.018em 0 0 currentColor, -0.018em 0 0 currentColor;
   ```

4. **Peso Estático com Contraste por Cor e Superfície**
   Manter o mesmo `font-weight` nos estados inativo e ativo (ex.: `font-medium`), diferenciando o estado exclusivamente por elevação sutil, fundo contrastante (ex.: `bg-white text-neutral-900 shadow-xs`) e cor neutra, sem qualquer variação de espessura de traço.

> **Regra de Ouro:** O clique ou foco em qualquer controle interativo deve produzir feedback instantâneo e estável, com zero deslocamento espacial nos elementos adjacentes.

---

# 92. CARDS MULTI-ESTADOS COM DIMENSÕES UNIFORMES (ZERO LAYOUT SHIFT)

Componentes de card com renderização condicional (ex.: zonas de upload, formulários colapsáveis, cards de status com múltiplos passos) **devem manter altura e largura estáticas e uniformes em todos os seus estados possíveis**.

### O Problema (Jitter Dimensional em Alternância de Estados)
Quando um card possui estados distintos com quantidades variadas de linhas de texto, ícones ou botões secundários (ex.: estado vazio versus estado com relatório gerado com botão de download):
- A altura do container se expande ou contrai dinamicamente ao alternar o estado.
- Em layouts em grid (como grades 2x2 de uploads de bimestres/módulos), o aumento de altura de um único card desalinha as linhas da grade e empurra todo o conteúdo inferior da página.
- O resultado é uma experiência visual instável e amadora.

### Requisitos Obrigatórios:

1. **Altura Base Padrão (Baseline Height / Min-Height Fixada)**
   - O container externo do card deve estabelecer uma altura estática ou altura mínima padronizada que comporte com conforto o estado com maior volume de conteúdo (ex.: `h-[160px] min-h-[160px] w-full`).
   - O container **não deve sofrer resize** ao alternar entre os estados (vazio, preenchido, dispensado, gerado ou erro).

2. **Alinhamento Centralizado nos Limites Fixos**
   - O conteúdo interno de todos os estados deve ser alinhado e centralizado tanto verticalmente (`justify-center`) quanto horizontalmente (`items-center` e `text-center`) dentro dos limites fixos do container.
   - Em estados horizontais (como lista de arquivos com ações), o conteúdo deve ocupar a largura disponível (`w-full`) enquanto permanece centrado na vertical.

3. **Mensagens de Erro ou Avisos Transitórios**
   - Avisos transitórios (como erros de validação de arquivo arrastado) não devem esticar o container verticalmente. Devem ser acomodados dentro da altura reservada ou posicionados de forma absoluta interna (`absolute bottom-2 inset-x-3 z-10`), sem alterar o fluxo do documento.

### Exemplo de Implementação Padrão:
```tsx
<div className="relative rounded-xl border p-4 sm:p-5 flex flex-col justify-center items-center h-[160px] min-h-[160px] w-full">
  {isExempt ? (
    <ExemptStateContent />
  ) : fileInfo ? (
    <FileLoadedContent />
  ) : (
    <EmptyUploadPrompt />
  )}
</div>
```

> **Diretriz Mandatória:** Em grids e listas, cards pertencentes ao mesmo grupo estrutural devem permanecer com dimensões perfeitamente simétricas em qualquer situação ou estado de interação.

---

# 93. DIRETRIZES DE SEGURANÇA, VALIDAÇÃO E DEVSECOPS (CLIENT-SIDE ROBUSTNESS & OWASP)

Em aplicações web que operam primariamente no cliente processando documentos confidenciais de usuários (como relatórios acadêmicos e PDFs oficiais), a segurança deve ser aplicada em camadas (Defesa em Profundidade) de acordo com os padrões OWASP Top 10 e práticas modernas de DevSecOps.

### 1. Segurança no Lado do Cliente & Prevenção a XSS
1. **Esquema Seguro em Links e Ações Dinâmicas:**
   - Funções que disparam downloads de artefatos em memória (`triggerDownload`) ou navegam para URLs dinâmicas devem validar rigorosamente o protocolo (`blob:`, caminhos relativos seguros no mesmo domínio).
   - Bloquear terminantemente esquemas executáveis ou arbitrários como `javascript:`, `vbscript:` ou `data:` não catalogados.
   - Todo link externo gerado dinamicamente deve conter explicitamente `rel="noopener noreferrer"`.
2. **Escapamento e Imutabilidade do DOM:**
   - Nunca utilizar injeções diretas em HTML (`dangerouslySetInnerHTML`, `innerHTML` ou `document.write`).
   - Confiar na renderização declarativa do React que sanitiza strings por padrão, garantindo que nomes de alunos, disciplinas ou professores sejam tratados estritamente como texto puro.

### 2. Tratamento Seguro de Arquivos & Prevenção a DoS
1. **Validação de Assinatura Binária (Magic Bytes):**
   - Não confiar exclusivamente na extensão de arquivo (`.pdf`) ou no MIME type informado pelo navegador (`file.type`), pois ambos podem ser facilmente forjados.
   - Inspecionar diretamente os primeiros 1024 bytes do arquivo (`slice(0, 1024)`) para confirmar a assinatura mágica `%PDF-` antes de submeter o buffer aos parsers completos.
2. **Limites Rígidos de Memória & Prevenção de Esgotamento (Buffer / Memory Exhaustion):**
   - Impor limites máximos por arquivo individual (máximo 50 MB) e limite cumulativo de mesclagem (máximo 150 MB) antes da alocação de memória no thread principal.
   - Estabelecer um teto de páginas processadas (máximo 1.000 páginas) para neutralizar ataques de "PDF Page Bombs" que causam travamento (freeze/crash) do navegador.
3. **Higienização Determinística de Nomes de Arquivos (Path Traversal Prevention):**
   - Nomes de arquivos gerados ou fornecidos por entrada do usuário devem passar por sanitização obrigatória:
     - Eliminação de sequências de escape de diretório (`../`, `..\`) e separadores de pasta (`/`, `\`).
     - Remoção de caracteres proibidos em sistemas operacionais (`[<>:"/\\|?*]`), bytes nulos (`\0`) e caracteres de controle (ASCII 0 a 31).
     - Truncamento do nome base a limites seguros (até 100 caracteres) antes de reanexar a extensão `.pdf`.

### 3. Gestão de Segredos & Dependências (DevSecOps)
1. **Zero Credenciais no Frontend:**
   - Nenhum segredo institucional, chave de API privada, token de autenticação pessoal ou credencial de infraestrutura pode residir no código-fonte do cliente ou em variáveis de ambiente expostas no build (`VITE_`).
   - Variáveis em `.env.example` devem conter exclusivamente placeholders documentais sem valores reais.
2. **Governança de Bibliotecas de Terceiros:**
   - Utilizar apenas bibliotecas auditadas e maduras com manutenção ativa (ex.: `pdf-lib`, `lucide-react`).
   - Executar verificações contínuas de vulnerabilidades (`npm audit` / linters de segurança) para certificar a ausência de CVEs críticas ou de alto impacto.

### 4. Erros e Prevenção de Vazamento de Informações
1. **Mensagens de Erro Sanitizadas e Amigáveis:**
   - Erros internos de bibliotecas, mensagens de exceção de baixo nível ou rastreamentos de pilha (*stack traces*) não devem ser projetados diretamente na interface para o usuário final.
   - Mapear exceções conhecidas (ex.: PDFs protegidos por senha, arquivos corrompidos ou falta de memória) para orientações claras em português, mantendo logs técnicos restritos ao console de depuração em ambiente de desenvolvimento.

### 5. Ciclo de Vida de Memória & Integridade de Armazenamento Local
1. **Revogação Sistemática de Recursos (`URL.revokeObjectURL`):**
   - Sempre que um novo documento for processado, gerado ou quando o componente for desmontado, URLs criadas via `URL.createObjectURL` devem ser imediatamente revogadas para liberar a memória heap do navegador.
2. **Validação Rígida de Esquema em Armazenamento Local (`localStorage`):**
   - Dados carregados do `localStorage` devem ser tipados e validados contra um esquema estrito, descartando propriedades desconhecidas, prevenindo poluição de protótipo (`__proto__`), higienizando caracteres de controle em strings e impondo cotas numéricas máximas de registros para evitar estouro da cota do navegador.

---

# 94. RASTREABILIDADE DE BUILD & VERSÃO NO RODAPÉ (BUILD-TIMESTAMP)

A aplicação deve expor visualmente no rodapé (*footer*) a marcação temporal precisa da última compilação para assegurar rastreabilidade de versão tanto em homologação quanto em produção no GitHub Pages / Cloud Run.

### Diretrizes de Implementação:
1. **Injeção em Tempo de Build:**
   - O timestamp deve ser computado e injetado pelo bundler (`vite.config.ts`) no momento exato do comando `vite build` via macro global (`define: { __APP_BUILD_VERSION__: ... }`), garantindo que o valor represente a compilação estática real e não a hora do cliente.
2. **Formato Obrigatório:**
   - O formato visual padronizado é: `YYYY MM AA - HH:MM` (ex.: `2026 09 09 - 19:45`), indicando Ano (4 dígitos), Mês (2 dígitos), Dia (2 dígitos) e Hora:Minuto com zeros à esquerda no fuso horário de referência (`America/Sao_Paulo`).
3. **Apresentação Visual:**
   - O identificador deve ser renderizado no rodapé compartilhado, estilizado de forma discreta e minimalista (tipografia monoespaçada, tamanho `text-[11px]`, fundo suave neutro e borda sutil com `title="Data e hora da última compilação (Build)"`), sem competir com as ações principais da tela.



