# Auditoria profunda — CineGlobo Simulator
Data: 28/10/2026. Base analisada: branch `main` após a Etapa 9. Escopo: código Three.js, módulos de treino, cenário, NPCs, PWA e testes GitHub Actions.

## Diagnóstico e evidências técnicas

| Severidade | Evidência no projeto | Consequência | Ação |
|---|---|---|---|
| Crítica | `makeTrainer()` inicia em (x=0.75, z=3.15), e o sofá tem colisor centrado em (0, 2.8) com largura 1.90 e profundidade 4.55, com margem adicional de 0.24 | Instrutor começa **dentro de obstáculo**; a função `canStand()` pode impedir que ele saia | Mover a posição inicial para área livre; criar navegação com desvio de obstáculos |
| Alta | A lógica anterior `updateTrainerFollow()` movia diretamente em linha reta até o alvo | Sofá, balcões ou parede interrompem o seguidor; giros e mudanças de direção podem parecer órbitas | A* com trajetória validada pelo mesmo `canStand()`, recálculo limitado e distância pessoal |
| Alta | `setRoomLights()` ajustava principalmente `PointLight.intensity` e `emissiveIntensity`, mas o cenário tem `HemisphereLight(..., 2.4)` e `AmbientLight(...,.46)` globais | No modo filme as superfícies continuam claras; a mudança pode ser pouco perceptível | Escurecer materiais próprios de cada sala, preservando LED de orientação e luminárias |
| Alta | `sw.js` implementa estratégia **cache-first** e substitui o cache na atualização, sem diálogo visível para reiniciar a página | Safari pode continuar mostrando HTML antigo e permanecer com controles anteriores em uma aba aberta | Aviso discreto de nova versão após ativação do Service Worker; botão de recarregar |
| Alta | A seleção do alvo requer proximidade **e** ângulo do olhar, `facing >= .67` na maioria dos objetos | Interação pode parecer falhar apesar de proximidade; especialmente no joystick do celular | Em etapa seguinte, priorizar proximidade e visibilidade/linha de visão, com indicador de alvo na UI |
| Média | As fitas e postes de fila não têm colisão e o cliente caminha por segmento retilíneo | A fila funciona como decoração e não como sistema multiusuário | Implementar fila com pontos de espera, ocupação, atendimento e percurso dos clientes |
| Média | O sofá permite sentar alterando a posição da câmera, mas não tem animação corporal ou estado de posicionamento | A ação funciona de modo simplificado, sem sensação corporal de sentar | Animar sentar/levantar e melhorar aproximação |
| Alta | `settings` e `data` são lidos do `localStorage` sem validação rigorosa de tipos e intervalos | Dados antigos ou inválidos podem causar tela travada, qualidade incorreta e erro de UI | Validar os dados locais de forma compatível, preservando valores válidos |
| Comercial | Painel Admin acessível sem login, persistência somente em `localStorage`, avaliações locais demonstrativas | Dados não são compartilhados entre funcionários, e não há gestão institucional real | Autenticação, servidor, controle de permissões, relatórios por usuário e revisão oficial de procedimentos antes de venda |
| Validação | O CI testa Chromium móvel emulado, **não Safari/WebKit de iPhone 11 físico**; limite de 150 chamadas é amostra específica | Testes verdes não comprovam performance, UX, temperatura ou estabilidade reais | Executar bateria física de 20 minutos, regressão de toque, luzes, salas, offline, reinícios e baixa conectividade |

## Decisão técnica

**Não acrescentar agora novos modelos/efeitos pesados.** Priorizar o motor de navegação, iluminação fidedigna, compatibilidade do estado local e atualização da PWA, em seguida a experiência contextual de interação e a fila operacional. O protótipo não está pronto para certificação, implantação institucional ou venda como treinamento aprovado.

## Correções desta etapa

- `navigation.mjs`: planejador A* de baixo custo, com verificação de colisões, sem cortar paredes em diagonal.
- `index.html`: ponto inicial do instrutor fora do sofá, deslocamento por pontos navegáveis, luz de cinema realçada por materiais de superfície individuais e estado visual film/entrada/limpeza.
- PWA: aviso quando uma atualização de Service Worker é detectada e opção de recarregar sem perder o controle do usuário; pré-cache v33 de todos os módulos, inclusive `navigation.mjs`.
- Testes: casos de navegação por sofá/obstáculos, modos de iluminação, ausência de travamento inicial e offline; os testes existentes continuam essenciais.

## Prioridades após a correção

1. **P0 — reais, em iPhone:** comprovar controles touch, atualizar a PWA e executar 20 minutos de uso observando FPS, consumo, calor e logs.
2. **P1 — interação e acessibilidade:** indicador de alvo de proximidade, raycast de visibilidade e interação contextual ao lado de objetos.
3. **P1 — luz/ambiente:** transições graduais com estados visuais distintos para início, projeção e limpeza, sem conflitos com regras de treino.
4. **P2 — logística dos NPCs:** fila de múltiplos clientes com pontos, desvio de bloqueios e ação independente por setor.
5. **P2 — fidelidade visual:** modelos de caixa, impressora, pipoqueiras, assentos e arquitetura com PBR leve, texturas comprimidas e orçamento por ambiente.
6. **P0 comercial — segurança:** separar administrador de usuário final, contas persistentes, avaliações auditáveis, telemetria consentida e critérios pedagógicos validados.

## Limitações de verificação

O repositório e o CI podem confirmar comportamento em Chromium e integridade da distribuição. Sem captura do navegador em execução física, logs remotos consentidos ou teste presencial, **não se pode afirmar que todas as falhas relatadas no iPhone foram eliminadas**. Acessibilidade pública de uma URL HTTPS depende do Pages e do cache do dispositivo.
