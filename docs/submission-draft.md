# HiDevs submission prepared for approval

**Status: not submitted. Explicit user approval is required before pressing Submit.**

Project: [Personalized MCQ Generator for Diagnostic Tests](https://app.hidevs.xyz/projects/2?tab=submission)

| Form field | Prepared value                                                    |
| ---------- | ----------------------------------------------------------------- |
| GitHub     | https://github.com/Janicebenita/personalized_mcq_generator_hidevs |
| Demo       | https://bloompath-mcq.vercel.app                                  |

The README prominently links the [2:27 YouTube demonstration](https://youtu.be/7qaD6AOwUzg), the [Google Drive copy](https://drive.google.com/file/d/1GuStRFiFee0ufSnXvgIFJAi9wtPU8myv/view), setup instructions, model provenance, and test evidence. YouTube visibility is Unlisted on the user-approved @JaniceBenita-d6x channel. Anyone with its link can watch it; it does not appear in the channel’s public video grid.

## Readiness evidence

- Public Vercel production deployment verified without sign-in. Application source commit: `b9ef4cd92ba8cfddba4bb6720524ce8cb304e3a6`.
- 56 automated tests pass. Coverage is 100% for `src/core.ts` only; UI and worker coverage are not included.
- Separate real-model CI runs on 34 sample definitions, with accepted/rejected stems and two simulated learner profiles per subject recorded.
- Six fixed Python/algorithm examples from the supplied Word question bank were checked without executing uploaded code.
- Hosted browser AI, a full six-question practice session, adaptive transitions, explanations, result totals, and JSON export were verified.
- Keyboard answer navigation and grading, invalid-input recovery, cancellation, and a narrow viewport were checked on the deployed app. The viewport was restored after testing.
- The user-provided hero image and centered header are published in the README. It is labeled as an illustration, separate from actual application screenshots.

No HiDevs review or score exists for this project yet. Test coverage and structural checks do not guarantee educational validity or a leaderboard score.
