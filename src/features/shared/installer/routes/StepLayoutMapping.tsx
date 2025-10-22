import { LayoutMapper } from '../components/LayoutMapper';
import { LayoutPreview } from '../components/LayoutPreview';
import { useInstaller } from './InstallerLayout';

export const StepLayoutMapping = () => {
  const { layoutItems, updateLayout, catalog, validation } = useInstaller();

  return (
    <div className="space-y-8">
      <LayoutMapper
        layout={layoutItems}
        catalog={catalog}
        onChange={updateLayout}
        validationMessages={validation.layout}
      />
      <LayoutPreview layout={layoutItems} catalog={catalog} />
    </div>
  );
};
