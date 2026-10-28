# CineGlobo Simulator — Etapa 5: desempenho e avaliação ilustrativa

Data de referência: 27/10/2026. Esta etapa continua usando dados fictícios e não equivale a homologação de treinamento real.

## Atualizações de desempenho
- Os **três terminais de turno** e os **três pontos de inspeção** continuam interativos por E/AGIR, com os mesmos nomes e posições.
- Suas geometrias anteriormente resultavam em aproximadamente **15 chamadas de desenho por quadro**. Agora são representadas por **três malhas instanciadas**, sem remover objetos funcionais.
- O acabamento de metal, as caixas escuras e as telas compartilham a mesma geometria/material dentro de cada grupo.
- Não são carregados arquivos GLB nem bibliotecas adicionais. O arquivo JavaScript novo é armazenado no cache versionado da PWA.
- Os resultados de FPS/draw calls devem ser medidos no navegador após a implementação; o número de grupos é estrutural, não uma comprovação de FPS no iPhone.

## Layout da interface móvel
- O painel lateral mostra prioritariamente **progresso e próxima meta**, com barra de preenchimento, botão para abrir o terminal e contagem de erros.
- Os demais setores aparecem em um resumo recolhível, preservando espaço na tela em paisagem.
- Os botões de treinamento mantêm área mínima de toque de 44 px quando o dispositivo possui toque.
- Os controles de joystick/câmera/AGIR não são modificados.

## Avaliação final demonstrativa
- Só há resultado final quando **todas as metas de abertura, atendimento e fechamento foram executadas**.
- A pontuação ilustrativa começa em **100 pontos** e diminui **5 por erro registrado**, com mínimo de zero. Não existe bonificação por clicar no painel nem por atalhos de seleção.
- Há indicação diferenciada para conclusão com poucos erros, com revisão sugerida ou repetição recomendada.
- O relatório lista metas concluídas por setor e ocorrências registradas, mas **não certifica funcionários**, não é nota oficial nem comprova cumprimento de procedimentos de segurança.
- O usuário pode compartilhar/exportar o relatório JSON pelo próprio aparelho, sem envio automático a um servidor.
- O histórico mantém até oito exercícios concluídos somente neste navegador; sem matrícula, conta ou identificação de usuário.

## Testes necessários
- Regras Node para avaliação pendente/concluída, limite de erros, pontuação e vedação de certificação.
- Browser Chromium móvel para as três funções (regressão), assertivas sobre 3 InstancedMesh / 15 instâncias e visibilidade da pontuação final.
- Medição física no **Safari do iPhone 11** ainda obrigatória; conferir uso em paisagem, botões no painel, aquecimento do aparelho, estabilidade 20 minutos, p95 e interações.
- Meta original de engenharia de até 150 draw calls continua indicativa e não deve ser considerada alcançada até medição atual.
