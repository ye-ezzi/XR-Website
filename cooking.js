// Import components
import { VideoContainer } from './components/VideoContainer.js';
import { RecipePopupManager, RecipePopup } from './components/RecipePopup.js';
import { RecipeCarousel } from './components/RecipeCarousel.js';
import { FoodRecordPopup } from './components/FoodRecordPopup.js';

console.log('Cooking mode loaded');

// 컴포넌트 인스턴스
let videoContainer;
let recipePopupManager;
let recipeCarousel;
let foodRecordPopup;
let gestureZoom;
let setGestureZoomValue;
let showGestureZoomOverlay;
let hideGestureZoomOverlay;
const BASE_VIDEO_SCALE = 1.2;
let stopAutoZoomSync;
let autoZoomSyncedOnce = false;

document.addEventListener('DOMContentLoaded', () => {
  // ========== 컴포넌트 초기화 ==========
  // 비디오 컨테이너
  videoContainer = new VideoContainer('animation-container', () => {
    console.log('Explore video ended - showing recipe popups');
    recipePopupManager.show('microwavePopup');
    recipePopupManager.show('fridgePopup');
  });

  // 레시피 팝업 매니저
  recipePopupManager = new RecipePopupManager();
  recipePopupManager.register('microwavePopup', new RecipePopup('microwavePopup'));
  recipePopupManager.register('fridgePopup', new RecipePopup('fridgePopup'));

  const recipeData = [
    {
      title: '토마토 스파게티',
      image: '/images/food1.png',
      rating: 4,
      reviews: 140,
      time: '30분',
      serving: '2인분',
      description: '평일 저녁, 팬 하나로 완성하는 이 레시피는 신선한 바질과 마늘, 오레가노, 미트볼이 어우러진 진하고 감칠맛 나는 토마토 소스 파스타입니다.',
      ingredients: ['스파게티 면 100g', '토마토 소스 100ml', '마늘 3쪽', '올리브유 2큰술', '양파 1/2개', '바질 1작은술', '소금 1작은술', '후추 1작은술', '파마산 치즈 (선택)'],
      steps: [
        '냄비에 물을 끓이고 소금을 넣은 후 스파게티 면을 8-10분간 삶습니다.',
        '마늘과 양파를 잘게 다집니다.',
        '팬에 올리브유를 두르고 마늘과 양파를 볶습니다.',
        '토마토 소스를 넣고 중불에서 5분간 잘 섞습니다.',
        '삶은 스파게티 면을 소스에 넣고 잘 섞습니다.',
        '소금, 후추로 간을 맞추고 바질을 올립니다.',
        '접시에 담고 파마산 치즈를 뿌려 완성합니다.'
      ]
    },
    {
      title: '베이컨 김치 크림 리조또',
      image: '/images/food2.png',
      rating: 3.5,
      reviews: 60,
      time: '15분',
      serving: '1인분',
      description: '한국인의 소울푸드 김치를 우유와 치즈로 부드럽게 재해석한 \'원팬\' 요리입니다.',
      ingredients: ['밥 1공기', '잘 익은 김치 1/2컵', '베이컨 3줄', '우유 200ml', '양파 1/4개', '체다 치즈 1장', '다진 마늘 1큰술', '버터'],
      steps: [
        '김치와 베이컨, 양파는 손가락으로 떼먹기 좋게 잘게 다집니다.',
        '깊은 팬에 기름을 두르고 다진 마늘과 베이컨, 양파를 노릇하게 볶습니다.',
        '김치를 넣고 숨이 죽을 때까지 충분히 볶아 신맛을 날려줍니다.',
        '밥을 넣고 재료와 잘 섞이도록 고슬고슬하게 볶아줍니다.',
        '우유를 붓고 밥알이 부드럽게 퍼질 때까지 중약불에서 저어가며 끓입니다.'
      ]
    },
    {
      title: '해물 볶음 우동',
      image: '/images/food3.png',
      rating: 4,
      reviews: 42,
      time: '15분',
      serving: '1인분',
      description: '탱글탱글한 우동 면발에 신선한 해산물과 아삭한 양배추, 감칠맛 나는 굴소스를 넣어 센 불에 빠르게 볶아낸 별미 볶음 우동입니다.',
      ingredients: ['우동 사리 1개', '냉동 해물 믹스 1줌', '양배추 1/8통', '양파 1/4개', '대파', '굴소스 2큰술', '간장 1큰술', '가쓰오부시(선택)'],
      steps: [
        '끓는 물에 우동 면을 1분간 살짝 데쳐 찬물에 헹궈 물기를 뺍니다.',
        '해산물은 깨끗이 씻어두고, 양배추와 양파는 굵게 채 썹니다.',
        '팬에 식용유를 두르고 편으로 센 마늘과 대파를 볶아 향을 냅니다.',
        '해산물, 양파, 양배추를 넣고 센 불에서 빠르게 볶아 불맛을 입힙니다.',
        '데친 우동 면과 굴소스, 간장, 설탕을 넣고 간이 잘 배도록 볶습니다.',
        '그릇에 담고 가쓰오부시나 쪽파를 뿌려 완성합니다.'
      ]
    },
    {
      title: '챱스테이크',
      image: '/images/food4.png',
      rating: 2.5,
      reviews: 58,
      time: '20분',
      serving: '2인분',
      description: '특별한 날, 한 입 크기로 썬 소고기와 아삭한 파프리카, 양파를 달콤 짭조름한 소스에 볶아낸 육즙 가득한 찹스테이크입니다.',
      ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/2개', '감자 1개', '대파 1대', '청양고추 2개'],
      steps: ['감자와 애호박을 먹기 좋은 크기로 썰어줍니다.', '물을 끓이고 된장을 푼 후 감자를 넣습니다.', '애호박, 두부를 넣고 끓입니다.', '대파와 고추를 넣고 한소끔 끓입니다.']
    },
    {
      title: '꾸덕 3분 초코 브라우니',
      image: '/images/food5.png',
      rating: 3,
      reviews: 102,
      time: '15분',
      serving: '1인분',
      description: '오븐 없이 전자레인지로 완성하는 이 레시피는 진한 초콜릿의 풍미와 쫀득한 식감이 살아있어, 당 충전이 필요한 오후에 완벽한 디저트입니다.',
      ingredients: ['밥 1공기', '고추장 2큰술', '참기름 1큰술', '시금치 50g', '당근 50g', '숙주 50g', '계란 1개'],
      steps: ['각종 나물을 데쳐서 준비합니다.', '계란을 프라이로 익힙니다.', '그릇에 밥을 담고 나물을 올립니다.', '계란 프라이를 올리고 고추장과 참기름을 넣어 비벼먹습니다.']
    }
  ];

  const buildCarouselCards = () => {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    track.innerHTML = '';

    recipeData.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'recipe-carousel-card' + (index === 0 ? ' center' : index === 1 ? ' right' : index === recipeData.length - 1 ? ' left' : ' hidden');
      card.setAttribute('data-index', String(index));

      const ingredientTags = item.ingredients ? item.ingredients.map(ing => `<span class="badge">${ing}</span>`).join('') : '';
      const stepsList = item.steps ? item.steps.map((step, idx) => `<li>${idx + 1}. ${step}</li>`).join('') : '';

      card.innerHTML = `
        <button class="card-close-btn" aria-label="레시피 캐러셀 닫기"></button>
        <img src="${item.image}" alt="${item.title}" class="recipe-card-image" />
        <div class="recipe-card-info">
          <div class="recipe-info-top">
            <div>
              <h3 class="recipe-card-title">${item.title}</h3>
              <div class="recipe-rating-row">
                <div class="rating-stars">
                  ${buildStars(item.rating)}
                </div>
                <span class="recipe-rating-count">후기 ${item.reviews}명</span>
              </div>
              <div class="recipe-badges">
                <span class="badge">${item.time}</span>
                <span class="badge">${item.serving}</span>
              </div>
            </div>
            <button class="recipe-bookmark" aria-label="즐겨찾기">
              <img src="/images/save.svg" alt="저장하기" />
            </button>
          </div>
          <p class="recipe-card-description">${item.description}</p>
          <div class="view-more-btn">
            <img src="/images/view more.svg" alt="더보기" />
          </div>

          <div class="recipe-detail-content">
            <div class="recipe-section">
              <h4 class="recipe-section-title">재료 준비</h4>
              <div class="recipe-ingredients">
                ${ingredientTags}
              </div>
            </div>

            <div class="recipe-section">
              <h4 class="recipe-section-title">조리 순서</h4>
              <ol class="recipe-steps">
                ${stepsList}
              </ol>
            </div>
          </div>
        </div>
      `;

      track.appendChild(card);
    });
  };

  const buildStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const empty = i > Math.round(rating);
      const starSrc = empty ? '/images/star.svg' : '/images/star_active.svg';
      stars.push(`<img src="${starSrc}" class="${empty ? 'empty' : 'filled'}" alt="별" />`);
    }
    return stars.join('');
  };

  buildCarouselCards();

  // 북마크 버튼 이벤트 리스너 추가
  const initBookmarkButtons = () => {
    const bookmarkButtons = document.querySelectorAll('.recipe-bookmark');
    bookmarkButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        button.classList.toggle('active');

        const img = button.querySelector('img');
        if (button.classList.contains('active')) {
          img.src = '/images/save_active.svg';
        } else {
          img.src = '/images/save.svg';
        }
      });
    });
  };

  initBookmarkButtons();

  const updateCarouselBottomBar = () => {
    const bottomBar = document.querySelector('.carousel-bottom-bar');
    if (!bottomBar || !recipeCarousel) return;

    const currentIndex = recipeCarousel.getCurrentIndex();
    const currentRecipe = recipeData[currentIndex];
    if (!currentRecipe) return;

    const nameEl = bottomBar.querySelector('.recipe-name');
    const metaEl = bottomBar.querySelector('.recipe-meta');
    const thumbImg = bottomBar.querySelector('.carousel-thumb img');

    if (nameEl) nameEl.textContent = currentRecipe.title || '';

    if (metaEl) {
      metaEl.innerHTML = '';
      if (currentRecipe.time) {
        const timeSpan = document.createElement('span');
        timeSpan.textContent = currentRecipe.time;
        metaEl.appendChild(timeSpan);
      }
      if (currentRecipe.serving) {
        const servingSpan = document.createElement('span');
        servingSpan.textContent = currentRecipe.serving;
        metaEl.appendChild(servingSpan);
      }
    }

    if (thumbImg && currentRecipe.image) {
      thumbImg.src = currentRecipe.image;
      thumbImg.alt = currentRecipe.title || thumbImg.alt;
    }
  };

  // 레시피 캐러셀 (개선된 3D 효과)
  recipeCarousel = new RecipeCarousel('recipe-carousel-overlay', {
    totalRecipes: 5,
    onCardClick: (cardData, cardElement) => {
      console.log('Recipe card clicked:', cardData);
      // X 버튼으로만 닫기 가능하도록 변경
    }
  });
  updateCarouselBottomBar();

  // 음식 기록하기 팝업 컴포넌트
  foodRecordPopup = new FoodRecordPopup({
    onSave: () => {
      if (typeof window.saveRecord === 'function') {
        window.saveRecord();
      }
    }
  });
  window.foodRecordPopup = foodRecordPopup;

  // ========== 기존 코드 ==========
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

  // 제스처형 줌 오버레이 초기화
  initGestureZoom();

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
  window.playExploreVideo = function() {
    console.log('Playing explore video using VideoContainer component');

    // Lottie 라이브러리가 로드되었는지 확인
    if (typeof lottie === 'undefined') {
      console.error('Lottie library is not loaded');
      return;
    }

    if (measureAnimation) {
      measureAnimation.destroy();
    }

    // VideoContainer 컴포넌트를 사용하여 비디오 재생
    videoContainer.play('/videos/explore.mp4');
  };

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

      if (measureAnimation) {
        measureAnimation.destroy();
      }

      // 모든 콘텐츠를 즉시 숨김
      const allContents = document.querySelectorAll('.tab-content');
      allContents.forEach(content => {
        content.style.display = 'none';
      });

      // 버튼에 따라 다른 영상 선택
      let videoPath = '/videos/explore.mp4'; // 기본값 (Scan)
      if (buttonAlt === '3D Receipt') {
        videoPath = '/videos/3D.mp4';
      } else if (buttonAlt === 'Measure') {
        videoPath = '/videos/measure.mp4';
      } else if (buttonAlt === 'Record') {
        videoPath = '/videos/capture.mp4';
      } else if (buttonAlt === 'Zoom') {
        videoPath = '/videos/zoom.mp4';
      }

      console.log('Playing video using VideoContainer:', videoPath);

      // Zoom 탭은 항상 수동 재생 (자동재생/자동동기화 없음)
      const shouldAutoplay = buttonAlt === 'Zoom' ? false : true;

      // VideoContainer 컴포넌트를 사용하여 비디오 재생
      videoContainer.play(videoPath, () => {
        console.log(`${buttonAlt} video ended`);

        // 3D Receipt 버튼인 경우 레시피 캐러셀 표시
        if (buttonAlt === '3D Receipt') {
          window.showRecipeCarousel();
        }

        // Measure 버튼인 경우 팝업 표시
        if (buttonAlt === 'Measure') {
          showTabPopup(buttonAlt);
        }

        // Record 버튼인 경우 팝업 표시
        if (buttonAlt === 'Record') {
          showTabPopup(buttonAlt);
        }
      }, { autoplay: shouldAutoplay });

      // Zoom 탭일 때만 오버레이 노출 및 현재 줌 적용
      if (buttonAlt === 'Zoom') {
        if (showGestureZoomOverlay) showGestureZoomOverlay();
        applyGestureZoomToVideo();
        if (videoContainer && videoContainer.videoElement) {
          videoContainer.videoElement.pause(); // 강제 정지 상태 유지
        }
      } else {
        if (hideGestureZoomOverlay) hideGestureZoomOverlay(true);
        resetVideoScale();
        if (stopAutoZoomSync) stopAutoZoomSync();
      }
  });
});

  // 페이지 로드 시 첫 번째 탭을 활성 상태로 설정 (옵션)
  if (tabs.length > 0) {
    // 초기 활성 탭을 'Scan'으로 설정 (id: scan-content와 연결된 탭)
    const initialTab = document.querySelector('[data-target-content="scan-content"]');
    if (initialTab) {
      updateTabState(initialTab);
      // 페이지 로드 시 탐색 비디오 자동 재생
      videoContainer.play('/videos/explore.mp4', () => {
        console.log('Initial explore video ended - showing recipe popups');
        recipePopupManager.show('microwavePopup');
        recipePopupManager.show('fridgePopup');
      });
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

    // 전자레인지 팝업 클릭 시 닫기
    const microwavePopup = document.getElementById('microwavePopup');
    if (microwavePopup) {
      microwavePopup.addEventListener('click', (e) => {
        // 팝업 배경 클릭 시에만 닫기
        if (e.target === microwavePopup) {
          microwavePopup.style.display = 'none';
        }
      });

      // 레시피 카드 클릭 시 닫기
      const microwaveCard = microwavePopup.querySelector('.recipe-card');
      if (microwaveCard) {
        microwaveCard.addEventListener('click', () => {
          microwavePopup.style.display = 'none';
          console.log('Microwave recipe card clicked - popup closed');
        });
      }
    }

    // 냉장고 팝업 클릭 시 닫기
    const fridgePopup = document.getElementById('fridgePopup');
    if (fridgePopup) {
      fridgePopup.addEventListener('click', (e) => {
        // 팝업 배경 클릭 시에만 닫기
        if (e.target === fridgePopup) {
          fridgePopup.style.display = 'none';
        }
      });

      // 레시피 카드 클릭 시 닫기
      const fridgeCard = fridgePopup.querySelector('.recipe-card');
      if (fridgeCard) {
        fridgeCard.addEventListener('click', () => {
          fridgePopup.style.display = 'none';
          console.log('Fridge recipe card clicked - popup closed');
        });
      }
    }
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

    // 3D Recipe는 캐러셀 표시
    if (buttonAlt === '3D Receipt') {
      showRecipeCarousel();
      console.log('Showing recipe carousel');
      return;
    }

    let popupId = '';
    switch(buttonAlt) {
      case 'Scan':
        popupId = 'scan-popup';
        break;
      case 'Record':
        if (foodRecordPopup) {
          foodRecordPopup.show();
          console.log('Showing popup: record-popup');
        }
        return;
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

    // 전자레인지 팝업 닫기
    const microwavePopup = document.getElementById('microwavePopup');
    if (microwavePopup) {
      microwavePopup.style.display = 'none';
    }

    // 냉장고 팝업 닫기
    const fridgePopup = document.getElementById('fridgePopup');
    if (fridgePopup) {
      fridgePopup.style.display = 'none';
    }
  }

  // 드래그 가능한 팝업 기능
  function initDraggablePopup() {
    const recipePopup = document.getElementById('3d-receipt-popup');
    if (!recipePopup) return;
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

  // 제스처형 줌 라인 UI
  function initGestureZoom() {
    const overlay = document.createElement('div');
    overlay.id = 'zoom-gesture-overlay';
    overlay.className = 'zoom-gesture-overlay';
    overlay.innerHTML = `
      <div class="zoom-gesture-banner">
        터치패드를 클릭 후 위 아래로 드래그해 확대/축소하세요.
      </div>
      <div class="zoom-gesture-line">
        <div class="zoom-gesture-hands">
          <div class="zoom-gesture-hand left"></div>
          <div class="zoom-gesture-hand right"></div>
        </div>
        <div class="zoom-gesture-line-core"></div>
        <div class="zoom-gesture-tag">100%</div>
        <div class="zoom-gesture-hit"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const line = overlay.querySelector('.zoom-gesture-line');
    const lineCore = overlay.querySelector('.zoom-gesture-line-core');
    const tag = overlay.querySelector('.zoom-gesture-tag');
    const hit = overlay.querySelector('.zoom-gesture-hit');
    const leftHand = overlay.querySelector('.zoom-gesture-hand.left');
    const rightHand = overlay.querySelector('.zoom-gesture-hand.right');

    gestureZoom = {
      overlay,
      line,
      lineCore,
      tag,
      leftHand,
      rightHand,
      value: 100,
      dragging: false,
      startX: 0,
      startValue: 100,
      showHands: false,
      introPlaying: false,
      manualOverride: false
    };

    const clampValue = (v) => Math.max(0, Math.min(300, v));

    setGestureZoomValue = (v) => {
      if (!gestureZoom) return;
      gestureZoom.value = clampValue(v);
      const normalized = gestureZoom.value / 300; // 0~1
      const widthPercent = normalized * 80; // 0% ~ 80%
      lineCore.style.setProperty('--line-width', `${widthPercent}%`);
      tag.textContent = `${Math.round(gestureZoom.value)}%`;
      positionHands(widthPercent);
      applyGestureZoomToVideo();

      // 드래그로 값 조절 중이면 영상 재생 위치를 함께 이동(정/역 방향)
      if (gestureZoom.manualOverride) {
        if (videoContainer && videoContainer.videoElement && !videoContainer.videoElement.paused) {
          videoContainer.videoElement.pause(); // 수동 조작 중에는 영상 정지 유지
        }
        syncVideoTimeToValue();
      }
    };

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    const positionHands = (widthPercent) => {
      if (!gestureZoom || !gestureZoom.line) return;
      const lineWidthPx = (gestureZoom.line.clientWidth || window.innerWidth) * (widthPercent / 100);
      const offset = lineWidthPx / 2;
      const handHalf = (leftHand?.offsetWidth || 0) / 2;
      const show = gestureZoom.showHands && widthPercent > 0;

      if (leftHand && rightHand) {
        leftHand.style.opacity = show ? '1' : '0';
        rightHand.style.opacity = show ? '1' : '0';
        leftHand.style.transform = `translate(calc(-50% - ${offset + handHalf * 0.1}px), 0)`;
        rightHand.style.transform = `translate(calc(-50% + ${offset + handHalf * 2}px), 0)`;
      }
    };

    const onPointerDown = (e) => {
      gestureZoom.dragging = true;
      gestureZoom.startX = getClientX(e);
      gestureZoom.startValue = gestureZoom.value;
      gestureZoom.manualOverride = true;
      if (stopAutoZoomSync) stopAutoZoomSync(); // 자동 진행 연동 중단
      if (videoContainer && videoContainer.videoElement) {
        videoContainer.videoElement.pause();
      }
      if (videoContainer && videoContainer.videoElement) {
        videoContainer.videoElement.pause(); // 수동 조작 시 영상 재생 멈춤
      }
      line.classList.add('dragging');
      if (e.pointerId !== undefined && hit.setPointerCapture) {
        hit.setPointerCapture(e.pointerId);
      }
      if (showGestureZoomOverlay) showGestureZoomOverlay();
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!gestureZoom.dragging) return;
      gestureZoom.showHands = true;
      const deltaX = getClientX(e) - gestureZoom.startX;
      const width = line.clientWidth || window.innerWidth;
      const deltaValue = (deltaX / width) * 200; // map to 0~200 range
      setGestureZoomValue(gestureZoom.startValue + deltaValue);
    };

    const stopDrag = () => {
      if (!gestureZoom.dragging) return;
      gestureZoom.dragging = false;
      line.classList.remove('dragging');
      gestureZoom.showHands = false;
      gestureZoom.manualOverride = false; // 드래그 종료 후 자동 진행도 동기화 허용
      positionHands(parseFloat(lineCore.style.getPropertyValue('--line-width')) || 0);
    };

    hit.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    showGestureZoomOverlay = () => {
      if (!gestureZoom) return;
      gestureZoom.overlay.classList.add('active');
      startIntroAnimation();
      applyGestureZoomToVideo();
    };

    hideGestureZoomOverlay = (reset = false) => {
      if (!gestureZoom) return;
      gestureZoom.overlay.classList.remove('active');
      if (reset && setGestureZoomValue) {
        setGestureZoomValue(100);
      }
      gestureZoom.showHands = false;
      gestureZoom.manualOverride = false;
      if (gestureZoom.leftHand) gestureZoom.leftHand.style.opacity = '0';
      if (gestureZoom.rightHand) gestureZoom.rightHand.style.opacity = '0';
      if (stopAutoZoomSync) stopAutoZoomSync();
    };

    // 초기 상태
    setGestureZoomValue(0);
  }

  function startIntroAnimation() {
    if (!gestureZoom) return;
    // 영상 진행도 기반으로 timeupdate에서 동기화하므로 여기서는 0으로 초기화만 수행
    setGestureZoomValue(0);
    if (gestureZoom.leftHand) gestureZoom.leftHand.style.opacity = '0';
    if (gestureZoom.rightHand) gestureZoom.rightHand.style.opacity = '0';
  }

  function applyGestureZoomToVideo() {
    if (!gestureZoom || !videoContainer || !videoContainer.videoElement) return;
    // 100% 이하는 기본 스케일 유지, 100% 이상부터 추가 확대
    const multiplier = Math.max(1, gestureZoom.value / 100);
    const scale = BASE_VIDEO_SCALE * multiplier;
    const videoEl = videoContainer.videoElement;
    videoEl.style.transformOrigin = 'center center';
    videoEl.style.transition = 'transform 0.08s linear';
    videoEl.style.transform = `scale(${scale})`;
  }

  function resetVideoScale() {
    if (videoContainer && videoContainer.videoElement) {
      videoContainer.videoElement.style.transform = `scale(${BASE_VIDEO_SCALE})`;
    }
  }

  function syncVideoTimeToValue() {
    if (!gestureZoom || !videoContainer || !videoContainer.videoElement) return;
    const videoEl = videoContainer.videoElement;
    if (!videoEl.duration || videoEl.duration === Infinity) return;
    const valueForPlayback = Math.max(0, Math.min(gestureZoom.value, 100)); // 재생 위치는 0~100%만 사용
    const targetTime = (valueForPlayback / 100) * videoEl.duration;
    videoEl.currentTime = targetTime;
  }

  function startAutoZoomSyncWithVideo() {
    // 자동 동기화/자동재생 제거됨 (수동 조작 전용)
    if (stopAutoZoomSync) stopAutoZoomSync();
    stopAutoZoomSync = null;
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

  // ========== Recipe Carousel Functions (Using Component) ==========
  window.showRecipeCarousel = function() {
    console.log('Showing recipe carousel using RecipeCarousel component');
    recipeCarousel.show();
    updateCarouselBottomBar();
  };

  window.closeRecipeCarousel = function() {
    console.log('Closing recipe carousel');
    recipeCarousel.hide();
  };

  window.nextRecipe = function() {
    recipeCarousel.next();
    updateCarouselBottomBar();
    console.log('Next recipe:', recipeCarousel.getCurrentIndex());
  };

  window.previousRecipe = function() {
    recipeCarousel.previous();
    updateCarouselBottomBar();
    console.log('Previous recipe:', recipeCarousel.getCurrentIndex());
  };

  // ========== Measure Tag 관련 함수 ==========
  window.showNutritionFromTag = function() {
    console.log('Showing nutrition from tag');
    const nutritionPopup = document.getElementById('nutrition-popup');
    if (nutritionPopup) {
      nutritionPopup.style.display = 'flex';
    }
  };

  window.closeNutritionPopup = function() {
    console.log('Closing nutrition popup');
    const nutritionPopup = document.getElementById('nutrition-popup');
    if (nutritionPopup) {
      nutritionPopup.style.display = 'none';
    }
  };

  window.goToRecipeSearch = function() {
    console.log('Going to recipe search');
    window.closeNutritionPopup();
    window.showRecipeCarousel();
  };

  // ========== Record 관련 함수 ==========
  window.saveRecord = function() {
    console.log('Saving record');
    const descriptionInput = document.getElementById('food-description');
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const finalDescription = description || '메모 없이 저장됨';
    const rating = window.foodRecordPopup ? window.foodRecordPopup.rating : null;
    const recordPopup = document.getElementById('record-popup');

    console.log('음식 기록 저장:', {
      description: finalDescription,
      rating: rating,
      timestamp: new Date().toISOString()
    });

    if (recordPopup) {
      recordPopup.style.display = 'none';
    }

    if (descriptionInput) {
      descriptionInput.value = '';
    }

    // 저장 완료 팝업 표시 생략 (사용자 요청)
  };

});
