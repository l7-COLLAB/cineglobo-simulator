# Etapa 3 — treinamento interativo de bomboniere

## Entregue nesta branch
- Um posto de treino selecionável pelo funcionário, com bloqueio por **função Bomboniere** e **EPIs conferidos**. As outras funções continuam com NPCs.
- Dois motores independentes de treinamento, pipoca **salgada** e **doce**, com estados testáveis. As máquinas possuem comandos de abertura, misturador, tampa e inclinação associados a objetos 3D e controles acessíveis por toque em painel.
- Salgada: base de referência 1 L óleo + 1 L manteiga; 1 copo de mistura; 1 copo de milho. O sal especial é apresentado como 1 colher rasa, **sem aprovação do momento de adição**. A simulação não registra penalidades por sua posição na sequência.
- Doce: 1 copo de óleo, 1 copo de milho e **1 copo de chocolate em pó**, não caramelo ou açúcar.
- Após aquecimento **fictício** do mostrador até 200 °C, o misturador pode ser ligado, ingredientes carregados e tampa fechada. A animação virtual acompanha o estouro, reduzindo a frequência até um intervalo sinalizado de 1 a 2 segundos antes de permitir desligar e inclinar.
- Montagem do balde misto em sequência: primeira metade salgada, metade doce e acabamento com salgada. Exige ambos os sabores concluídos.
- Botões com tamanho mínimo de toque, avisos de erro em português e HUD de progresso. Missão da pipoqueira é concluída por uma batelada aprovada, **não** somente por EPIs.
- Animações não avançam quando jogo está pausado ou aba oculta; continuam com o jogo em execução, inclusive enquanto o painel da máquina está aberto.
- PWA atualizado para armazenar o novo módulo local no cache de versão `cineglobo-v25-popcorn-training`. **Isso não certifica operação offline completa**, pois dependências externas ainda podem precisar de rede.

## Limitações declaradas
- Os valores são **parâmetros de jogo**, não procedimentos de operação real ou instruções de segurança alimentar. Um operador responsável precisa aprovar etapas, insumos, EPIs, limites e limpeza antes de uso formal.
- A etapa do sal continua **não avaliável** enquanto não houver definição operacional.
- Não há queimadura, manipulação de alimentos reais, temperatura real nem validação de segurança de equipamentos.
- A animação do milho estourando é representativa e visualmente econômica. Há trabalho futuro de caldeirão articulado, sons autorizados, recipientes em mãos e instruções por objeto.
- A atribuição de nota e histórico entre sessões ainda é local e demonstrativa, sem autenticação institucional.
- Testes Playwright em viewport móvel não substituem testes de Safari/iPhone físico nem comprovação de desempenho ou treinamento oficial.

## Revisão esperada
1. Conferir o CI de regras e navegador: sal não penalizado, doce sem caramelo, ordem de etapas, separação entre máquinas, EPIs e montagem do balde misto.
2. Confirmar aproximação do personagem aos comandos, visibilidade da bomba de milho, tampa e caldeirão, toques em botões e texto legível no celular.
3. Testar no Safari do iPhone 11 em paisagem, com pausa, rotação e fechamento do jogo.
4. Obter validação operacional dos ingredientes e do momento do sal antes de transformar a mecânica em treinamento avaliado real.
