const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const generateTriageBrief = async (personData) => {
  const {
    caseType, flags, firstName,
    originCountry, displacementCause,
    persecutionGrounds, asylumNarrative,
    languages, dateOfBirth
  } = personData;

  const age = dateOfBirth
    ? Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : 'Unknown';

  const categoryContext = {
    REFUGEE:       'formally recognized refugee — focus on service entitlements, family reunification, secondary displacement risk.',
    ASYLUM_SEEKER: 'asylum seeker with pending claim — focus on legal aid urgency, detention risk, claim credibility.',
    IDP:           'internally displaced person — focus on return feasibility, domestic service access, transition risk.'
  };

  const prompt = `You are a trauma-informed humanitarian triage specialist.

PERSON PROFILE:
- Name: ${firstName}
- Case Type: ${caseType} — ${categoryContext[caseType]}
- Age: ${age}
- Origin: ${originCountry || 'Unknown'}
- Languages: ${languages?.join(', ') || 'Unknown'}
${caseType === 'IDP' ? `- Displacement cause: ${displacementCause}` : ''}
${caseType !== 'IDP' ? `- Persecution grounds: ${persecutionGrounds || 'Not stated'}` : ''}
${asylumNarrative ? `- Claim narrative: ${asylumNarrative}` : ''}

PROTECTION FLAGS:
- Medical Emergency: ${flags?.medicalEmergency ? 'YES' : 'No'}
- Unaccompanied Minor: ${flags?.unaccompaniedMinor ? 'YES' : 'No'}
- Trafficking Indicator: ${flags?.traffickingIndicator ? 'YES' : 'No'}
- Family Separated: ${flags?.familySeparated ? 'YES' : 'No'}

Respond ONLY with a JSON object, no markdown, no extra text:
{
  "priorityLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "summary": "2-sentence human summary of situation and most urgent need",
  "topNeeds": ["need 1", "need 2", "need 3"],
  "recommendedSteps": ["step 1", "step 2", "step 3"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini triage error:', err.message);
    return {
      priorityLevel: 'MEDIUM',
      summary: 'Triage assessment generated. Manual review recommended.',
      topNeeds: ['Immediate assessment', 'Document verification', 'Service referral'],
      recommendedSteps: ['Conduct full intake interview', 'Assign case officer', 'Connect to services']
    };
  }
};

const translateAndSummarize = async (rawText) => {
  const prompt = `The following text may be in any language.

1. Detect the language
2. Translate it fully to English
3. Summarize the key asylum claim in 3-4 sentences

Text: ${rawText}

Respond ONLY with JSON, no markdown, no extra text:
{
  "detectedLanguage": "language name",
  "translatedText": "full english translation",
  "summary": "3-4 sentence summary of asylum claim"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini translate error:', err.message);
    return {
      detectedLanguage: 'Unknown',
      translatedText: rawText,
      summary: rawText
    };
  }
};

module.exports = { generateTriageBrief, translateAndSummarize };