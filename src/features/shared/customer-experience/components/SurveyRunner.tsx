import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { Select } from '../../../shared/ui/Select';
import type { Survey } from '../lib/types';

interface SurveyRunnerProps {
  survey: Survey;
  onSubmit: (answers: Record<string, unknown>) => void;
}

export const SurveyRunner = ({ survey, onSubmit }: SurveyRunnerProps) => {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(answers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
      <header className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{survey.name}</h3>
        <p className="text-sm text-muted">{survey.type} survey • {survey.anonymity ? 'Anonymous' : 'Identified'}</p>
      </header>

      <div className="space-y-5">
        {survey.questions.map((question, index) => (
          <motion.fieldset
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.18 }}
            className="space-y-3"
          >
            <legend className="text-sm font-semibold text-foreground">{question.prompt}</legend>
            {question.kind === 'SCALE' && (
              <Select
                value={(answers[question.id] as string) ?? ''}
                onChange={event =>
                  setAnswers(current => ({ ...current, [question.id]: Number(event.target.value) }))
                }
              >
                <option value="" disabled>
                  Select rating
                </option>
                {[...Array(11).keys()].map(score => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </Select>
            )}
            {question.kind === 'CHOICE' && (
              <Select
                value={(answers[question.id] as string) ?? ''}
                onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))}
              >
                <option value="" disabled>
                  Choose option
                </option>
                {(question.options ?? []).map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            )}
            {question.kind === 'TEXT' && (
              <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                <span className="sr-only">{question.prompt}</span>
                <textarea
                  rows={3}
                  className="w-full rounded-3xl border border-border/60 bg-surface/70 px-4 py-3 text-base text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                  value={(answers[question.id] as string) ?? ''}
                  onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))}
                />
              </label>
            )}
          </motion.fieldset>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {survey.rewardPoints && (
          <span className="text-sm text-muted">Complete to earn {survey.rewardPoints} points</span>
        )}
        <Button type="submit">Submit feedback</Button>
      </div>
    </form>
  );
};
