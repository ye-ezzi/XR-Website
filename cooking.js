console.log('Cooking mode loaded');

// TODO: attach real cooking mode logic here (recipe steps, timers, etc.)

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.bottom-bar-item');
    const bgContainer = document.getElementById('background-image-container');
    let measureAnimation = null;

    const updateTabState = (selectedTab) => {
        tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.style.color = '#fff'; // 비활성 탭 텍스트는 흰색
            const img = tab.querySelector('img');
            if (img) {
                // 비활성 탭 아이콘은 일반 src로 변경
                img.src = img.dataset.originalSrc || img.src; // originalSrc가 없으면 현재 src 사용
            }
            // 모든 콘텐츠 숨기기
            const targetContentId = tab.dataset.targetContent;
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.style.display = 'none';
            }
        });

        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.style.color = '#F4CF15'; // 활성 탭 텍스트는 #F4CF15
            const img = selectedTab.querySelector('img');
            if (img) {
                // 활성 탭 아이콘은 activeSrc로 변경
                img.dataset.originalSrc = img.src; // 현재 src를 originalSrc로 저장
                img.src = selectedTab.dataset.activeSrc;
            }

            // 선택된 탭의 콘텐츠 보이기
            const selectedContentId = selectedTab.dataset.targetContent;
            const selectedContent = document.getElementById(selectedContentId);
            if (selectedContent) {
                selectedContent.style.display = 'flex'; // flex로 설정하여 중앙 정렬 유지
            }

            const bgImage = selectedTab.dataset.bgImage;
            if (bgImage) {
                bgContainer.style.backgroundImage = `url('${bgImage}')`;
            }
        }
    };

    // 애니메이션 컨테이너 생성
    const animationContainer = document.createElement('div');
    animationContainer.id = 'measureAnimation';
    animationContainer.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 45;
        opacity: 0;
        transition: opacity 0.5s ease;
        pointer-events: none;
        overflow: hidden;
    `;
    document.body.appendChild(animationContainer);

    // 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        #measureAnimation.visible { opacity: 1; }
        #measureAnimation svg {
            width: 100vw !important;
            height: 100vh !important;
            object-fit: fill !important;
            transform: scale(1.1) !important;
            transform-origin: center !important;
        }
        #measureAnimation svg * {
            width: 100% !important;
            height: 100% !important;
        }
    `;
    document.head.appendChild(style);

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 링크 이동 방지
            updateTabState(tab);

            // 측정하기 버튼 클릭 시 애니메이션 실행
            if (tab.querySelector('img').alt === 'Measure') {
                if (measureAnimation) {
                    measureAnimation.destroy();
                }
                
                animationContainer.classList.add('visible');
                measureAnimation = lottie.loadAnimation({
                    container: animationContainer,
                    renderer: 'svg',
                    loop: false,
                    autoplay: true,
                    path: new URL('./videos/measure.json', window.location.origin).href,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid slice'
                    }
                });

                measureAnimation.addEventListener('DOMLoaded', () => {
                    const svg = animationContainer.querySelector('svg');
                    if (svg) {
                        svg.setAttribute('viewBox', '0 0 1920 1080');
                        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                    }
                });

                // 애니메이션이 끝나면 마지막 프레임 유지
                measureAnimation.addEventListener('complete', () => {
                    measureAnimation.goToAndStop(measureAnimation.totalFrames - 1, true);
                });
            } else {
                // 다른 탭 클릭 시 애니메이션 숨김
                animationContainer.classList.remove('visible');
                if (measureAnimation) {
                    measureAnimation.destroy();
                    measureAnimation = null;
                }
            }
        });
    });

    // 페이지 로드 시 첫 번째 탭을 활성 상태로 설정 (옵션)
    if (tabs.length > 0) {
        // 초기 활성 탭을 'Scan'으로 설정 (id: scan-content와 연결된 탭)
        const initialTab = document.querySelector('[data-target-content="scan-content"]');
        if (initialTab) {
            updateTabState(initialTab);
        } else {
            updateTabState(tabs[0]);
        }
    }
});
