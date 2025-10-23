import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers3, Orbit, Radar, Sparkles, SquareStack, Cuboid, Ruler, Satellite } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';

const cosmicBackdrop =
  'bg-[#020313] bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),rgba(2,3,19,0)_55%),radial-gradient(circle_at_80%_30%,rgba(192,132,252,0.22),rgba(2,3,19,0)_60%),radial-gradient(circle_at_50%_110%,rgba(14,165,233,0.15),rgba(2,3,19,0)_70%)]';

const glassPanel =
  'border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_60px_rgba(45,212,191,0.08)]';

type FlowStatus = 'locked' | 'draft' | 'beta';

type FloorSystem = {
  label: string;
  value: string;
};

type FloorRoom = {
  name: string;
  area: string;
  focus: string;
  nodes: string;
  experience: string;
};

type FloorFlow = {
  stage: string;
  description: string;
  status: FlowStatus;
};

type FloorBlueprint = {
  id: string;
  level: string;
  codename: string;
  summary: string;
  modules: string[];
  systems: FloorSystem[];
  rooms: FloorRoom[];
  flows: FloorFlow[];
};

const flowStatusStyles: Record<FlowStatus, string> = {
  locked: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  draft: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  beta: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
};

const floorBlueprints: FloorBlueprint[] = [
  {
    id: 'arrival',
    level: 'Level 01',
    codename: 'Flux Arrival Nexus',
    summary:
      'Volumetric welcome theater choreographed with responsive lighting, biometric concierge, and kinetic guidance into the residence core.',
    modules: [
      'Immersive lobby theatre',
      'Holographic concierge',
      'Drone valet pads',
      'Adaptive signage ribbon',
    ],
    systems: [
      { label: 'Nanogrid', value: '88% regenerative loop' },
      { label: 'Occupancy', value: 'Live guests · 68% capacity' },
      { label: 'Wayfinding AI', value: 'Pathing · 12 micro-routes open' },
    ],
    rooms: [
      {
        name: 'Kinetic Lobby Theater',
        area: '2,400 sq ft',
        focus: 'Orientation & welcome ritual',
        nodes: '12 volumetric projectors',
        experience:
          'Stage the arrival sequence with adaptive audio halos, drone valet handoff, and holographic concierge for every guest persona.',
      },
      {
        name: 'Orientation Gallery',
        area: '1,120 sq ft',
        focus: 'Digital twin handshake',
        nodes: 'LiDAR lane + biometric column',
        experience:
          'Transition visitors into the residence digital twin. Capture biometrics, calibrate lighting preferences, and sync security tokens in 29 seconds.',
      },
      {
        name: 'Vertical Transit Gate',
        area: '980 sq ft',
        focus: 'Lift + drone shuttle pad',
        nodes: '4 lift cores · 2 drone docks',
        experience:
          'Route high-priority residents via magnetic lift columns or drone shuttle lanes with real-time queue transparency.',
      },
    ],
    flows: [
      {
        stage: 'Arrival handshake',
        description: 'Autonomous valet sync triggers biometric warm-up and orientation queue orchestration.',
        status: 'locked',
      },
      {
        stage: 'Immersion brief',
        description: 'Spatial audio ring introduces home amenities with resident-specific narrative overlays.',
        status: 'beta',
      },
      {
        stage: 'Transit assignment',
        description: 'Adaptive routing decides lift, drone, or kinetic stairs within 4.2 seconds.',
        status: 'draft',
      },
    ],
  },
  {
    id: 'living',
    level: 'Level 02',
    codename: 'Echelon Living Atrium',
    summary:
      'Hyper-flex gathering floor with modular walls, climate bubbles, and ambient sonic textures for day-to-night living.',
    modules: [
      'Modular lounge halos',
      'Spectral kitchen lab',
      'Atrium rainforest core',
      'Ambient acoustic shields',
    ],
    systems: [
      { label: 'Climate bubbles', value: '3 active · 72°F / 68°F / 60°F' },
      { label: 'Sonic ambience', value: '8D audio · mode Aurora' },
      { label: 'Privacy glass', value: 'Tint sync · 0.8 opacity' },
    ],
    rooms: [
      {
        name: 'Adaptive Lounge Halo',
        area: '1,860 sq ft',
        focus: 'Community living capsule',
        nodes: 'Magnetic walls · 18 sensor nodes',
        experience:
          'Switch from sunrise co-working to midnight cinema with panel gestures. Each segment remembers acoustic and lighting scenes.',
      },
      {
        name: 'Spectral Culinary Lab',
        area: '1,320 sq ft',
        focus: 'Generative kitchen + chef AI',
        nodes: '6 robotic surfaces · olfactory grid',
        experience:
          'Blend molecular dining, nutrition tracking, and guest choreography with multi-sensory overlays and drone plating pads.',
      },
      {
        name: 'Atrium Rainforest Core',
        area: '1,540 sq ft',
        focus: 'Biophilic recharge chamber',
        nodes: 'Mist canopy · climate loops',
        experience:
          'Biofeedback canopy adjusts humidity, airflow, and light refraction to match resident recovery and wellness protocols.',
      },
    ],
    flows: [
      {
        stage: 'Scene morph',
        description: 'Pre-built mood recipes shift furniture topology and lighting across the atrium instantly.',
        status: 'locked',
      },
      {
        stage: 'Guest synchrony',
        description: 'Invited guests sync their wearable data to align playlists, privacy, and nutrition allowances.',
        status: 'beta',
      },
      {
        stage: 'Night drift',
        description: 'Autonomous partitions seal sections, recalibrating energy loops for evening minimal footprint.',
        status: 'draft',
      },
    ],
  },
  {
    id: 'innovation',
    level: 'Level 03',
    codename: 'Quantum Innovation Deck',
    summary:
      'Prototype lab with volumetric collaboration pods, materials library, and lightfield projection stage for live co-design.',
    modules: [
      'Lightfield co-lab pods',
      'Materials observatory',
      'Holo-whiteboard array',
      'Rapid prototyping spine',
    ],
    systems: [
      { label: 'Prototype velocity', value: '6 builds / day' },
      { label: 'Collab pods', value: '4 pods · all online' },
      { label: 'Security mesh', value: 'Quantum key · synched' },
    ],
    rooms: [
      {
        name: 'Volumetric Collaboration Pods',
        area: '1,100 sq ft',
        focus: 'Distributed team immersion',
        nodes: '4 pods · photon displays',
        experience:
          'Spin 3D models mid-air, annotate with haptic stylus, and stream edits to remote teams with zero latency.',
      },
      {
        name: 'Materials Observatory',
        area: '940 sq ft',
        focus: 'Smart inventory + testing',
        nodes: 'Spectral scanners · nano lab',
        experience:
          'Run instant durability simulations, store-lab results, and preview finish options with holographic textures.',
      },
      {
        name: 'Rapid Build Spine',
        area: '1,260 sq ft',
        focus: 'Robotic prototyping lane',
        nodes: 'CNC rail · print farm',
        experience:
          'Robotic arms, drone inspectors, and nano-printers orchestrate to output prototypes ready for same-day review.',
      },
    ],
    flows: [
      {
        stage: 'Concept intake',
        description: 'Whiteboard array captures intent and spins baseline geometries in under 90 seconds.',
        status: 'locked',
      },
      {
        stage: 'Simulate + iterate',
        description: 'AI scenario engine stress-tests variations while teams co-edit in volumetric pods.',
        status: 'locked',
      },
      {
        stage: 'Launch review',
        description: 'Executes a choreographed reveal with lighting cues, playback, and investor streaming.',
        status: 'beta',
      },
    ],
  },
  {
    id: 'retreat',
    level: 'Level 04',
    codename: 'Stratos Retreat Level',
    summary:
      'Personal recharge suites, orbital wellness observatory, and starlight terrace for peak restoration moments.',
    modules: [
      'Orbital wellness observatory',
      'Hydrofloat recovery pods',
      'Sky terrace runway',
      'Dream analytics loft',
    ],
    systems: [
      { label: 'Circadian lighting', value: 'Aurora · sync confirmed' },
      { label: 'Wellness pods', value: '5 pods · 2 in session' },
      { label: 'Privacy shields', value: 'Acoustic veil 97%' },
    ],
    rooms: [
      {
        name: 'Hydrofloat Recovery Suite',
        area: '880 sq ft',
        focus: 'Microgravity hydrotherapy',
        nodes: '3 float capsules · AI breath coach',
        experience:
          'Zero-gravity float capsules analyze biometrics and adapt aromatics, visuals, and guided breathwork in real-time.',
      },
      {
        name: 'Starlight Observation Terrace',
        area: '1,400 sq ft',
        focus: 'Panoramic night vistas',
        nodes: 'Retractable dome · star tracker',
        experience:
          'Dynamic canopy projects constellations, orchestrated with ambient soundscapes mapped to the night sky.',
      },
      {
        name: 'Dream Analytics Loft',
        area: '960 sq ft',
        focus: 'Sleep lab + mood studio',
        nodes: 'Neural mesh · scent array',
        experience:
          'Capture dream telemetry, visualize wellness trends, and script morning light choreography tailored per resident.',
      },
    ],
    flows: [
      {
        stage: 'Arrival decompress',
        description: 'Soft gradient lighting cools body temperature while aromatics tune circadian alignment.',
        status: 'beta',
      },
      {
        stage: 'Wellness protocol',
        description: 'Recovery pods select breathwork sequences matched to biometric readiness.',
        status: 'locked',
      },
      {
        stage: 'Dawn launch',
        description: 'Dream analytics trigger sunrise scenes across lower floors and send morning digest.',
        status: 'draft',
      },
    ],
  },
];

