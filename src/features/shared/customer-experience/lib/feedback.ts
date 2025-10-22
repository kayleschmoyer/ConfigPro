import type { Survey, SurveyResponse } from './types';

export const calculateNps = (responses: SurveyResponse[]) => {
  const npsResponses = responses.filter(response => typeof response.npsScore === 'number');
  if (!npsResponses.length) return { score: 0, promoters: 0, detractors: 0, passives: 0 };

  const promoters = npsResponses.filter(response => (response.npsScore ?? 0) >= 9).length;
  const detractors = npsResponses.filter(response => (response.npsScore ?? 0) <= 6).length;
  const passives = npsResponses.length - promoters - detractors;
  const score = Math.round(((promoters - detractors) / npsResponses.length) * 100);

  return { score, promoters, detractors, passives };
};

export const calculateCsat = (responses: SurveyResponse[]) => {
  const csatResponses = responses.filter(response => typeof response.csat === 'number');
  if (!csatResponses.length) return { average: 0, favorableRate: 0 };

  const average =
    csatResponses.reduce((sum, response) => sum + (response.csat ?? 0), 0) / csatResponses.length;
  const favorableRate =
    csatResponses.filter(response => (response.csat ?? 0) >= 4).length / csatResponses.length;

  return { average, favorableRate };
};

export const throttleSurvey = (
  survey: Survey,
  responses: SurveyResponse[],
  customerId: string,
  cooldownDays = 14
) => {
  if (survey.anonymity) return false;
  const now = Date.now();
  return responses.some(response => {
    if (response.customerId !== customerId || response.surveyId !== survey.id) return false;
    const diff = now - new Date(response.at).getTime();
    return diff < cooldownDays * 24 * 60 * 60 * 1000;
  });
};

export const tagFeedback = (responses: SurveyResponse[]) => {
  const keywordCounts = new Map<string, number>();

  responses.forEach(response => {
    const freeTextAnswers = Object.values(response.answers).filter(
      answer => typeof answer === 'string'
    ) as string[];
    freeTextAnswers.forEach(answer => {
      answer
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .forEach(token => keywordCounts.set(token, (keywordCounts.get(token) ?? 0) + 1));
    });
  });

  return Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));
};
