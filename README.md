# CineGlobo Simulator v2.0 — iPhone

Simulador 3D de treinamento operacional do Cine Globo. Base preservada: v1.9.

## Como instalar no iPhone
Acesse https://l7-collab.github.io/cineglobo-simulator/ no Safari, toque em Compartilhar e selecione Adicionar à Tela de Início.

## Controles
- Joystick virtual esquerdo: caminhar
- Arraste no lado direito: olhar
- AGIR: interagir
- Tarefas: painel de missão

## Publicação
Workflow em .github/workflows/pages.yml. Ative Settings > Pages > Build and deployment > Source: GitHub Actions.

## Observações
O computador pessoal não precisa ficar ligado; depende da publicação em hospedagem estática. Modo offline não é garantido. Validar em iPhone físico antes de uso operacional.
## Roteiro de execução

O plano de quatro etapas, as metas não comprovadas de desempenho e os requisitos de treinamento ficam registrados em [docs/ROTEIRO_EXECUCAO_2026-10-27.md](docs/ROTEIRO_EXECUCAO_2026-10-27.md). As melhorias são submetidas a PR e não são consideradas aprovadas até os testes necessários, inclusive no iPhone físico.

## Treinamento de turno (demonstração)
Após escolher a função Caixa, Bomboniere ou Sala, procure o **Terminal de turno** correspondente no cinema 3D ou abra **Terminal de turno** no painel lateral. Abertura, atendimento e fechamento usam metas que só avançam após ações executadas no jogo; o instrutor indica a próxima pendência. O histórico concluído fica apenas neste navegador, sem autenticação institucional.

Regras e limites: [Etapa 4 — turnos e metas](docs/ETAPA4_TURNOS_METAS.md).

## Publicação para iPhone e uso offline (Etapa 7)

A publicação usa GitHub Pages e serve a versão estática em `dist/`, com o motor Three.js incorporado localmente. O jogo **não exige um computador pessoal ligado** quando o Pages estiver publicado com sucesso.

- Acompanhe a publicação em [GitHub Actions — Publicar CineGlobo Simulator](https://github.com/l7-COLLAB/cineglobo-simulator/actions/workflows/pages.yml).
- Leia o procedimento completo de [instalação no Safari, offline e teste de 20 minutos](docs/ETAPA7_PAGES_OFFLINE.md).
- O endereço previsto é `https://l7-collab.github.io/cineglobo-simulator/`, condicionado à confirmação do deploy HTTPS.
- Para desenvolver: `npm install`, `npm run build`, `python3 -m http.server 8765 --directory dist`.

> **Ativação do GitHub Pages (iPhone):** em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. O workflow `pages.yml` é executado a cada atualização da `main` e confirma por HTTPS a presença do HTML e do Three.js local. Não use os modelos Jekyll ou Static HTML.