const immersivePerspectives = [
  {
    title: 'Orbital overview',
    description: 'Spin the residence in full 3D, peel back facades, and tag structural edits with instant clash detection.',
    icon: Orbit,
    gradient: 'from-sky-400/70 to-cyan-300/50',
    glow: 'from-sky-400/50 via-transparent to-transparent',
  },
  {
    title: 'Room zoom-in',
    description: 'Dive through walls into a volumetric room model with live sensor data, finish swatches, and occupancy overlays.',
    icon: Radar,
    gradient: 'from-purple-400/70 to-fuchsia-300/50',
    glow: 'from-purple-400/50 via-transparent to-transparent',
  },
  {
    title: 'Floor choreography',
    description: 'Animate foot traffic, drone routes, and logistics paths to balance flow and energy usage in one glance.',
    icon: Layers3,
    gradient: 'from-emerald-400/70 to-teal-300/50',
    glow: 'from-emerald-400/50 via-transparent to-transparent',
  },
  {
    title: 'Atmosphere scripting',
    description: 'Blend lighting, climate, and audio presets per room, then preview transitions with AI-generated mood reels.',
    icon: Sparkles,
    gradient: 'from-amber-400/70 to-orange-300/50',
    glow: 'from-amber-400/50 via-transparent to-transparent',
  },
];

