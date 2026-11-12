import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Play, Pause, RotateCcw, Sparkles, Layers, ShieldCheck, HeartPulse } from 'lucide-react';

interface Medical3DSceneProps {
  className?: string;
  isDarkMode?: boolean;
  onOpenLiveVoice?: () => void;
  onOpenChatbot?: () => void;
}

export const Medical3DScene: React.FC<Medical3DSceneProps> = ({
  className = '',
  isDarkMode = false,
  onOpenLiveVoice,
  onOpenChatbot
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);
  const [activeTheme, setActiveTheme] = useState<'teal' | 'emerald' | 'blue'>('teal');
  const activeThemeRef = useRef<'teal' | 'emerald' | 'blue'>('teal');
  const [isControlsExpanded, setIsControlsExpanded] = useState(true);

  // Synchronize state with refs for the render loop
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    activeThemeRef.current = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to adapt quality and pacing
    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as any).RENDERER;
        const gpu = String((gl as any).getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 1. Scene, Camera, and Modern Renderer Setup
    const scene = new THREE.Scene();
    const bgColor = isDarkMode ? 0x091420 : 0xf0fdfa;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.045);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.2);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Balanced Studio Lighting Rig (≤ 3 shadow casters)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.8);
    keyLight.position.set(4, 6, 4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.camera.left = -3;
      keyLight.shadow.camera.right = 3;
      keyLight.shadow.camera.top = 3;
      keyLight.shadow.camera.bottom = -3;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 1.2);
    fillLight.position.set(0, 8, 0);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x0d9488, 3.5, 10);
    rimLight.position.set(-3, 3, -2);
    scene.add(rimLight);

    // 4. Contact Shadow Grounding (Procedural radial shadow texture)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: isDarkMode ? 0.65 : 0.4,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.01;
    scene.add(contactShadow);

    // 5. Composite Procedural Medical Subject (3-12 parts inside THREE.Group)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Theme Color Sets
    const THEMES = {
      teal: {
        primary: 0x0d9488,
        secondary: 0x14b8a6,
        accent: 0x5eead4,
        glow: 0x2dd4bf,
        base: 0x1e293b,
      },
      emerald: {
        primary: 0x059669,
        secondary: 0x10b981,
        accent: 0x6ee7b7,
        glow: 0x34d399,
        base: 0x064e3b,
      },
      blue: {
        primary: 0x2563eb,
        secondary: 0x3b82f6,
        accent: 0x93c5fd,
        glow: 0x60a5fa,
        base: 0x1e1b4b,
      },
    };

    // Shared Materials with varied PBR roughness/metalness across adjacent parts
    const currentTheme = THEMES[activeThemeRef.current];

    // Part 1: Primary Silhouette - Beveled Medical Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.22, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x0f172a : 0xe2e8f0,
      metalness: 0.88,
      roughness: 0.16,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.11;
    baseMesh.receiveShadow = !isSoftwareGl;
    masterGroup.add(baseMesh);

    // Part 2: Inner glowing platform ring
    const innerRingGeo = new THREE.TorusGeometry(1.25, 0.04, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: currentTheme.accent,
      emissive: currentTheme.glow,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.1,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, ringMat);
    innerRingMesh.rotation.x = Math.PI / 2;
    innerRingMesh.position.y = 0.23;
    masterGroup.add(innerRingMesh);

    // Part 3: Holographic Column Core (Translucent Medical Scanner Pod)
    const coreGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.8, 32, 1, true);
    const coreMat = new THREE.MeshStandardMaterial({
      color: currentTheme.secondary,
      emissive: currentTheme.primary,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 1.15;
    masterGroup.add(coreMesh);

    // Part 4 & 5: Composite Beveled 3D Medical Cross (Floating Centerpiece)
    const crossGroup = new THREE.Group();
    crossGroup.position.y = 1.25;

    const crossMat = new THREE.MeshPhysicalMaterial({
      color: currentTheme.primary,
      emissive: currentTheme.secondary,
      emissiveIntensity: 0.3,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });

    const vBarGeo = new THREE.BoxGeometry(0.32, 1.0, 0.3);
    const hBarGeo = new THREE.BoxGeometry(1.0, 0.32, 0.3);
    const vBar = new THREE.Mesh(vBarGeo, crossMat);
    const hBar = new THREE.Mesh(hBarGeo, crossMat);
    vBar.castShadow = !isSoftwareGl;
    hBar.castShadow = !isSoftwareGl;
    crossGroup.add(vBar);
    crossGroup.add(hBar);
    masterGroup.add(crossGroup);

    // Part 6 & 7: Dual Orbital Diagnostic Rings (Tilted & Gyroscopic)
    const ringGeo1 = new THREE.TorusGeometry(1.15, 0.032, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: currentTheme.accent,
      emissive: currentTheme.glow,
      emissiveIntensity: 0.6,
      metalness: 0.95,
      roughness: 0.1,
    });
    const orbitalRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    orbitalRing1.position.y = 1.25;
    orbitalRing1.rotation.x = Math.PI / 3;
    masterGroup.add(orbitalRing1);

    const ringGeo2 = new THREE.TorusGeometry(1.35, 0.028, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: currentTheme.secondary,
      emissiveIntensity: 0.45,
      metalness: 0.9,
      roughness: 0.15,
    });
    const orbitalRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitalRing2.position.y = 1.25;
    orbitalRing2.rotation.y = Math.PI / 4;
    masterGroup.add(orbitalRing2);

    // Part 8: DNA Double Helix Structure (Procedural twin spiral rungs & nodes)
    const dnaGroup = new THREE.Group();
    dnaGroup.position.y = 0.35;
    const strandNodeCount = 18;
    const sphereGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const rungGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8);

    const sphereMatA = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: currentTheme.accent,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.7,
    });
    const sphereMatB = new THREE.MeshStandardMaterial({
      color: currentTheme.glow,
      roughness: 0.25,
      metalness: 0.8,
    });
    const rungMat = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x94a3b8 : 0x64748b,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.65,
    });

    for (let i = 0; i < strandNodeCount; i++) {
      const t = (i / strandNodeCount) * Math.PI * 2.2;
      const y = (i / strandNodeCount) * 1.6;
      const radius = 0.42;

      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = -x1;
      const z2 = -z1;

      const nodeA = new THREE.Mesh(sphereGeo, sphereMatA);
      nodeA.position.set(x1, y, z1);
      dnaGroup.add(nodeA);

      const nodeB = new THREE.Mesh(sphereGeo, sphereMatB);
      nodeB.position.set(x2, y, z2);
      dnaGroup.add(nodeB);

      // Connecting genetic rung
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -t;
      dnaGroup.add(rung);
    }
    masterGroup.add(dnaGroup);

    // Part 9: Floating Ambient Medical Particles Field
    const particleCount = 28;
    const particleGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: currentTheme.glow,
      transparent: true,
      opacity: 0.7,
    });
    const particles: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; yBase: number }[] = [];

    for (let p = 0; p < particleCount; p++) {
      const pMesh = new THREE.Mesh(particleGeo, particleMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.3 + Math.random() * 0.9;
      const yBase = 0.4 + Math.random() * 1.6;
      pMesh.position.set(Math.cos(angle) * radius, yBase, Math.sin(angle) * radius);
      scene.add(pMesh);
      particles.push({
        mesh: pMesh,
        angle,
        speed: (0.2 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1),
        radius,
        yBase,
      });
    }

    // Interactive Drag Orbit & Mouse Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.style.touchAction = 'none';
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Pre-allocated scratch variables for lossless 60fps render loop
    const clock = new THREE.Clock();
    let frameId = 0;

    // Software WebGL frame pacing guard
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 40);
        return;
      }
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 40);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    // 6. Lossless Continuous Render Loop (Auto-animates immediately upon launch!)
    function animate() {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Exponential damping for smooth manual interaction
      const dampFactor = 1 - Math.exp(-9 * dt);
      currentRotationY += (targetRotationY - currentRotationY) * dampFactor;
      currentRotationX += (targetRotationX - currentRotationX) * dampFactor;

      // Auto-rotation (always runs automatically as requested)
      if (isPlayingRef.current) {
        targetRotationY += dt * 0.45;
      }

      masterGroup.rotation.y = currentRotationY;
      masterGroup.rotation.x = currentRotationX;

      // Subtle breathing pulse & harmonic kinematics
      const hoverBob = Math.sin(time * 2.2) * 0.07;
      crossGroup.position.y = 1.25 + hoverBob;
      crossGroup.rotation.y = time * 0.6;

      // Gyroscopic orbital rings rotation
      orbitalRing1.rotation.z = time * 0.8;
      orbitalRing1.rotation.y = time * 0.5;
      orbitalRing2.rotation.z = -time * 0.6;
      orbitalRing2.rotation.x = Math.PI / 4 + Math.sin(time * 0.9) * 0.2;

      // DNA rotation
      dnaGroup.rotation.y = -time * 0.4;

      // Particle field orbit
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed * dt;
        p.mesh.position.x = Math.cos(p.angle) * p.radius;
        p.mesh.position.z = Math.sin(p.angle) * p.radius;
        p.mesh.position.y = p.yBase + Math.sin(time * 1.5 + i) * 0.08;
      }

      // Check dynamic theme color updates
      const activePalette = THEMES[activeThemeRef.current];
      if (crossMat.color.getHex() !== activePalette.primary) {
        crossMat.color.setHex(activePalette.primary);
        crossMat.emissive.setHex(activePalette.secondary);
        ringMat.color.setHex(activePalette.accent);
        ringMat.emissive.setHex(activePalette.glow);
        ringMat1.color.setHex(activePalette.accent);
        ringMat1.emissive.setHex(activePalette.glow);
        coreMat.color.setHex(activePalette.secondary);
        coreMat.emissive.setHex(activePalette.primary);
        rimLight.color.setHex(activePalette.primary);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();

    // 7. Responsive Resizing
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup resources
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Dispose Geometries and Materials
      baseGeo.dispose();
      baseMat.dispose();
      innerRingGeo.dispose();
      ringMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      vBarGeo.dispose();
      hBarGeo.dispose();
      crossMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      sphereGeo.dispose();
      rungGeo.dispose();
      sphereMatA.dispose();
      sphereMatB.dispose();
      rungMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [isDarkMode]);

  const handleReset = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-teal-500/20 dark:border-teal-500/30 shadow-2xl bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 text-white ${className}`} dir="rtl">
      
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[360px] sm:h-[420px] md:h-[480px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Top Left Floating Badge (Unobtrusive) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 border border-teal-500/30 rounded-2xl px-3.5 py-1.5 shadow-lg backdrop-blur-xs text-xs font-bold text-teal-300">
        <Sparkles className="w-4 h-4 text-teal-400" />
        <span>المجسم التفاعلي ثلاثي الأبعاد • Three.js</span>
      </div>

      {/* Top Right Floating Indicator (No Pulsating Dot) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-2xl px-3 py-1.5 shadow-lg text-xs font-semibold text-slate-300">
        <HeartPulse className="w-4 h-4 text-emerald-400" />
        <span>حركة ديناميكية مستمرة (60 FPS)</span>
      </div>

      {/* Center Top Overlay Text */}
      <div className="absolute top-14 inset-x-0 mx-auto text-center pointer-events-none px-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-teal-500/10 text-teal-300 border border-teal-500/30 mb-1.5">
          منظومة احجز عند دكتورك الرقمية
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-md">
          الرعاية الطبية الذكية بمعايير المستقبل
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1">
          اسحب المجسم بالماوس أو اللمس للدوران والاستكشاف ثلاثي الأبعاد
        </p>
      </div>

      {/* Unified Bottom Control Dock (Consolidated Ergonomic Floating Dock) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Quick Play/Pause & Reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              title={isPlaying ? 'إيقاف الحركة التلقائية' : 'تشغيل الحركة التلقائية'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>إيقاف</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>دوران تلقائي</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs cursor-pointer"
              title="إعادة ضبط زاوية الرؤية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Color Theme Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">السمة:</span>
            <button
              onClick={() => setActiveTheme('teal')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTheme === 'teal'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              طبّي تركواز
            </button>
            <button
              onClick={() => setActiveTheme('emerald')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTheme === 'emerald'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              صحّي زمردي
            </button>
            <button
              onClick={() => setActiveTheme('blue')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeTheme === 'blue'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              أزرق سريري
            </button>
          </div>

          {/* Direct AI Action Shortcuts */}
          {(onOpenLiveVoice || onOpenChatbot) && (
            <div className="flex items-center gap-1.5">
              {onOpenLiveVoice && (
                <button
                  onClick={onOpenLiveVoice}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>🎙️ الصوت المباشر</span>
                </button>
              )}
              {onOpenChatbot && (
                <button
                  onClick={onOpenChatbot}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>💬 المحادثة الذكية</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
