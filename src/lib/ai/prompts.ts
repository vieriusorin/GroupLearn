/**
 * AI Prompt Templates
 *
 * Reusable prompt templates for various AI tasks
 */

// ============================================
// Flashcard Generation
// ============================================

export function buildFlashcardGenerationPrompt(content: string, count = 10): string {
  return `
You are a learning specialist creating flashcards for spaced repetition study.

CONTENT TO ANALYZE:
${content}

TASK: Generate exactly ${count} high-quality flashcards from this content.

OUTPUT FORMAT (JSON array):
[
  {
    "question": "Clear, specific question (use Markdown for formatting)",
    "answer": "Concise, accurate answer (use Markdown for formatting)",
    "difficulty": "easy" | "medium" | "hard",
    "hints": "Optional context or hint for Socratic guidance"
  }
]

REQUIREMENTS:
1. Focus on key concepts, not trivia
2. Questions should test understanding, not just recall
3. Use clear, unambiguous language
4. Avoid questions that can be answered with yes/no
5. Difficulty levels:
   - easy: Basic facts and definitions (30%)
   - medium: Application of concepts (50%)
   - hard: Analysis, synthesis, edge cases (20%)
6. Each card should be self-contained (no references to other cards)
7. Answers should be 1-3 sentences maximum
8. Return ONLY the JSON array, no additional text

Generate the flashcards:`.trim();
}

// ============================================
// Socratic Hints
// ============================================

export function buildSocraticHintPrompt(question: string, answer: string, context?: string): string {
  return `
You are a Socratic tutor helping a student learn through guided questions.

FLASHCARD:
Question: ${question}
Answer: ${answer}
${context ? `Context: ${context}` : ''}

TASK: Provide a Socratic hint that guides the student toward the answer WITHOUT revealing it.

REQUIREMENTS:
1. Ask a leading question that prompts thinking
2. Do NOT include the answer or key terms from the answer
3. Focus on the reasoning process or prerequisite concepts
4. Keep it brief (1-2 sentences maximum)
5. Use an encouraging, supportive tone
6. Guide them to think about "how" or "why" rather than "what"

EXAMPLES:

Good hint: "What happens when you need to pause execution until an async operation completes?"
Bad hint: "It waits for a Promise to resolve" (reveals answer)

Good hint: "Think about how the browser stores data that persists across page refreshes."
Bad hint: "Use localStorage" (reveals answer)

Good hint: "Consider what's special about the 'this' keyword in arrow functions compared to regular functions."
Bad hint: "Arrow functions inherit 'this' from parent scope" (reveals answer)

Provide your Socratic hint (1-2 sentences only):`.trim();
}

// ============================================
// Knowledge Gap Analysis
// ============================================

export function buildGapAnalysisPrompt(
  groupData: {
    failedTopics: Array<{ topic: string; successRate: number; affectedUsers: number }>;
    totalUsers: number;
  }
): string {
  const failedList = groupData.failedTopics
    .map((t) => `- ${t.topic}: ${t.successRate}% success rate (${t.affectedUsers}/${groupData.totalUsers} users struggling)`)
    .join('\n');

  return `
You are an educational data analyst identifying knowledge gaps in a learning group.

GROUP PERFORMANCE DATA:
${failedList}

Total Users: ${groupData.totalUsers}

TASK: Analyze these struggling topics and identify:
1. Common prerequisite concepts that may be missing
2. The root cause of the struggles (complexity, prerequisites, teaching approach)
3. Recommended learning path to address the gaps

OUTPUT FORMAT (JSON):
{
  "gaps": [
    {
      "topic": "The struggling topic",
      "rootCause": "Why students are struggling",
      "prerequisites": ["Concept 1", "Concept 2"],
      "severity": "critical" | "high" | "medium" | "low",
      "recommendedActions": [
        {
          "action": "Specific action to take",
          "priority": "high" | "medium" | "low",
          "description": "How this will help"
        }
      ]
    }
  ],
  "overallAssessment": "2-3 sentence summary of the group's learning situation"
}

REQUIREMENTS:
1. Focus on actionable insights
2. Identify patterns across multiple topics
3. Prioritize prerequisites that unlock multiple topics
4. Consider that <40% success rate is critical
5. Return ONLY the JSON object, no additional text

Analyze the knowledge gaps:`.trim();
}

// ============================================
// Bridge Deck Generation
// ============================================

export function buildBridgeDeckPrompt(
  gap: {
    topic: string;
    prerequisites: string[];
    rootCause: string;
  },
  cardCount = 8
): string {
  const prereqList = gap.prerequisites.map((p) => `- ${p}`).join('\n');

  return `
You are a learning specialist creating a "bridge deck" to help students overcome a knowledge gap.

KNOWLEDGE GAP:
Topic: ${gap.topic}
Root Cause: ${gap.rootCause}

Missing Prerequisites:
${prereqList}

TASK: Generate exactly ${cardCount} flashcards that bridge this knowledge gap by teaching the prerequisites.

OUTPUT FORMAT (JSON array):
[
  {
    "question": "Clear, specific question (use Markdown)",
    "answer": "Concise, accurate answer (use Markdown)",
    "difficulty": "easy" | "medium" | "hard",
    "prerequisiteConcept": "Which prerequisite this card teaches",
    "hints": "Optional Socratic hint context"
  }
]

REQUIREMENTS:
1. Start with the most fundamental prerequisites
2. Build progressively toward the target topic
3. Each card should connect to the next in a logical sequence
4. Use concrete examples and analogies
5. Focus on "why" and "how," not just "what"
6. Difficulty progression: start easy, build to medium/hard
7. Final 2 cards should directly apply to the original topic
8. Return ONLY the JSON array, no additional text

Generate the bridge deck:`.trim();
}

// ============================================
// Text Extraction from Documents
// ============================================

export function buildTextExtractionPrompt(rawText: string): string {
  return `
You are a text processing assistant. Extract the main educational content from the following document text.

RAW DOCUMENT TEXT:
${rawText}

TASK: Clean and structure the text for learning card generation.

OUTPUT FORMAT (plain text):
- Remove headers, footers, page numbers
- Remove navigation elements and metadata
- Keep main content, headings, and key points
- Preserve code blocks and examples
- Maintain logical section breaks

REQUIREMENTS:
1. Focus on educational content only
2. Maintain the logical flow and structure
3. Keep technical terms and code exactly as written
4. Remove redundant content
5. Return ONLY the cleaned text, no additional commentary

Extract the content:`.trim();
}

// ============================================
// Utility Functions
// ============================================

/**
 * Parse JSON response from AI, handling potential markdown wrapping
 */
export function parseJSONResponse<T>(response: string): T {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();

    // Remove ```json and ``` wrappers
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error}`);
  }
}

/**
 * Validate flashcard format
 */
export function validateFlashcard(card: unknown): card is {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string;
} {
  if (typeof card !== 'object' || card === null) return false;

  const c = card as Record<string, unknown>;

  return (
    typeof c.question === 'string' &&
    c.question.length > 0 &&
    typeof c.answer === 'string' &&
    c.answer.length > 0 &&
    (c.difficulty === 'easy' || c.difficulty === 'medium' || c.difficulty === 'hard') &&
    (c.hints === undefined || typeof c.hints === 'string')
  );
}