const creationStreams = [
  {
    title: 'Procedural walls & zoning',
    details: 'Sketch circulation, drag partitions in 3D, and let the generator align HVAC, lighting, and acoustic paths automatically.',
    icon: SquareStack,
  },
  {
    title: 'Spatial intelligence overlays',
    details: 'Live telemetry feeds reveal temperature bands, occupancy density, and sound dampening per micro-zone.',
    icon: Radar,
  },
  {
    title: 'Materiality composer',
    details: 'Swap finishes with spectral accuracy, project textures on surfaces, and export bill-of-materials instantly.',
    icon: Cuboid,
  },
  {
    title: 'Precision measurement suite',
    details: 'Laser-accurate measurement anchors, AR cloud alignment, and compliance checks tuned to local codes.',
    icon: Ruler,
  },
  {
    title: 'Satellite sync engine',
    details: 'Push updates to contractors, VR viewers, and on-site drones with real-time change intelligence.',
    icon: Satellite,
  },
];

const threeDStackVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export const FuturisticBlueprintCreatorPage = () => {
  const [activeFloorId, setActiveFloorId] = useState<string>(floorBlueprints[1]?.id ?? floorBlueprints[0]?.id);
  const activeFloor = useMemo(
    () => floorBlueprints.find((floor) => floor.id === activeFloorId) ?? floorBlueprints[0],
    [activeFloorId],
  );
  const [activeRoomName, setActiveRoomName] = useState<string>(activeFloor.rooms[0]?.name ?? '');

  useEffect(() => {
    setActiveRoomName(activeFloor.rooms[0]?.name ?? '');
  }, [activeFloor]);

  const activeRoom = useMemo(
    () => activeFloor.rooms.find((room) => room.name === activeRoomName) ?? activeFloor.rooms[0],
    [activeFloor, activeRoomName],
  );

  return (
    <div className={cn('relative min-h-screen text-white', cosmicBackdrop)}>
      <div className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-transparent blur-[140px]" />
      <div className="absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
      <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 pb-24 pt-16 md:px-10 lg:px-14">
        <section className="relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200">
              Blueprint Hyperstudio
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              Design an orbital-grade home with a <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">3D immersive blueprint creator</span>
            </h1>
            <p className="mt-6 text-base text-muted sm:text-lg">
              Glide floor-by-floor, zoom into every room, and orchestrate futuristic living scenarios with cinematic precision. Your blueprint updates across VR, AR, and contractor dashboards instantly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="h-12 rounded-full px-8 text-lg">
                Launch creator
              </Button>
              <Button variant="outline" size="lg" className="h-12 rounded-full border-cyan-300/40 px-8 text-lg text-cyan-200">
                Preview volumetric tour
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[320px,1fr] xl:grid-cols-[360px,1fr]">
          <aside className="space-y-5">
            <div className={cn('rounded-3xl p-6', glassPanel)}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-500/10">
                  <Layers3 className="h-5 w-5 text-cyan-200" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Floor stack</p>
                  <p className="text-base text-white/80">Select a level to edit</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">
                Each level carries live systems telemetry, occupant flow modeling, and immersive room choreographies you can tune in real-time.
              </p>
            </div>

            <div className="space-y-4">
              {floorBlueprints.map((floor) => {
                const isActive = floor.id === activeFloor.id;

                return (
                  <motion.button
                    key={floor.id}
                    onClick={() => setActiveFloorId(floor.id)}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      'relative w-full overflow-hidden rounded-3xl border px-6 py-6 text-left transition',
                      isActive
                        ? 'border-cyan-300/60 bg-cyan-500/10 shadow-[0_0_45px_rgba(34,211,238,0.25)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-cyan-300/30 hover:bg-white/[0.04]',
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">{floor.level}</span>
                        {isActive ? (
                          <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                            Live edit
                          </span>
                        ) : (
                          <span className="text-xs text-white/40">Tap to enter</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{floor.codename}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{floor.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {floor.modules.map((module) => (
                          <span
                            key={module}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/60"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-8">
            <div className={cn('relative overflow-hidden rounded-[36px] p-8 md:p-10', glassPanel)}>
              <div className="absolute inset-0 rounded-[36px] border border-white/10" />
              <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -bottom-28 right-0 h-64 w-64 translate-x-10 rounded-full bg-purple-500/20 blur-3xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl space-y-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">Active level</p>
                  <h2 className="text-3xl font-semibold text-white md:text-4xl">{activeFloor.codename}</h2>
                  <p className="text-sm text-white/70 md:text-base">{activeFloor.summary}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {activeFloor.systems.map((system) => (
                    <div key={system.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                      <p className="uppercase tracking-[0.28em] text-white/50">{system.label}</p>
                      <p className="mt-2 text-sm text-white">{system.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ perspective: '1600px' }} className="relative mt-10 h-[320px] w-full">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transformStyle: 'preserve-3d', transform: 'rotateX(58deg) rotateZ(-6deg) translateY(-20px)' }}
                  initial="initial"
                  animate="animate"
                  variants={threeDStackVariants}
                >
                  {floorBlueprints.map((floor, index) => {
                    const depth = (index - floorBlueprints.indexOf(activeFloor)) * 48;
                    const isActive = floor.id === activeFloor.id;

                    return (
                      <motion.div
                        key={floor.id}
                        className="absolute h-[140px] w-[420px] rounded-[32px] border border-white/10 bg-white/[0.05] shadow-[0_35px_120px_rgba(15,118,110,0.18)]"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translateZ(${depth}px)`,
                          opacity: isActive ? 1 : 0.5,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      >
                        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                        <div className="relative flex h-full w-full flex-col justify-between p-6">
                          <div className="flex items-center justify-between text-xs text-white/70">
                            <span className="uppercase tracking-[0.3em]">{floor.level}</span>
                            <span>{floor.modules[0]}</span>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white">{floor.codename}</p>
                            <p className="mt-1 text-[13px] text-white/70">{floor.summary.slice(0, 80)}…</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              <div className="relative mt-12 grid gap-4 md:grid-cols-3">
                {activeFloor.flows.map((flow) => (
                  <div
                    key={flow.stage}
                    className={cn(
                      'rounded-2xl border px-5 py-4 text-sm text-white/70',
                      flowStatusStyles[flow.status],
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.28em] text-white/60">{flow.stage}</p>
                    <p className="mt-2 text-sm text-white">{flow.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {activeFloor.rooms.map((room) => {
                const isActive = room.name === activeRoom?.name;

                return (
                  <motion.button
                    key={room.name}
                    onClick={() => setActiveRoomName(room.name)}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      'relative overflow-hidden rounded-3xl border px-6 py-6 text-left transition',
                      isActive
                        ? 'border-emerald-300/60 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.25)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-emerald-300/30 hover:bg-white/[0.06]',
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{room.name}</h3>
                          <p className="text-xs uppercase tracking-[0.28em] text-white/60">{room.focus}</p>
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">{room.area}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70">{room.experience}</p>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/50">{room.nodes}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {activeRoom && (
              <div className={cn('relative overflow-hidden rounded-[32px] p-8 md:p-10', glassPanel)}>
                <div className="absolute inset-0 rounded-[32px] border border-white/10" />
                <div className="absolute inset-y-0 right-[-20%] h-full w-1/2 bg-gradient-to-l from-emerald-500/20 via-transparent to-transparent blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-[0.32em] text-white/60">Room deep dive</p>
                    <h3 className="text-3xl font-semibold text-white">{activeRoom.name}</h3>
                    <p className="text-base leading-relaxed text-white/70">{activeRoom.experience}</p>
                  </div>
                  <div className="grid gap-4 text-sm text-white/70 md:w-72">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">Function</p>
                      <p className="mt-2 text-sm text-white">{activeRoom.focus}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">Spatial footprint</p>
                      <p className="mt-2 text-sm text-white">{activeRoom.area}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/60">Sensor mesh</p>
                      <p className="mt-2 text-sm text-white">{activeRoom.nodes}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={cn('relative overflow-hidden rounded-[36px] p-10 md:p-12', glassPanel)}>
          <div className="absolute inset-0 rounded-[36px] border border-white/10" />
          <div className="absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-72 w-72 translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr,420px]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Immersive perspectives</p>
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Navigate the blueprint like an interactive stadium fly-through</h2>
              <p className="text-base text-white/70">
                Move between orbital overviews and per-room zoom-ins with smooth cinematic transitions. Every perspective keeps telemetry, annotations, and contractor-ready specifications aligned.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {immersivePerspectives.map(({ title, description, icon: Icon, gradient, glow }) => (
                  <div key={title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className={cn('absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-60', glow)} />
                    <div className="relative flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white bg-gradient-to-br', gradient)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                      </div>
                      <p className="text-sm text-white/70">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Zoom choreography</p>
                  <p className="text-lg font-semibold text-white">Set orbit paths & cinematic cues</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/70">
                Layer scripted camera paths, focus shifts, and annotation bursts to create guided walkthroughs for clients, engineers, or inspectors.
              </p>
              <div className="mt-6 space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.28em] text-white/50">Flight duration</span>
                  <span className="text-sm text-white">02:48 cinematic tour</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.28em] text-white/50">Key frames</span>
                  <span className="text-sm text-white">12 anchor beats</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.28em] text-white/50">Shared presets</span>
                  <span className="text-sm text-white">VR, AR, contractor HUD</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-4 text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Creation streams</p>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">Everything you need to craft the ultimate futuristic blueprint</h2>
            <p className="mx-auto max-w-3xl text-base text-white/70">
              From procedural walls to satellite-synced updates, ConfigPro turns every floor plan into a living, breathing digital twin connected to every team member.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creationStreams.map(({ title, details, icon: Icon }) => (
              <div key={title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                <div className="relative flex flex-col gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/70">{details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FuturisticBlueprintCreatorPage;
