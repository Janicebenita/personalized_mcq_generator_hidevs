# Project fitness review

Reviewed on 15 November 2026 for the HiDevs **Personalized MCQ Generator for Diagnostic Tests** challenge.

**Conclusion:** ready for evaluation as a beginner educational prototype. The implementation addresses all four published criteria, with the limitations below. This review does not predict an evaluation score.

| Criterion          | Finding                                                                                                                                                                           | Evidence                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Question relevance | Supported for definition-style English notes. Questions retain topic scope and source provenance; conservative checks reject weak or unsupported stems.                           | `src/core.ts`, `docs/evaluation.json`                                            |
| Answer generation  | Four distinct options, a source-derived answer key, related-topic distractors, and post-answer explanations are implemented. Structural checks do not prove semantic correctness. | Core question invariants across three subjects and three task levels             |
| Content adaptation | Two correct answers raise the next task level; a miss lowers it. Task formats change, weaker topics are prioritized, and target concepts do not repeat within a session.          | Core policy tests, six simulated learner paths, and the recorded browser session |
| UI/UX              | Public assessment studio, focused practice room, source feedback, results dashboard, exports, keyboard controls, cancellation, and invalid-input recovery are available.          | Hosted browser verification and screenshots                                      |

## Release checks

- The repository is public, uses the default `main` branch, and includes setup, usage, provenance, screenshots, and a demonstration video.
- The live Vercel app and a model asset returned HTTP 200 without sign-in.
- Latest pre-submission CI run `43627071014` passed both `quality` and `model-integration` jobs. The verified release has 56 automated tests; 100% coverage applies only to `src/core.ts`.
- The 2:27 YouTube video is on **@JaniceBenita-d6x**. At the owner’s request, visibility was changed to Public and the channel listing showed BloomPath among seven videos.
- The README links both the live application and YouTube demonstration. A Google Drive copy is also available.
- The owner explicitly authorized HiDevs submission after the earlier approval hold.

## Material limits

- Input is definition-style English text, with at least four related concepts per topic; arbitrary PDF/DOCX pages and diagrams are not parsed.
- Difficulty is a transparent practice heuristic, not a calibrated assessment of ability. The application supports recognition and comparison of definitions, not comprehensive higher-order assessment.
- The 34 author-written model examples are a small development evaluation, not an independent educational benchmark. Acceptance counts are not accuracy scores.
- Source errors and ambiguous meanings can remain. Classroom use requires question review; answer keys in client memory make the app unsuitable for secure examinations.
- First browser AI use downloads approximately 97 MB of model files plus runtime assets. An instant source-template mode is available.
