# Etapa 9 — Hall, fila do caixa, iluminação e funcionários

A atualização implementa os ajustes solicitados após os testes reais no iPhone 11.

## Hall
- Removidas as quatro mesas e suas banquetas. Um sofá comprido em formato de ilha possui assentos nas laterais e nas extremidades, encosto central baixo e acabamento vinho escuro.
- Quatro pontos interativos permitem sentar dos lados **esquerda, direita, entrada e caixa**. O ponto de vista desce ao sentar; usar novamente a interação ou andar faz levantar.
- Removidos os colisores antigos das mesas. O sofá mantém colisão central para impedir atravessar o estofado.
- Instalados organizadores de fila entre entrada e bilheteria, com postes metálicos e fitas vinho entre colunas. O cliente virtual nasce dentro do corredor da fila e se dirige ao balcão do caixa.
- Geometrias estáticas consolidadas para manter a renderização leve no celular.

## Iluminação
- Adicionados interruptores de demonstração **próximos das entradas das Salas 1 e 2**, para qualquer função visualizar a iluminação sem receber pontuação indevida.
- Três modos distintos: entrada/comerciais (arandelas), filme (luzes gerais/arandelas apagadas, LEDs vermelhos permanecem) e limpeza (luzes gerais).
- Ao escolher um modo no interruptor externo, a porta correspondente abre para a demonstração ficar observável. A rotina avaliada da função Sala continua com suas exigências de ingresso e inspeção.
- Pontos de luz e emissivos foram reforçados para distinguir melhor os estados, sem adicionar dezenas de PointLights.

## iPhone e instrutor
- Botão AGIR aparece apenas quando há alvo real, a distância e direção válidas; desaparece em áreas vazias, quando há uma janela aberta e ao pausar.
- O instrutor utiliza trajetória do jogador e posição de espera com histerese, sem orbitar quando a pessoa somente gira a câmera. Ao parar, deixa de caminhar e conserva espaço pessoal.
- Todos os funcionários NPC usam camisa preta e boné preto, com logo Cine Globo. O instrutor usa boné e logo correspondentes. O cliente virtual mantém roupa própria.

## Aceitação
- Executar regressão de Caixa, Bomboniere, Sala, missões, iluminação, desempenho e uso offline.
- Validar no iPhone físico a visibilidade das luzes em cada modo, o toque AGIR, circulação no corredor e ausência de órbita do instrutor.
- Não declarar procedimentos institucionais oficialmente aprovados. A verificação automática em Chromium móvel não substitui teste em Safari físico.
