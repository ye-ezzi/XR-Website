/**
 * Cooking Mode - Modular Version
 * 컴포넌트를 사용한 요리 모드 메인 스크립트
 */

import { cookingComponents } from './components/cooking-components.js';

console.log('Cooking mode (modular) loaded');

document.addEventListener('DOMContentLoaded', () => {
  // ========== 컴포넌트 초기화 ==========
  const { videoContainer, recipePopupManager, recipeCarousel } = cookingComponents.initAll({
    videoContainerId: 'animation-container',
    popupIds: ['microwavePopup', 'fridgePopup'],
    carouselId: 'recipe-carousel-overlay',
    carouselOptions: {
      totalRecipes: 5,
      onCardClick: (cardData, cardElement) => {
        // 중앙 카드 클릭 시 레시피 상세 팝업 표시
        console.log('Recipe card clicked:', cardData);
        recipeCarousel.hide();
        document.getElementById('3d-receipt-popup').style.display = 'flex';
      }
    },
    onVideoEnd: () => {
      // 비디오 종료 시 레시피 팝업 표시
      console.log('Explore video ended - showing recipe popups');
      recipePopupManager.show('microwavePopup');
      recipePopupManager.show('fridgePopup');
    }
  });

  // ========== 전역 함수 정의 (HTML onclick 이벤트용) ==========

  // Explore 비디오 재생
  window.playExploreVideo = function() {
    console.log('Playing explore video...');
    videoContainer.play('/videos/explore.mp4');
  };

  // 레시피 캐러셀 표시
  window.showRecipeCarousel = function() {
    console.log('Showing recipe carousel');
    recipeCarousel.show();
  };

  // 레시피 캐러셀 닫기
  window.closeRecipeCarousel = function() {
    console.log('Closing recipe carousel');
    recipeCarousel.hide();
  };

  // 다음 레시피
  window.nextRecipe = function() {
    recipeCarousel.next();
    console.log('Next recipe:', recipeCarousel.getCurrentIndex());
  };

  // 이전 레시피
  window.previousRecipe = function() {
    recipeCarousel.previous();
    console.log('Previous recipe:', recipeCarousel.getCurrentIndex());
  };

  // ========== 페이지 로드 시 Explore 비디오 자동 재생 ==========
  setTimeout(() => {
    playExploreVideo();
  }, 100);

  // ========== 기존 기능들 (팝업, 드래그, 줌 등) ==========
  initPopupEvents();
  initDraggablePopup();
  initZoomControl();
  initScanImageView();
  initTabs();

  console.log('Cooking mode initialization complete');
});

// ========== 탭 관리 ==========
function initTabs() {
  const tabs = document.querySelectorAll('.bottom-bar-item');

  const updateTabState = (selectedTab) => {
    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.style.color = '#fff';
      const img = tab.querySelector('img');
      if (img) {
        img.src = img.dataset.originalSrc || img.src;
      }
      const targetContentId = tab.dataset.targetContent;
      const targetContent = document.getElementById(targetContentId);
      if (targetContent) {
        targetContent.style.display = 'none';
      }
    });

    if (selectedTab) {
      selectedTab.classList.add('active');
      selectedTab.style.color = '#fff';
      const targetContentId = selectedTab.dataset.targetContent;
      const targetContent = document.getElementById(targetContentId);
      if (targetContent) {
        targetContent.style.display = 'flex';
      }
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      updateTabState(tab);

      const buttonAlt = tab.querySelector('img').alt;
      showTabPopup(buttonAlt);

      if (buttonAlt !== 'Scan') {
        window.hideScanImageView();
      }
    });
  });

  // 첫 번째 탭 활성화
  if (tabs.length > 0) {
    updateTabState(tabs[0]);
  }
}

// ========== 탭 팝업 표시 ==========
function showTabPopup(buttonAlt) {
  closeAllPopups();

  if (buttonAlt === 'Measure') {
    const measureOverlay = document.getElementById('measure-overlay');
    if (measureOverlay) {
      measureOverlay.classList.add('active');
      console.log('Showing measure tag overlay');
    }
    return;
  }

  if (buttonAlt === '3D Receipt') {
    showRecipeCarousel();
    return;
  }

  let popupId = '';
  switch(buttonAlt) {
    case 'Scan':
      popupId = 'scan-popup';
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
    console.log(`Showing ${popupId}`);
  }
}

function closeAllPopups() {
  const popups = document.querySelectorAll('.tab-popup');
  popups.forEach(popup => {
    popup.style.display = 'none';
  });

  // 레시피 팝업도 닫기
  const components = cookingComponents.getRecipePopupManager();
  if (components) {
    components.hideAll();
  }
}

// ========== 팝업 이벤트 초기화 ==========
function initPopupEvents() {
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

// ========== 드래그 가능한 팝업 ==========
function initDraggablePopup() {
  const recipePopup = document.getElementById('3d-receipt-popup');
  const popupContent = recipePopup?.querySelector('.popup-content');

  if (!recipePopup || !popupContent) return;

  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  popupContent.addEventListener('mousedown', (e) => {
    if (e.target.closest('.close-popup, .popup-actions, button')) {
      return;
    }
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = popupContent.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    popupContent.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    popupContent.style.left = `${initialLeft + dx}px`;
    popupContent.style.top = `${initialTop + dy}px`;
    popupContent.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      popupContent.style.cursor = 'grab';
    }
  });

  window.show3DRecipePopup = function() {
    recipePopup.style.display = 'flex';
  };

  window.close3DRecipePopup = function() {
    recipePopup.style.display = 'none';
    popupContent.style.left = '';
    popupContent.style.top = '';
    popupContent.style.transform = '';
  };
}

// ========== 줌 컨트롤 ==========
function initZoomControl() {
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  const zoomInBtn = document.querySelector('.zoom-in');
  const zoomOutBtn = document.querySelector('.zoom-out');

  if (!zoomSlider || !zoomValue) return;

  zoomSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    zoomValue.textContent = `${value}%`;
    console.log(`Zoom level: ${value}%`);
  });

  zoomInBtn?.addEventListener('click', () => {
    const currentValue = parseInt(zoomSlider.value);
    const newValue = Math.min(currentValue + 10, 200);
    zoomSlider.value = newValue;
    zoomValue.textContent = `${newValue}%`;
  });

  zoomOutBtn?.addEventListener('click', () => {
    const currentValue = parseInt(zoomSlider.value);
    const newValue = Math.max(currentValue - 10, 100);
    zoomSlider.value = newValue;
    zoomValue.textContent = `${newValue}%`;
  });
}

// ========== 스캔 이미지 뷰 ==========
function initScanImageView() {
  window.showScanImageView = function() {
    const scanOverlay = document.getElementById('scan-image-overlay');
    if (scanOverlay) {
      scanOverlay.classList.add('active');
      console.log('Showing scan image view');
    }
  };

  window.hideScanImageView = function() {
    const scanOverlay = document.getElementById('scan-image-overlay');
    if (scanOverlay) {
      scanOverlay.classList.remove('active');
      console.log('Hiding scan image view');
    }
  };
}
