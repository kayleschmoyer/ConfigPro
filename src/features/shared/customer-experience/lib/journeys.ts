import { WorkflowEngine } from '@/pages/shared/features/workflow.engine';
import type { Journey, JourneyDryRun, JourneySimulationResult } from './types';

export type JourneyContext = {
  customerId: string;
  trigger: { kind: string; payload?: Record<string, unknown> };
  facts?: Record<string, unknown>;
};

const matchesTrigger = (journey: Journey, context: JourneyContext) =>
  journey.trigger.kind === context.trigger.kind;

export const createJourneyEngine = (journey: Journey) =>
  new WorkflowEngine<'IDLE' | 'RUNNING' | 'COMPLETE', JourneyContext>({
    initial: 'IDLE',
    transitions: [
      { from: 'IDLE', to: 'RUNNING', name: 'start', condition: ctx => matchesTrigger(journey, ctx) },
      { from: 'RUNNING', to: 'COMPLETE', name: 'complete' }
    ]
  });

export const dryRunJourney = (journey: Journey, context: JourneyContext): JourneyDryRun => {
  const engine = createJourneyEngine(journey);
  const results: JourneySimulationResult[] = [];
  const triggerMatches = matchesTrigger(journey, context);

  if (!triggerMatches) {
    results.push({
      stepId: 'trigger',
      executed: false,
      reason: `Trigger mismatch: expected ${journey.trigger.kind}`
    });
    return { journeyId: journey.id, customerId: context.customerId, results };
  }

  engine.transition('RUNNING', context);
  results.push({ stepId: 'trigger', executed: true, reason: 'Trigger matched and journey started.' });

  journey.steps.forEach(step => {
    const params = step.params as { condition?: (ctx: JourneyContext) => boolean } | undefined;
    const condition = params?.condition;
    const allowed = typeof condition === 'function' ? condition(context) : true;
    if (allowed) {
      results.push({ stepId: step.id, executed: true, reason: describeAction(step.action, step.params) });
    } else {
      results.push({ stepId: step.id, executed: false, reason: 'Condition evaluated to false.' });
    }
  });

  engine.transition('COMPLETE', context);
  results.push({ stepId: 'complete', executed: true, reason: 'Journey reached terminal state.' });

  return { journeyId: journey.id, customerId: context.customerId, results };
};

const describeAction = (action: string, params?: Record<string, unknown>) => {
  switch (action) {
    case 'SEND_MESSAGE':
      return `Send ${params?.channel ?? 'portal'} message template ${params?.templateId ?? 'default'}`;
    case 'ISSUE_REWARD':
      return `Issue reward ${params?.rewardId ?? 'unknown'} worth ${params?.points ?? 0} points`;
    case 'ASSIGN_TASK':
      return `Assign task to ${params?.assignee ?? 'queue'} with due date ${params?.dueAt ?? 'unspecified'}`;
    case 'TAG_CUSTOMER':
      return `Apply tag ${params?.tag ?? 'untitled'} to profile`;
    case 'SCHEDULE_FOLLOW_UP':
      return `Schedule follow-up in ${params?.delay ?? '0'} minutes`;
    default:
      return `Execute action ${action}`;
  }
};

export const journeyTriggerCatalog = [
  { kind: 'SEGMENT_ENTRY', label: 'Segment entry' },
  { kind: 'SEGMENT_EXIT', label: 'Segment exit' },
  { kind: 'INVOICE_OVERDUE', label: 'Invoice overdue' },
  { kind: 'POINTS_EXPIRING', label: 'Points expiring' },
  { kind: 'LOW_NPS', label: 'Low NPS' },
  { kind: 'MISSED_APPOINTMENT', label: 'Missed appointment' },
  { kind: 'ABANDONED_BOOKING', label: 'Abandoned booking' }
];

export const journeyActions = [
  { id: 'SEND_MESSAGE', label: 'Send message', channels: ['PORTAL', 'EMAIL', 'SMS'] },
  { id: 'ISSUE_REWARD', label: 'Issue reward' },
  { id: 'ASSIGN_TASK', label: 'Assign internal task' },
  { id: 'TAG_CUSTOMER', label: 'Apply tag' },
  { id: 'SCHEDULE_FOLLOW_UP', label: 'Schedule follow-up' }
];
