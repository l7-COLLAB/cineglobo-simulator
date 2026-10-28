# Etapa 11 — Interações confiáveis e gestos estáveis no iPhone

## Problemas verificados
- Antes, o algoritmo aceitava um objeto apenas quando o jogador estivesse no alcance **e olhando diretamente** para ele; o limiar de direção era rígido (cosseno 0,67). No iPhone, aproximar-se sem centralizar a câmera podia ocultar **AGIR**.
- O alvo selecionado era guardado entre quadros. Em baixa taxa de FPS, um toque podia executar uma ação de outro ponto após o jogador se afastar.
- Perda de foco, cancelamento do toque, pausa ou abertura de modal podiam deixar um ponteiro capturado e manter comandos de joystick.
- A geometria de sofás e balcões deve bloquear seleções que atravessem obstáculos; salas separadas devem exigir portas abertas.
- Testes automatizados de interface não substituem testes físicos de Safari, especialmente após 20 minutos de jogo.

## Correções implementadas
- `interaction-targeting.mjs` é um algoritmo puro, rápido e testável. O alcance agora é 1,88 m na maioria dos setores, 2,25 m no computador e 2,20 m no instrutor. Dentro de 1,22 m, não é preciso alinhar o olhar com exatidão.
- Para alvos mais distantes, é exigida somente orientação geral (não claramente às costas). O sistema verifica colisores do cenário, divisória das salas e passagem pela porta aberta.
- Um alvo já indicado tem pequena preferência de estabilidade, evitando o botão alternar rapidamente entre objetos próximos.
- Antes de executar AGIR ou a tecla E, o jogo verifica novamente a posição atual, os obstáculos e a janela/pausa. Nada é executado quando a ação deixou de estar acessível.
- Ao perder foco, ocultar a aba, abrir um modal ou pausar, o jogo libera ponteiros capturados, zera a direção do joystick e interrompe a caminhada. O botão AGIR mantém nome acessível para leitores de tela.
- Cache da PWA `v34`: inclui o novo módulo local e preserva disponibilidade offline após instalação bem-sucedida.

## Testes
- Testes Node de proximidade, alvo atrás do jogador, colisão de sofá, terminal integrado a balcão, portas e preferência estável.
- Testes Playwright móvel para botão contextual, toque atrasado após afastamento, perda de foco e pausa.
- Regressão completa das fases anteriores (atendimento, sala, bomboniere, PWA e métricas).
- Critério de desempenho: cenário de referência Chromium móvel com **no máximo 150 chamadas de desenho**; não é estimativa de FPS real do Safari.

## Teste manual no iPhone 11 (pendente)
Abra a última versão publicada, gire o aparelho para paisagem e caminhe entre hall, caixa, pipoqueira e sala. O botão AGIR deve aparecer perto dos objetos, inclusive quando estão de lado, e desaparecer ao afastar-se. Ele não deve executar a ação depois de sair do alcance nem através do sofá/porta fechada. Use dois dedos no joystick e câmera, pause durante o movimento e retome. Repita com notificações/alternância de aplicativos. Monitore a sessão por 20 minutos ativos.

**Limites:** o projeto é demonstrativo, não certifica funcionários; ainda não há controle de contas, fila multiusuário, autenticação administrativa ou confirmação de estabilidade térmica física.
