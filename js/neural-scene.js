/* ===================================
   Neural Scene — Three.js 3D Brain Network
   =================================== */

const NeuralScene = {
  scene: null,
  camera: null,
  renderer: null,
  canvas: null,
  raycaster: null,
  mouse: { x: 0, y: 0 },

  nodes: [],
  secondaryNodes: [],
  connections: [],
  particles: [],
  ambientParticles: null,
  labels: [],

  activeNode: -1,
  hoveredNode: -1,
  isWebGL: true,
  animationId: null,
  isVisible: true,
  clock: null,
  sceneRect: null,

  // Phase data
  phases: [
    { name: 'Inmersión', pos: [-2.0, 1.0, 0.2] },
    { name: 'Estrategia', pos: [-0.6, -0.6, 0.5] },
    { name: 'Creación', pos: [0.8, 0.7, -0.3] },
    { name: 'Activación', pos: [2.0, -0.2, 0.1] }
  ],

  init() {
    this.canvas = document.getElementById('neuralCanvas');
    if (!this.canvas) return;

    if (!this.checkWebGL()) {
      this.initFallback();
      return;
    }

    this.clock = new THREE.Clock();
    this.setupScene();
    this.createNodes();
    this.createSecondaryNodes();
    this.createConnections();
    this.createFlowingParticles();
    this.createAmbientParticles();
    this.setupLabels();
    this.setupInteractions();
    this.setupVisibility();
    this.onResize();
    window.addEventListener('resize', () => this.onResize());

    this.animate();
  },

  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const isMobile = window.innerWidth <= 900;
      this.isWebGL = !!ctx && !isMobile;
    } catch (e) {
      this.isWebGL = false;
    }
    return this.isWebGL;
  },

  setupScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 8); // Start far, animate closer

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !isSafari, // Disable antialiasing on Safari for performance
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap pixel ratio: Safari struggles with WebGL at high DPR
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSafari ? 1.5 : 2));

    this.raycaster = new THREE.Raycaster();
  },

  createNodes() {
    this.phases.forEach((phase, i) => {
      const pos = new THREE.Vector3(...phase.pos);

      // Core sphere (bright gold center)
      const coreGeo = new THREE.SphereGeometry(0.12, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xB4BECD,
        transparent: true,
        opacity: 0.9
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.copy(pos);
      core.userData = { phaseIndex: i, type: 'node' };
      core.scale.set(0, 0, 0); // Start hidden for entrance

      // Inner glow
      const glowGeo = new THREE.SphereGeometry(0.22, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xB4BECD,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(pos);
      glow.scale.set(0, 0, 0);

      // Outer pulse ring
      const ringGeo = new THREE.RingGeometry(0.28, 0.30, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xB4BECD,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.scale.set(0, 0, 0);

      this.scene.add(core, glow, ring);
      this.nodes.push({
        core, glow, ring,
        position: pos,
        baseGlowOpacity: 0.15,
        baseRingOpacity: 0.08
      });
    });
  },

  createSecondaryNodes() {
    const nodeCount = 30;
    for (let i = 0; i < nodeCount; i++) {
      // Cluster around main nodes for organic brain-like distribution
      const parentIdx = Math.floor(Math.random() * 4);
      const parent = this.phases[parentIdx].pos;
      const spread = 1.2 + Math.random() * 0.8;

      const pos = new THREE.Vector3(
        parent[0] + (Math.random() - 0.5) * spread,
        parent[1] + (Math.random() - 0.5) * spread,
        parent[2] + (Math.random() - 0.5) * spread * 0.6
      );

      const size = 0.02 + Math.random() * 0.03;
      const geo = new THREE.SphereGeometry(size, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xE8E0D4,
        transparent: true,
        opacity: 0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { baseOpacity: 0.15 + Math.random() * 0.2, parentIdx };

      this.scene.add(mesh);
      this.secondaryNodes.push(mesh);
    }
  },

  createConnections() {
    // Primary connections between main nodes
    const primaryPairs = [[0,1], [1,2], [2,3], [0,2], [1,3], [0,3]];

    primaryPairs.forEach(([a, b]) => {
      const start = this.nodes[a].position;
      const end = this.nodes[b].position;

      // Create organic curve with offset midpoint
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.x += (Math.random() - 0.5) * 0.5;
      mid.y += (Math.random() - 0.5) * 0.5;
      mid.z += (Math.random() - 0.5) * 0.8;

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(60);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xB4BECD,
        transparent: true,
        opacity: 0
      });
      const line = new THREE.Line(geometry, material);

      this.scene.add(line);
      this.connections.push({
        line, curve, material,
        baseOpacity: 0.2,
        nodeA: a,
        nodeB: b,
        isPrimary: true
      });
    });

    // Secondary connections from main nodes to nearby secondary nodes
    this.secondaryNodes.forEach((secNode, i) => {
      const parentIdx = secNode.userData.parentIdx;
      const parentPos = this.nodes[parentIdx].position;
      const nodePos = secNode.position;

      const mid = parentPos.clone().add(nodePos).multiplyScalar(0.5);
      mid.z += (Math.random() - 0.5) * 0.3;

      const curve = new THREE.QuadraticBezierCurve3(parentPos, mid, nodePos);
      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xE8E0D4,
        transparent: true,
        opacity: 0
      });
      const line = new THREE.Line(geometry, material);

      this.scene.add(line);
      this.connections.push({
        line, curve, material,
        baseOpacity: 0.08,
        nodeA: parentIdx,
        nodeB: -1,
        isPrimary: false
      });
    });
  },

  createFlowingParticles() {
    // Only for primary connections
    this.connections.filter(c => c.isPrimary).forEach(conn => {
      const particleCount = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < particleCount; i++) {
        const geo = new THREE.SphereGeometry(0.018, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xB4BECD,
          transparent: true,
          opacity: 0
        });
        const mesh = new THREE.Mesh(geo, mat);
        const t = Math.random();
        const point = conn.curve.getPoint(t);
        mesh.position.copy(point);

        this.scene.add(mesh);
        this.particles.push({
          mesh, mat,
          curve: conn.curve,
          t,
          speed: 0.001 + Math.random() * 0.003,
          baseOpacity: 0.5 + Math.random() * 0.3,
          connNodeA: conn.nodeA,
          connNodeB: conn.nodeB
        });
      }
    });
  },

  createAmbientParticles() {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      opacities[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xB4BECD,
      size: 0.012,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true
    });

    this.ambientParticles = new THREE.Points(geo, mat);
    this.scene.add(this.ambientParticles);
  },

  setupLabels() {
    const labelEls = document.querySelectorAll('.phase-label-3d');
    labelEls.forEach((el, i) => {
      this.labels.push({
        el,
        phaseIndex: i,
        screenPos: { x: 0, y: 0 }
      });
    });
    // Cache scene container rect
    const sceneEl = document.getElementById('procesoScene');
    if (sceneEl) this.sceneRect = sceneEl.getBoundingClientRect();
  },

  updateLabels() {
    if (!this.camera || !this.labels.length) return;

    const halfW = window.innerWidth * 0.5;
    const halfH = window.innerHeight * 0.5;

    this.labels.forEach((label, i) => {
      const node = this.nodes[i];
      if (!node) return;

      // Clone position, apply scene rotation (since scene rotates for parallax)
      const pos = node.position.clone();
      pos.applyMatrix4(this.scene.matrixWorld);
      pos.project(this.camera);

      // Convert normalized device coordinates to screen pixels
      const x = (pos.x * halfW) + halfW;
      const y = -(pos.y * halfH) + halfH;

      // Offset label below the node
      const yOffset = 32;

      label.el.style.left = x + 'px';
      label.el.style.top = (y + yOffset) + 'px';
    });
  },

  setupInteractions() {
    // Mouse move for parallax + raycasting
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Click for node activation
    this.canvas.addEventListener('click', (e) => this.onClick(e));
  },

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Subtle parallax rotation
    gsap.to(this.scene.rotation, {
      y: this.mouse.x * 0.12,
      x: -this.mouse.y * 0.08,
      duration: 1.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  },

  onClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodes.map(n => n.core));

    if (intersects.length > 0) {
      const idx = intersects[0].object.userData.phaseIndex;
      this.activateNode(idx);
    }
  },

  activateNode(index) {
    if (index === this.activeNode) return;
    this.activeNode = index;

    const targetNode = this.nodes[index];

    // Camera moves toward active node
    gsap.to(this.camera.position, {
      x: targetNode.position.x * 0.2,
      y: targetNode.position.y * 0.2,
      z: 4.5,
      duration: 1.2,
      ease: 'power2.inOut'
    });

    // Animate all nodes
    this.nodes.forEach((node, i) => {
      const isActive = i === index;
      gsap.to(node.glow.material, {
        opacity: isActive ? 0.5 : 0.08,
        duration: 0.6
      });
      gsap.to(node.core.material, {
        opacity: isActive ? 1.0 : 0.4,
        duration: 0.4
      });
      gsap.to(node.ring.material, {
        opacity: isActive ? 0.25 : 0.03,
        duration: 0.6
      });
      // Pulse ring scale on active
      if (isActive) {
        gsap.fromTo(node.ring.scale,
          { x: 1, y: 1, z: 1 },
          { x: 1.5, y: 1.5, z: 1.5, duration: 0.8, ease: 'power2.out' }
        );
      } else {
        gsap.to(node.ring.scale, { x: 1, y: 1, z: 1, duration: 0.5 });
      }
    });

    // Brighten connections related to active node
    this.connections.forEach(conn => {
      const related = conn.nodeA === index || conn.nodeB === index;
      gsap.to(conn.material, {
        opacity: related ? (conn.isPrimary ? 0.5 : 0.2) : (conn.isPrimary ? 0.1 : 0.03),
        duration: 0.6
      });
    });

    // Speed up related particles
    this.particles.forEach(p => {
      const related = p.connNodeA === index || p.connNodeB === index;
      p.speed = related ? 0.006 + Math.random() * 0.004 : 0.001 + Math.random() * 0.002;
      gsap.to(p.mat, {
        opacity: related ? 0.8 : 0.2,
        duration: 0.5
      });
    });

    // Update dots
    document.querySelectorAll('.phase-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update labels — active label glows, others dim
    this.labels.forEach((label, i) => {
      const isActive = i === index;
      label.el.classList.toggle('active', isActive);
      gsap.to(label.el, {
        opacity: isActive ? 1 : 0.4,
        duration: 0.5,
        ease: 'power2.out'
      });
    });

    // Show panel
    this.showPanel(index);
  },

  deactivateAll() {
    this.activeNode = -1;

    gsap.to(this.camera.position, {
      x: 0, y: 0, z: 5,
      duration: 1, ease: 'power2.inOut'
    });

    this.nodes.forEach(node => {
      gsap.to(node.glow.material, { opacity: node.baseGlowOpacity, duration: 0.6 });
      gsap.to(node.core.material, { opacity: 0.9, duration: 0.4 });
      gsap.to(node.ring.material, { opacity: node.baseRingOpacity, duration: 0.6 });
    });

    this.connections.forEach(conn => {
      gsap.to(conn.material, { opacity: conn.baseOpacity, duration: 0.6 });
    });

    this.particles.forEach(p => {
      p.speed = 0.001 + Math.random() * 0.003;
      gsap.to(p.mat, { opacity: p.baseOpacity, duration: 0.5 });
    });

    document.querySelectorAll('.phase-dot').forEach(d => d.classList.remove('active'));

    // Reset labels
    this.labels.forEach(label => {
      label.el.classList.remove('active');
      gsap.to(label.el, { opacity: 1, duration: 0.5 });
    });

    this.hideAllPanels();
  },

  showPanel(index) {
    document.querySelectorAll('.proceso-panel').forEach((panel, i) => {
      if (i === index) {
        panel.classList.add('active');
        gsap.to(panel, {
          opacity: 1, y: 0,
          duration: 0.6, delay: 0.15,
          ease: 'power3.out'
        });
      } else {
        panel.classList.remove('active');
        gsap.to(panel, {
          opacity: 0, y: 20,
          duration: 0.3,
          ease: 'power2.in'
        });
      }
    });
  },

  hideAllPanels() {
    document.querySelectorAll('.proceso-panel').forEach(panel => {
      panel.classList.remove('active');
      gsap.to(panel, { opacity: 0, y: 20, duration: 0.3 });
    });
  },

  animate() {
    if (!this.isVisible) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Raycaster hover detection
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodes.map(n => n.core));
    const cursorRing = document.getElementById('cursorRing');

    if (intersects.length > 0) {
      const idx = intersects[0].object.userData.phaseIndex;
      if (this.hoveredNode !== idx) {
        // Reset previous hovered label
        if (this.hoveredNode !== -1 && this.hoveredNode !== this.activeNode && this.labels[this.hoveredNode]) {
          this.labels[this.hoveredNode].el.classList.remove('hovered');
        }
        this.hoveredNode = idx;
        document.body.style.cursor = 'pointer';
        if (cursorRing) cursorRing.classList.add('hover');

        // Expand hovered node glow
        if (this.activeNode !== idx) {
          gsap.to(this.nodes[idx].glow.material, { opacity: 0.3, duration: 0.3 });
        }

        // Highlight hovered label
        if (this.labels[idx]) {
          this.labels[idx].el.classList.add('hovered');
        }
      }
    } else {
      if (this.hoveredNode !== -1) {
        const prevIdx = this.hoveredNode;
        if (this.activeNode !== prevIdx) {
          gsap.to(this.nodes[prevIdx].glow.material, {
            opacity: this.nodes[prevIdx].baseGlowOpacity,
            duration: 0.3
          });
        }
        // Remove hover from label
        if (this.labels[prevIdx]) {
          this.labels[prevIdx].el.classList.remove('hovered');
        }
        this.hoveredNode = -1;
        document.body.style.cursor = '';
        if (cursorRing) cursorRing.classList.remove('hover');
      }
    }

    // Animate node pulse rings
    this.nodes.forEach((node, i) => {
      const pulseScale = 1 + Math.sin(elapsed * 1.5 + i * 1.2) * 0.08;
      node.ring.rotation.z = elapsed * 0.3 + i;
      if (this.activeNode !== i) {
        node.ring.scale.set(pulseScale, pulseScale, pulseScale);
      }
    });

    // Animate secondary node twinkle
    this.secondaryNodes.forEach((node, i) => {
      const twinkle = node.userData.baseOpacity * (0.7 + Math.sin(elapsed * 2 + i * 0.8) * 0.3);
      node.material.opacity = twinkle;
    });

    // Move flowing particles along curves
    this.particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t -= 1;
      const point = p.curve.getPoint(p.t);
      p.mesh.position.copy(point);
    });

    // Rotate ambient particles slowly
    if (this.ambientParticles) {
      this.ambientParticles.rotation.y = elapsed * 0.02;
      this.ambientParticles.rotation.x = Math.sin(elapsed * 0.01) * 0.05;
    }

    // Update HTML label positions to track 3D nodes
    this.updateLabels();

    this.renderer.render(this.scene, this.camera);
  },

  // === Entrance Animation ===
  entrance() {
    const tl = gsap.timeline({ delay: 0.3 });

    // Camera zooms in
    tl.to(this.camera.position, {
      z: 5, duration: 2, ease: 'power2.out'
    }, 0);

    // Nodes appear with stagger
    this.nodes.forEach((node, i) => {
      tl.to(node.core.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.8, ease: 'back.out(2)'
      }, 0.3 + i * 0.2);
      tl.to(node.glow.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.8, ease: 'back.out(1.5)'
      }, 0.4 + i * 0.2);
      tl.to(node.glow.material, {
        opacity: node.baseGlowOpacity,
        duration: 0.6
      }, 0.5 + i * 0.2);
      tl.to(node.ring.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.6
      }, 0.5 + i * 0.2);
      tl.to(node.ring.material, {
        opacity: node.baseRingOpacity,
        duration: 0.6
      }, 0.5 + i * 0.2);
    });

    // Secondary nodes fade in
    this.secondaryNodes.forEach((node, i) => {
      tl.to(node.material, {
        opacity: node.userData.baseOpacity,
        duration: 0.5
      }, 0.8 + i * 0.02);
    });

    // Connections draw in
    this.connections.forEach((conn, i) => {
      tl.to(conn.material, {
        opacity: conn.baseOpacity,
        duration: 0.6
      }, 1.0 + i * 0.02);
    });

    // Particles fade in
    this.particles.forEach((p, i) => {
      tl.to(p.mat, {
        opacity: p.baseOpacity,
        duration: 0.4
      }, 1.2 + i * 0.01);
    });

    // Ambient particles
    if (this.ambientParticles) {
      tl.to(this.ambientParticles.material, {
        opacity: 0.35,
        duration: 1.5
      }, 1.0);
    }

    // Phase dots appear
    document.querySelectorAll('.phase-dot').forEach((dot, i) => {
      tl.to(dot, {
        opacity: 1, y: 0,
        duration: 0.5, ease: 'power3.out'
      }, 1.5 + i * 0.1);
    });

    // Node labels appear with stagger
    this.labels.forEach((label, i) => {
      tl.to(label.el, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onStart: () => label.el.classList.add('visible')
      }, 1.2 + i * 0.2);

      // Animate the number sliding down into place
      const numEl = label.el.querySelector('.phase-label-3d__number');
      if (numEl) {
        tl.to(numEl, {
          y: 0,
          duration: 0.5,
          ease: 'power3.out'
        }, 1.3 + i * 0.2);
      }
    });

    return tl;
  },

  // === Visibility Management ===
  setupVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isVisible = false;
        cancelAnimationFrame(this.animationId);
      } else {
        this.isVisible = true;
        this.animate();
      }
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!this.isVisible) {
            this.isVisible = true;
            this.animate();
          }
        } else {
          this.isVisible = false;
          cancelAnimationFrame(this.animationId);
        }
      });
    }, { threshold: 0.05 });

    const sceneEl = document.getElementById('procesoScene');
    if (sceneEl) observer.observe(sceneEl);
  },

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const sceneEl = document.getElementById('procesoScene');
    if (sceneEl) this.sceneRect = sceneEl.getBoundingClientRect();
  },

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    if (this.renderer) this.renderer.dispose();
  },

  // === 2D Fallback ===
  initFallback() {
    this.canvas.style.display = 'none';
    const fallback = document.getElementById('neuralFallback');
    if (fallback) {
      fallback.classList.add('active');
      this.setupFallbackInteractions();
    }
  },

  setupFallbackInteractions() {
    document.querySelectorAll('.neural-fallback__node').forEach((node, i) => {
      node.addEventListener('click', () => {
        document.querySelectorAll('.neural-fallback__node').forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        document.querySelectorAll('.phase-dot').forEach((d, j) => d.classList.toggle('active', j === i));
        this.showPanel(i);
      });
    });
  }
};
