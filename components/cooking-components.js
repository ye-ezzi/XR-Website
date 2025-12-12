/**
 * Cooking Components Entry Point
 * 모든 cooking 관련 컴포넌트를 통합 관리하는 메인 파일
 */

import { VideoContainer } from './VideoContainer.js';
import { RecipePopup, RecipePopupManager } from './RecipePopup.js';
import { RecipeCarousel } from './RecipeCarousel.js';

/**
 * Cooking Components Manager
 * 모든 컴포넌트의 인스턴스를 관리하고 초기화
 */
export class CookingComponents {
  constructor() {
    this.videoContainer = null;
    this.recipePopupManager = null;
    this.recipeCarousel = null;
  }

  /**
   * 비디오 컨테이너 초기화
   * @param {string} containerId - 비디오 컨테이너 ID
   * @param {Function} onVideoEnd - 비디오 종료 시 콜백
   * @returns {VideoContainer}
   */
  initVideoContainer(containerId, onVideoEnd = null) {
    this.videoContainer = new VideoContainer(containerId, onVideoEnd);
    return this.videoContainer;
  }

  /**
   * 레시피 팝업 매니저 초기화
   * @param {Array<string>} popupIds - 팝업 ID 배열
   * @returns {RecipePopupManager}
   */
  initRecipePopups(popupIds) {
    this.recipePopupManager = new RecipePopupManager();

    popupIds.forEach(id => {
      const popup = new RecipePopup(id);
      this.recipePopupManager.register(id, popup);
    });

    return this.recipePopupManager;
  }

  /**
   * 레시피 캐러셀 초기화
   * @param {string} overlayId - 오버레이 ID
   * @param {Object} options - 캐러셀 옵션
   * @returns {RecipeCarousel}
   */
  initRecipeCarousel(overlayId, options = {}) {
    this.recipeCarousel = new RecipeCarousel(overlayId, options);
    return this.recipeCarousel;
  }

  /**
   * 모든 컴포넌트 초기화
   * @param {Object} config - 설정 객체
   */
  initAll(config = {}) {
    const {
      videoContainerId = 'animation-container',
      popupIds = ['microwavePopup', 'fridgePopup'],
      carouselId = 'recipe-carousel-overlay',
      carouselOptions = {},
      onVideoEnd = null
    } = config;

    // 비디오 컨테이너 초기화
    this.initVideoContainer(videoContainerId, onVideoEnd);

    // 레시피 팝업 초기화
    this.initRecipePopups(popupIds);

    // 레시피 캐러셀 초기화
    this.initRecipeCarousel(carouselId, carouselOptions);

    return {
      videoContainer: this.videoContainer,
      recipePopupManager: this.recipePopupManager,
      recipeCarousel: this.recipeCarousel
    };
  }

  /**
   * 비디오 컨테이너 가져오기
   * @returns {VideoContainer}
   */
  getVideoContainer() {
    return this.videoContainer;
  }

  /**
   * 레시피 팝업 매니저 가져오기
   * @returns {RecipePopupManager}
   */
  getRecipePopupManager() {
    return this.recipePopupManager;
  }

  /**
   * 레시피 캐러셀 가져오기
   * @returns {RecipeCarousel}
   */
  getRecipeCarousel() {
    return this.recipeCarousel;
  }
}

// 전역 인스턴스 (옵션)
export const cookingComponents = new CookingComponents();
