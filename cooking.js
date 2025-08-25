console.log('Cooking mode loaded');

// TODO: attach real cooking mode logic here (recipe steps, timers, etc.)

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.bottom-bar-item');
  let measureAnimation = null;
  
  // 페이지 로드 시 바로 explore 영상 재생
  setTimeout(() => {
    playExploreVideo();
  }, 500);

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

    }
  };

  // 애니메이션 컨테이너 생성
  const animationContainer = document.createElement('div');
  animationContainer.id = 'measureAnimation';
  animationContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999;
        opacity: 0;
        transition: opacity 0.8s ease;
        pointer-events: none;
        cursor: pointer;
    `;
  document.body.appendChild(animationContainer);
  
  // 애니메이션 컨테이너 클릭 시 닫기
  animationContainer.addEventListener('click', () => {
    animationContainer.classList.remove('visible');
    if (measureAnimation) {
      measureAnimation.destroy();
      measureAnimation = null;
    }
  });

  // 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
        #measureAnimation.visible { 
            opacity: 1 !important; 
            pointer-events: auto !important;
        }
        #measureAnimation {
            overflow: hidden;
        }
        #measureAnimation video {
            width: 100vw !important;
            height: 100vh !important;
            object-fit: cover !important;
            transform: scale(1.2) !important;
            transform-origin: center !important;
        }
    `;
  document.head.appendChild(style);

  // explore 영상 재생 함수
  function playExploreVideo() {
    // Lottie 라이브러리가 로드되었는지 확인
    if (typeof lottie === 'undefined') {
      console.error('Lottie library is not loaded');
      return;
    }
    
    if (measureAnimation) {
      measureAnimation.destroy();
    }
    
    // 모든 콘텐츠를 즉시 숨김
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => {
      content.style.display = 'none';
    });
            
    console.log('Auto-playing explore video on page load');
    
    // 애니메이션 컨테이너 초기화
    animationContainer.innerHTML = '';
    
    console.log('Loading video from path: /videos/explore.mp4');
    
    // MP4 비디오 요소 생성
    const videoElement = document.createElement('video');
    videoElement.src = '/videos/explore.mp4';
    videoElement.autoplay = true;
    videoElement.loop = false; // 반복재생 하지 않음
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.cssText = `
      width: 100vw !important;
      height: 100vh !important;
      object-fit: cover;
      transform: scale(1.2);
      transform-origin: center;
    `;
    
    animationContainer.appendChild(videoElement);
    
    videoElement.addEventListener('loadeddata', () => {
      console.log('Explore video loaded successfully');
      videoElement.play();
      
      // 비디오가 로드된 후 fade-in으로 컨테이너 표시
      setTimeout(() => {
        animationContainer.classList.add('visible');
        console.log('Explore video container faded in');
      }, 100);
    });
    
    videoElement.addEventListener('ended', () => {
      console.log('Explore video ended - keeping last frame');
    });
    
    videoElement.addEventListener('error', (e) => {
      console.error('Error loading explore video:', e);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault(); // 기본 링크 이동 방지
      updateTabState(tab);

      // 버튼별로 다른 영상 재생
      const buttonAlt = tab.querySelector('img').alt;
      console.log('Button clicked:', buttonAlt);
      
      // Lottie 라이브러리가 로드되었는지 확인
      if (typeof lottie === 'undefined') {
        console.error('Lottie library is not loaded');
        return;
      }
      
      if (measureAnimation) {
        measureAnimation.destroy();
      }
      
      // 모든 콘텐츠를 즉시 숨김
      const allContents = document.querySelectorAll('.tab-content');
      allContents.forEach(content => {
        content.style.display = 'none';
      });
      
      // 애니메이션 컨테이너는 아직 보이지 않게 유지
      console.log('Preparing video container');
      
      // 애니메이션 컨테이너 초기화
      animationContainer.innerHTML = '';
      
      // 버튼에 따라 다른 영상 선택
      let videoPath = '/videos/explore.mp4'; // 기본값
      if (buttonAlt === '3D Receipt') {
        videoPath = '/videos/3D.mp4';
      } else if (buttonAlt === 'Measure') {
        videoPath = '/videos/measure.mp4';
      } else if (buttonAlt === 'Record') {
        videoPath = '/videos/capture.mp4';
      } else if (buttonAlt === 'Zoom') {
        videoPath = '/videos/zoom.mp4';
      }
      
      console.log('Loading video from path:', videoPath);
      
      // MP4 비디오 요소 생성
      const videoElement = document.createElement('video');
      videoElement.src = videoPath;
      videoElement.autoplay = true;
      videoElement.loop = false;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.style.cssText = `
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover;
        transform: scale(1.4);
        transform-origin: center;
      `;
      
      animationContainer.appendChild(videoElement);
      
      videoElement.addEventListener('loadeddata', () => {
        console.log('Video loaded successfully');
        videoElement.play();
        
        // 비디오가 로드된 후 fade-in으로 컨테이너 표시
        setTimeout(() => {
          animationContainer.classList.add('visible');
          console.log('Video container faded in');
        }, 100);
      });
      
      videoElement.addEventListener('ended', () => {
        console.log('Video ended - keeping last frame');
      });
      
      videoElement.addEventListener('error', (e) => {
        console.error('Error loading video:', e);
      });
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
