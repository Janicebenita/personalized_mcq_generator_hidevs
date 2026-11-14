import { pipeline, env } from '@huggingface/transformers';
import { writeFile } from 'node:fs/promises';
env.allowRemoteModels = false;
env.localModelPath = './public/models/';
const p = await pipeline('text2text-generation', 'qg-v1', { dtype: 'q8' });
const results = [];
for (const [term, definition] of [
  ['Mitochondrion', 'the organelle that releases usable energy through cellular respiration'],
  ['List', 'a mutable ordered collection of items in Python'],
  ['Evaporation', 'the process that changes liquid water into water vapor by absorbing energy'],
]) {
  const input = `generate question: <hl> ${term} <hl> is ${definition}. </s>`;
  const begin = performance.now();
  const out = await p(input, { max_new_tokens: 48, do_sample: false, repetition_penalty: 1.1 });
  results.push({
    term,
    definition,
    input,
    output: out[0].generated_text,
    ms: Math.round(performance.now() - begin),
  });
  console.log(results.at(-1));
}
await writeFile('docs/model-smoke.json', JSON.stringify(results, null, 2));
await p.dispose();
