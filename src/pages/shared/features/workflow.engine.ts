export type WorkflowState = string;

export interface WorkflowTransition<State extends WorkflowState, Context = unknown> {
  from: State;
  to: State;
  name?: string;
  condition?: (context: Context) => boolean;
}

export interface WorkflowDefinition<State extends WorkflowState, Context = unknown> {
  initial: State;
  transitions: WorkflowTransition<State, Context>[];
}

export class WorkflowEngine<State extends WorkflowState, Context = unknown> {
  private readonly definition: WorkflowDefinition<State, Context>;
  private current: State;

  constructor(definition: WorkflowDefinition<State, Context>) {
    this.definition = definition;
    this.current = definition.initial;
  }

  getCurrentState(): State {
    return this.current;
  }

  reset(state?: State): State {
    this.current = state ?? this.definition.initial;
    return this.current;
  }

  canTransition(target: State, context?: Context): boolean {
    return this.definition.transitions.some((transition) => {
      return (
        transition.from === this.current &&
        transition.to === target &&
        (typeof transition.condition !== 'function' || transition.condition(context as Context))
      );
    });
  }

  transition(target: State, context?: Context): State {
    if (!this.canTransition(target, context)) {
      throw new Error(`Transition from "${this.current}" to "${target}" is not allowed.`);
    }

    this.current = target;
    return this.current;
  }

  getNextStates(context?: Context): State[] {
    return this.getAvailableTransitions(context).map((transition) => transition.to);
  }

  getAvailableTransitions(context?: Context): WorkflowTransition<State, Context>[] {
    return this.definition.transitions.filter((transition) => {
      return (
        transition.from === this.current &&
        (typeof transition.condition !== 'function' || transition.condition(context as Context))
      );
    });
  }

  describe(): WorkflowDefinition<State, Context> {
    return { ...this.definition };
  }
}

