import { useMemo } from 'react';
import { calculateCsat, calculateNps, tagFeedback, throttleSurvey } from '../lib/feedback';
import type { Survey } from '../lib/types';
import { filterMarketingChannels } from '../lib/privacy';
import { usePortal } from './usePortal';

export const useFeedback = () => {
  const { snapshot } = usePortal();
  const { surveys, responses, customer } = snapshot;

  const nps = useMemo(() => calculateNps(responses), [responses]);
  const csat = useMemo(() => calculateCsat(responses), [responses]);
  const tags = useMemo(() => tagFeedback(responses), [responses]);
  const channels = useMemo(() => filterMarketingChannels(customer), [customer]);

  const eligibleSurveys = useMemo(
    () => surveys.filter(survey => !throttleSurvey(survey, responses, customer.id)),
    [surveys, responses, customer.id]
  );

  return { surveys, responses, nps, csat, tags, channels, eligibleSurveys };
};

export const useSurveyById = (surveyId: string): Survey | undefined => {
  const { snapshot } = usePortal();
  return snapshot.surveys.find(survey => survey.id === surveyId);
};
