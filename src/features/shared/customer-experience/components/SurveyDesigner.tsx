import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import type { Survey, SurveyQuestion } from '../lib';

interface SurveyDesignerProps {
  baseSurvey?: Survey;
  onSave: (survey: Survey) => void;
}

const questionTemplates: SurveyQuestion[] = [
  { id: 'template-nps', kind: 'SCALE', prompt: 'On a scale of 0-10, how likely are you to recommend us?' },
  { id: 'template-csat', kind: 'SCALE', prompt: 'Rate your satisfaction (1-5).' },
  { id: 'template-text', kind: 'TEXT', prompt: 'What could we improve?' }
];

export const SurveyDesigner = ({ baseSurvey, onSave }: SurveyDesignerProps) => {
  const [survey, setSurvey] = useState<Survey>(
    baseSurvey ?? {
      id: `survey-${Date.now()}`,
      name: 'Untitled survey',
      type: 'NPS',
      questions: [],
      anonymity: false
    }
  );

  const addQuestion = (templateId: string) => {
    const template = questionTemplates.find(question => question.id === templateId);
    if (!template) return;
    setSurvey(current => ({
      ...current,
      questions: [
        ...current.questions,
        { ...template, id: `${template.id}-${current.questions.length + 1}` }
      ]
    }));
  };

  const updateName = (name: string) => setSurvey(current => ({ ...current, name }));
  const updateType = (type: Survey['type']) => setSurvey(current => ({ ...current, type }));

  return (
    <motion.section
      layout
      className="space-y-6 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Input
            label="Survey name"
            value={survey.name}
            onChange={event => updateName(event.target.value)}
          />
          <Select
            label="Survey type"
            value={survey.type}
            onChange={event => updateType(event.target.value as Survey['type'])}
          >
            <option value="NPS">Net Promoter Score</option>
            <option value="CSAT">Customer Satisfaction</option>
            <option value="MICRO">Micro pulse</option>
          </Select>
        </div>
        <Button onClick={() => onSave(survey)}>Save survey</Button>
      </header>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Questions</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {questionTemplates.map(template => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto flex-col items-start gap-1 rounded-2xl px-4 py-4 text-left"
              onClick={() => addQuestion(template.id)}
            >
              <span className="text-sm font-semibold text-foreground">{template.prompt}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted">{template.kind}</span>
            </Button>
          ))}
        </div>
      </section>

      <ul className="space-y-4">
        {survey.questions.map((question, index) => (
          <li
            key={question.id}
            className="rounded-2xl border border-border/50 bg-surface/70 p-4 text-sm text-foreground"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Question {index + 1}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted">{question.kind}</span>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{question.prompt}</p>
          </li>
        ))}
        {!survey.questions.length && (
          <li className="rounded-2xl border border-dashed border-border/50 bg-surface/60 p-4 text-sm text-muted">
            Choose a template to add your first question.
          </li>
        )}
      </ul>
    </motion.section>
  );
};
