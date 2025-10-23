import { Scene, AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, Path, Shape, ExtrudeGeometry } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import type { BlueprintProject } from '../state/store';

const createWallMesh = (
  wall: { a: { x: number; y: number }; b: { x: number; y: number }; thickness: number },
  height: number,
  elevation: number,
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
  geometry.translate(0, elevation, -wall.thickness / 2);
  const angle = Math.atan2(wall.b.y - wall.a.y, wall.b.x - wall.a.x);
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color: 0x4f46e5 }));
  mesh.position.set(wall.a.x, 0, -wall.a.y);
  mesh.rotation.set(0, -angle, 0);
  return mesh;
};

export const exportGltf = (project: BlueprintProject, filename = 'blueprint.gltf') =>
  new Promise<void>((resolve, reject) => {
    const scene = new Scene();
    scene.add(new AmbientLight(0xffffff, 0.7));
    const light = new DirectionalLight(0xffffff, 0.8);
    light.position.set(20, 30, 10);
    scene.add(light);

    const openingsByWall = project.openings.reduce<Record<string, { offset: number; width: number }[]>>((acc, opening) => {
      if (!acc[opening.wallId]) {
        acc[opening.wallId] = [];
      }
      acc[opening.wallId].push({ offset: opening.offset, width: opening.width });
      return acc;
    }, {});

    project.floors.forEach((floor) => {
      project.walls
        .filter((wall) => wall.levelId === floor.id)
        .forEach((wall) => {
          const mesh = createWallMesh(wall, floor.height, floor.elevation, openingsByWall[wall.id] ?? []);
          if (mesh) {
            scene.add(mesh);
          }
        });
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf: ArrayBuffer | object) => {
        const data = gltf instanceof ArrayBuffer ? gltf : JSON.stringify(gltf, null, 2);
        const blob = new Blob([data], { type: 'model/gltf+json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        resolve();
      },
      (error: unknown) => {
        console.error('Failed to export glTF', error);
        reject(error);
      },
      { binary: false },
    );
  });
