import { useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useBlueprintStore } from '../state/store';
import type { Tool } from '../state/store';
import { exportSvg } from '../export/exportSvg';
import { exportGltf } from '../export/exportGltf';
import { fromUnitsValue, toUnitsValue } from '../utils/geometry';
import type { Units } from '../utils/geometry';

const tools: { key: Tool; label: string }[] = [
  { key: 'select', label: 'Select' },
  { key: 'wall', label: 'Wall' },
  { key: 'door', label: 'Door' },
  { key: 'window', label: 'Window' },
];

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const Toolbar = () => {
  const tool = useBlueprintStore((state) => state.tool);
  const setTool = useBlueprintStore((state) => state.setTool);
  const units = useBlueprintStore((state) => state.units);
  const toggleUnits = useBlueprintStore((state) => state.toggleUnits);
  const floors = useBlueprintStore((state) => state.floors);
  const activeFloorId = useBlueprintStore((state) => state.activeFloorId);
  const setActiveFloor = useBlueprintStore((state) => state.setActiveFloor);
  const addFloor = useBlueprintStore((state) => state.addFloor);
  const removeFloor = useBlueprintStore((state) => state.removeFloor);
  const setFloorHeight = useBlueprintStore((state) => state.setFloorHeight);
  const undo = useBlueprintStore((state) => state.undo);
  const redo = useBlueprintStore((state) => state.redo);
  const exportProject = useBlueprintStore((state) => state.exportProject);
  const importProject = useBlueprintStore((state) => state.importProject);
  const saveToLocalStorage = useBlueprintStore((state) => state.saveToLocalStorage);
  const loadFromLocalStorage = useBlueprintStore((state) => state.loadFromLocalStorage);
  const preview3D = useBlueprintStore((state) => state.preview3D);
  const setPreview3D = useBlueprintStore((state) => state.setPreview3D);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeFloor = useMemo(() => floors.find((floor) => floor.id === activeFloorId), [floors, activeFloorId]);

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const project = JSON.parse(text);
      importProject(project);
    } catch (error) {
      console.error('Failed to import project', error);
    } finally {
      event.target.value = '';
    }
  };

  const handleExportJson = () => {
    const project = exportProject();
    downloadJson(project, 'blueprint.json');
  };

  const handleExportSvg = () => {
    const project = exportProject();
    if (!activeFloorId) return;
    exportSvg(project, activeFloorId, 'blueprint.svg');
  };

  const handleExportGltf = () => {
    const project = exportProject();
    void exportGltf(project, 'blueprint.gltf');
  };

  const handleHeightChange = (event: ChangeEvent<HTMLInputElement>, unitsMode: Units, floorId: string) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    const base = fromUnitsValue(value, unitsMode);
    setFloorHeight(floorId, base);
  };

  const handleLoad = () => {
    const success = loadFromLocalStorage();
    if (!success) {
      window.alert('No saved blueprint found.');
    }
  };

  return (
    <aside className="toolbar">
      <h2>Blueprint Creator</h2>
      <section>
        <h3>Tools</h3>
        <div className="button-group">
          {tools.map((item) => (
            <button
              key={item.key}
              className={item.key === tool ? 'active' : ''}
              onClick={() => setTool(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3>Floors</h3>
        <div className="floor-list">
          {floors.map((floor) => (
            <button
              key={floor.id}
              className={floor.id === activeFloorId ? 'active' : ''}
              onClick={() => setActiveFloor(floor.id)}
            >
              {floor.name}
            </button>
          ))}
        </div>
        {activeFloor && (
          <label className="field">
            <span>Height ({units === 'imperial' ? 'ft' : 'm'})</span>
            <input
              type="number"
              min={0}
              step={units === 'imperial' ? 0.5 : 0.1}
              value={toUnitsValue(activeFloor.height, units).toFixed(2)}
              onChange={(event) => handleHeightChange(event, units, activeFloor.id)}
            />
          </label>
        )}
        <div className="button-row">
          <button onClick={addFloor}>Add floor</button>
          <button onClick={() => removeFloor(activeFloorId)} disabled={floors.length <= 1}>
            Remove
          </button>
        </div>
      </section>
      <section>
        <h3>History</h3>
        <div className="button-row">
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </div>
      </section>
      <section>
        <h3>Units</h3>
        <button onClick={toggleUnits}>{units === 'imperial' ? 'Switch to metric' : 'Switch to imperial'}</button>
      </section>
      <section>
        <h3>Preview</h3>
        <button onClick={() => setPreview3D(!preview3D)}>{preview3D ? 'Show 2D only' : 'Show 3D'}</button>
      </section>
      <section>
        <h3>Export</h3>
        <div className="button-column">
          <button onClick={handleExportJson}>Export JSON</button>
          <button onClick={handleExportSvg}>Export SVG</button>
          <button onClick={handleExportGltf}>Export glTF</button>
        </div>
      </section>
      <section>
        <h3>Import &amp; Save</h3>
        <div className="button-column">
          <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
          <button onClick={saveToLocalStorage}>Save local</button>
          <button onClick={handleLoad}>Load local</button>
        </div>
      </section>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImportChange}
      />
    </aside>
  );
};

export default Toolbar;
