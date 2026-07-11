import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { DocumentType } from '../../database/entities/document-type.entity';
import { FaqService } from '../faq/faq.service';
import { XenovaEmbeddings } from './embeddings/xenova-embeddings';

const KB_DIR = path.join(process.cwd(), 'knowledge-base');

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);
  private readonly embeddings = new XenovaEmbeddings();
  private vectorStore: MemoryVectorStore | null = null;
  private ready: Promise<void> | null = null;

  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
    private readonly faqService: FaqService,
  ) {}

  onModuleInit() {
    // Kick off ingestion in the background — don't block Nest's bootstrap.
    // The assistant falls back to "no context" answers until this resolves.
    this.ready = this.ingest().catch((err) => {
      this.logger.error('Knowledge base ingestion failed', err as Error);
    });
  }

  async waitUntilReady(): Promise<void> {
    if (this.ready) await this.ready;
  }

  async ingest(): Promise<void> {
    this.logger.log('Ingesting Registrar Assistant knowledge base...');

    const [fileChunks, faqDocs, documentTypeDocs] = await Promise.all([
      this.loadKnowledgeBaseFiles(),
      this.loadFaqs(),
      this.loadDocumentTypes(),
    ]);

    const docs = [...fileChunks, ...faqDocs, ...documentTypeDocs];

    if (!docs.length) {
      this.logger.warn(
        'No knowledge base content found — assistant will rely on Gemini alone, with no grounded retrieval.',
      );
      return;
    }

    this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this.embeddings);
    this.logger.log(
      `Knowledge base ready: ${docs.length} chunks indexed ` +
        `(${fileChunks.length} from documents, ${faqDocs.length} FAQs, ${documentTypeDocs.length} document types).`,
    );
  }

  // Short FAQ/document-type blurbs tend to score artificially high on generic
  // queries (e.g. anything mentioning "fee") and can crowd out the actual
  // policy text. Reserve dedicated slots per source so the source documents
  // always get a fair shot at surfacing alongside FAQs and document types.
  async retrieve(query: string, k = 5): Promise<Document[]> {
    await this.waitUntilReady();
    if (!this.vectorStore) return [];

    const isFaqOrDocType = (doc: Document) =>
      doc.metadata.source === 'faq' || doc.metadata.source === 'document_type';

    const [fileDocs, otherDocs] = await Promise.all([
      this.vectorStore.similaritySearch(query, Math.ceil(k * 0.6), (doc) => !isFaqOrDocType(doc)),
      this.vectorStore.similaritySearch(query, Math.floor(k * 0.4) + 1, isFaqOrDocType),
    ]);

    return [...fileDocs, ...otherDocs].slice(0, k + 2);
  }

  isReady(): boolean {
    return this.vectorStore !== null;
  }

  private async loadKnowledgeBaseFiles(): Promise<Document[]> {
    if (!fs.existsSync(KB_DIR)) {
      this.logger.warn(`Knowledge base folder not found at ${KB_DIR}`);
      return [];
    }

    // Fallback splitter for oversized sections and non-Markdown files —
    // ~500 tokens for English text, with overlap so context isn't lost at boundaries.
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1800,
      chunkOverlap: 200,
    });
    const MAX_SECTION_LENGTH = 2500;

    const files = fs.readdirSync(KB_DIR).filter((f) => /\.(pdf|md|txt)$/i.test(f));
    const chunks: Document[] = [];

    for (const file of files) {
      try {
        const text = await this.readFileText(path.join(KB_DIR, file));
        if (!text.trim()) continue;

        // Markdown files: split by section headers first, so a procedure and
        // its fee/steps table stay in one chunk instead of being cut mid-table
        // by a blind character-count window.
        const rawSections = /\.md$/i.test(file) ? this.splitMarkdownSections(text) : [text];

        for (const section of rawSections) {
          if (section.length <= MAX_SECTION_LENGTH) {
            chunks.push(new Document({ pageContent: section.trim(), metadata: { source: file } }));
          } else {
            const split = await splitter.createDocuments([section], [{ source: file }]);
            chunks.push(...split);
          }
        }
      } catch (err) {
        this.logger.error(`Failed to load knowledge base file "${file}"`, err as Error);
      }
    }

    return chunks;
  }

  private splitMarkdownSections(text: string): string[] {
    const lines = text.split('\n');
    const sections: string[] = [];
    let current: string[] = [];

    for (const line of lines) {
      if (/^#{1,3}\s/.test(line) && current.length) {
        sections.push(current.join('\n'));
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) sections.push(current.join('\n'));

    return sections.filter((s) => s.trim().length > 0);
  }

  private async readFileText(fullPath: string): Promise<string> {
    if (/\.pdf$/i.test(fullPath)) {
      const { PDFParse } = await import('pdf-parse');
      const buffer = fs.readFileSync(fullPath);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    }
    return fs.readFileSync(fullPath, 'utf8');
  }

  private async loadFaqs(): Promise<Document[]> {
    const faqs = await this.faqService.findAll();
    return faqs.map(
      (faq) =>
        new Document({
          pageContent: `Q: ${faq.question}\nA: ${faq.answer}`,
          metadata: { source: 'faq', category: faq.category ?? null, faqId: faq.id },
        }),
    );
  }

  private async loadDocumentTypes(): Promise<Document[]> {
    const types = await this.documentTypeRepository.find({ where: { isActive: true } });
    return types.map(
      (dt) =>
        new Document({
          pageContent:
            `Document: ${dt.name}. ${dt.description ?? ''} ` +
            `Processing time: ${dt.processingDays} working day(s). ` +
            `Fee: ${Number(dt.fee) > 0 ? `Php ${dt.fee}` : 'Free'}. ` +
            `${dt.requiresClearance ? 'Requires clearance before release.' : ''}`,
          metadata: { source: 'document_type', documentTypeId: dt.id },
        }),
    );
  }
}
