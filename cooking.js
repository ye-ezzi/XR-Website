console.log('Cooking mode loaded');

// TODO: attach real cooking mode logic here (recipe steps, timers, etc.)

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.bottom-bar-item');
    const bgContainer = document.getElementById('background-image-container');

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

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 링크 이동 방지
            updateTabState(tab);
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
