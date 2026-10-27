# CineGlobo Simulator — Etapa 3, Sala: ingressos e rotina operacional (demonstração)

Versão de referência: 27/10/2026. Esta documentação se aplica ao PR da branch `feat/etapa3-salas-validacao-rotina`.

## Funcionalidades entregues
- Seleção da função **Sala** independente de Caixa/Bomboniere. O leitor de ingressos fica inacessível para jogador em outra função.
- Validação por sessão **completa e obrigatória**: unidade, filme, horário, sala, formato 2D/3D, status novo e poltrona A–J, números 1–12.
- Ingresso marcado como usado na aprovação; segunda tentativa deve oferecer **recusa**, jamais nova liberação.
- Dados armazenados apenas no navegador e fictícios; CPF só consulta um código de teste previamente vinculado, não consulta CPF real.
- Sessões da Sala 1 em Ijuí são apenas **2D**; Sala 2 aceita 2D ou 3D. O conteúdo de outras cidades continua demonstrativo sem presumir planta física idêntica.
- Painel da sala com fluxo acionado por cliques executados: início da recepção (arandelas + LEDs), encerramento de comerciais (arandelas apagadas, somente LEDs), limpeza (luzes gerais), inspeção de poltronas, piso/corredores e objetos esquecidos.
- Quando sessão é **3D**, a rotina exige o recolhimento virtual de óculos antes da conclusão; para 2D a ação é opcional e não penalizada.
- A fase de filme só pode iniciar depois de pelo menos um bilhete fictício aprovado na sessão selecionada. A fase de limpeza exige passar pela fase de filme. O encerramento exige ações de inspeção, e não marcar checkbox sem executar.
- Regras puras em `room-training.mjs`, testes Node de casos corretos e incorretos e Playwright em viewport móvel.

## Ações do aprendiz
1. Escolher a função **Sala** ao entrar no jogo.
2. Aproximar-se do painel de iluminação da sala correta e selecionar a sessão; iniciar recepção.
3. Aproximar-se do leitor de ingressos e confirmar filme, horário, sala e formato do ingresso fictício. Autorizar um bilhete válido; tentar o mesmo bilhete novamente e recusar.
4. Voltar ao painel da sala, simular o fim dos comerciais (apagar arandelas, preservar LEDs).
5. Após simular o fim da sessão, acender luzes gerais para a limpeza.
6. Inspecionar os assentos A–J, piso e corredores e objetos esquecidos; quando aplicável, recolher óculos 3D virtualmente.
7. Encerrar rotina e verificar o estado aprovado.

## Restrições
Este produto não valida o procedimento real de verificação de ingressos, exigências de emergência, acessibilidade, limpeza, iluminação, ar-condicionado ou descarte. Não prescreve produtos químicos, temperatura da sala nem parâmetros de áudio não fornecidos pelos responsáveis. As simulações de ingresso, cliente e sessão são fictícias. Uma validação operacional responsável continua obrigatória antes de vender o software para capacitação oficial.

## Testes pendentes além do CI
Inspeção do fluxo no Safari físico em iPhone 11, movimentação e posição dos botões, legibilidade em paisagem, perda de contexto WebGL, travessia entre salas e relatório de métricas por 20 minutos. Publicação pública não é prova de aprovação física.
