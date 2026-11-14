# Verification and assessment quality

The release is checked at three levels: deterministic core tests, real-model evaluation, and browser interaction. Passing a structural test does not establish educational correctness.

## Automated checks

- TypeScript strict checking and production compilation.
- Core tests cover source extraction, duplicates/conflicts, unsupported lines, Unicode, HTML escaping, shuffled answer keys, provenance, all three task formats, unsupported generated stems, adaptation bounds, topic selection, repeat protection, invalid submissions, confidence separation, statistics, and CSV escaping.
- Six supplied Word-bank reference questions have four distinct options, one stated answer, and an explanation. These structural checks do not independently verify Python or algorithm semantics.
- Real model runs cover all 34 author-written sample definitions and six learner simulations. The report includes raw accepted and rejected stems, final questions, options, keys, and adaptation traces. Generated stems are accepted only if they retain at least 80% of meaningful source tokens, minimum overlap, critical defining properties, a valid question form, and a conservative allowed vocabulary.
- Coverage thresholds for `src/core.ts`: 90% lines/statements/functions, 85% branches. The UI and worker are not included in that coverage figure.

See `docs/evaluation.json` and the CI artifacts for actual results. No percentage here is a promised HiDevs score.

## Browser acceptance checklist

Verify against the actual production URL before submission:

1. Choose a sample, generate using browser AI, and inspect accepted vs fallback counts.
2. Select an answer with keyboard controls. Check that grading happens once and source evidence appears.
3. Two correct answers raise the next task to Challenge; a missed answer lowers it. Challenge compares term–description pairs rather than relabeling the same item.
4. Complete a session, inspect topic counts, confidence, timing, review evidence, and difficulty reasons. Download JSON/CSV.
5. Edit notes; verify the previous bank/results are cleared. Try empty, unsupported, and oversize material.
6. Cancel AI generation; verify a usable retry/source-practice path. Model errors must not display a successful AI result.
7. Verify narrow/mobile and desktop layouts, keyboard focus, clear labels, and visible feedback.
8. Open the public site without Vercel authentication. Confirm the main page and model assets return successfully.

## Known limitations

The sample set is small, English-only, and written by the developer. It is not an independent held-out benchmark, randomized controlled study, or educator evaluation. Browser device speed and model output can differ across execution backends. Automatic checks are conservative and can reject otherwise usable questions. Retaining source words does not prove semantic equivalence. Human review is required for classroom use.
