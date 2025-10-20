export interface Notifier {
  id: "smtp" | "twilio" | "console";
  send(to: string, template: string, params: Record<string, string>): Promise<void>;
}

const registry = new Map<string, Notifier>();

export const registerNotifier = (notifier: Notifier) =>
  registry.set(notifier.id, notifier);

export const notifier = (id: string) => registry.get(id)!;
