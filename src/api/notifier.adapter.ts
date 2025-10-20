export type NotificationChannel = 'email' | 'sms' | 'push';

export type NotificationProviderStatus = 'connected' | 'pending' | 'disconnected';

export interface NotificationTemplate {
  id: string;
  channel: NotificationChannel;
  name: string;
  description?: string;
  locale: string;
  version: number;
  subject?: string;
  body: string;
  tags?: string[];
  updatedAt: string;
}

export interface NotificationProviderDescriptor {
  id: string;
  vendor: string;
  channel: NotificationChannel;
  displayName: string;
  status: NotificationProviderStatus;
  capabilities: string[];
  metadata?: Record<string, string>;
  updatedAt: string;
}

export interface NotificationTrigger {
  id: string;
  name: string;
  event: string;
  channels: NotificationChannel[];
  templateBindings: Record<NotificationChannel, string>;
  conditions?: string[];
  audience?: string;
  enabled: boolean;
  updatedAt: string;
}

export type TriggerExecutionStatus = 'delivered' | 'skipped' | 'failed';

export interface NotificationDeliveryRecord {
  providerId: string;
  templateId: string;
  deliveredAt: string;
  messageId?: string;
  error?: string;
}

export interface NotificationTriggerLogEntry {
  id: string;
  triggerId: string;
  eventPayloadId: string;
  status: TriggerExecutionStatus;
  recordedAt: string;
  notes?: string;
  channelDeliveries?: Partial<Record<NotificationChannel, NotificationDeliveryRecord>>;
}

export interface NotificationAdapter {
  listProviders(): Promise<NotificationProviderDescriptor[]>;
  getProvider(id: string): Promise<NotificationProviderDescriptor | null>;
  upsertProvider(
    descriptor: Omit<NotificationProviderDescriptor, 'updatedAt'>,
  ): Promise<NotificationProviderDescriptor>;
  removeProvider(id: string): Promise<void>;

  listTemplates(channel?: NotificationChannel): Promise<NotificationTemplate[]>;
  getTemplate(id: string): Promise<NotificationTemplate | null>;
  upsertTemplate(template: Omit<NotificationTemplate, 'updatedAt'>): Promise<NotificationTemplate>;
  removeTemplate(id: string): Promise<void>;

  listTriggers(): Promise<NotificationTrigger[]>;
  getTrigger(id: string): Promise<NotificationTrigger | null>;
  upsertTrigger(trigger: Omit<NotificationTrigger, 'updatedAt'>): Promise<NotificationTrigger>;
  removeTrigger(id: string): Promise<void>;
  recordTriggerExecution(
    triggerId: string,
    status: TriggerExecutionStatus,
    options: {
      eventPayloadId: string;
      notes?: string;
      channelDeliveries?: Partial<Record<NotificationChannel, NotificationDeliveryRecord>>;
    },
  ): Promise<NotificationTriggerLogEntry>;
  getTriggerLog(triggerId: string): Promise<NotificationTriggerLogEntry[]>;
}

class InMemoryNotificationAdapter implements NotificationAdapter {
  private providers = new Map<string, NotificationProviderDescriptor>();
  private templates = new Map<string, NotificationTemplate>();
  private triggers = new Map<string, NotificationTrigger>();
  private triggerLogs = new Map<string, NotificationTriggerLogEntry[]>();

  async listProviders(): Promise<NotificationProviderDescriptor[]> {
    return Array.from(this.providers.values());
  }

  async getProvider(id: string): Promise<NotificationProviderDescriptor | null> {
    return this.providers.get(id) ?? null;
  }

  async upsertProvider(
    descriptor: Omit<NotificationProviderDescriptor, 'updatedAt'>,
  ): Promise<NotificationProviderDescriptor> {
    const updated: NotificationProviderDescriptor = {
      ...descriptor,
      updatedAt: new Date().toISOString(),
    };
    this.providers.set(updated.id, updated);
    return updated;
  }

  async removeProvider(id: string): Promise<void> {
    this.providers.delete(id);
  }

  async listTemplates(channel?: NotificationChannel): Promise<NotificationTemplate[]> {
    const templates = Array.from(this.templates.values());
    return channel ? templates.filter((template) => template.channel === channel) : templates;
  }

  async getTemplate(id: string): Promise<NotificationTemplate | null> {
    return this.templates.get(id) ?? null;
  }

  async upsertTemplate(template: Omit<NotificationTemplate, 'updatedAt'>): Promise<NotificationTemplate> {
    const updated: NotificationTemplate = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
    this.templates.set(updated.id, updated);
    return updated;
  }

  async removeTemplate(id: string): Promise<void> {
    this.templates.delete(id);
  }

  async listTriggers(): Promise<NotificationTrigger[]> {
    return Array.from(this.triggers.values());
  }

  async getTrigger(id: string): Promise<NotificationTrigger | null> {
    return this.triggers.get(id) ?? null;
  }

  async upsertTrigger(trigger: Omit<NotificationTrigger, 'updatedAt'>): Promise<NotificationTrigger> {
    for (const channel of trigger.channels) {
      const templateId = trigger.templateBindings[channel];
      if (templateId && !this.templates.has(templateId)) {
        throw new Error(`Template ${templateId} for channel ${channel} not found`);
      }
    }

    const updated: NotificationTrigger = {
      ...trigger,
      updatedAt: new Date().toISOString(),
    };
    this.triggers.set(updated.id, updated);
    if (!this.triggerLogs.has(updated.id)) {
      this.triggerLogs.set(updated.id, []);
    }
    return updated;
  }

  async removeTrigger(id: string): Promise<void> {
    this.triggers.delete(id);
    this.triggerLogs.delete(id);
  }

  async recordTriggerExecution(
    triggerId: string,
    status: TriggerExecutionStatus,
    options: {
      eventPayloadId: string;
      notes?: string;
      channelDeliveries?: Partial<Record<NotificationChannel, NotificationDeliveryRecord>>;
    },
  ): Promise<NotificationTriggerLogEntry> {
    if (!this.triggers.has(triggerId)) {
      throw new Error(`Trigger ${triggerId} not found`);
    }

    const entry: NotificationTriggerLogEntry = {
      id: `${triggerId}-${Date.now()}`,
      triggerId,
      status,
      recordedAt: new Date().toISOString(),
      eventPayloadId: options.eventPayloadId,
      notes: options.notes,
      channelDeliveries: options.channelDeliveries,
    };

    const history = this.triggerLogs.get(triggerId) ?? [];
    history.push(entry);
    this.triggerLogs.set(triggerId, history);
    return entry;
  }

  async getTriggerLog(triggerId: string): Promise<NotificationTriggerLogEntry[]> {
    return this.triggerLogs.get(triggerId) ?? [];
  }
}

let adapterInstance: NotificationAdapter | null = null;

export const getNotificationAdapter = (): NotificationAdapter => {
  if (!adapterInstance) {
    adapterInstance = new InMemoryNotificationAdapter();
  }
  return adapterInstance;
};

export const resetNotificationAdapter = () => {
  adapterInstance = null;
};

export const createTestNotificationAdapter = () => new InMemoryNotificationAdapter();
