# CineGlobo Simulator — roteiro de execução

**Data:** 27/10/2026. **Requisitos de referência:** roteiro fornecido pela direção do projeto, baseado em `CineGlobo_Prompt_Completo.md` e no commit `e675642e89fdf3dda5d5bd6b61f9fa16c94d724e`. Este arquivo complementa o documento integral; não elimina requisitos anteriores. O documento integral não foi localizado na raiz deste repositório quando este roteiro foi registrado.

## Decisões imutáveis
- Evoluir o mesmo jogo web Three.js/JavaScript. Nada de substituir por quiz ou minijogos isolados.
- Executar no próprio navegador do iPhone, sem computador pessoal ligado e sem desktop remoto.
- Referências visuais são metas de direção de arte: cinema convincente, balcões vermelhos, iluminação quente, metal e vidro controlado. Não há garantia de fotorrealismo móvel.
- Modelos próprios ou comercialmente licenciados, hospedados com o aplicativo. Não adotar fantasia, criaturas ou poderes da segunda proposta de referência.
- Ijuí como referência inicial; plantas das outras unidades não podem ser presumidas iguais. Medidas não documentadas permanecem provisórias.
- Nenhuma venda real, CPF real ou transmissão de dados operacionais pelo protótipo.

## Entregas agrupadas em quatro etapas

| Etapa | Entrega | Critério |
|---|---|---|
| 1 — Base leve | Perfil de desempenho, pausa, controles, carregamento, falhas, atualização, modularização gradual | Percorrer e interagir sem erro, medir no dispositivo e registrar limitações |
| 2 — Acabamento | Hall, caixas, bomboniere, pipoqueiras, personagens e duas salas | Equipamentos legíveis, colisões coerentes, leitura em celular |
| 3 — Treinamento | Atendimento, PDV, ingresso, pipocas, balde misto, abertura, salas e limpeza | Estados e ações reais na simulação, erros explicados, correção possível |
| 4 — Operação | Conteúdo compartilhado, administrativo seguro, progresso, PWA, testes, distribuição | Atualização consistente entre aparelhos, navegador com PC desligado |

Cada etapa pode conter vários PRs, mas deve entregar uma versão utilizável. Primeiro provar um atendimento integral, não multiplicar cenários sem validação.

### Etapa 1 — desempenho

- Corrigir pipocas decorativas com InstancedMesh; separar custos de lógica e renderização; congelar ações, NPCs, EPIs e temporizadores em pausa e aba oculta; impedir atos indevidos.
- Painel técnico somente opcional: FPS, p95 de intervalo entre quadros, draw calls, triângulos, carregamento e recursos. Percursos comparáveis em hall, bomboniere, Sala 1, Sala 2 e venda.
- Modularizar mundo, controles, NPC, treinamento, dados e UI sem reescrita regressiva.
- Fixar dependências essenciais e remover CDN onde viável; culling de salas fechadas considerando portas; LOD secundário; geometria/material compartilhados; colisores simples.
- Sem dependência da taxa de quadros para sequenciamento da simulação.
- Multitoque, safe areas, joystick+olhar, retrato/paisagem, pausa/retorno de menus e abas.
- **Metas iniciais não comprovadas:** iPhone 11 Safari horizontal; 30 FPS estáveis no modo Equilibrada, 60 opcionais; p95 de quadro até 40 ms; primeiro ambiente jogável até 15 MB; até 150 chamadas de desenho e 250 mil triângulos visíveis quando viável; texturas de 512–1024 px comuns, 2048 só quando justificado; 20 minutos sem vazamentos, congelamentos e controles perdidos. Não declarar aprovado sem medição real.

### Etapa 2 — acabamento

- Criar trecho de referência **caixa + cliente + bomboniere ao fundo** antes de expandir.
- Peças modulares para paredes, piso, portas, balcões; GLB/glTF e Blender opcional para autoria, texturas compactas e luz pré-calculada quando adequado.
- Poucas luzes dinâmicas e sombras, sem reflexos pesados. Circuitos independentes para arandelas, LEDs vermelhos e luzes de limpeza.
- Personagens reutilizáveis: caminhar, esperar, falar, apontar, pegar, entregar, vestir, limpar; instrutor segue sem obstruir; fallback caso GLB falhe; balões legíveis sem cobrir controles.
- Qualidade Econômica, Equilibrada e Alta, UI textual sempre nítida. Otimização automática futura sem mudanças incessantes de resolução.

### Etapa 3 — treinamentos verificáveis

**Unidades e cargos:** Três Passos, Palmeira das Missões, Santa Rosa, Frederico Westphalen, Cruz Alta, Ijuí e Horizontina; avisos gerais e específicos. Cargos escolhidos separadamente: Caixa, Bomboniere, Sala; NPCs realizam demais funções. Nenhum cargo obriga completar outro.

