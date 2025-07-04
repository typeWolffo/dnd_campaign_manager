// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

// Typy elementów mapy
const ELEMENT_TYPES = {
  FLOOR: "floor",
  WALL: "wall",
  CLIFF: "cliff",
  DOOR: "door",
  WATER: "water",
  STAIRS: "stairs",
};

// Definicje elementów z ich właściwościami łączenia
const ELEMENT_DEFINITIONS = {
  [ELEMENT_TYPES.FLOOR]: {
    name: "Podłoga",
    color: 0x8b4513,
    height: 0.1,
    connections: { top: true, bottom: true, left: true, right: true },
  },
  [ELEMENT_TYPES.WALL]: {
    name: "Ściana",
    color: 0x666666,
    height: 3,
    connections: { top: false, bottom: false, left: true, right: true },
  },
  [ELEMENT_TYPES.CLIFF]: {
    name: "Klif",
    color: 0x654321,
    height: 5,
    connections: { top: true, bottom: true, left: true, right: true },
  },
  [ELEMENT_TYPES.DOOR]: {
    name: "Drzwi",
    color: 0x8b4513,
    height: 2.5,
    connections: { top: false, bottom: false, left: true, right: true },
  },
  [ELEMENT_TYPES.WATER]: {
    name: "Woda",
    color: 0x4169e1,
    height: 0.05,
    connections: { top: true, bottom: true, left: true, right: true },
  },
  [ELEMENT_TYPES.STAIRS]: {
    name: "Schody",
    color: 0x888888,
    height: 2,
    connections: { top: true, bottom: true, left: false, right: false },
  },
};

