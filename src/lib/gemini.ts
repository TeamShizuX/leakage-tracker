import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseExpenseDetails(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
    Analyze the following expense input from a user.
    Extract the item name, the amount, the currency (default to LKR if not specified).
    Categorize the expense into a typical category like "Dining Out", "Transport", "Utilities", "Groceries", "Entertainment", etc.
    Assign a necessity score from 1 to 5, where 1 is highly necessary (e.g., rent, basic groceries) and 5 is highly unnecessary (e.g., luxury items, impulse dining).
    Set "is_unnecessary" to true if the score is 4 or 5, otherwise false.

    Respond ONLY with a valid JSON object matching this structure (no markdown tags, no extra text):
    {
      "item": "string",
      "amount": number,
      "currency": "string",
      "category": "string",
      "necessity_score": number,
      "is_unnecessary": boolean
    }

    Expense input: "${text}"
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const jsonText = response.text().trim().replace(/^```json/, '').replace(/```$/, '');
  
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse Gemini response', jsonText);
    throw new Error('Failed to parse expense');
  }
}

export async function roastWallet(transactions: any[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
    You are a sarcastic financial advisor roasting a user's wallet based on their recent transactions.
    Here are their recent transactions:
    ${JSON.stringify(transactions, null, 2)}
    
    Give a short, brutally honest, and humorous paragraph analyzing their spending habits. Focus especially on anything marked as "is_unnecessary". Don't be too mean, keep it fun but stinging.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateFinancialAdvice(transactions: any[], budgetLimit: number, savingsGoal: number) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
    You are a professional, helpful financial advisor.
    The user has a monthly budget limit of ${budgetLimit} LKR and a monthly savings goal of ${savingsGoal} LKR.
    


    Here are their expenses for this month so far:
    ${JSON.stringify(transactions, null, 2)}
    
    Please provide actionable, personalized financial advice.
    - Mention their total income vs expenses and explicitly state if they are on track to hit their savings goal.
    - Identify where they are overspending or experiencing "leakage" (unnecessary expenses).
    - Give them 2-3 specific, realistic tips to cut costs based on their actual categories.
    - Keep the tone encouraging but firm.
    - Use Markdown formatting for readability (bolding, bullet points).
    - Keep it under 200 words.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function determineIntent(text: string): Promise<'EXPENSE' | 'CHAT'> {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  
  const prompt = `
    Analyze the following message sent by a user to a financial tracking bot.
    Determine if the user is trying to LOG an expense (e.g., "Pizza 200", "Paid for gas 5000", "I bought shoes for $50"), 
    OR if they are trying to CHAT / ask a question (e.g., "What is my total?", "Roast me", "Give me advice", "Hello", "How much did I spend?").
    
    Respond ONLY with the word "EXPENSE" or "CHAT". No other text.
    
    Message: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toUpperCase();

    if (responseText.includes('CHAT')) return 'CHAT';
    return 'EXPENSE';
  } catch (error) {
    console.error('Error determining intent, defaulting to CHAT:', error);
    return 'CHAT';
  }
}

export async function generatePremiumChatResponse(text: string, transactions: any[], budgetLimit: number, savingsGoal: number) {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const prompt = `
    You are an elite, highly intelligent, and slightly witty Premium Financial Advisor AI.
    The user is chatting with you via a messaging app. 
    
    User's Message: "${text}"
    
    Context:
    - User's Monthly Budget: ${budgetLimit} LKR
    - User's Monthly Savings Goal: ${savingsGoal} LKR

    - Recent Expenses: ${JSON.stringify(transactions, null, 2)}
    
    Instructions:
    1. Answer the user's message directly based on the context provided.
    2. If they ask for a roast, be brutally honest, sarcastic, and funny about their spending (especially "unnecessary" items).
    3. If they ask for a summary, calculate their total expenses and let them know if they are on track to save ${savingsGoal} this month.
    4. Maintain an elite, premium tone. You are an exclusive perk they paid for.
    5. Use basic Markdown (bolding, lists) to format your response nicely for a chat interface. Keep it concise enough for a text message.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating premium chat response:', error);
    return "I'm currently experiencing technical difficulties processing your elite request. Please try again later.";
  }
}
