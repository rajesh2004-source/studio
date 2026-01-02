'use server';

/**
 * @fileOverview An AI agent that suggests transaction categories based on the transaction description and vendor.
 *
 * - suggestTransactionCategories - A function that handles the suggestion of transaction categories.
 * - SuggestTransactionCategoriesInput - The input type for the suggestTransactionCategories function.
 * - SuggestTransactionCategoriesOutput - The return type for the suggestTransactionCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoriesInputSchema = z.object({
  description: z.string().describe('The description of the transaction.'),
  vendor: z.string().describe('The vendor associated with the transaction.'),
});
export type SuggestTransactionCategoriesInput = z.infer<typeof SuggestTransactionCategoriesInputSchema>;

const SuggestTransactionCategoriesOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested categories for the transaction.'),
});
export type SuggestTransactionCategoriesOutput = z.infer<typeof SuggestTransactionCategoriesOutputSchema>;

export async function suggestTransactionCategories(
  input: SuggestTransactionCategoriesInput
): Promise<SuggestTransactionCategoriesOutput> {
  return suggestTransactionCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoriesPrompt',
  input: {schema: SuggestTransactionCategoriesInputSchema},
  output: {schema: SuggestTransactionCategoriesOutputSchema},
  prompt: `You are an expert in categorizing transactions for petty cash management.

  Given the transaction description and vendor, suggest relevant categories for the transaction.
  Return the suggested categories as an array of strings.

  Description: {{{description}}}
  Vendor: {{{vendor}}}
  Categories:`,
});

const suggestTransactionCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoriesFlow',
    inputSchema: SuggestTransactionCategoriesInputSchema,
    outputSchema: SuggestTransactionCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
