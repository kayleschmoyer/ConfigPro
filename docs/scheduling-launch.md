# AI Scheduling Launch Guide

## Configuration checklist

1. **Connect data feeds**
   - Staff directory: ensure `StaffProfile` records include qualifications, availability, and labor categories.
   - Labor regulations: map jurisdictional rules to `LaborLawRule` entries and flag severity levels.
   - Demand forecasts: select a forecasting service (baseline or composite) and schedule nightly runs.
2. **Enable optimization service**
   - Choose `GreedyScheduleOptimizationService` or register a custom implementation via `ScheduleOptimizationService`.
   - Configure max shifts per day and qualification requirements per location.
3. **Activate observability**
   - Register metric listeners using `registerMetricListener` to ship metrics to your telemetry stack.
   - Track `schedule.accuracy` and `schedule.fulfillment` for launch dashboards.

## Migration path

- Import historical rosters into the shared `SchedulingContext` schema. Use the `createSchedulingContext` helper to produce drafts.
- Mirror existing approval workflows by mapping your endpoints onto the new scheduling API (draft → publish → swap → rollback).
- Run both the legacy scheduler and AI scheduler in parallel for two cycles. Compare coverage heatmaps and compliance outcomes before full cutover.

## Demo data

The application ships with demo staff, labor rules, and forecast data defined in `src/data/demoSchedulingData.ts`. These power the manager console and employee portal for workshops or sales demos. Update the dataset with your brand voice and business units for tailored walkthroughs.

## Launch checklist

- [ ] Complete integration tests against `/scheduling` routes.
- [ ] Configure alerting on compliance breaches via the metrics API.
- [ ] Record a Loom walkthrough highlighting manager and employee experiences.
- [ ] Publish internal enablement docs linking to this guide.
