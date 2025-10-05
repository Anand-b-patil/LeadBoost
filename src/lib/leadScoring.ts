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

  try {
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
    
    return {
      ...lead,
      priorityScore: scoringData.priorityScore || 50,
      aiInsight: scoringData.aiInsight || 'No insight available',
      isHotLead: scoringData.isHotLead || false
    };
  } catch (error) {
    console.error('Error scoring lead:', error);
    console.error('Lead data:', lead);
    console.error('API response:', response);
    // Return default scoring if API fails
    return {
      ...lead,
      priorityScore: 50,
      aiInsight: `Scoring unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`,
      isHotLead: false
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
