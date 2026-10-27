# CineGlobo Simulator — protocolo Safari iPhone 11

Atualização: 27/10/2026. Este documento é um **procedimento pendente de execução física**, não um laudo de aprovação.

## Pré-condições
- Revisar e integrar sequencialmente os PRs #3, #4, #5, #6 e o PR desta rodada, com CI aprovado. Nenhuma integração é presumida.
- Garantir URL HTTPS da versão revisada (GitHub Pages de demonstração somente se configurado e dentro das condições de uso). A página pública atual pode não conter as mudanças da branch.
- Preferir Safari no **iPhone 11 físico**. Testes em viewport móvel no Chromium não equivalem a testes no dispositivo.
- Conectar a uma rede conhecida; anotar versão do iOS, qualidade gráfica, bateria aproximada, orientação, presença de economia de energia e condições de rede, sem expor dados pessoais.
- Não usar CPF verdadeiro; programação, ingressos e pagamentos são estritamente fictícios.

## Como registrar as métricas no aparelho
1. Abrir a URL HTTPS no Safari e escolher **Ijuí / Caixa**.
2. Abrir **Pausa** e selecionar **Equilibrada**, **30 FPS**.
3. Habilitar **Métricas técnicas** e continuar o jogo.
4. Percorrer **Hall**, **Caixa/Bomboniere**, **Sala 1** e **Sala 2**; manter pelo menos 60 s em cada área sem abrir caixas de diálogo. Usar as portas.
5. Durante os percursos, conferir que o joystick e a câmera podem ser usados simultaneamente e que o botão AGIR não fica coberto.
6. Pausar ao final e tocar **Compartilhar relatório técnico**. Usar Compartilhar do iOS, copiar JSON ou localizar Downloads, conforme o navegador disponibilizar. Nenhum dado é transmitido automaticamente pelo próprio simulador.
7. Guardar o arquivo junto à data e identificação de build/commit e anexá-lo à revisão do PR. Repetir em modo Econômica se os resultados forem insuficientes.
8. Se o Safari não mostrar o conteúdo atualizado, registrar o problema de cache/PWA antes de tentar limpar dados. Não confundir versão antiga com falha nova.

## Cenários funcionais essenciais
- Iniciar função Caixa; usar o computador atrás do balcão; chamar cliente; cliente aproxima-se com animação e diálogo.
- Confirmar filme, horário, formato, sala e quantidade; selecionar poltronas; pagar (Pix e dinheiro insuficiente/corrigido); emitir e entregar ingresso fictício; terminar diálogo.
- Tentar ocupar assento vendido ou escolher sessão errada: sistema deve bloquear e explicar.
- Iniciar turno de Sala independentemente; validar ingresso novo, usado, horário e sala incompatíveis.
- Iniciar turno de Bomboniere; executar EPIs; **não** aprovar receitas/limpeza ainda pendentes de modelagem ou aprovação operacional.
- Abrir/fechar portas, percorrer as duas salas e conferir arandelas, LEDs e iluminação de limpeza separadamente.
- Pausar por 30 s no meio da movimentação de um cliente ou da animação de entrega; nada deve avançar durante a pausa. Alternar aba por 30 s e retornar sem saltos de movimento.
- Girar retrato/paisagem; testar áreas seguras do iPhone; manter uma sessão de 20 minutos sem controles congelados, WebGL perdido ou aumento progressivo de memória percebido.
- Reabrir a PWA pela tela inicial quando disponível; confirmar versão e comportamento. **Offline não é requisito validado** até testes de todos os recursos sem rede.

## Critérios indicativos, não comprovados
- 30 FPS observados com estabilidade no perfil Equilibrada.
- Intervalo p95 de quadro `<= 40 ms` como meta de engenharia.
- Limite-alvo de até 150 chamadas de desenho no percurso móvel e até 250 mil triângulos visíveis por quadro.
- Primeiro ambiente jogável até 15 MB de transferência efetiva, ressalvados cache/CDN e falta de dados `transferSize`.
- Nenhuma regressão de fluxo de atendimento, colisão, luzes, EPIs e verificação de ingresso.

**Importante:** o relatório do jogo amostra intervalos entre quadros desenhados, não tempo preciso de GPU. A contagem de transferência pode ignorar cache e conteúdo externo. É necessário interpretar contexto de FPS limitado e CPU/GPU do aparelho.

## Registro de execução (preencher após teste)
| Item | Resultado |
|---|---|
| Data, build/commit e URL | Pendente |
| iPhone 11, iOS e Safari | Pendente |
| Qualidade / FPS limitado | Pendente |
| Hall: FPS / p95 / draw calls | Pendente |
| Caixa/Bomboniere: FPS / p95 / draw calls | Pendente |
| Sala 1: FPS / p95 / draw calls | Pendente |
| Sala 2: FPS / p95 / draw calls | Pendente |
| Venda e entrega completas | Pendente |
| Ingresso válido/repetido/divergente | Pendente |
| Pausa, aba oculta e orientação | Pendente |
| Estabilidade 20 min / WebGL | Pendente |
| Screenshot e JSON | Pendente |
| Decisão: aprovar, corrigir ou reverter | Pendente |

## Comparação automática anterior
Em Chromium móvel **simulado**, a referência anterior havia registrado **187 draw calls** e **14.546 triângulos** em um instante do cenário da visita. Isso não comprova p95/FPS no iPhone 11 nem significa que todas as áreas já estão abaixo do alvo. A nova comparação deve ser registrada no PR quando o CI terminar.
