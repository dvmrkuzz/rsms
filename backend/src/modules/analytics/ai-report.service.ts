import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AiReportService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly configService: ConfigService,
  ) {}

  async generateReport(): Promise<{ report: string; analytics: any }> {
    const analytics = await this.analyticsService.getFullAnalytics();
    const report = await this.callGemini(analytics);
    return { report, analytics };
  }

  private async callGemini(analytics: any): Promise<string> {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    const model = this.configService.get<string>('gemini.model') ?? 'gemini-2.5-flash';

    const prompt = this.buildPrompt(analytics);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(`Gemini API error: ${error}`);
    }

    const data = await response.json() as any;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new InternalServerErrorException('No response from Gemini API');
    }

    return text;
  }

  private buildPrompt(analytics: any): string {
    const { requestStats, documentStats, visitorStats, peakDays, monthlyTrend, userStats } = analytics;

    const topDocument = documentStats[0]?.name ?? 'N/A';
    const peakDay = peakDays[0]?.day ?? 'N/A';
    const currentMonth = new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

    return `You are an administrative report writer for the Registrar's Office of Sorsogon State University - Bulan Campus.

Based on the following operational data, write a concise, professional narrative report (3-4 paragraphs) suitable for administrative review. Use a formal but readable tone. Do not use bullet points or headers — write in continuous prose paragraphs only.

OPERATIONAL DATA:
- Total service requests: ${requestStats.total}
- Pending requests: ${requestStats.byStatus.pending}
- Processing: ${requestStats.byStatus.processing}
- Ready for pickup: ${requestStats.byStatus.ready}
- Released/completed: ${requestStats.byStatus.released}
- Cancelled: ${requestStats.byStatus.cancelled}
- Rejected: ${requestStats.byStatus.rejected}
- Completion rate: ${requestStats.completionRate}%

DOCUMENT REQUEST BREAKDOWN:
${documentStats.slice(0, 5).map((d: any) => `- ${d.name}: ${d.count} requests (${d.released} released)`).join('\n')}

VISITOR STATISTICS:
- Total visitors logged: ${visitorStats.total}
- Visitors today: ${visitorStats.today}
- Most common purpose: ${visitorStats.byPurpose[0]?.purpose?.replace('_', ' ') ?? 'N/A'}

PEAK TRANSACTION DAY: ${peakDay} (${peakDays[0]?.count ?? 0} requests)

MONTHLY TREND (last 6 months):
${monthlyTrend.map((m: any) => `- ${m.month}: ${m.requests} requests, ${m.released} released`).join('\n')}

USER ACCOUNTS:
- Total registered users: ${userStats.total}
- Active accounts: ${userStats.active}
- Students: ${userStats.students}, Staff: ${userStats.staff}, Admins: ${userStats.admins}

Write the report as of ${currentMonth}. Start directly with the report content — no title, no heading, no preamble.`;
  }
}