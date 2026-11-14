import { pipeline, env } from '@huggingface/transformers';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import {
  parseContent,
  validateStem,
  buildItem,
  newSession,
  chooseFact,
  grade,
  analytics,
} from '../src/core.ts';
import { samples } from '../src/samples.ts';
env.allowRemoteModels = false;
env.localModelPath = './public/models/';
const p = await pipeline('text2text-generation', 'qg-v1', { dtype: 'q8' });
const cases = [];
const paths = [];
for (const sample of samples) {
  const facts = parseContent(sample.text).facts;
  for (const f of facts) {
    const start = performance.now();
    const result = await p(`generate question: <hl> ${f.term} <hl> is ${f.definition}. </s>`, {
      max_new_tokens: 48,
      do_sample: false,
      num_beams: 1,
      repetition_penalty: 1.1,
    });
    const raw = result[0].generated_text,
      accepted = validateStem(raw, f);
    const item = buildItem(f, facts, 2, 'evaluation', raw);
    assert.equal(new Set(item.options).size, 4);
    assert.equal(item.options.filter((o) => o === item.answer).length, 1);
    assert.equal(item.answer, f.term);
    cases.push({
      sample: sample.id,
      term: f.term,
      source: f.source,
      rawStem: raw,
      accepted: !!accepted,
      finalStem: item.stem,
      origin: item.origin,
      options: item.options,
      answer: item.answer,
      ms: Math.round(performance.now() - start),
    });
  }
  for (const profile of ['all-correct', 'needs-support']) {
    let s = newSession(8);
    for (let i = 0; i < 8; i++) {
      const f = chooseFact(s, facts);
      const c = cases.find((c) => c.term === f.term);
      const item = buildItem(f, facts, s.level, profile, c.rawStem);
      const correct = profile === 'all-correct' || i % 3 === 2;
      s = grade(
        s,
        item,
        correct ? item.answer : item.options.find((o) => o !== item.answer),
        'Sure',
        15,
      );
    }
    paths.push({
      sample: sample.id,
      profile,
      levels: s.responses.map((r) => r.before),
      concepts: s.seen,
      accuracy: analytics(s.responses).accuracy,
      reasons: s.responses.map((r) => r.reason),
    });
  }
}
await p.dispose();
const accepted = cases.filter((c) => c.accepted).length;
const report = {
  scope:
    '34 author-written definition facts across three subjects; deterministic greedy generation. Structural checks are not human semantic grading or evidence of exam validity.',
  runtime: process.version,
  model: 'valhalla/t5-small-qg-hl, dynamic int8 ONNX',
  total: cases.length,
  accepted,
  rejected: cases.length - accepted,
  distinctOptionsPassed: cases.length,
  answerInSourcePassed: cases.length,
  cases,
  paths,
};
assert.ok(
  accepted >= cases.length * 0.65,
  'Too many model stems rejected; inspect quality before release.',
);
await writeFile('docs/evaluation.json', JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      total: report.total,
      accepted,
      rejected: report.rejected,
      distinctOptionsPassed: report.distinctOptionsPassed,
      paths: paths.map((p) => ({
        sample: p.sample,
        profile: p.profile,
        levels: p.levels,
        accuracy: p.accuracy,
      })),
    },
    null,
    2,
  ),
);
