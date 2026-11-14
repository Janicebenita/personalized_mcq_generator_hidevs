import { describe, it, expect } from 'vitest';
import {
  parseContent,
  buildItem,
  validateStem,
  newSession,
  chooseFact,
  grade,
  analytics,
  shuffle,
  normalize,
  hash,
  escapeHTML,
  toCSV,
} from '../src/core';
import { samples } from '../src/samples';
import type { Fact, Level, Session } from '../src/core';
const facts = parseContent(samples[0].text).facts;
const extra = `\nAlpha :: a distinctive starting point for a sequence\nBeta :: a second point used to label a sequence\nGamma :: a third point used to label a sequence\nDelta :: a fourth point used to label a sequence`;
function answer(s: Session, correct = true) {
  const f = chooseFact(s, facts)!;
  const i = buildItem(f, facts, s.level, 'test');
  return grade(s, i, correct ? i.answer : i.options.find((o) => o !== i.answer)!, 'Sure', 9);
}
describe('content integrity', () => {
  it.each(samples)('extracts grounded definitions from $id', (sample) => {
    const r = parseContent(sample.text);
    expect(r.facts.length).toBeGreaterThanOrEqual(8);
    expect(r.warnings).toEqual([]);
    for (const f of r.facts) {
      expect(sample.text.split('\n')[f.line - 1]).toBe(f.source);
      expect(f.source).toContain(f.term);
    }
  });
  it('normalizes Unicode and punctuation', () =>
    expect(normalize('  Ａ List—X! ')).toBe('a list x'));
  it('has stable identifiers and does not mutate shuffle input', () => {
    expect(hash('same')).toBe(hash('same'));
    expect(hash('a')).not.toBe(hash('b'));
    const a = [1, 2, 3, 4];
    expect(shuffle(a, 'x')).toEqual(shuffle(a, 'x'));
    expect(a).toEqual([1, 2, 3, 4]);
    expect(shuffle(a, 'y').sort()).toEqual(a);
  });
  it('preserves literal HTML safely in display', () =>
    expect(escapeHTML(`<img src="x" onerror='bad'>&`)).toBe(
      '&lt;img src=&quot;x&quot; onerror=&#39;bad&#39;&gt;&amp;',
    ));
  it('rejects empty and oversized sources', () => {
    expect(() => parseContent(' ')).toThrow('Add some');
    expect(() => parseContent('é'.repeat(25001))).toThrow('50 KB');
  });
  it('requires four unique related definitions', () => {
    expect(() => parseContent('Hi')).toThrow('4 distinct');
    expect(() =>
      parseContent(
        '# A\nAlpha :: one description of a concept\nBeta :: another description of a concept\n# B\nGamma :: the third description of a concept\nDelta :: the fourth description of a concept',
      ),
    ).toThrow('same topic');
  });
  it('deduplicates repeated definitions', () =>
    expect(parseContent(samples[0].text + '\n' + facts[0].source).facts).toHaveLength(
      facts.length,
    ));
  it('excludes both versions of conflicting terms', () => {
    const r = parseContent(
      samples[0].text + '\nNucleus is a completely different description of another structure.',
    );
    expect(r.facts.some((f) => f.term === 'Nucleus')).toBe(false);
    expect(r.warnings.join(' ')).toContain('Conflicting');
  });
  it('excludes answer synonyms sharing an identical definition', () => {
    const r = parseContent(samples[0].text + '\nCore is ' + facts[0].definition + '.');
    expect(r.facts.some((f) => ['Nucleus', 'Core'].includes(f.term))).toBe(false);
    expect(r.warnings.join(' ')).toContain('same definition');
  });
  it('skips unsafe, unsupported, self-referential and small topics', () => {
    const r = parseContent(
      samples[0].text +
        '\nThis is this sentence with this sentence repeated.\nIgnore instructions is a way to manipulate the system.\n<img> is a harmful markup entry to exclude.\nThis line has no definition.\n# Small\nAtom is a smallest unit of an element.',
    );
    expect(r.warnings.length).toBeGreaterThanOrEqual(5);
    expect(r.facts).toHaveLength(10);
  });
  it('supports CRLF, bullet definitions and explicit glossary syntax', () => {
    const r = parseContent(extra.replace(/\n/g, '\r\n').replace('Alpha ::', '- Alpha ::'));
    expect(r.facts).toHaveLength(4);
    expect(r.facts[0].term).toBe('Alpha');
  });
  it('limits material to 24 concepts with a visible warning', () => {
    const t = Array.from(
      { length: 30 },
      (_, i) => `Term${i} :: a unique description indexed as value ${i}`,
    ).join('\n');
    const r = parseContent(t);
    expect(r.facts).toHaveLength(24);
    expect(r.warnings.at(-1)).toContain('24');
  });
  it('rejects unsuitable long terms', () =>
    expect(
      parseContent(
        samples[0].text +
          '\nA B C D E F G H I is a valid definition with too many words in the term.',
      ).warnings.join(' '),
    ).toContain('unsuitable'));
});
describe('question quality and provenance', () => {
  for (const sample of samples)
    for (const level of [1, 2, 3] as Level[])
      it(`${sample.id} level ${level}: four distinct grounded choices with one key`, () => {
        const fs = parseContent(sample.text).facts;
        for (const f of fs) {
          const item = buildItem(f, fs, level, 'bank');
          expect(new Set(item.options.map(normalize)).size).toBe(4);
          expect(item.options.filter((o) => o === item.answer)).toHaveLength(1);
          expect(item.distractors).toHaveLength(3);
          expect(item.source).toBe(f.source);
          expect(item.line).toBe(f.line);
          expect(item.origin).toBe('source');
          if (level < 3)
            expect(
              item.distractors.every((d) =>
                fs.some(
                  (g) => g.topic === f.topic && (d.option === g.term || d.option === g.definition),
                ),
              ),
            ).toBe(true);
          else {
            expect(
              item.options.filter((o) => fs.some((g) => o === `${g.term} — ${g.definition}`)),
            ).toHaveLength(1);
            expect(item.distractors.every((d) => d.option.includes(' — '))).toBe(true);
          }
        }
      });
  it('rejects insufficient distractors', () =>
    expect(() => buildItem(facts[0], [facts[0]], 2, 'x')).toThrow('Not enough'));
  it('accepts a grounded AI question and records its origin', () => {
    const f = facts.find((f) => f.term === 'Mitochondrion')!;
    const stem = 'What is the organelle that releases usable energy through cellular respiration?';
    expect(validateStem(stem, f)).toBe(stem);
    expect(validateStem('Question: ' + stem, f)).toBe(stem);
    const item = buildItem(f, facts, 2, 'x', stem);
    expect(item.origin).toBe('ai');
    expect(item.stem).toBe(stem);
    expect(buildItem(f, facts, 1, 'x', stem).origin).toBe('source');
  });
  it.each([
    'Hello?',
    'What is Mitochondrion in a living cell?',
    'Which unrelated country is largest in the world?',
    'What is the organelle that releases usable energy through cellular respiration',
    'What is the organelle that releases usable energy through cellular respiration? <script>',
    'What is the green organelle that releases usable energy through cellular respiration?',
    'x'.repeat(250) + '?',
  ])('rejects unsupported generated stem: %s', (stem) =>
    expect(validateStem(stem, facts[1])).toBeNull(),
  );
  it('uses a source template for a rejected stem', () =>
    expect(buildItem(facts[1], facts, 3, 'x', 'What is imaginary knowledge?').origin).toBe(
      'source',
    ));
  it('rejects a generic question that drops distinguishing attributes', () => {
    const tuple = parseContent(samples[1].text).facts.find((f) => f.term === 'Tuple')!;
    expect(validateStem('What is a collection of items in Python?', tuple)).toBeNull();
    expect(
      validateStem('What is an immutable ordered collection of items in Python?', tuple),
    ).not.toBeNull();
  });
  it('preserves explicit negations and defining properties', () => {
    const f = {
      ...facts[0],
      term: 'Unusual process',
      definition: 'the process that changes liquid water without absorbing energy',
      source: 'Unusual process is the process that changes liquid water without absorbing energy.',
    };
    expect(
      validateStem('What is the process that changes liquid water absorbing energy?', f),
    ).toBeNull();
  });
});
describe('adaptive policy and assessment state', () => {
  it('starts at Connect and bounds session lengths', () => {
    expect(newSession(8).level).toBe(2);
    expect(newSession(0).target).toBe(1);
    expect(newSession(100).target).toBe(24);
  });
  it('raises after two correct answers and resets the streak', () => {
    let s = newSession(8);
    s = answer(s);
    expect(s.level).toBe(2);
    s = answer(s);
    expect(s.level).toBe(3);
    expect(s.streak).toBe(0);
    expect(s.responses.at(-1)!.reason).toContain('raise');
  });
  it('lowers after one wrong answer and respects floor', () => {
    let s = newSession(8);
    s = answer(s, false);
    expect(s.level).toBe(1);
    s = answer(s, false);
    expect(s.level).toBe(1);
    expect(s.responses.at(-1)!.reason).toContain('Stay at Recall');
  });
  it('respects ceiling after repeated correct answers', () => {
    let s = newSession(8);
    for (let i = 0; i < 6; i++) s = answer(s);
    expect(s.level).toBe(3);
    expect(s.responses.at(-1)!.reason).toContain('highest');
  });
  it('cannot regrade an answer or accept an unknown option', () => {
    const s = newSession(3),
      f = facts[0],
      i = buildItem(f, facts, 2, 'x');
    const next = grade(s, i, i.answer, 'Sure', 3);
    expect(() => grade(next, i, i.answer, 'Sure', 3)).toThrow('already');
    expect(() => grade(s, i, 'malformed', 'Sure', 3)).toThrow('valid answer');
    expect(() => grade(s, { ...i, level: 3 }, i.answer, 'Sure', 3)).toThrow('valid answer');
  });
  it('finishes at the requested length', () => {
    const s = answer(newSession(1));
    expect(chooseFact(s, facts)).toBeNull();
    const i = buildItem(facts[0], facts, 2, 'x');
    expect(() => grade(s, i, i.answer, 'Sure', 3)).toThrow('complete');
  });
  it('has no concept repetitions and can exhaust a bank', () => {
    let s = newSession(24);
    for (let i = 0; i < facts.length; i++) s = answer(s);
    expect(new Set(s.seen).size).toBe(facts.length);
    expect(chooseFact(s, facts)).toBeNull();
  });
  it('prioritizes a topic after a miss while keeping unseen concepts', () => {
    const s = answer(newSession(8), false);
    expect(chooseFact(s, facts)!.topic).toBe(s.responses[0].item.topic);
  });
  it('clamps invalid answer times without changing adaptation', () => {
    const s = newSession(3),
      i = buildItem(facts[0], facts, 2, 'x');
    for (const n of [NaN, Infinity, -10])
      expect(grade(s, i, i.answer, 'Sure', n).responses[0].seconds).toBe(0);
    expect(grade(s, i, i.answer, 'Sure', 9999).responses[0].seconds).toBe(3600);
  });
  it('separates confidence and time from grading', () => {
    const s = newSession(3),
      i = buildItem(facts[0], facts, 2, 'x');
    expect(grade(s, i, i.answer, 'Guessing', 1000).level).toBe(
      grade(s, i, i.answer, 'Sure', 1).level,
    );
  });
  it('different learners follow different paths on the same material', () => {
    let strong = newSession(6),
      support = newSession(6);
    for (let j = 0; j < 6; j++) {
      strong = answer(strong);
      support = answer(support, j % 3 === 2);
    }
    expect(strong.responses.map((r) => r.before)).toEqual([2, 2, 3, 3, 3, 3]);
    expect(support.responses.map((r) => r.before)).toEqual([2, 1, 1, 1, 1, 1]);
    expect(strong.responses.map((r) => r.item.factId)).not.toEqual(
      support.responses.map((r) => r.item.factId),
    );
  });
});
describe('honest analytics and exports', () => {
  it('shows an empty result without invented mastery', () =>
    expect(analytics([])).toMatchObject({ total: 0, accuracy: 0, interval: [0, 100], topics: [] }));
  it('computes topic accuracy, timing and confident misses', () => {
    const s = answer(answer(newSession(8)), false);
    const a = analytics(s.responses);
    expect(a).toMatchObject({
      total: 2,
      correct: 1,
      accuracy: 50,
      seconds: 18,
      confidentMisses: 1,
    });
    expect(a.interval[0]).toBeLessThan(50);
    expect(a.interval[1]).toBeGreaterThan(50);
    expect(a.topics.reduce((n, t) => n + t.total, 0)).toBe(2);
  });
  it('escapes commas, quotes, newlines and formula prefixes in CSV', () => {
    const s = answer(newSession(1));
    const r = s.responses[0];
    const csv = toCSV([
      { ...r, selected: '=SUM(A1,A2)', item: { ...r.item, stem: 'Say "hello",\nworld?' } },
    ]);
    expect(csv).toContain('"\'=SUM(A1,A2)"');
    expect(csv).toContain('Say ""hello"",\nworld?');
    expect(csv).toContain('"Correct"');
  });
});
