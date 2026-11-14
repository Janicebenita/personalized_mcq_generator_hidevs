import { pipeline, env } from '@huggingface/transformers';
import type { Fact } from './core';
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = '/models/';
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}
self.onmessage = async (event: MessageEvent<{ facts: Fact[] }>) => {
  try {
    const generator = await pipeline('text2text-generation', 'qg-v1', {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (p: any) => {
        if (p.status === 'progress')
          self.postMessage({
            type: 'progress',
            message: `Loading AI model · ${Math.round(p.progress)}% of ${p.file}`,
          });
      },
    });
    const stems: Record<string, string> = {};
    for (let i = 0; i < event.data.facts.length; i++) {
      const f = event.data.facts[i];
      self.postMessage({
        type: 'progress',
        message: `Writing question ${i + 1} of ${event.data.facts.length} · ${f.topic}`,
      });
      const input = `generate question: <hl> ${f.term} <hl> is ${f.definition}. </s>`;
      const result: any = await generator(input, {
        max_new_tokens: 48,
        do_sample: false,
        num_beams: 1,
        repetition_penalty: 1.1,
      });
      stems[f.id] = result[0].generated_text;
    }
    await generator.dispose();
    self.postMessage({ type: 'done', stems });
  } catch {
    self.postMessage({
      type: 'error',
      message:
        'The browser AI could not load or run. Check your connection and available memory. Your notes have not been uploaded. Retry or use source practice.',
    });
  }
};
