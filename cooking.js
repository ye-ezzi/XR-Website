console.log('Cooking mode loaded');

// TODO: attach real cooking mode logic here (recipe steps, timers, etc.)

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.bottom-bar-item');
  let measureAnimation = null;
  
  // 페이지 로드 시 바로 explore 영상 재생
  setTimeout(() => {
    playExploreVideo();
  }, 100);

  // 팝업 관련 함수들
  initPopupEvents();

  // 드래그 기능 초기화
  initDraggablePopup();

  // 확대하기 컨트롤 초기화
  initZoomControl();

  // 탐색 이미지 뷰 초기화
  initScanImageView();


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
      selectedTab.style.color = '#fff'; // 활성 탭 텍스트도 흰색 유지
      const img = selectedTab.querySelector('img');
      if (img) {
        // 활성 탭 아이콘은 일반 src 유지 (아이콘 변경 안함)
        // img.dataset.originalSrc = img.src;
        // img.src = selectedTab.dataset.activeSrc;
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
        
        /* Mobile responsive design for videos */
        @media (max-width: 768px) {
            #measureAnimation video {
                transform: scale(1.1) !important;
            }
        }
        
        @media (max-width: 480px) {
            #measureAnimation video {
                transform: scale(1.0) !important;
            }
        }
    `;
  document.head.appendChild(style);

  // explore 영상 재생 함수
  function playExploreVideo() {
    // 성능 측정 시작
    const loadStartTime = performance.now();
    
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
    
    // 애니메이션 컨테이너를 미리 준비하여 빠른 로딩
    animationContainer.innerHTML = '';
    animationContainer.classList.remove('visible');
            
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
    // 모바일에서 스케일 조정
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? (window.innerWidth <= 480 ? '1.0' : '1.1') : '1.2';
    
    videoElement.style.cssText = `
      width: 100vw !important;
      height: 100vh !important;
      object-fit: cover;
      transform: scale(${scale});
      transform-origin: center;
    `;
    
    animationContainer.appendChild(videoElement);
    
    videoElement.addEventListener('loadeddata', () => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.log(`Explore video loaded successfully in ${loadTime.toFixed(2)}ms`);
      console.log(`Video size: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
      
      videoElement.play();
      
      // 비디오가 로드된 후 즉시 컨테이너 표시
      animationContainer.classList.add('visible');
      console.log('Explore video container faded in');
    });
    
    videoElement.addEventListener('ended', () => {
      console.log('Explore video ended - video remains visible');
      // 영상을 마지막 프레임에서 멈춤
      videoElement.pause();
      // showScanImageView() 호출 제거 - 이미지 오버레이 표시 안함
    });
    
    videoElement.addEventListener('error', (e) => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.error(`Error loading explore video after ${loadTime.toFixed(2)}ms:`, e);
      console.error('Failed video path: /videos/explore.mp4');
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault(); // 기본 링크 이동 방지

      // 모든 팝업 닫기
      closeAllPopups();

      // 측정 오버레이 닫기
      const measureOverlay = document.getElementById('measure-overlay');
      if (measureOverlay) {
        measureOverlay.classList.remove('active');
      }

      updateTabState(tab);

      // 버튼별로 다른 처리
      const buttonAlt = tab.querySelector('img').alt;
      console.log('Button clicked:', buttonAlt);
      
      
      // 성능 측정 시작
      const loadStartTime = performance.now();
      
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
      // Zoom 버튼은 자동재생 안함, 나머지는 자동재생
      videoElement.autoplay = (buttonAlt !== 'Zoom');
      videoElement.loop = false;
      videoElement.muted = true;
      videoElement.playsInline = true;
      // 모바일에서 스케일 조정
      const isMobile = window.innerWidth <= 768;
      const scale = isMobile ? (window.innerWidth <= 480 ? '1.0' : '1.1') : '1.4';
      
      videoElement.style.cssText = `
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover;
        transform: scale(${scale});
        transform-origin: center;
      `;
      
      animationContainer.appendChild(videoElement);
      
      videoElement.addEventListener('loadeddata', () => {
        const loadEndTime = performance.now();
        const loadTime = loadEndTime - loadStartTime;
        console.log(`${buttonAlt} video loaded successfully in ${loadTime.toFixed(2)}ms`);
        console.log(`Video size: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        console.log(`Video path: ${videoPath}`);

        // Zoom 버튼은 자동 재생하지 않고 컨트롤 UI 즉시 표시
        if (buttonAlt === 'Zoom') {
          // 비디오가 로드된 후 즉시 컨테이너 표시
          animationContainer.classList.add('visible');
          console.log('Video container faded in');
          // 컨트롤 UI 표시
          showZoomControl(videoElement);
        } else {
          // 다른 버튼들은 기존대로 자동 재생
          videoElement.play();
          // 비디오가 로드된 후 즉시 컨테이너 표시
          animationContainer.classList.add('visible');
          console.log('Video container faded in');
        }
      });

      videoElement.addEventListener('ended', () => {
        console.log(`${buttonAlt} video ended`);

        if (buttonAlt === 'Scan') {
          // Scan (탐색하기): 영상 멈춤 (이미지 오버레이 표시 안함)
          videoElement.pause();
          // showScanImageView() 호출 제거
        } else if (buttonAlt === 'Zoom') {
          // Zoom (확대하기): 아무것도 안함 (컨트롤 UI가 이미 표시됨)
        } else {
          // 3D Recipe, Measure, Record: 각각의 팝업 표시
          showTabPopup(buttonAlt);
        }
      });
      
      videoElement.addEventListener('error', (e) => {
        const loadEndTime = performance.now();
        const loadTime = loadEndTime - loadStartTime;
        console.error(`Error loading ${buttonAlt} video after ${loadTime.toFixed(2)}ms:`, e);
        console.error(`Failed video path: ${videoPath}`);
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

  // 팝업 관련 함수들
  function initPopupEvents() {
    // 모든 닫기 버튼에 이벤트 리스너 추가
    const closeButtons = document.querySelectorAll('.close-popup');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPopups();
      });
    });

    // 팝업 배경 클릭 시 닫기 (영상 컨테이너는 제외)
    const popups = document.querySelectorAll('.tab-popup');
    popups.forEach(popup => {
      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          e.stopPropagation();
          closeAllPopups();
        }
      });
    });
  }

  function showTabPopup(buttonAlt) {
    closeAllPopups(); // 기존 팝업 닫기

    // 측정하기는 태그 오버레이 표시
    if (buttonAlt === 'Measure') {
      const measureOverlay = document.getElementById('measure-overlay');
      if (measureOverlay) {
        measureOverlay.classList.add('active');
        console.log('Showing measure tag overlay');
      }
      return;
    }

    let popupId = '';
    switch(buttonAlt) {
      case 'Scan':
        popupId = 'scan-popup';
        break;
      case '3D Receipt':
        popupId = '3d-receipt-popup';
        break;
      case 'Zoom':
        popupId = 'zoom-popup';
        break;
      case 'Record':
        popupId = 'record-popup';
        break;
      default:
        console.log('Unknown button:', buttonAlt);
        return;
    }

    const popup = document.getElementById(popupId);
    if (popup) {
      popup.style.display = 'flex';
      console.log(`Showing popup: ${popupId}`);
    }
  }

  function closeAllPopups() {
    const popups = document.querySelectorAll('.tab-popup');
    popups.forEach(popup => {
      popup.style.display = 'none';
    });
  }

  // 드래그 가능한 팝업 기능
  function initDraggablePopup() {
    const recipePopup = document.getElementById('3d-receipt-popup');
    const popupContent = recipePopup.querySelector('.popup-content');

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    popupContent.addEventListener('mousedown', dragStart);
    popupContent.addEventListener('touchstart', dragStart);

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
      // 버튼이나 링크 클릭 시에는 드래그 시작하지 않음
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        return;
      }

      if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      isDragging = true;
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();

        if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, popupContent);
      }
    }

    function dragEnd() {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    // 팝업이 닫힐 때 위치 초기화
    const closeButtons = recipePopup.querySelectorAll('.close-popup');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        xOffset = 0;
        yOffset = 0;
        currentX = 0;
        currentY = 0;
        popupContent.style.transform = 'translate(0px, 0px)';
      });
    });

    // 팝업 배경 클릭 시 위치 초기화
    recipePopup.addEventListener('click', (e) => {
      if (e.target === recipePopup) {
        xOffset = 0;
        yOffset = 0;
        currentX = 0;
        currentY = 0;
        popupContent.style.transform = 'translate(0px, 0px)';
      }
    });
  }

  // 확대하기 컨트롤 기능
  function initZoomControl() {
    const zoomControl = document.getElementById('zoom-control');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomSliderFill = document.getElementById('zoom-slider-fill');
    const zoomSliderThumb = document.getElementById('zoom-slider-thumb');
    const zoomValue = document.getElementById('zoom-value');

    let currentProgress = 0; // 0% ~ 100%
    let isDraggingSlider = false;
    let currentVideoElement = null;

    // 줌 진행도 업데이트 함수 (영상 시간을 조절)
    function updateZoomProgress(progress) {
      currentProgress = Math.max(0, Math.min(100, progress));

      zoomSliderFill.style.width = currentProgress + '%';
      zoomSliderThumb.style.left = currentProgress + '%';

      // 줌 배율 계산 (0% = 1.0x, 100% = 3.0x)
      const zoomLevel = 1.0 + (currentProgress / 100) * 2.0;
      zoomValue.textContent = zoomLevel.toFixed(1) + 'x';

      // 비디오 시간 조절 (진행도에 따라)
      if (currentVideoElement && currentVideoElement.duration) {
        const targetTime = (currentProgress / 100) * currentVideoElement.duration;
        currentVideoElement.currentTime = targetTime;
      }
    }

    // 확대 버튼 (진행도 10% 증가)
    zoomInBtn.addEventListener('click', () => {
      updateZoomProgress(currentProgress + 10);
    });

    // 축소 버튼 (진행도 10% 감소)
    zoomOutBtn.addEventListener('click', () => {
      updateZoomProgress(currentProgress - 10);
    });

    // 슬라이더 클릭
    zoomSlider.addEventListener('mousedown', startDrag);
    zoomSlider.addEventListener('touchstart', startDrag);

    function startDrag(e) {
      isDraggingSlider = true;
      updateSliderPosition(e);
    }

    document.addEventListener('mousemove', (e) => {
      if (isDraggingSlider) {
        updateSliderPosition(e);
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (isDraggingSlider) {
        updateSliderPosition(e);
      }
    });

    document.addEventListener('mouseup', () => {
      isDraggingSlider = false;
    });

    document.addEventListener('touchend', () => {
      isDraggingSlider = false;
    });

    function updateSliderPosition(e) {
      const rect = zoomSlider.getBoundingClientRect();
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      updateZoomProgress(percentage);
    }

    // 컨트롤 표시 함수
    window.showZoomControl = function(videoElement) {
      zoomControl.classList.add('active');

      // 전달받은 비디오 요소 저장
      currentVideoElement = videoElement;

      // 초기 진행도 0으로 설정
      updateZoomProgress(0);

      console.log('Zoom control UI displayed');
      console.log('Video duration:', currentVideoElement.duration);
    };

    // 컨트롤 숨기기 함수
    window.hideZoomControl = function() {
      zoomControl.classList.remove('active');
      currentVideoElement = null;
      currentProgress = 0;
    };

    // 다른 탭 클릭 시 줌 컨트롤 숨기기
    const tabs = document.querySelectorAll('.bottom-bar-item');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const buttonAlt = tab.querySelector('img').alt;
        if (buttonAlt !== 'Zoom') {
          window.hideZoomControl();
        }
      });
    });
  }

  // 탐색 이미지 뷰 기능
  function initScanImageView() {
    const scanImageContainer = document.getElementById('scan-image-container');
    const selectableAreas = scanImageContainer.querySelectorAll('.selectable-area');

    // 이미지 뷰 표시 함수
    window.showScanImageView = function() {
      scanImageContainer.classList.add('active');
      console.log('Scan image view displayed');
    };

    // 이미지 뷰 숨기기 함수
    window.hideScanImageView = function() {
      scanImageContainer.classList.remove('active');
      console.log('Scan image view hidden');
    };

    // 영역 클릭 시 로그만 출력 (탐색하기에서는 팝업 없음)
    selectableAreas.forEach(area => {
      area.addEventListener('click', () => {
        const areaName = area.dataset.area;
        console.log(`Clicked area: ${areaName}`);
      });
    });

    // 다른 탭 클릭 시 이미지 뷰 숨기기
    const tabs = document.querySelectorAll('.bottom-bar-item');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const buttonAlt = tab.querySelector('img').alt;
        if (buttonAlt !== 'Scan') {
          window.hideScanImageView();
        }
      });
    });
  }

});