const DnDMapBuilder = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [selectedTool, setSelectedTool] = useState(ELEMENT_TYPES.FLOOR);
  const [mapData, setMapData] = useState(new Map());
  const [hoveredPosition, setHoveredPosition] = useState(null);

  // Inicjalizacja sceny Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // Scena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    sceneRef.current = scene;

    // Kamera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Oświetlenie
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Siatka pomocnicza
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x444444);
    scene.add(gridHelper);

    // Płaszczyzna do raycasting
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.name = "groundPlane";
    scene.add(plane);

    mountRef.current.appendChild(renderer.domElement);

    // Podstawowe kontrolki kamery
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      if (event.button === 2) {
        // Prawy przycisk myszy
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event) => {
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };

        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi += deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("wheel", handleWheel);
    renderer.domElement.addEventListener("contextmenu", (e) =>
      e.preventDefault(),
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.dispose();
    };
  }, []);

  // Funkcja do tworzenia geometrii elementu z automatycznym łączeniem
  const createElementGeometry = (type, position, connections = {}) => {
    const definition = ELEMENT_DEFINITIONS[type];
    let geometry;

    switch (type) {
      case ELEMENT_TYPES.FLOOR:
        geometry = new THREE.BoxGeometry(1, definition.height, 1);
        break;
      case ELEMENT_TYPES.WALL:
        geometry = new THREE.BoxGeometry(1, definition.height, 0.2);
        break;
      case ELEMENT_TYPES.CLIFF:
        geometry = new THREE.BoxGeometry(1, definition.height, 1);
        break;
      case ELEMENT_TYPES.DOOR:
        // Drzwi z otworem
        const doorShape = new THREE.Shape();
        doorShape.moveTo(-0.5, 0);
        doorShape.lineTo(0.5, 0);
        doorShape.lineTo(0.5, definition.height);
        doorShape.lineTo(-0.5, definition.height);
        doorShape.lineTo(-0.5, 0);

        // Otwór na drzwi
        const doorHole = new THREE.Path();
        doorHole.moveTo(-0.3, 0.1);
        doorHole.lineTo(0.3, 0.1);
        doorHole.lineTo(0.3, 2.2);
        doorHole.lineTo(-0.3, 2.2);
        doorHole.lineTo(-0.3, 0.1);
        doorShape.holes.push(doorHole);

        geometry = new THREE.ExtrudeGeometry(doorShape, {
          depth: 0.2,
          bevelEnabled: false,
        });
        break;
      case ELEMENT_TYPES.WATER:
        geometry = new THREE.BoxGeometry(1, definition.height, 1);
        break;
      case ELEMENT_TYPES.STAIRS:
        // Schody jako seria stopni
        geometry = new THREE.BoxGeometry(1, definition.height, 1);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, definition.height, 1);
    }

    return geometry;
  };

  // Funkcja do tworzenia materiału z teksturą
  const createElementMaterial = (type) => {
    const definition = ELEMENT_DEFINITIONS[type];

    let material;
    if (type === ELEMENT_TYPES.WATER) {
      material = new THREE.MeshPhongMaterial({
        color: definition.color,
        transparent: true,
        opacity: 0.7,
        shininess: 100,
      });
    } else {
      material = new THREE.MeshLambertMaterial({
        color: definition.color,
      });
    }

    return material;
  };

  // Funkcja do sprawdzania sąsiadów i automatycznego dostosowywania
  const getNeighborConnections = (x, z) => {
    const neighbors = {
      top: mapData.get(`${x},${z + 1}`),
      bottom: mapData.get(`${x},${z - 1}`),
      left: mapData.get(`${x - 1},${z}`),
      right: mapData.get(`${x + 1},${z}`),
    };
    return neighbors;
  };

  // Funkcja do aktualizacji połączeń sąsiadów
  const updateNeighborConnections = (x, z) => {
    const positions = [
      { x: x, z: z + 1 }, // top
      { x: x, z: z - 1 }, // bottom
      { x: x - 1, z: z }, // left
      { x: x + 1, z: z }, // right
    ];

    positions.forEach((pos) => {
      const key = `${pos.x},${pos.z}`;
      const neighbor = mapData.get(key);
      if (neighbor) {
        // Usuń stary mesh
        sceneRef.current.remove(neighbor.mesh);

        // Stwórz nowy z zaktualizowanymi połączeniami
        const connections = getNeighborConnections(pos.x, pos.z);
        const geometry = createElementGeometry(neighbor.type, pos, connections);
        const material = createElementMaterial(neighbor.type);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(pos.x, neighbor.mesh.position.y, pos.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        sceneRef.current.add(mesh);

        // Aktualizuj dane
        neighbor.mesh = mesh;
        neighbor.connections = connections;
      }
    });
  };

  // Funkcja do umieszczania elementu
  const placeElement = (x, z) => {
    const key = `${x},${z}`;

    // Usuń istniejący element jeśli istnieje
    if (mapData.has(key)) {
      sceneRef.current.remove(mapData.get(key).mesh);
    }

    const definition = ELEMENT_DEFINITIONS[selectedTool];
    const connections = getNeighborConnections(x, z);
    const geometry = createElementGeometry(selectedTool, { x, z }, connections);
    const material = createElementMaterial(selectedTool);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, definition.height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRef.current.add(mesh);

    // Zapisz do danych mapy
    setMapData((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, {
        type: selectedTool,
        position: { x, z },
        mesh: mesh,
        connections: connections,
      });
      return newMap;
    });

    // Aktualizuj sąsiadów
    setTimeout(() => updateNeighborConnections(x, z), 0);
  };

  // Obsługa kliknięcia na mapę
  const handleCanvasClick = useCallback(
    (event) => {
      if (!rendererRef.current || !cameraRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const groundPlane = sceneRef.current.getObjectByName("groundPlane");

      if (groundPlane) {
        const intersects = raycasterRef.current.intersectObject(groundPlane);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          const gridX = Math.round(point.x);
          const gridZ = Math.round(point.z);
          placeElement(gridX, gridZ);
        }
      }
    },
    [selectedTool],
  );

  // Obsługa hover
  const handleCanvasMouseMove = useCallback((event) => {
    if (!rendererRef.current || !cameraRef.current) return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const groundPlane = sceneRef.current.getObjectByName("groundPlane");

    if (groundPlane) {
      const intersects = raycasterRef.current.intersectObject(groundPlane);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const gridX = Math.round(point.x);
        const gridZ = Math.round(point.z);
        setHoveredPosition({ x: gridX, z: gridZ });
      }
    }
  }, []);

  // Dodaj event listenery
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
    };
  }, [handleCanvasClick, handleCanvasMouseMove]);

  // Funkcja czyszczenia mapy
  const clearMap = () => {
    mapData.forEach((element) => {
      sceneRef.current.remove(element.mesh);
    });
    setMapData(new Map());
  };

  // Funkcja eksportu mapy
  const exportMap = () => {
    const exportData = Array.from(mapData.entries()).map(([key, value]) => ({
      key,
      type: value.type,
      position: value.position,
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dnd-map.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* Panel narzędzi */}
      <div className="w-64 overflow-y-auto bg-gray-800 p-4">
        <h2 className="mb-4 text-xl font-bold">D&D Map Builder</h2>

        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">Narzędzia</h3>
          <div className="space-y-2">
            {Object.entries(ELEMENT_DEFINITIONS).map(([type, definition]) => (
              <button
                key={type}
                onClick={() => setSelectedTool(type)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selectedTool === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className="mr-3 h-4 w-4 rounded"
                    style={{
                      backgroundColor: `#${definition.color.toString(16).padStart(6, "0")}`,
                    }}
                  />
                  {definition.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold">Działania</h3>
          <div className="space-y-2">
            <button
              onClick={clearMap}
              className="w-full rounded-lg bg-red-600 p-3 transition-colors hover:bg-red-700"
            >
              Wyczyść mapę
            </button>
            <button
              onClick={exportMap}
              className="w-full rounded-lg bg-green-600 p-3 transition-colors hover:bg-green-700"
            >
              Eksportuj mapę
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Informacje</h3>
          <div className="text-sm text-gray-300">
            <p>Elementy: {mapData.size}</p>
            <p>Aktualnie: {ELEMENT_DEFINITIONS[selectedTool]?.name}</p>
            {hoveredPosition && (
              <p>
                Pozycja: {hoveredPosition.x}, {hoveredPosition.z}
              </p>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-400">
          <p>Sterowanie:</p>
          <p>• LPM - umieść element</p>
          <p>• PPM + przeciągnij - obróć kamerę</p>
          <p>• Scroll - przybliż/oddal</p>
        </div>
      </div>

      {/* Obszar renderowania */}
      <div className="relative flex-1">
        <div ref={mountRef} className="h-full w-full" />

        {/* Overlay z informacjami */}
        <div className="bg-opacity-50 absolute top-4 right-4 rounded-lg bg-black p-4">
          <h3 className="mb-2 text-lg font-semibold">Aktualny element</h3>
          <div className="flex items-center">
            <div
              className="mr-3 h-6 w-6 rounded"
              style={{
                backgroundColor: `#${ELEMENT_DEFINITIONS[selectedTool]?.color.toString(16).padStart(6, "0")}`,
              }}
            />
            <span>{ELEMENT_DEFINITIONS[selectedTool]?.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DnDMapBuilder;
