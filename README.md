# Meu Treino

MVP de app Android e iOS para cadastrar os aparelhos disponíveis na academia e montar treinos por dia da semana. Funciona offline e grava os dados em SQLite no próprio aparelho.

## Rodar

Requer Node.js 24 (ou versão compatível com Expo SDK 58), npm e [Expo Go](https://expo.dev/go) em um dispositivo Android ou iOS.

```bash
npm install
npm start
```

Abra o QR code com o Expo Go. Para usar emulador Android configurado, execute `npm run android`. Para simulador iOS local, é necessário macOS e Xcode; também é possível testar em um iPhone com Expo Go.

## Validar

```bash
npm run typecheck
npm test
npm run lint
npx expo-doctor
```

## Dados e escopo

O catálogo inicial inclui aparelhos comuns de musculação, pesos livres, cabos, cardio e acessórios, com nomes em português e inglês. A aba **Catálogo** mostra todos; **Minha academia** reúne os aparelhos marcados e permite editar a seleção. Ao montar um treino, há um filtro para mostrar apenas exercícios dos aparelhos disponíveis na academia. Equipamentos e exercícios ausentes podem ser criados no app. Os treinos, os aparelhos marcados e o idioma escolhido ficam somente no dispositivo; não há conta nem sincronização. A [spec do MVP](specs/mvp.md) descreve os critérios de aceitação.

## Identidade visual

As cores da interface ficam em `src/theme.ts`. Os ícones roxos e o splash estão em `assets/`; para recriá-los no Windows, execute `scripts/generate-brand-assets.ps1` no PowerShell. Os PNGs gerados já estão versionados e são usados diretamente pelos builds Android e iOS.

## Ilustrações dos exercícios

Os exercícios do catálogo têm imagens locais de 512 px em `assets/exercises/`, mostradas no treino, na busca e ao lado dos equipamentos correspondentes em “Minha academia”. Quando a coleção não possui uma pose fiel, aparece um pictograma específico; itens personalizados usam um ícone genérico. As poses são ilustrações de identificação, não instruções de execução. As imagens vêm do [Workout Guide](https://github.com/bryllim/workout-guide), de Bryl Lim, com contribuições originais do [Everkinetic](https://github.com/everkinetic/data), sob [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Os arquivos `LICENSE-ASSETS`, `ATTRIBUTION.md` e `SOURCES.json` em `assets/exercises/` preservam os créditos e a origem de cada imagem utilizada.

Os 67 GIFs em `assets/exercise-gifs/` foram montados com quatro quadros da mesma coleção e estão guardados para uma futura tela de demonstração; o aplicativo ainda não os exibe. Para recriá-los, obtenha o [Workout Guide](https://github.com/bryllim/workout-guide) no commit `aac599224bb9780305239607ef98540b7e0ce389` e execute `npm run artwork:gifs -- <caminho-do-repositório>`. Os GIFs são adaptações sob a mesma licença CC BY-SA 4.0.

## Gerar aplicativo para download

O perfil `preview` em `eas.json` gera um APK Android que funciona sem Expo Go ou servidor de desenvolvimento. Requer uma conta Expo autenticada:

- [Baixar a versão atualizada na Expo](https://expo.dev/accounts/picolitios/projects/meu-treino/builds/15093d71-27cf-4b4d-94fe-d11512ac9c19) (build Android do commit `1c907ee`; o botão de download aparece quando a geração terminar).

Para gerar um novo link quando o atual expirar:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Após a conclusão, o EAS fornece um link para baixar e instalar o APK. Para iOS, o mesmo perfil pode gerar uma distribuição interna com `--platform ios`; a instalação em iPhone exige conta Apple Developer e registro dos aparelhos. O perfil não publica o app nas lojas.
