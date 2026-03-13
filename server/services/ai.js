const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const truncate = (str, max = 500) => (str ? String(str).substring(0, max) : '');

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
- Name: ${truncate(firstName, 100)}
- Case Type: ${caseType} — ${categoryContext[caseType]}
- Age: ${age}
- Origin: ${truncate(originCountry, 100) || 'Unknown'}
- Languages: ${languages?.map(l => truncate(l, 50)).join(', ') || 'Unknown'}
${caseType === 'IDP' ? `- Displacement cause: ${displacementCause}` : ''}
${caseType !== 'IDP' ? `- Persecution grounds: ${truncate(persecutionGrounds, 200) || 'Not stated'}` : ''}
${asylumNarrative ? `- Claim narrative: ${truncate(asylumNarrative, 500)}` : ''}

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text.trim();

  try {
    return JSON.parse(text);
  } catch {
    return {
      priorityLevel: 'MEDIUM',
      summary: 'Triage assessment generated. Manual review recommended.',
      topNeeds: ['Immediate assessment', 'Document verification', 'Service referral'],
      recommendedSteps: ['Conduct full intake interview', 'Assign case officer', 'Connect to services']
    };
  }
};

module.exports = { generateTriageBrief };
