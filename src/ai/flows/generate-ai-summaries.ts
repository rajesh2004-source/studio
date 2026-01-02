'use server';
/**
 * @fileOverview AI-assisted summary generator for petty cash reports.
 *
 * - generateReportSummary - A function that generates AI summaries for petty cash reports.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportSummaryInputSchema = z.object({
  reportData: z
    .string()
    .describe('The petty cash report data to be summarized.'),
});
export type GenerateReportSummaryInput = z.infer<
  typeof GenerateReportSummaryInputSchema
>;

const GenerateReportSummaryOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the report.'),
});
export type GenerateReportSummaryOutput = z.infer<
  typeof GenerateReportSummaryOutputSchema
>;

export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<GenerateReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `You are an expert financial analyst. Please provide a concise summary of the following petty cash report data, highlighting key trends and insights:\n\n{{{reportData}}}`,
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: GenerateReportSummaryInputSchema,
    outputSchema: GenerateReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
