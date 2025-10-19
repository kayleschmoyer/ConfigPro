import type {
  ForecastAssumption,
  ForecastScenario,
  ForecastSignal,
  ForecastingContext,
} from '../modules/forecasting';
import { createForecastingContext } from '../modules/forecasting';

export interface ProjectionAuditEntry {
  id: string;
  scenarioId: string;
  createdAt: string;
  actor: string;
  payload: Record<string, unknown>;
}

export interface ForecastingApi {
  bootstrap(context: ForecastingContext): Promise<ForecastingContext>;
  listScenarios(): Promise<ForecastScenario[]>;
  getScenario(id: string): Promise<ForecastScenario>;
  createScenario(scenario: ForecastScenario): Promise<ForecastScenario>;
  updateAssumptions(scenarioId: string, assumptions: ForecastAssumption[]): Promise<ForecastScenario>;
  appendSignals(scenarioId: string, signals: ForecastSignal[]): Promise<ForecastScenario>;
  archiveScenario(scenarioId: string): Promise<void>;
  getProjectionAudit(scenarioId: string): Promise<ProjectionAuditEntry[]>;
}

class InMemoryForecastingApi implements ForecastingApi {
  private context: ForecastingContext | null = null;

  private auditLog = new Map<string, ProjectionAuditEntry[]>();

  async bootstrap(context: ForecastingContext): Promise<ForecastingContext> {
    this.context = createForecastingContext(context.baselineSignals, context.model, context.scenarios);
    for (const scenario of context.scenarios) {
      this.appendAudit(scenario.id, 'bootstrap', { scenario });
    }
    return this.context;
  }

  async listScenarios(): Promise<ForecastScenario[]> {
    this.ensureContext();
    return [...(this.context?.scenarios ?? [])];
  }

  async getScenario(id: string): Promise<ForecastScenario> {
    this.ensureContext();
    const scenario = this.context?.scenarios.find((item) => item.id === id);
    if (!scenario) {
      throw new Error(`Forecast scenario ${id} not found`);
    }
    return scenario;
  }

  async createScenario(scenario: ForecastScenario): Promise<ForecastScenario> {
    this.ensureContext();
    const scenarios = this.context?.scenarios ?? [];
    if (scenarios.some((existing) => existing.id === scenario.id)) {
      throw new Error(`Scenario ${scenario.id} already exists`);
    }
    const created = { ...scenario, createdAt: scenario.createdAt ?? new Date().toISOString() };
    this.context = createForecastingContext(
      this.context!.baselineSignals,
      this.context!.model,
      [...scenarios, created],
    );
    this.appendAudit(created.id, 'create', { scenario: created });
    return created;
  }

  async updateAssumptions(
    scenarioId: string,
    assumptions: ForecastAssumption[],
  ): Promise<ForecastScenario> {
    this.ensureContext();
    const scenarios = this.context!.scenarios.map((scenario) => {
      if (scenario.id !== scenarioId) {
        return scenario;
      }
      const updated = { ...scenario, assumptions };
      this.appendAudit(scenarioId, 'update-assumptions', { assumptions });
      return updated;
    });
    const updatedScenario = scenarios.find((scenario) => scenario.id === scenarioId);
    if (!updatedScenario) {
      throw new Error(`Forecast scenario ${scenarioId} not found`);
    }
    this.context = createForecastingContext(this.context!.baselineSignals, this.context!.model, scenarios);
    return updatedScenario;
  }

  async appendSignals(scenarioId: string, signals: ForecastSignal[]): Promise<ForecastScenario> {
    this.ensureContext();
    const scenarios = this.context!.scenarios.map((scenario) => {
      if (scenario.id !== scenarioId) {
        return scenario;
      }
      const mergedSignals = [...scenario.baseSignals, ...signals];
      const updated = { ...scenario, baseSignals: mergedSignals };
      this.appendAudit(scenarioId, 'append-signals', { appended: signals.length });
      return updated;
    });
    const updatedScenario = scenarios.find((scenario) => scenario.id === scenarioId);
    if (!updatedScenario) {
      throw new Error(`Forecast scenario ${scenarioId} not found`);
    }
    this.context = createForecastingContext(this.context!.baselineSignals, this.context!.model, scenarios);
    return updatedScenario;
  }

  async archiveScenario(scenarioId: string): Promise<void> {
    this.ensureContext();
    const scenarios = this.context!.scenarios.filter((scenario) => scenario.id !== scenarioId);
    if (scenarios.length === this.context!.scenarios.length) {
      throw new Error(`Forecast scenario ${scenarioId} not found`);
    }
    this.context = createForecastingContext(this.context!.baselineSignals, this.context!.model, scenarios);
    this.appendAudit(scenarioId, 'archive', {});
  }

  async getProjectionAudit(scenarioId: string): Promise<ProjectionAuditEntry[]> {
    return this.auditLog.get(scenarioId) ?? [];
  }

  private ensureContext() {
    if (!this.context) {
      throw new Error('Forecasting workspace not initialised. Call bootstrap first.');
    }
  }

  private appendAudit(scenarioId: string, action: string, payload: Record<string, unknown>) {
    const entry: ProjectionAuditEntry = {
      id: `${action}-${Date.now()}`,
      scenarioId,
      createdAt: new Date().toISOString(),
      actor: 'system',
      payload,
    };
    const log = this.auditLog.get(scenarioId) ?? [];
    log.push(entry);
    this.auditLog.set(scenarioId, log);
  }
}

let apiInstance: ForecastingApi | null = null;

export const getForecastingApi = (): ForecastingApi => {
  if (!apiInstance) {
    apiInstance = new InMemoryForecastingApi();
  }
  return apiInstance;
};

export const resetForecastingApi = () => {
  apiInstance = null;
};
