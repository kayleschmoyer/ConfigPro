import { useInstaller } from './InstallerLayout';
import { FeatureCatalog } from '../components/FeatureCatalog';
import { useCurrencyFormat } from '../../../shared/hooks/useCurrencyFormat';

interface StepSelectFeaturesProps {
  onRegisterSearchFocus: (fn: (() => void) | null) => void;
  selectionOptions: Record<string, Record<string, unknown> | undefined>;
}

export const StepSelectFeatures = ({ onRegisterSearchFocus, selectionOptions }: StepSelectFeaturesProps) => {
  const { catalog, selectedFeatureIds, toggleFeature, updateFeatureOptions, billingVisible, draft, validation } = useInstaller();
  const { formatCurrency } = useCurrencyFormat({ currency: draft.currency, locale: draft.locale });

  return (
    <FeatureCatalog
      catalog={catalog}
      selectedIds={selectedFeatureIds}
      onToggle={toggleFeature}
      onUpdateOptions={updateFeatureOptions}
      billingVisible={billingVisible}
      formatCurrency={(value) => formatCurrency({ currency: draft.currency, value })}
      dependencyMap={validation.dependencies}
      conflictMap={validation.conflicts}
      selectionOptions={selectionOptions}
      onRegisterSearchFocus={(fn) => onRegisterSearchFocus(fn)}
    />
  );
};
