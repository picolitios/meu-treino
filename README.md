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

O catálogo inicial inclui aparelhos comuns de musculação, pesos livres, cabos, cardio e acessórios, com nomes em português e inglês. Equipamentos e exercícios ausentes podem ser criados no app. Os treinos, os aparelhos marcados e o idioma escolhido ficam somente no dispositivo; não há conta nem sincronização. A [spec do MVP](specs/mvp.md) descreve os critérios de aceitação.

## Identidade visual

As cores da interface ficam em `src/theme.ts`. Os ícones roxos e o splash estão em `assets/`; para recriá-los no Windows, execute `scripts/generate-brand-assets.ps1` no PowerShell. Os PNGs gerados já estão versionados e são usados diretamente pelos builds Android e iOS.
