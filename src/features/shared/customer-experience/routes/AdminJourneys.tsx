import { JourneyCanvas } from '../components/JourneyCanvas';
import { useJourneys } from '../hooks/useJourneys';

export const AdminJourneys = () => {
  const { journeys, dryRuns } = useJourneys();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Journeys & automation</h2>
        <p className="text-sm text-muted">Orchestrate proactive outreach with explainable dry runs.</p>
      </header>
      <div className="space-y-6">
        {journeys.map((journey, index) => (
          <JourneyCanvas key={journey.id} journey={journey} dryRun={dryRuns[index]?.results} />
        ))}
      </div>
    </div>
  );
};

export default AdminJourneys;
