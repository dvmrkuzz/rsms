import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';

// @xenova/transformers is ESM-only; this backend compiles to CommonJS,
// so the model pipeline must be loaded via a dynamic import at runtime.
let extractorPromise: Promise<any> | null = null;

function getExtractor(): Promise<any> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import('@xenova/transformers');
      return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    })();
  }
  return extractorPromise;
}

export class XenovaEmbeddings extends Embeddings {
  constructor(params: EmbeddingsParams = {}) {
    super(params);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const extractor = await getExtractor();
    const vectors: number[][] = [];
    for (const text of texts) {
      vectors.push(await this.embedOne(extractor, text));
    }
    return vectors;
  }

  async embedQuery(text: string): Promise<number[]> {
    const extractor = await getExtractor();
    return this.embedOne(extractor, text);
  }

  private async embedOne(extractor: any, text: string): Promise<number[]> {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  }
}
