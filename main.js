import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class ModelViewer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.clock = new THREE.Clock();
    this.rotationSpeed = 0.01; // 모델 회전 속도 (사용자 드래그 전용)
    this.frustumSize = 10; // Orthographic 기본 높이 (world units)
    this.hideHudPanels = false; // HUD/패널 자동 숨김 스위치
    this.isAnimating = false; // 시작 버튼 애니메이션 중 여부
    this.isPanning = false; // 좌우 이동 중 여부
    this.fadeMaterials = []; // 페이드에 사용되는 머티리얼 목록
    this.allowUserRotate = false; // 초기에는 사용자 회전 비활성화
    this.movementAnimation = null; // 좌우 움직임 시 Lottie 애니메이션
    this.preloadedAnimation = null; // 미리 로드된 Lottie 애니메이션
        
    this.init();
    this.loadGLBModel('/models/glasses_ver2.glb');
  }

  init() {
    // Lottie 애니메이션 미리 로드
    this.preloadAnimation();
        
    // Scene 설정 (투명 배경으로 설정해 뒤의 홈 이미지가 보이도록 함)
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Orthographic 카메라 설정 (원근 왜곡 없음)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      (-aspect * this.frustumSize) / 2,
      (aspect * this.frustumSize) / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.01,
      2000
    );
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer 설정 (알파 활성화, 클리어 알파 0)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setClearAlpha(0);

    const viewerContainer = document.getElementById('viewer');
    viewerContainer.appendChild(this.renderer.domElement);

    this.setupMouseControls();
    this.setupLighting();
    this.setupStartButton();
    this.setupVisibilityToggle();

    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    this.animate();
  }

  setupVisibilityToggle() {
    const cb = document.getElementById('modelToggle');
    if (!cb) return;
    const apply = (checked) => {
      if (!this.model) return;
      this.model.visible = !!checked;
    };
    // 초기 상태 반영
    apply(cb.checked);
    cb.addEventListener('change', (e) => {
      apply(e.target.checked);
    });
  }

  setupStartButton() {
    const btn = document.getElementById('startButton');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // 라인/텍스트 즉시 숨김
      const layer = document.getElementById('annoLayer');
      const line1Img = document.getElementById('line1Img');
      const line2Img = document.getElementById('line2Img');
      const t1 = document.getElementById('line1Text');
      const t2 = document.getElementById('line2Text');
      if (layer) layer.classList.remove('visible');
      if (line1Img) line1Img.classList.remove('visible');
      if (line2Img) line2Img.classList.remove('visible');
      if (t1) t1.textContent = '';
      if (t2) t2.textContent = '';

      if (!this.model || this.isAnimating) return;
      this.playStartSequence();
    });
  }

  playStartSequence() {
    // 버튼 비활성화/페이드 아웃(선택)
    const btn = document.getElementById('startButton');
    if (btn) {
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
    }

    this.isAnimating = true;

    // 회전 목표: 현재 각도 기준 Y축으로 180도 추가
    const startY = this.model.rotation.y;
    const endY = startY + Math.PI;
    const rotDuration = 1200; // ms
    const fadeDelay = 1000;   // ms 후 페이드 시작
    const fadeDuration = 900; // ms
    const startTime = performance.now();

    // 페이드 대상 머티리얼 수집(중복 제거)
    const materialSet = new Set();
    this.model.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((m) => materialSet.add(m));
      }
    });
    this.fadeMaterials = Array.from(materialSet).map((m) => ({
      mat: m,
      transparent: m.transparent === true,
      opacity: m.opacity !== undefined ? m.opacity : 1,
      depthWrite: m.depthWrite !== undefined ? m.depthWrite : true,
    }));
    // 페이드 전처리: 투명 처리 및 depthWrite off로 겹침 뿌연 현상 최소화
    this.fadeMaterials.forEach(({ mat }) => {
      if (mat.opacity === undefined) mat.opacity = 1;
      mat.transparent = true;
      mat.depthWrite = false;
      mat.needsUpdate = true;
    });

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const step = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      // 회전 보간
      const rProgress = Math.min(1, elapsed / rotDuration);
      const rEased = easeInOut(rProgress);
      this.model.rotation.y = startY + (endY - startY) * rEased;

      // 페이드 보간
      const fProgress = Math.min(1, Math.max(0, (elapsed - fadeDelay) / fadeDuration));
      const f = fProgress; // 0 -> 1
      this.fadeMaterials.forEach(({ mat, opacity }) => {
        mat.opacity = (1 - f) * opacity;
      });

      if (rProgress < 1 || fProgress < 1) {
        requestAnimationFrame(step);
      } else {
        if (this.model) this.model.visible = false;
        this.isAnimating = false;
        if (btn) btn.style.display = 'none';
        // 3D 모델 회전 완료 후 최종 상태로 이동 (어노테이션 재실행 방지)
        this.showFinalState();
      }
    };

    requestAnimationFrame(step);
  }

  showFinalState() {
    // 어노테이션 레이어 숨김
    const layer = document.getElementById('annoLayer');
    if (layer) layer.classList.remove('visible');
        
    // 3D 모델을 즉시 보여주고 최종 애니메이션 시작
    if (this.model) {
      this.model.visible = true;
      this.revealModelOverHome();
    }
  }

  revealModelOverHome() {
    if (!this.model) return;

    // 페이드 대상 재질 확보
    let items = this.fadeMaterials && this.fadeMaterials.length ? this.fadeMaterials : [];
    if (items.length === 0) {
      const materialSet = new Set();
      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => materialSet.add(m));
        }
      });
      items = Array.from(materialSet).map((m) => ({
        mat: m,
        transparent: m.transparent === true,
        opacity: m.opacity !== undefined ? m.opacity : 1,
        depthWrite: m.depthWrite !== undefined ? m.depthWrite : true,
      }));
      this.fadeMaterials = items;
    }

    // 시작 상태: 모두 0으로 두고 부드럽게 원래 불투명도로
    this.model.visible = true;
    items.forEach(({ mat }) => {
      if (mat.opacity === undefined) mat.opacity = 1;
      mat.transparent = true;
      mat.depthWrite = false;
      mat.opacity = 0;
      mat.needsUpdate = true;
    });

    const duration = 800;
    const start = performance.now();
    const animate = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration);
      items.forEach(({ mat, opacity }) => {
        mat.opacity = opacity * t;
      });
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // depthWrite 원복
        items.forEach(({ mat, depthWrite }) => {
          mat.depthWrite = depthWrite;
          mat.needsUpdate = true;
        });
        // 페이드인 완료 후 좌우 회전 수행
        this.rotateModelLeftRight();
        // 모델이 보이는 단계에서 토글 표시
        const glass = document.getElementById('glassToggle');
        if (glass) glass.style.display = 'flex';
      }
    };
    requestAnimationFrame(animate);
  }

  restoreModelSimple() {
    if (!this.model) return;
    this.model.visible = true;
    // 모델의 모든 머티리얼을 즉시 원복(불투명 1)하여 보이게 함
    this.model.traverse((child) => {
      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (!mat) return;
          if (mat.opacity === undefined) mat.opacity = 1;
          mat.transparent = true;
          mat.opacity = 1;
          mat.needsUpdate = true;
        });
      }
    });
    // 토글 표시
    const glass = document.getElementById('glassToggle');
    if (glass) glass.style.display = 'flex';
  }

  preloadAnimation() {
    // MP4 비디오를 사용하므로 별도의 프리로드가 필요 없음
    console.log('Using MP4 video - preload not needed');
  }

  startMovementAnimation() {
    const container = document.getElementById('movementAnimation');
    if (!container) return;
        
    // 기존 비디오가 있다면 제거
    if (this.movementVideo) {
      this.movementVideo.remove();
      this.movementVideo = null;
    }
        
    // 컨테이너 표시
    container.classList.add('visible');
    container.innerHTML = ''; // 컨테이너 초기화
        
    // MP4 비디오 요소 생성
    this.movementVideo = document.createElement('video');
    this.movementVideo.src = '/videos/scan.mp4';
    this.movementVideo.autoplay = true;
    this.movementVideo.loop = false; // 한 번만 재생
    this.movementVideo.muted = true;
    this.movementVideo.playsInline = true;
    this.movementVideo.style.cssText = `
      width: 100vw !important;
      height: 100vh !important;
      object-fit: cover;
      transform: scale(1);
      transform-origin: center;
    `;
    
    container.appendChild(this.movementVideo);
    
    this.movementVideo.addEventListener('loadeddata', () => {
      console.log('Movement video loaded successfully');
      this.movementVideo.play();
    });
    
    this.movementVideo.addEventListener('error', (e) => {
      console.error('Error loading movement video:', e);
    });
    
    // 비디오 종료 후 마지막 프레임 유지
    this.movementVideo.addEventListener('ended', () => {
      console.log('Movement video ended - keeping last frame');
      // 비디오가 끝나면 마지막 프레임에서 정지
    });
        
    console.log('Movement video started');
  }

  stopMovementAnimation() {
    // 아무것도 하지 않음 - 애니메이션은 이미 마지막 프레임에서 정지되어 있고
    // 컨테이너도 계속 표시되어 마지막 프레임이 팝업과 함께 보임
    console.log('Movement animation remains visible at final frame');
  }

  rotateModelLeftRight() {
    if (!this.model || this.isPanning) return;
    this.isPanning = true;
        
    // 좌우 움직임 시작과 함께 배경 애니메이션 시작
    this.startMovementAnimation();

    const startY = this.model.rotation.y;
    const angle = THREE.MathUtils.degToRad(10); // 좌우 10도
    const leftY = startY - angle;
    const rightY = startY + angle;

    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const rotateTo = (from, to, ms) => new Promise((resolve) => {
      const t0 = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / ms);
        const e = easeInOut(t);
        this.model.rotation.y = from + (to - from) * e;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    // 좌로 4초 → 우로 4초 → 중간으로 2초 복귀
    rotateTo(startY, leftY, 4000)
      .then(() => rotateTo(leftY, rightY, 4000))
      .then(() => rotateTo(rightY, startY, 2000))
      .finally(() => {
        this.isPanning = false;
        // 좌우 움직임 완료와 함께 배경 애니메이션 중지
        this.stopMovementAnimation();
        // 회전 완료 후 모델 숨김 + 요리 모드 팝업 표시
        if (this.model) this.model.visible = false;
        const modal = document.getElementById('cookingModal');
        if (modal) modal.style.display = 'flex';

        const startBtn = document.getElementById('cookStart');
        if (startBtn) {
          startBtn.onclick = () => { 
            // 팝업 즉시 숨기기
            if (modal) modal.style.display = 'none';
            // 페이지 이동
            window.location.href = new URL('./cook.html', window.location.origin).href; 
          };
        }
      });
  }

  setupMouseControls() {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // 마우스 이벤트 리스너
    this.renderer.domElement.addEventListener('mousedown', (event) => {
      if (this.isAnimating || this.isPanning || !this.allowUserRotate) return;
      isMouseDown = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    });

    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (this.isAnimating || this.isPanning || !this.allowUserRotate) return;
      if (isMouseDown && this.model) {
        mouseX = event.clientX;
        mouseY = event.clientY;

        const deltaX = mouseX - lastMouseX;
        const deltaY = mouseY - lastMouseY;

        // 모델 회전 (Y축과 X축)
        this.model.rotation.y += deltaX * 0.01;
        this.model.rotation.x += deltaY * 0.01;

        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    });

    this.renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    // 터치 이벤트 (모바일 지원)
    this.renderer.domElement.addEventListener('touchstart', (event) => {
      if (this.isAnimating || this.isPanning || !this.allowUserRotate) return;
      event.preventDefault();
      isMouseDown = true;
      lastMouseX = event.touches[0].clientX;
      lastMouseY = event.touches[0].clientY;
    });

    this.renderer.domElement.addEventListener('touchmove', (event) => {
      if (this.isAnimating || this.isPanning || !this.allowUserRotate) return;
      event.preventDefault();
      if (isMouseDown && this.model) {
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;

        const deltaX = mouseX - lastMouseX;
        const deltaY = mouseY - lastMouseY;

        // 모델 회전 (Y축과 X축)
        this.model.rotation.y += deltaX * 0.01;
        this.model.rotation.x += deltaY * 0.01;

        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    });

    this.renderer.domElement.addEventListener('touchend', () => {
      isMouseDown = false;
    });
  }

  setupLighting() {
    // 상하 천지광으로 전반 밝기 균형
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.25);
    this.scene.add(hemi);

    // 주변광 - 소폭 상향
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // 메인 방향성 조명 (정면)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(0, 2, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.bias = -0.0001;
    this.scene.add(mainLight);

    // 상단 조명 (강도 살짝 하향하여 상단 치중 완화)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
    topLight.position.set(0, 8, 0);
    this.scene.add(topLight);

    // 프레임을 밝히는 전면 저각도 보조광 (좌/우)
    const frontLeft = new THREE.DirectionalLight(0xffffff, 1.1);
    frontLeft.position.set(-3, 0.6, 3.5);
    this.scene.add(frontLeft);

    const frontRight = new THREE.DirectionalLight(0xffffff, 1.1);
    frontRight.position.set(3, 0.6, 3.5);
    this.scene.add(frontRight);

    // 윤곽 분리를 위한 후면 라이트
    const backLight = new THREE.DirectionalLight(0xffffff, 0.7);
    backLight.position.set(0, 2, -5);
    this.scene.add(backLight);

    // 렌즈 하이라이트용 스포트
    const spotLight = new THREE.SpotLight(0xffffff, 0.9, 100, Math.PI / 8, 0.3);
    spotLight.position.set(0, 5, 3);
    spotLight.target.position.set(0, 0, 0);
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);
  }

  loadGLBModel(url) {
    document.getElementById('loading').classList.remove('hidden');
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.model = gltf.scene;
        this.adjustModelSize();
        this.model.rotation.y = Math.PI;

        // 프레임을 더 밝게: 렌즈는 제외 + HUD 패널 숨김 처리
        this.model.traverse((child) => {
          if (!child.isMesh) return;

          child.castShadow = true;
          child.receiveShadow = true;

          const nameStr = ((child.name || '') + ' ' + (child.material?.name || ''));
          const isLensName = /lens|glass/i.test(nameStr);

          // 패널(HUD) 후보 감지: 매우 얇은 평면 + 넓은 비율 또는 이름 키워드
          let isHudPanel = false;
          if (child.geometry) {
            if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
            const bb = child.geometry.boundingBox;
            if (bb) {
              const size = bb.getSize(new THREE.Vector3());
              const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
              const isVeryThin = dims[0] < 0.003;
              const isWidePlate = dims[2] / Math.max(dims[1], 1e-6) > 1.3;
              isHudPanel = isVeryThin && isWidePlate;
            }
          }
          const keywordPanel = /(ui|hud|panel|screen|canvas|overlay)/i.test(nameStr);

          if (!isLensName && this.hideHudPanels && (isHudPanel || keywordPanel)) {
            child.visible = false;
            return;
          }

          // 머티리얼 튜닝
          const mat = child.material;
          if (mat) {
            const isLens = (mat.transparent && mat.opacity < 1.0) || isLensName;
            if (!isLens) {
              if (mat.metalness !== undefined) mat.metalness = 0.25;
              if (mat.roughness !== undefined) mat.roughness = 0.25;
              if (mat.emissive !== undefined) {
                mat.emissive = new THREE.Color(0x111111);
                mat.emissiveIntensity = 0.2;
              }
            } else {
              if (mat.roughness !== undefined) mat.roughness = 0.2;
              if (mat.metalness !== undefined) mat.metalness = 0.05;
              mat.transparent = true;
              mat.opacity = Math.min(mat.opacity ?? 0.9, 0.92);
              mat.depthWrite = false; // 투명 물체의 뿌연 오버랩 방지
            }
            mat.needsUpdate = true;
          }
        });

        this.scene.add(this.model);
        this.frameModel();

        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(this.model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
          this.updateAnimation = (delta) => mixer.update(delta);
        }

        document.getElementById('loading').classList.add('hidden');
        // 모델 등장 후 안내 라인/텍스트 인터랙션 실행
        this.runAnnotations();
      },
      undefined,
      (error) => {
        console.error('Error loading GLB file:', error);
        document.getElementById('loading').classList.add('hidden');
        this.createDefaultModel();
        this.runAnnotations();
      }
    );
  }

  createDefaultModel() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x667eea, shininess: 100, transparent: true, opacity: 0.9 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.castShadow = true;
    this.model.receiveShadow = true;
    this.model.rotation.y = Math.PI;
    this.scene.add(this.model);
    this.frameModel();
  }

  adjustModelSize() {
    if (!this.model) return;
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetWidth = 20;
    const scale = targetWidth / maxDim;
    this.model.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.sub(center);
    this.model.position.y += 0.05;
  }

  frameModel() {
    if (!this.model) return;
    const aspect = window.innerWidth / window.innerHeight;
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const width = size.x;
    const height = size.y;
    const padding = 1.5; // 여백
    const requiredHeight = Math.max(height * padding, (width * padding) / aspect);
    this.frustumSize = requiredHeight;
    this.camera.left = (-aspect * this.frustumSize) / 2;
    this.camera.right = (aspect * this.frustumSize) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = -this.frustumSize / 2;
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.frameModel();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    if (this.updateAnimation) this.updateAnimation(delta);
    this.renderer.render(this.scene, this.camera);
  }

  runAnnotations() {
    const layer = document.getElementById('annoLayer');
    const line1Img = document.getElementById('line1Img');
    const line2Img = document.getElementById('line2Img');
    const t1 = document.getElementById('line1Text');
    const t2 = document.getElementById('line2Text');
    const btn = document.getElementById('startButton');
    if (!layer || !line1Img || !line2Img || !t1 || !t2 || !btn) return;

    const text1 = '날짜, 시간, 배터리 상태는 필수 정보이며, 접근성을 위해 오른쪽 상단에 위치합니다.';
    const text2 = '시작 화면에서 사용자는 알림 및 추천 작업과 같은 중요한 활동을 확인할 수 있습니다.';

    const typeWriter = (el, text, speed = 18) => new Promise((resolve) => {
      el.textContent = '';
      el.classList.add('typing-caret');
      let i = 0;
      const tick = () => {
        el.textContent = text.slice(0, i);
        i += 1;
        if (i <= text.length) {
          setTimeout(tick, speed);
        } else {
          el.classList.remove('typing-caret');
          resolve();
        }
      };
      tick();
    });

    const showPng = (img) => new Promise((resolve) => {
      img.classList.remove('visible');
      void img.getBoundingClientRect();
      img.classList.add('visible');
      setTimeout(resolve, 400);
    });

    // 시퀀스: 레이어 보이기 → line1 PNG → text1 → line2 PNG → text2 → 시작하기 버튼 표시

    layer.classList.add('visible');
    showPng(line1Img)
      .then(() => typeWriter(t1, text1))
      .then(() => showPng(line2Img))
      .then(() => typeWriter(t2, text2))
      .then(() => {
        btn.style.display = 'inline-flex';
        // 시작하기 버튼이 보이는 동안 토글은 숨김 유지
        const glass = document.getElementById('glassToggle');
        if (glass) glass.style.display = 'none';
      });

    window.addEventListener('resize', () => {
      svg.setAttribute('viewBox', '0 0 100 100');
    }, { once: true });
  }
}

// 뷰어 인스턴스 생성
new ModelViewer();
