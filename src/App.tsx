import Canvas2D from './editor/Canvas2D';
import Toolbar from './editor/Toolbar';
import Preview3D from './preview/Preview3D';
import { useBlueprintStore } from './state/store';
import './styles.css';

const App = () => {
  const preview3D = useBlueprintStore((state) => state.preview3D);
  return (
    <div className="blueprint-app">
      <Toolbar />
      <div className="workspace">
        <div className="canvas-wrapper">
          <Canvas2D />
        </div>
        {preview3D && (
          <div className="preview-wrapper">
            <Preview3D />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
