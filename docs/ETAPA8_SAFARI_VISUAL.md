# Etapa 8 — Correção da experiência visual no iPhone

Relato do dispositivo: após a primeira publicação HTTPS, a captura em paisagem mostrou imagem excessivamente pixelada, comandos difíceis e uma aparência de blocos. Esta mudança atua diretamente nesses problemas, preservando os treinamentos funcionais de Caixa, Bomboniere e Sala.

## Correções implementadas
1. **Renderização:** o padrão Equilibrada passa a usar até **1,35 pixels por unidade CSS** em dispositivos com densidade suficiente. Econômica usa até 0,9 e Alta até 1,75; antes, Econômica utilizava somente 0,6. Antialiasing MSAA é solicitado na criação do WebGL. O usuário ainda pode escolher qualidade na Pausa.
2. **Migração do aparelho:** uma atualização única troca o antigo padrão Econômica por Equilibrada e ajusta a sensibilidade padrão do toque. Seleções posteriores continuam sob controle do usuário.
3. **Viewport:** o canvas ocupa largura/altura reais em CSS, com dimensões internas recalculadas no carregamento, rotação, mudança da viewport visual e redimensionamento. A câmera atualiza sua razão de aspecto e não depende de dimensões antigas da página.
4. **Painel:** menus em paisagem ficam compactos e sem quebra de linha; a lista de tarefas começa recolhida em telas sensíveis ao toque, sem disputar espaço com a cena. O botão Tarefas pode mostrar e esconder o painel, e os controles permanecem acessíveis.
5. **Gestos:** movimento de câmera por um único dedo com sensibilidade melhor calibrada e proteção contra saltos. Joystick com raio proporcional ao tamanho visível, zona morta pequena, transição suave de movimento e limpeza de estado ao soltar, pausar ou perder foco.
6. **Mobiliário:** quatro mesas/assentos de blocos geométricos foram substituídos por tampos redondos com pedestais e banquetas, consolidados em uma única malha estática.
7. **Interação:** plaquetas de interação agora têm perfil fino, em vez de cubos grandes, mas continuam registradas nos mesmos pontos para os comandos de AGIR. Balcão de bilheteria ganhou plinto e frisos visuais finos.
8. **PWA:** cache revisado para `cineglobo-v31-mobile-visual`, evitando manter a página antiga depois da implantação.

## Validação
- Testes existentes de Caixa, Bomboniere, Sala, turnos, cache PWA, instrutor e qualidade visual devem continuar passando.
- Novos testes Playwright no Chromium móvel simulado verificam largura integral da tela 896×414, rotação 390×844 → 844×390, pixels por CSS, migração de configurações, HUD, gestos e características dos marcadores.
- Há uma meta de engenharia de 150 draw calls no cenário de teste. Maior nitidez pode custar FPS em hardware real; a qualidade deve ser ajustável sem perder as funções.
- **O teste de viewport de Chromium não prova que o erro visual do Safari de fato foi eliminado**. É necessário abrir a nova revisão em Safari no aparelho físico e comparar capturas, movimentação, nitidez e estabilidade 20 minutos.

## Limitações
Esta etapa melhora silhuetas e usabilidade, mas não transforma o protótipo em ambiente fotorrealista. A qualidade final ainda dependerá de modelos de equipamentos mais detalhados, iluminação e materiais otimizados, comparação visual com referências e teste presencial. Não afirmar aprovação comercial nem de treinamento operacional.
