# Etapa 6 — Personagens econômicos e validação prolongada de desempenho

Referência: 27/10/2026. Esta etapa modifica a performance visual, mantendo os treinamentos de Caixa, Bomboniere e Sala e as interações com o instrutor.

## Otimização dos atores no Three.js
- Funcionários virtuais e clientes agora usam um único mesh para **tronco, cabeça, rosto, cabelo e acessórios rígidos** (cores de vértice), mantendo badge e olhos independentes.
- Cada **perna articulada** usa uma única malha de calça+sapato; a mesma geometria é compartilhada entre diferentes atores, sem perder a animação de caminhada.
- Cada **braço articulado** usa uma única malha de manga+mão; a animação de braços, conversa e entrega de bilhetes permanece vinculada ao grupo original.
- Sem novos modelos ou redes externas, sem alterações de animação dos NPCs, colisões, controles de operação, pipoqueiras ou salas.
- Testes verificam geometria das pernas compartilhada, braços e pernas independentes, olhos, balões de fala e regressões de Caixa/Bomboniere/Sala.
- A meta de engenharia de **150 draw calls no quadro de referência do Chromium móvel simulado** é verificada automaticamente; a contagem **não corresponde ao Safari real**.

## Sessão prolongada de observação no iPhone 11
1. Conferir que a revisão foi integrada à `main` e que há URL HTTPS realmente acessível, sem assumir que o Pages está habilitado. Atualizar cache da PWA se usar versão anterior.
2. No Safari do iPhone 11: iniciar o simulador e escolher função, qualidade Equilibrada, limite de 30 FPS.
3. Abrir Pausa, habilitar Métricas técnicas, retornar ao jogo e **jogar por pelo menos 20 minutos ativos e amostrados**. Circular entre hall, caixa, bomboniere, Sala 1 e Sala 2; testar toques, abertura, venda, simulação de pipocas e iluminação.
4. O monitor mostra **minutos ativos amostrados / 20** e total de perdas de contexto WebGL. As pausas e abas ocultas não devem somar amostras longas.
5. Ao final, usar **Compartilhar relatório técnico**, que inclui `activeObservedSeconds`, `activeTwentyMinuteSampleReached`, `contextLossCount`, `geometryCountAtStart`, `geometryCountPeak`, `geometryCountChange` e métricas por área.
6. Registrar temperatura percebida, nível aproximado de bateria e travamentos, **manualmente**, sem inventar medição de sensores. Conferir se ocorre perda de contexto WebGL ou aumento descontrolado de recursos.
7. Avaliar FPS, intervalo p95, draw calls, resolução, legibilidade em paisagem e presença de áudio/elementos externos conforme disponibilidade.

**Observação:** o contador `activeTwentyMinuteSampleReached` significa apenas que houve 20 minutos de intervalos entre quadros amostrados no navegador. Não garante estabilidade térmica, memória, energia, capacidade operacional, dispositivo ou qualidade física. Testes automatizados em Chromium não simulam hardware, Safari, WebKit nem um exercício físico de vinte minutos.

## Dependências de publicação
O repositório tem `.github/workflows/pages.yml`, com publicação por GitHub Actions quando a infraestrutura está configurada e autorizada. A existência desse workflow **não comprova acesso público**. Confirmar o Pages em `Settings > Pages` e testar a URL HTTPS no iPhone.

## Limitações
Treinamento demonstrativo, sem certificação ou aprovação operacional. Receitas quentes, produtos de limpeza, EPIs e condições reais exigem revisão dos responsáveis. Fluxos e relatórios permanecem fictícios, sem backend institucional de funcionário.
