# CineGlobo Simulator — Etapa 4, turnos, metas e instrutor

Atualização de 27/10/2026. **Treinamento demonstrativo; não certifica aptidão operacional.**

## O que mudou
Há um **terminal 3D de turno em cada setor** do cinema: Caixa, Bomboniere e Sala. O aprendiz escolhe uma única função ao entrar. Os outros setores continuam com funcionários virtuais. Ao usar E/AGIR no terminal de seu setor, o aprendiz pode iniciar um exercício de turno, acompanhar metas de abertura, atendimento e fechamento, consultar erros e visualizar um histórico de até oito exercícios concluídos neste navegador.

As metas são registradas por eventos emitidos durante **ações realmente realizadas no simulador**. Não há controle para assinalar metas sem interagir com os equipamentos. Para conferir a saída, o estoque e a bancada, há objetos 3D específicos; para encerrar o caixa ou conferir os misturadores, o terminal valida evidências do jogo antes de aceitar a ação.

O instrutor continua acompanhando o jogador e agora indica a próxima meta pendente, incluindo orientação sobre qual equipamento procurar. Respostas incorretas na validação do caixa, nas duas pipoqueiras e na rotina de sala podem entrar no histórico do exercício. Não são armazenados CPF real nem dados de identidade do usuário.

## Setor Caixa
- **Abertura:** abrir computador do caixa, conferir mini impressora e televisão de programação.
- **Atendimento:** atender cliente virtual, selecionar a sessão, receber pagamento fictício, emitir e **entregar** ingressos correspondentes ao pedido.
- **Fechamento:** conferir o registro de bilhetes emitidos e entregues e encerrar o computador do turno no terminal. A conferência continua possível depois da despedida do cliente, pois a evidência da venda é preservada durante o exercício.
- Erros reais das regras de venda são registrados somente com o exercício iniciado.

## Setor Bomboniere
- **Abertura:** vestir EPIs e validá-los na bancada; conferir os recipientes de insumos pelo objeto 3D da estação.
- **Atendimento:** concluir as duas bateladas separadas e montar o balde misto corretamente.
- **Fechamento:** confirmar no terminal que ambos os misturadores estão desligados e inspecionar a bancada pela interação com um objeto do cenário. Não há simulação nem instrução de produtos químicos de limpeza.
- O momento correto de aplicação do sal continua pendente de aprovação operacional e não gera penalização.

## Setor Sala
- **Abertura:** conferir a porta da sala e iniciar a recepção no painel de luzes.
- **Atendimento:** validar um ingresso fictício da sessão exata e concluir a rotina de filme/limpeza no painel da sala.
- **Fechamento:** confirmar iluminação de limpeza da sala concluída no terminal e inspecionar a saída usando o objeto físico próximo à entrada.
- Sala 1 Ijuí é apenas 2D; Sala 2 pode oferecer sessões demonstrativas 2D e 3D.

## O que não foi implementado como serviço real
- Cobrança financeira, fechamento de caixa contábil, auditoria de ingressos comerciais, autenticação, emissão de certificados, logs em servidor ou rastreamento de funcionários.
- Procedimentos oficiais de temperatura, limpeza, segurança, acessibilidade, evacuação, ar-condicionado ou requisitos de cada unidade.
- Verificação real da qualidade do serviço: o registro de progresso é local, fictício e orientativo.

## Testes
- `tests/shift-training.test.mjs`: ações das três funções; controle de fase; impossibilidade de forçar eventos; prevenção de duplicatas; relatórios e limites do histórico de erros.
- `tests/turnos.spec.cjs`: terminal 3D, abertura do Caixa, venda completa pela UI, entrega animada, fechamento e histórico.
- Testes existentes de Caixa, Bomboniere, Sala, diagnóstico e cenários gráficos permanecem como regressão.
- Testes em Chromium com viewport móvel **não substituem a validação física no Safari do iPhone 11**.

## Pendências
Aprovação operacional dos procedimentos, teste físico Safari de 20 minutos com métricas exportadas, publicação pública do GitHub Pages (não confirmada por esta alteração), validação offline completa e reforço de autenticação se houver uso institucional.
