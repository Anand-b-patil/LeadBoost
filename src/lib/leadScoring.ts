import { generateFromGemini } from './api';

export interface Lead {
  id: string;
  name: string;
  email: string;
  linkedin: string;
  company: string;
  revenue: string;
  industry: string;
  priorityScore?: number;
  aiInsight?: string;
  isHotLead?: boolean;
  createdAt: Date;
}

export interface ScoredLead extends Lead {
  priorityScore: number;
  aiInsight: string;
  isHotLead: boolean;
  baseScore?: number;
  aiScore?: number | null;
  baseBreakdown?: {
    role: number;
    company: number;
    intent: number;
    contact: number;
    recency: number;
  };
}

export function computeBaseScoreDetailed(lead: Lead) {
  let role = 0;
  let company = 0;
  let intent = 0;
  let contact = 0;
  let recency = 0;

  const title = (lead.name || "").toLowerCase();
  if (/founder|ceo|cto|cfo|co-founder/.test(title)) role = 30;
  else if (/vp|vice president|head|director/.test(title)) role = 20;
  else if (/manager|lead/.test(title)) role = 10;

  try {
    const num = Number(String(lead.revenue).replace(/[^0-9]/g, "")) || 0;
    if (num > 100000000) company = 25;
    else if (num > 5000000) company = 15;
    else company = 5;
  } catch {
    company = 10;
  }

  const signals = (lead.aiInsight || "").toLowerCase();
  if (/fund|raised|series|hiring|launch|acquired/.test(signals)) intent = 25;
  else if (/hiring|growth|expanding|pilot/.test(signals)) intent = 10;

  if (lead.email && lead.linkedin) contact = 10;
  else if (lead.email || lead.linkedin) contact = 5;

  if (/recent|month|week/.test(signals)) recency = 8;

  const score = Math.max(0, Math.min(100, Math.round(role + company + intent + contact + recency)));
  return { score, breakdown: { role, company, intent, contact, recency } };
}

export async function scoreLead(lead: Lead): Promise<ScoredLead> {
  const prompt = `Analyze this lead and provide a priority score (0-100) and a human-readable explanation:

Lead Information:
- Name: ${lead.name}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Revenue: ${lead.revenue}
- Email: ${lead.email}
- LinkedIn: ${lead.linkedin}

Please provide:
1. Priority Score (0-100): A number representing how valuable this lead is
2. AI Insight: In 1-2 sentences, explain why this lead received this score. Reference their company, industry, and any recent events or news if possible.
3. Hot Lead: true/false - whether this is an immediate high-priority prospect

Consider factors like:
- Company size and revenue potential
- Industry growth and market opportunity
- Contact role and decision-making authority
- Recent company activity, funding, or news
- Competitive landscape

Respond in this exact JSON format:
{
  "priorityScore": 85,
  "aiInsight": "High-value prospect with recent funding and growing team in a fast-growing industry.",
  "isHotLead": true
}`;

  let baseScore = 50;
  try {
    // Compute deterministic base score locally (same rubric as backend)
    const { score: computedBaseScore, breakdown } = computeBaseScoreDetailed(lead);
    baseScore = computedBaseScore;

    const response = await generateFromGemini({ 
      prompt,
      temperature: 0.3 // Lower temperature for more consistent scoring
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Parse the JSON response - handle markdown code blocks
    let jsonText = response.text || '{}';
    
    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }
    
    // Clean up any extra whitespace
    jsonText = jsonText.trim();
    
    const scoringData = JSON.parse(jsonText);
    const aiScore = scoringData.priorityScore || null;
    const finalScore = aiScore !== null ? aiScore : baseScore;

    return {
      ...lead,
      priorityScore: finalScore,
      aiInsight: scoringData.aiInsight || 'No insight available',
      isHotLead: scoringData.isHotLead || false,
      baseScore,
      aiScore,
      baseBreakdown: breakdown,
    } as ScoredLead;
  } catch (error) {
    console.error('Error scoring lead:', error);
    console.error('Lead data:', lead);
    // @ts-ignore
    console.error('API response:', (error as any).response);
    // Return default scoring if API fails
    return {
      ...lead,
      priorityScore: baseScore || 50,
      aiInsight: `Scoring unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`,
      isHotLead: false,
      // debug
      // @ts-ignore
      baseScore,
      // @ts-ignore
      aiScore: null,
    };
  }
}

export async function scoreMultipleLeads(leads: Lead[]): Promise<ScoredLead[]> {
  const scoredLeads: ScoredLead[] = [];
  
  for (const lead of leads) {
    try {
      const scoredLead = await scoreLead(lead);
      scoredLeads.push(scoredLead);
    } catch (error) {
      console.error(`Error scoring lead ${lead.name}:`, error);
      // Add lead with default scoring
      scoredLeads.push({
        ...lead,
        priorityScore: 50,
        aiInsight: 'Scoring failed',
        isHotLead: false
      });
    }
  }
  
  return scoredLeads;
}

// Local storage helpers
export function saveLeadsToStorage(leads: ScoredLead[]): void {
  localStorage.setItem('leadboost_leads', JSON.stringify(leads));
}

export function getLeadsFromStorage(): ScoredLead[] {
  const stored = localStorage.getItem('leadboost_leads');
  if (!stored) return [];
  
  try {
    const leads = JSON.parse(stored);
    return leads.map((lead: any) => ({
      ...lead,
      createdAt: new Date(lead.createdAt)
    }));
  } catch (error) {
    console.error('Error parsing stored leads:', error);
    return [];
  }
}

export function clearStoredLeads(): void {
  localStorage.removeItem('leadboost_leads');
}
