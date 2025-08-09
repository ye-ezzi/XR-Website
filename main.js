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
        this.fadeMaterials = []; // 페이드에 사용되는 머티리얼 목록
        
        this.init();
        this.loadGLBModel('/models/glasses_ver2.glb');
    }

    init() {
        // Scene 설정
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a); // 진한 회색 배경

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
        this.camera.position.set(0, 0, 10); // 거리와 무관, 방향만 필요
        this.camera.lookAt(0, 0, 0);

        // Renderer 설정
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // HiDPI 디스플레이에서 선명도 개선
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05; // 약간 밝게
        this.renderer.physicallyCorrectLights = true; // 조명 물리 정확도 개선

        // Viewer 컨테이너에 렌더러 추가
        const viewerContainer = document.getElementById('viewer');
        viewerContainer.appendChild(this.renderer.domElement);

        // 마우스 이벤트 설정 (모델 회전 전용)
        this.setupMouseControls();

        // 조명 설정
        this.setupLighting();

        // 시작하기 버튼 바인딩
        this.setupStartButton();

        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        // 애니메이션 루프 시작
        this.animate();
    }

    setupStartButton() {
        const btn = document.getElementById('startButton');
        if (!btn) return;
        btn.addEventListener('click', () => {
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
                // 끝 처리: 완전히 투명화 후 숨김
                if (this.model) this.model.visible = false;
                this.isAnimating = false;
                if (btn) btn.style.display = 'none';
            }
        };

        requestAnimationFrame(step);
    }

    setupMouseControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let lastMouseX = 0;
        let lastMouseY = 0;

        // 마우스 이벤트 리스너
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            if (this.isAnimating) return;
            isMouseDown = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (this.isAnimating) return;
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
            if (this.isAnimating) return;
            event.preventDefault();
            isMouseDown = true;
            lastMouseX = event.touches[0].clientX;
            lastMouseY = event.touches[0].clientY;
        });

        this.renderer.domElement.addEventListener('touchmove', (event) => {
            if (this.isAnimating) return;
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
            },
            undefined,
            (error) => {
                console.error('Error loading GLB file:', error);
                document.getElementById('loading').classList.add('hidden');
                this.createDefaultModel();
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
}

// 뷰어 인스턴스 생성
new ModelViewer();
