# MVP — Meus equipamentos e treinos

## Objetivo

App Android e iOS, utilizável sem conta ou conexão, para registrar os equipamentos disponíveis em uma academia e montar treinos por dia da semana.

## Requisitos e critérios de aceitação

- O catálogo inicial cobre as famílias comuns de máquinas, pesos livres, cabos, cardio e acessórios. Cada item tem nome em português e inglês. Como academias podem ter aparelhos próprios ou nomes regionais, o usuário pode cadastrar equipamentos ausentes.
- A busca filtra conforme a digitação, ignora acentos e considera os nomes nos dois idiomas.
- É possível marcar e desmarcar equipamentos da academia; essa seleção persiste após reiniciar o app.
- A aba “Catálogo” mostra todos os equipamentos com busca e categorias. A aba “Minha academia” mostra apenas os marcados e oferece edição para consultar a lista completa, marcar novos aparelhos e retirar os que deixaram de existir. A seleção já salva no aparelho é preservada.
- Na escolha de exercícios para um treino, é possível filtrar os exercícios associados aos equipamentos marcados; a lista completa continua acessível.
- Cada dia da semana tem um treino editável: nome próprio, lista ordenada de exercícios, séries e repetições por exercício.
- É possível adicionar exercícios do catálogo, criar um exercício com nome próprio e excluir exercícios de um treino.
- Os dados do usuário persistem em SQLite local. Exclusões de exercícios do treino não apagam o catálogo.
- A interface segue o idioma do aparelho (português ou inglês) na primeira abertura e permite alterná-lo dentro do app.
- A identidade visual usa roxo profundo, violeta e lavanda de modo consistente nas telas, nos estados ativos e nos ícones do aplicativo, preservando legibilidade.
- Cada exercício inicial mostra uma ilustração local representativa ou um pictograma específico na lista de escolha e no treino, inclusive sem internet. Exercícios criados pelo usuário mostram um símbolo neutro. Créditos e licença das ilustrações ficam acessíveis no app e no repositório.
- A lista “Minha academia” mostra a ilustração do exercício associado a cada equipamento inicial. A arte usa tamanho suficiente para identificar a pose em uma tela de celular; equipamentos personalizados usam um símbolo neutro.
- Ao tocar na ilustração de um exercício no treino ou na lista de escolha, ou na imagem do equipamento correspondente no Catálogo, o app abre uma demonstração animada local do movimento, inclusive sem internet. O toque na imagem do Catálogo não altera a seleção do equipamento. Fechar a demonstração retorna à lista de escolha com a busca preservada. Exercícios sem ilustração licenciada não exibem uma demonstração. Os GIFs derivam da mesma coleção CC BY-SA 4.0 e mostram créditos e licença na tela.
- O projeto oferece um perfil de distribuição interna para gerar APK Android instalável sem Expo Go ou servidor de desenvolvimento. O mesmo perfil prepara builds iOS internos quando houver conta Apple Developer e dispositivos registrados.

## Fora do MVP

Conta, sincronização entre aparelhos, planos gerados automaticamente, registro de cargas/histórico e publicação nas lojas.
