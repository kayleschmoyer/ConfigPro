import { useMemo } from 'react';
import { dryRunJourney, journeyActions, journeyTriggerCatalog } from '../lib/journeys';
import type { Journey } from '../lib/types';
import { usePortal, usePortalJourneys } from './usePortal';

export const useJourneys = () => {
  const { snapshot } = usePortal();
  const journeys = usePortalJourneys();

  const dryRuns = useMemo(
    () =>
      journeys.map(journey =>
        dryRunJourney(journey, {
          customerId: snapshot.customer.id,
          trigger: { kind: journey.trigger.kind },
          facts: {
            points: snapshot.loyalty.points,
            balance: snapshot.invoices.reduce((sum, invoice) => sum + invoice.balance.value, 0)
          }
        })
      ),
    [journeys, snapshot]
  );

  return { journeys, dryRuns, actions: journeyActions, triggers: journeyTriggerCatalog };
};

export const useJourneyById = (journeyId: string): Journey | undefined => {
  const journeys = usePortalJourneys();
  return journeys.find(journey => journey.id === journeyId);
};
