/**
 * Recipe Popup Component
 * 레시피 카드 팝업을 관리하는 컴포넌트
 */
export class RecipePopup {
  constructor(popupId) {
    this.popup = document.getElementById(popupId);
    this.card = null;

    if (this.popup) {
      this.card = this.popup.querySelector('.recipe-card');
      this.setupEventListeners();
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    if (!this.popup) return;

    // 팝업 배경 클릭 시 닫기
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.hide();
      }
    });

    // 레시피 카드 클릭 시 닫기
    if (this.card) {
      this.card.addEventListener('click', () => {
        this.hide();
        console.log(`${this.popup.id} card clicked - popup closed`);
      });
    }
  }

  /**
   * 팝업 표시
   */
  show() {
    if (this.popup) {
      this.popup.style.display = 'flex';
      this.popup.style.pointerEvents = 'auto';
      console.log(`Showing popup: ${this.popup.id}`);
    }
  }

  /**
   * 팝업 숨기기
   */
  hide() {
    if (this.popup) {
      this.popup.style.display = 'none';
      this.popup.style.pointerEvents = 'none';
      console.log(`Hiding popup: ${this.popup.id}`);
    }
  }

  /**
   * 레시피 데이터 설정
   * @param {Object} data - 레시피 데이터 { title, subtitle, tags[], image }
   */
  setData(data) {
    if (!this.card) return;

    const titleElement = this.card.querySelector('.recipe-title');
    const subtitleElement = this.card.querySelector('.recipe-subtitle');
    const tagsContainer = this.card.querySelector('.recipe-tags');
    const imageElement = this.card.querySelector('.recipe-image');

    if (titleElement && data.title) {
      titleElement.textContent = data.title;
    }

    if (subtitleElement && data.subtitle) {
      subtitleElement.textContent = data.subtitle;
    }

    if (imageElement && data.image) {
      imageElement.src = data.image;
      imageElement.alt = data.title || 'Recipe';
    }

    if (tagsContainer && data.tags) {
      tagsContainer.innerHTML = '';
      data.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'recipe-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    }
  }
}

/**
 * Recipe Popup Manager
 * 여러 레시피 팝업을 관리하는 매니저 클래스
 */
export class RecipePopupManager {
  constructor() {
    this.popups = new Map();
  }

  /**
   * 팝업 등록
   * @param {string} id - 팝업 ID
   * @param {RecipePopup} popup - RecipePopup 인스턴스
   */
  register(id, popup) {
    this.popups.set(id, popup);
  }

  /**
   * 특정 팝업 표시
   * @param {string} id - 팝업 ID
   */
  show(id) {
    const popup = this.popups.get(id);
    if (popup) {
      popup.show();
    }
  }

  /**
   * 특정 팝업 숨기기
   * @param {string} id - 팝업 ID
   */
  hide(id) {
    const popup = this.popups.get(id);
    if (popup) {
      popup.hide();
    }
  }

  /**
   * 모든 팝업 숨기기
   */
  hideAll() {
    this.popups.forEach(popup => popup.hide());
  }

  /**
   * 팝업 가져오기
   * @param {string} id - 팝업 ID
   * @returns {RecipePopup}
   */
  get(id) {
    return this.popups.get(id);
  }
}
