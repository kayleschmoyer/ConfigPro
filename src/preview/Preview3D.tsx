import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ExtrudeGeometry, Path, Shape } from 'three';
import { useBlueprintStore } from '../state/store';

interface WallMeshData {
  id: string;
  geometry: ExtrudeGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}

const createWallGeometry = (
  wall: { a: { x: number; y: number }; b: { x: number; y: number }; thickness: number },
  height: number,
  openings: { offset: number; width: number }[],
) => {
  const length = Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y);
  if (length <= 0) return null;
  const shape = new Shape();
  const half = wall.thickness / 2;
  shape.moveTo(0, -half);
  shape.lineTo(length, -half);
  shape.lineTo(length, half);
  shape.lineTo(0, half);
  shape.lineTo(0, -half);
  openings.forEach((opening) => {
    const start = Math.max(0, opening.offset);
    const end = Math.min(opening.offset + opening.width, length);
    if (end <= start) return;
    const hole = new Path();
    hole.moveTo(start, -half);
    hole.lineTo(end, -half);
    hole.lineTo(end, half);
    hole.lineTo(start, half);
    hole.lineTo(start, -half);
    shape.holes.push(hole);
  });
  const geometry = new ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2);
  return geometry;
};

const Preview3D = () => {
  const preview3D = useBlueprintStore((state) => state.preview3D);
  const floors = useBlueprintStore((state) => state.floors);
  const walls = useBlueprintStore((state) => state.walls);
  const openings = useBlueprintStore((state) => state.openings);

  const wallList = useMemo(() => Object.values(walls), [walls]);
  const openingList = useMemo(() => Object.values(openings), [openings]);

  const meshes = useMemo(() => {
    const list: WallMeshData[] = [];
    floors.forEach((floor, index) => {
      const wallsForFloor = wallList.filter((wall) => wall.levelId === floor.id);
      wallsForFloor.forEach((wall) => {
        const openingsForWall = openingList.filter((opening) => opening.wallId === wall.id);
        const geometry = createWallGeometry(wall, floor.height, openingsForWall);
        if (!geometry) return;
        geometry.translate(0, 0, -wall.thickness / 2);
        const angle = Math.atan2(wall.b.y - wall.a.y, wall.b.x - wall.a.x);
        const meshData: WallMeshData = {
          id: `${floor.id}-${wall.id}`,
          geometry,
          position: [wall.a.x, floor.elevation, -wall.a.y],
          rotation: [0, -angle, 0],
          color: index % 2 === 0 ? '#38bdf8' : '#22d3ee',
        };
        list.push(meshData);
      });
    });
    return list;
  }, [floors, wallList, openingList]);

  if (!preview3D) {
    return null;
  }

  return (
    <div className="preview3d">
      <Canvas camera={{ position: [25, 20, 25], fov: 45 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[20, 30, 10]} intensity={0.8} castShadow />
          {meshes.map((mesh) => (
            <mesh key={mesh.id} position={mesh.position} rotation={mesh.rotation} castShadow receiveShadow>
              <primitive object={mesh.geometry} attach="geometry" />
              <meshStandardMaterial color={mesh.color} />
            </mesh>
          ))}
          <gridHelper args={[100, 100, '#4b5563', '#1f2937']} position={[0, -0.01, 0]} />
          <OrbitControls enableDamping />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Preview3D;
