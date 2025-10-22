import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { useFeedback } from '../hooks/useFeedback';
import { SurveyRunner } from '../components/SurveyRunner';

export const PortalFeedback = () => {
  const { eligibleSurveys, nps, csat, tags } = useFeedback();
  const [activeSurveyId, setActiveSurveyId] = useState<string | undefined>(eligibleSurveys[0]?.id);

  const activeSurvey = eligibleSurveys.find(survey => survey.id === activeSurveyId);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Feedback</h2>
          <p className="text-sm text-muted">Share how we can improve. Earn loyalty points for qualified surveys.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-3xl border border-border/60 bg-surface/70 px-4 py-2 text-sm text-foreground/90">
            NPS {nps.score}
          </div>
          <div className="rounded-3xl border border-border/60 bg-surface/70 px-4 py-2 text-sm text-foreground/90">
            CSAT {(csat.average || 0).toFixed(1)}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {eligibleSurveys.map(survey => (
          <Button
            key={survey.id}
            variant={survey.id === activeSurveyId ? 'primary' : 'outline'}
            onClick={() => setActiveSurveyId(survey.id)}
          >
            {survey.name}
          </Button>
        ))}
      </div>

      {activeSurvey ? (
        <SurveyRunner
          survey={activeSurvey}
          onSubmit={() => setActiveSurveyId(undefined)}
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-border/60 bg-surface/60 text-sm text-muted">
          No active surveys right now. Check back soon.
        </div>
      )}

      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Top drivers</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag.keyword}
              className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
            >
              {tag.keyword} ({tag.count})
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PortalFeedback;
