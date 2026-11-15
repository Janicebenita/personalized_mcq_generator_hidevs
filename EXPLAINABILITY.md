# BloomPath Explainability

## Decision

BloomPath chooses eligible concepts from the learner's supplied definition-style notes and constructs multiple-choice questions around those concepts. It uses an on-device question-generation model to generate question stems and applies source-based validation checks to ensure that generated questions remain connected to the supplied learning material. If a generated stem fails these checks, BloomPath falls back to a visibly labeled source-template question.

The next practice task is selected from three levels: Recall, Connect, and Challenge. The selection follows an explicit response policy based on the learner's previous answers. Topic prioritization uses smoothed observed accuracy, calculated as `(correct + 1) / (answered + 2)`, while unseen topics begin at `0.5`. Confidence and answer time are displayed for learner reflection but do not affect grading or task-level selection.

## Inputs

The primary inputs are English definition-style study notes pasted by the learner or imported from UTF-8 `.txt` or `.md` files. The supported format accepts one definition per line and requires at least four distinct related terms per topic. Each assessment uses up to 24 extracted concepts. BloomPath retains source line references so learners can inspect the original material associated with each question.

During a practice session, BloomPath also uses the learner's selected answers and correctness results to determine subsequent practice tasks and prioritize weaker topics. Confidence ratings and answer time are collected as reflection information. The application keeps notes and responses in the browser tab's memory and allows learners to explicitly export session results as JSON or CSV.

## Limitations

BloomPath's validation checks provide structural safeguards but cannot guarantee factual correctness, question quality, or educational validity. Source notes may contain inaccurate information, and similar meanings may escape conflict detection. Generated question stems can also differ between browser and native execution. The documented model evaluation uses author-written examples rather than an independent held-out benchmark.

The current release supports definition-style text input but does not parse arbitrary PDF or Word documents, interpret diagrams, or generate code-execution exercises. Topic accuracy and the session-level Wilson interval are descriptive learning aids rather than validated measurements of general ability or mastery. Four-term topics may also limit distractor variety.

BloomPath is designed for educational practice and self-assessment. It is not a secure examination platform and should not be used as the sole basis for high-stakes educational decisions. Learners and educators should review the supplied source material and generated questions before relying on them in classroom settings.