**Layout:** bomboniere atrás dos caixas, computador voltado ao funcionário, cliente do lado externo; monitor, teclado, mini impressora, duas pipoqueiras independentes com tampa, caldeirão, basculamento e controles visíveis; mãos ou enquadramento contextual para pegar/usar itens; paredes, portas e corredores coerentes.

**Salas de Ijuí:** Sala 1 apenas 2D; Sala 2 2D/3D. Fileiras A–J, 12 assentos por fileira, corredores laterais, fileira E VIP reclinável; mapa da venda coincide com modelo espacial. Arandelas acesas para entrada/comerciais, apagadas após música, LEDs vermelhos durante filme, iluminação geral de limpeza. Não presumir temperatura/volume oficiais.

**Atendimento:** tocar no computador chama cliente que se desloca, fala em balão, pede filme/hora/formato/sala/quantidade/categoria. Escolher assentos disponíveis sem duplicidade, meio de pagamento, troco, emissão e entrega de recibo/QR fictícios com participação visual da impressora. Não aprovar erro automaticamente. Categorias e preços editáveis, sempre fictícios.

**Ingresso:** validar código/QR sem CPF, ou CPF de teste vinculado à compra existente; unidade, sessão, formato, horário, sala e uso prévio; impedir reutilização. Gerar cenários para usuário que escolhe somente Sala.

**Abertura/intervalos:** acender luzes, ligar PDV/impressora/TVs, ar-condicionado, poltronas, cheirinho conforme aprovação; varrer, baldes temáticos, pipoca, temperatura/volume, limpar baldes/óculos 3D. Checklist só avança por ações verificadas.

**EPIs:** boné, luvas, cabelo comprido preso antes de pipoqueira; cabelos curtos não requerem ação impossível; equipar/vestir com animações. Não bloquear Caixa ou Sala.

**Pipoca salgada — relato, não procedimento oficialmente aprovado:** mistura-base de 1 L óleo + 1 L manteiga; por lote 1 xícara desta mistura, 1 xícara de milho, 1 colher rasa de sal especial; simular 200 °C, ligar batedor, acompanhar tampa/estouro, levantar tampa, desligar ao intervalo de 1–2 s, bascular. Ordem exata do sal permanece pendente, sem punição inventada.

**Pipoca doce — relato, não procedimento oficialmente aprovado:** simular 200 °C; batedor, 1 xícara milho, 1 de óleo, 1 de achocolatado; tampa/estouro, levantar, intervalo de 1–2 s, desligar, bascular. Não substituir ingredientes por caramelo/açúcar. Quantidade, temperatura e estágio devem existir no estado do jogo.

**Balde misto:** divisória primeiro; salgada pela metade; doce no lado vazio; completar com salgada; preenchimento progressivo e divisória visível.

**Limpeza noturna:** após última sessão, esvaziar; sobras separadas conforme política aprovada; retirar grãos/farelos com pincel; resíduos, peças, exterior, espuma, interior, vidros, secagem, montagem e caixas de ingredientes. Relatos com amolecedor, aquecimento, jarra, palha de aço e vinagre ficam **pendentes de aprovação operacional/manual**; não transformá-los em instruções avaliadas ou adicionar parâmetros elétricos/proporções inventadas.

**Instrutor e nota:** acompanhar, orientar, reconhecer erro, explicar correção e nova tentativa; contabilizar acertos, erros, pedidos de ajuda e repetição. Microfone é opcional, com alternativa por toque/texto.

### Etapa 4 — operação e entrega

- Conteúdo versionado por unidade/sala/sessão/aviso/preço/procedimento, separado do código 3D.
- JSON editado no repositório serve a demonstração. Contas, progresso e administração no celular requerem backend com autenticação, autorização e auditoria; verificar custos antes de contratar.
- `localStorage` apenas preferências e dados demonstrativos do aparelho; não equivale a sincronização segura.
- GitHub Pages somente para demonstração dentro dos limites do provedor; SaaS comercial demanda hospedagem apropriada, sem assumir contrato pago.
- PWA com rotas relativas, ícones e cache versionado; modo offline só após teste sem rede com todas as dependências; atualização controlada e recuperação de WebGL/rede.
- Validar abertura, movimentos simultâneos, pausa e temporizadores, erros de atendimento/troco/assento, ingresso válido/reutilizado/divergente, EPIs/receitas/limpeza, mapa espacial/iluminação, dados em outro dispositivo, performance física e rollback por versão.

## Próximo marco de aceitação
Trecho visual caixa + cliente + bomboniere ao fundo; cliente animado, pedido por balão, emissão/entrega de ingressos coerentes, bloqueios por erro e painel técnico medido no iPhone 11. Não confundir testes de CI ou Chromium com aprovação no Safari físico.

## Referências
- https://threejs.org/manual/pages/optimize-lots-of-objects.html
- https://threejs.org/manual/pages/responsive.html
- https://threejs.org/docs/pages/InstancedMesh.html
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
