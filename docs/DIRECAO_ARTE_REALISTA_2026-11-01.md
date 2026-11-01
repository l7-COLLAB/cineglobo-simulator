# CineGlobo Simulator — direção de arte 3D realista e interação física
Data: 01/11/2026 · Proposta visual experimental, ainda não homologada

## Objetivo
Elevar o jogo de treinamento do Cine Globo a um ambiente de primeira/terceira pessoa tridimensional, imersivo e crível, usando jogos cinematográficos modernos (como Call of Duty) **somente como referência de fidelidade visual**, sem copiar personagens, marcas, modelos ou assets protegidos. Uma experiência equivalente a AAA não é tecnicamente garantida no Safari de iPhone 11 e não deve ser anunciada como concluída.

## Princípio de produto
O cinema precisa parecer real **e** ensinar ações verificáveis. Nenhum objeto é considerado funcional apenas porque o botão AGIR aparece. Cada interação deve refletir um estado no treinamento, produzir feedback visível/audível e, quando apropriado, permitir erro e correção.

## Direção de arte
- Espaço: cinema contemporâneo, portas e corredores dimensionados; hall de entrada com sofá-ilha acessível nos quatro lados e fila conduzindo ao computador do caixa.
- Materialidade: piso com rejunte e variação sutil; concreto, laminados, tecido, couro sintético, vidro, metal escovado e plástico com materiais PBR específicos. Evitar caixas genéricas e contornos geométricos sem forma.
- Luz: luminárias de cor e intensidade plausíveis, iluminação indireta ou pré-calculada, LED de percurso, refletância moderada e três estados independentes por sala (entrada, filme, limpeza). Não comprometer a visibilidade operacional.
- Objetos: balcões com detalhes reais, computador/PDV, teclado, mouse, maquininha, impressora com rolo e saída de papel, duas pipoqueiras operáveis, recipientes, uniformes pretos e bonés com logo.
- Pessoas: silhuetas humanas anatômicas em GLB, LOD móvel e animações de caminhar, parar, esperar, olhar, falar, apontar, pegar, entregar e limpar. Instrutor não deve circular em torno do jogador continuamente.
- Som: ambiência discreta, passos e feedback operacional contextual, com mute e volume configuráveis. Não reproduzir músicas protegidas sem licença.
- UI: sinalização integrada ao ambiente, textos de missão legíveis no celular, marcação clara do item observado, AGIR apenas na proximidade válida e sem atravessar paredes.

## Pipeline recomendado
1. **Cena vertical de validação:** caixa + cliente + bomboniere visível + instrutor; testar conclusão de uma venda fictícia e emissão de ingresso com objetos físicos animados. Não refazer todas as salas de uma vez.
2. **Modelagem:** criar assets originais em Blender ou obter modelos com licença comercial adequada; importar glTF/GLB; escalas em metros, pivôs de abertura, colisores independentes e nomes de nós para ações.
3. **Materiais e luz:** usar mapas baseColor/normal/roughness/metallic e texturas compactadas sob licença compatível, lightmaps quando viáveis; reflexos locais seletivos, sem efeitos globais pesados por padrão.
4. **Interação sem falhas:** alvos com distância, orientação e linha de visão; raycast de tela/retículo; destaque discreto; máquinas com estados e animações vinculadas às regras de Caixa/Bomboniere/Sala.
5. **Performance e estabilidade:** reduzir draw calls com batching/instancing, limitar triângulos, aplicar LOD e descarregar conteúdos fechados; gerenciar cache PWA por versão, contexto WebGL perdido/recuperado e toque multigestos.

## Primeira revisão desta branch
- Texturas procedurais pequenas de piso, parede acústica e passadeira, com detalhes geométricos finos repetidos.
- Melhor uso de rugosidade/relevo nas superfícies estruturais; acabamento de balcões menos plano.
- Sombras de contato pré-calculadas sob caixa, bomboniere e sofá, sem shadow maps em tempo real.
- Atualização do cache PWA para distribuir os novos materiais.

**Limite importante:** nenhum novo modelo humano ou objeto GLB é introduzido nesta revisão; o resultado ainda não é fotorrealista. A base de treinamento e os alvos existentes permanecem inalterados.

## Critérios de aceitação
- iPhone 11 Safari, preferencialmente horizontal: meta inicial de 30 FPS no preset Equilibrado após 20 minutos; não declarar aprovada antes de medição física.
- UI e texto legíveis sem pixelar, incluindo valores do PDV, botões e falas.
- Abrir, fechar e utilizar: caixa, impressora, maquininha, pipoqueiras, portas e interruptores; progresso aumenta apenas após ações válidas.
- O personagem não atravessa caixas, balcões, portas e filas; instrutor e NPCs não ficam orbitando.
- Perfil Econômico reduz custo sem impedir funções; Alta só habilita detalhes se o aparelho sustentar.
- Sem downloads de assets não licenciados, dependência de computador ligado ou servidor remoto para renderização.
- Regressão automatizada de regras, build e PWA; testes manuais específicos no Safari físico, inclusive perda de contexto WebGL e retomada após suspensão.
- Não confundir protótipo com procedimento oficial aprovado ou plataforma comercial autenticada.

## Próximos marcos
1. Substituir o conjunto de PDV por GLB detalhado com texturas PBR e interação no monitor, teclado, impressora, gaveta e maquininha.
2. Introduzir cliente e instrutor rigados/animações reais com orçamento móvel e balões de texto.
3. Refinar bomboniere e as duas pipoqueiras com tampas, caldeirões, controles, ingredientes e etapas verificáveis.
4. Iluminação e arquitetura completa das Salas 1 e 2, com efeitos cinematográficos adaptativos por aparelho.
