# Verification and assessment quality

The release is checked at three levels: deterministic core tests, real-model evaluation, and browser interaction. Passing a structural test does not establish educational correctness.

## Automated checks

- TypeScript strict checking and production compilation.
- Core tests cover source extraction, duplicates/conflicts, unsupported lines, Unicode, HTML escaping, shuffled answer keys, provenance, all three task formats, unsupported generated stems, adaptation bounds, topic selection, repeat protection, invalid submissions, confidence separation, statistics, and CSV escaping.
- Six supplied Word-bank reference questions have four distinct options, one stated answer, and an explanation. These structural checks do not independently verify Python or algorithm semantics. The separate `scripts/verify-python-reference.py` runs six fixed Python/algorithm examples and complexity checks; it never executes uploaded code.
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

## Verified release evidence

- Public production site: https://bloompath-mcq.vercel.app � anonymous HTML and model asset requests returned HTTP 200 without redirects.
- Both quality and real-model integration jobs passed for application commit `06485d9619141581f409c61d4709750d223120e8`, run https://github.com/Janicebenita/personalized_mcq_generator_hidevs/actions/runs/43621351376 . Subsequent formatting and keyboard-focus improvements receive a fresh CI run before release.
- Hosted browser AI completed a Biology assessment: 10 concepts, 2 topics, 8 accepted browser stems. The Node evaluation accepted 24 of 34 across all subjects; backend differences can change greedy generation. Provenance remains visible in both cases.
- An actual six-question synthetic browser session followed levels 2, 2, 3, 2, 2, 3. Two correct answers raised the task level; a deliberate miss lowered it. Results showed 5/6 correct, one confident miss, and topic totals matching the exported JSON.
- The complete synthetic session export is in `docs/demo/browser-session.json`; browser screenshots are in `docs/screenshots/`.
- The narrated demonstration is 146.88 seconds, H.264/AAC at 1920�1080, and is shared through Google Drive with Viewer access for anyone with the link.
