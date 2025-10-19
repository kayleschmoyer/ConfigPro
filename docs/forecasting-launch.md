# AI Forecasting Launch Guide

ConfigPro now ships with a shared AI Forecasting workspace that mirrors the Scheduling launch experience. Use this guide to tailor the demo narrative and activate the feature for customer pilots.

## 1. Bootstrapping the Forecasting Workspace
- Navigate to `/forecasting/studio` to see the demand studio experience.
- The workspace auto-loads the `Spring demand boost` scenario with:
  - Baseline demand signals defined in `src/data/demoForecastingData.ts`.
  - AuroraDemandNet model metadata and accuracy scores.
  - Assumptions and external influences used to generate uplift.
- Update the dataset to reflect your customer, region, and typical planning horizon.

## 2. Demand Studio Walkthrough
- The strategic overview cards summarise projected volume, uplift, confidence blend, and variance.
- Channel mix intelligence breaks down omni-channel share, perfect for demonstrating how planning feeds staffing.
- The influence panel highlights events and macro inputs layered on top of the baseline.
- Scenario comparisons show how each playbook performs vs. the baseline, exposing the automation-ready metrics.

## 3. Scenario Workbench Tour
- The workbench surfaces an `Omni-channel expansion` scenario alongside the baseline play.
- Tuning assumptions adds +2% uplift and increases confidence, illustrating collaborative controls.
- Appending live signals simulates streaming data ingestion that refreshes projections in real time.
- Automation hand-off cards explain how forecasting connects to labour, inventory, and marketing automations.

## 4. Extend the Story
- Add new scenarios by cloning `buildOmniScenario` in `ScenarioWorkbench.tsx` or via the `ForecastingApi`.
- Integrate real demand or marketing signals by replacing `demoBaselineSignals` with live feeds.
- Pair with scheduling by highlighting how coverage insights consume the forecasted demand.

Launch-ready positioning now covers both Scheduling and Forecasting, giving teams an elite, end-to-end operations narrative.
