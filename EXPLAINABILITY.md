# BloomPath Explainability

## Decision

BloomPath chooses eligible concepts from the learner's supplied definition-style notes and constructs questions around those concepts. It can use the on-device question-generation model for stems, but it applies source checks and falls back to a visibly labeled source-template question when a generated stem does not pass those checks.

The next practice task is selected from Recall, Connect, and Challenge according to the session's explicit response policy. Topic prioritization uses smoothed observed accuracy, calculated as `(correct + 1) / (answered + 2)`; unseen topics begin at `0.5`. Confidence and answer time are shown for reflection and do not change the grade or task level.

## Inputs

The primary inputs are English definition-style notes pasted by the learner or imported from UTF-8 `.txt` or `.md` files. The documented format supports one definition per line and at least four distinct related terms per topic; an assessment uses up to 24 extracted concepts. BloomPath retains source line references so learners can inspect the material associated with a question.

During a session, BloomPath also uses the learner's selected answers and correctness results to guide subsequent task selection and topic prioritization. The application keeps notes and responses in the browser tab's memory, and the learner can explicitly export session results as JSON or CSV.

## Limits

BloomPath's checks are structural safeguards, not proof of factual correctness or educational validity. Source notes may contain errors, similar meanings can escape conflict checks, and generated stems can differ between browser and native execution. The documented model evaluation uses author-written examples rather than an independent held-out benchmark.

The current release accepts definition-style text; it does not parse arbitrary PDF or Word documents, interpret diagrams, or generate code-execution exercises. Topic accuracy and the session-level Wilson interval are descriptive aids, not validated measures of general ability or mastery. BloomPath is intended for practice and should not be used as a secure examination system or as the sole basis for high-stakes educational decisions.
