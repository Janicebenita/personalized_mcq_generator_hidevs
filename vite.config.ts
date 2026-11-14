import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include:['tests/**/*.test.ts'], coverage:{ provider:'v8',include:['src/core.ts'],reporter:['text','json-summary','html'],thresholds:{lines:90,functions:90,branches:85,statements:90}}},
  build:{target:'es2022'}, worker:{format:'es'},
});
