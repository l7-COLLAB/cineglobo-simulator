# Etapa 7 — Publicação independente no iPhone e PWA com motor 3D local

## O que foi preparado

O CineGlobo Simulator agora pode ser **empacotado em uma distribuição estática** com a biblioteca Three.js 0.165.0 guardada em `vendor/three.module.js` dentro da própria publicação. O instrutor procedural original continua caminhando e interagindo. O carregamento opcional do modelo externo Soldier.glb foi desativado, pois consumia rede e não era necessário ao treinamento. Todos os módulos locais são incluídos no cache versionado `cineglobo-v30-offline-three`.

A página de publicação do GitHub Actions usa `npm install`, executa `npm run build`, valida o conjunto de regras e envia **somente a pasta `dist/`** ao Pages. Após implantar, o fluxo tenta buscar o `index.html` e a biblioteca 3D no endereço HTTPS **devolvido pela plataforma**, sem presumir que a publicação foi bem-sucedida.

O fluxo de testes no Chromium móvel também usa a pasta de distribuição real, incluindo um cenário que desconecta o navegador após a primeira instalação e volta a abrir o simulador sem rede.

## Como verificar e abrir no iPhone

1. Verifique [GitHub Actions do projeto](https://github.com/l7-COLLAB/cineglobo-simulator/actions/workflows/pages.yml). A execução de **Publicar CineGlobo Simulator** precisa estar concluída com sucesso. Caso o Pages não esteja ativado, confira [Settings → Pages](https://github.com/l7-COLLAB/cineglobo-simulator/settings/pages), escolhendo **GitHub Actions** como fonte de publicação.
2. A URL prevista, quando a publicação estiver ativa, é `https://l7-collab.github.io/cineglobo-simulator/`. **O endereço só é considerado disponível após responder com o jogo e seus arquivos**, e não pela simples existência do repositório.
3. Abra o link no **Safari do iPhone**, inicie a função desejada e confirme que hall, personagens, caixa e salas aparecem normalmente.
4. Para adicionar à tela inicial, no Safari toque em **Compartilhar → Adicionar à Tela de Início**, caso a opção esteja disponível para a versão do seu iOS.
5. Para testar offline, abra o jogo uma vez **com internet**, aguarde o carregamento e **feche o site normalmente**. Depois, desative Wi-Fi e dados móveis, volte pelo ícone da tela inicial (ou guia do Safari) e tente jogar. A capacidade offline depende da política de armazenamento do Safari e da permanência do cache no dispositivo.
6. Para o teste prolongado, use **Pausa → Métricas técnicas**, jogue por 20 minutos ativos e compartilhe o relatório JSON no fim. Registre se houve aquecimento excessivo ou falhas físicas, pois essas condições não podem ser medidas pelo simulador.

## Execução local para desenvolvedores

Com Node.js 22 ou versão compatível:

```sh
npm install --ignore-scripts
npm run build
python3 -m http.server 8765 --directory dist
```

Acesse `http://127.0.0.1:8765/`. Após instalar o cache no localhost, o teste offline também pode ser exercitado. Nada disso exige um computador ligado **depois que a publicação HTTPS estiver hospedada na plataforma**.

## Limitações conhecidas

- Offline é testado automaticamente em **Chromium móvel simulado**. Só o Safari físico pode validar a experiência offline de fato, inclusive com a aplicação fechada por horas/dias.
- O Pages depende das permissões/regras do repositório e do êxito da ação de implantação. Sem confirmação de acesso, não apresentar o site como público.
- PWA não é um app nativo. Se o Safari eliminar os dados do site, o conteúdo precisará ser carregado novamente quando houver internet.
- A avaliação do jogo continua fictícia; o sistema não substitui procedimentos internos nem confere certificação.
