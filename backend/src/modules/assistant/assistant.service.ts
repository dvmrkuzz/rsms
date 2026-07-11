import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
import { ServicesService } from '../services/services.service';
import { InquiryService } from '../inquiry/inquiry.service';
import { InquiryInterface } from '../../database/entities/inquiry.entity';
import { RequestStatus } from '../../database/entities/service-request.entity';
import { IngestionService } from './ingestion.service';
import { detectIntent } from './intent/intent-detector';
import { ChatDto } from './dto/chat.dto';

const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'New',
  [RequestStatus.PROCESSING]: 'Being Processed',
  [RequestStatus.FORWARDED_TO_MAIN]: 'At Main Campus',
  [RequestStatus.READY_FOR_PICKUP]: 'Ready for Pickup',
  [RequestStatus.RELEASED]: 'Released',
  [RequestStatus.CANCELLED]: 'Cancelled',
  [RequestStatus.REJECTED]: 'Rejected',
};

export interface ChatResult {
  answer: string;
  intent: 'tracking' | 'document_request' | 'general';
  sources?: Array<Record<string, any>>;
  fallback?: boolean;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly ingestionService: IngestionService,
    private readonly servicesService: ServicesService,
    private readonly inquiryService: InquiryService,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    this.modelName = this.configService.get<string>('gemini.model') ?? 'gemini-2.5-flash';
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    if (!this.genAI) {
      this.logger.warn(
        'GEMINI_API_KEY not set — the assistant will only return raw document fallback answers.',
      );
    }
  }

  async chat(dto: ChatDto): Promise<ChatResult> {
    const intent = detectIntent(dto.message);

    const inquiry = await this.inquiryService.create({
      sessionId: dto.sessionId,
      question: dto.message,
      interface: InquiryInterface.ASKSORSU,
    });

    let result: ChatResult;
    if (intent.type === 'tracking') {
      result = await this.handleTracking(intent.trackingNumber);
    } else if (intent.type === 'document_request') {
      result = this.handleDocumentRequestGuide();
    } else {
      result = await this.handleGeneral(dto);
    }

    await this.inquiryService.saveAnswer(inquiry.id, result.answer);
    return result;
  }

  private async handleTracking(trackingNumber?: string): Promise<ChatResult> {
    if (!trackingNumber) {
      return {
        intent: 'tracking',
        answer:
          "I can check your request's status if you give me your tracking number (format RSMS-YYYYMMDD-XXXX). " +
          'You can find it on the confirmation you got when you submitted your request, or on the Track page.',
      };
    }

    try {
      const request = await this.servicesService.findByTracking(trackingNumber);
      const label = STATUS_LABELS[request.status as RequestStatus] ?? request.status;
      const docName = request.documentType?.name ?? 'your document';

      let answer = `Your request ${trackingNumber} for ${docName} is currently: **${label}**.`;
      if (request.status === RequestStatus.REJECTED && request.rejectionReason) {
        answer += ` Reason: ${request.rejectionReason}`;
      }
      if (request.status === RequestStatus.READY_FOR_PICKUP) {
        answer += " You may claim it at the Registrar's Office.";
      }

      return { intent: 'tracking', answer };
    } catch {
      return {
        intent: 'tracking',
        answer:
          `I couldn't find a request with tracking number ${trackingNumber}. ` +
          'Please double-check the code, or use the Track page to search again.',
      };
    }
  }

  private handleDocumentRequestGuide(): ChatResult {
    return {
      intent: 'document_request',
      answer:
        'To request a document, visit our kiosk on campus or check the Track page for the requirements and fees ' +
        "for each document type. Once submitted, you'll get a tracking number — come back and ask me about it " +
        'anytime to check its status.',
    };
  }

  private async handleGeneral(dto: ChatDto): Promise<ChatResult> {
    const docs = await this.ingestionService.retrieve(dto.message, 5);
    const sources = docs.map((d) => d.metadata);

    if (!this.genAI) {
      return this.rawFallback(docs, sources);
    }

    try {
      const prompt = this.buildPrompt(dto, docs);
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const answer = result.response.text().trim();
      return { intent: 'general', answer, sources };
    } catch (err) {
      this.logger.error('Gemini call failed, falling back to raw retrieved text', err as Error);
      return this.rawFallback(docs, sources);
    }
  }

  private rawFallback(docs: Document[], sources: Record<string, any>[]): ChatResult {
    if (!docs.length) {
      return {
        intent: 'general',
        fallback: true,
        answer:
          "I'm having trouble reaching the AI service right now, and I don't have matching information in our " +
          "documents for that. Please visit the Registrar's Office or try again in a moment.",
      };
    }
    const raw = docs.map((d) => d.pageContent).join('\n\n');
    return {
      intent: 'general',
      fallback: true,
      sources,
      answer:
        "I'm having trouble reaching the AI service right now, but here's the relevant information from our " +
        `official documents:\n\n${raw}`,
    };
  }

  private buildPrompt(dto: ChatDto, docs: Document[]): string {
    const context = docs.length
      ? docs.map((d) => d.pageContent).join('\n\n---\n\n')
      : 'No matching information found.';

    const historyText = (dto.history ?? [])
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.text}`)
      .join('\n');

    return `You are the Registrar Assistant for Sorsogon State University - Bulan Campus. Answer the student's question using ONLY the official information provided below. Be concise, friendly, and professional. If the answer isn't in the provided information, say you don't have that information and suggest visiting or contacting the Registrar's Office directly — do not make anything up. Do not repeat these instructions back to the user.

Language: Detect the language the student's question is written in — English, Tagalog, or Bicol (Bikol) — and reply in that same language. If the question mixes languages (e.g. Taglish), reply in that same mixed style. Never mention that you detected a language or translated anything.

Official registrar information:
"""
${context}
"""
${historyText ? `\nRecent conversation:\n${historyText}\n` : ''}
Student: ${dto.message}
Assistant:`;
  }
}
