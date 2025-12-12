/**
 * Recipe Carousel Component
 * 3D 레시피 캐러셀을 관리하는 컴포넌트
 */
export class RecipeCarousel {
  constructor(overlayId, options = {}) {
    this.overlay = document.getElementById(overlayId);
    this.currentIndex = 0;
    this.totalRecipes = options.totalRecipes || 5;
    this.onCardClick = options.onCardClick || null;

    if (this.overlay) {
      this.track = this.overlay.querySelector('.recipe-carousel-track');
      this.cards = this.overlay.querySelectorAll('.recipe-carousel-card');
      this.setupEventListeners();
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    if (!this.cards) return;

    // 카드 클릭 이벤트
    this.cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (!card.classList.contains('center')) {
          // 사이드 카드 클릭 시 중앙으로 이동
          const cardIndex = parseInt(card.getAttribute('data-index'));
          this.currentIndex = cardIndex;
          this.updateCards();
        } else {
          // 중앙 카드 클릭 시 콜백 실행
          if (this.onCardClick) {
            const cardData = this.getCardData(card);
            this.onCardClick(cardData, card);
          }
        }
      });
    });
  }

  /**
   * 카드 데이터 가져오기
   * @param {HTMLElement} card - 카드 엘리먼트
   * @returns {Object} 카드 데이터
   */
  getCardData(card) {
    return {
      index: parseInt(card.getAttribute('data-index')),
      title: card.querySelector('.recipe-card-title')?.textContent || '',
      description: card.querySelector('.recipe-card-description')?.textContent || '',
      meta: card.querySelector('.recipe-card-meta')?.textContent || '',
      image: card.querySelector('.recipe-card-image')?.src || ''
    };
  }

  /**
   * 캐러셀 표시
   */
  show() {
    if (this.overlay) {
      this.overlay.classList.add('active');
      this.updateCards();
    }
  }

  /**
   * 캐러셀 숨기기
   */
  hide() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
  }

  /**
   * 다음 레시피로 이동
   */
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.totalRecipes;
    this.updateCards();
  }

  /**
   * 이전 레시피로 이동
   */
  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.totalRecipes) % this.totalRecipes;
    this.updateCards();
  }

  /**
   * 특정 인덱스로 이동
   * @param {number} index - 이동할 인덱스
   */
  goTo(index) {
    if (index >= 0 && index < this.totalRecipes) {
      this.currentIndex = index;
      this.updateCards();
    }
  }

  /**
   * 카드 위치 계산 (원형 배치)
   * @param {number} index - 카드 인덱스
   * @returns {number} 상대적 위치
   */
  getCardPosition(index) {
    const diff = index - this.currentIndex;
    const totalCards = this.totalRecipes;

    let position = diff;
    // 원형 배치를 위한 최단 거리 계산
    if (diff > totalCards / 2) position = diff - totalCards;
    if (diff < -totalCards / 2) position = diff + totalCards;

    return position;
  }

  /**
   * 카드 위치 업데이트 (개선된 3D 효과)
   */
  updateCards() {
    if (!this.cards) return;

    this.cards.forEach((card) => {
      const cardIndex = parseInt(card.getAttribute('data-index'));
      const position = this.getCardPosition(cardIndex);
      const isCenter = position === 0;

      // 클래스 초기화
      card.classList.remove('center', 'left', 'right', 'far-left', 'far-right', 'hidden');

      // 위치에 따라 클래스와 transform 적용
      if (position === 0) {
        card.classList.add('center');
      } else if (position === 1) {
        card.classList.add('right');
      } else if (position === -1) {
        card.classList.add('left');
      } else if (position === 2) {
        card.classList.add('far-right');
      } else if (position === -2) {
        card.classList.add('far-left');
      }
      // hidden 클래스를 추가하지 않음 - 모든 카드 표시

      // 고급 3D transform 적용
      this.applyAdvancedTransform(card, position, isCenter);
    });
  }

  /**
   * 고급 3D transform 적용
   * @param {HTMLElement} card - 카드 엘리먼트
   * @param {number} position - 상대적 위치
   * @param {boolean} isCenter - 중앙 카드 여부
   */
  applyAdvancedTransform(card, position, isCenter) {
    const absPos = Math.abs(position);

    // 반응형을 위한 화면 크기 체크
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;

    // X축 이동 (바로 옆 카드는 좁은 간격, 바깥 카드는 넓은 간격)
    const getTranslateX = (pos) => {
      const absPos = Math.abs(pos);
      if (absPos === 0) return 0;

      // 모바일 대응
      if (isSmallMobile) {
        if (absPos === 1) return pos * 280; // 작은 모바일: 바로 옆 카드
        if (absPos === 2) return pos * 380; // 작은 모바일: 바깥 카드
        return pos * 380; // 나머지 카드
      } else if (isMobile) {
        if (absPos === 1) return pos * 320; // 모바일: 바로 옆 카드
        if (absPos === 2) return pos * 420; // 모바일: 바깥 카드
        return pos * 420; // 나머지 카드
      }

      // 데스크톱 - 참고 코드와 유사한 간격
      if (absPos === 1) return pos * 200; // 바로 옆 카드 간격 (120 * 3 비율)
      if (absPos === 2) return pos * 210; // 바깥 카드 간격 (130 * 3 비율, 약간 넓게)
    };

    // Z축 깊이 (바로 옆 카드가 바깥 카드보다 앞에 오도록)
    const getTranslateZ = (pos) => {
      const absPos = Math.abs(pos);
      if (absPos === 0) return 0;

      // 모바일에서는 Z축 깊이를 줄임
      if (isMobile) {
        if (absPos === 1) return -50;  // 바로 옆 카드는 앞쪽으로
        return -280; // 바깥쪽 카드는 더 뒤로
      }

      // 데스크톱 - 참고 코드와 동일한 깊이 값
      if (absPos === 1) return -50; // 바로 옆 카드는 앞쪽으로
      return -300; // 바깥쪽 카드는 더 뒤로
    };

    // Y축 회전 (바로 옆 카드도 바깥쪽 카드처럼 기울이기)
    const getRotateY = (pos) => {
      const absPos = Math.abs(pos);
      if (absPos === 0) return 0;

      // 모바일에서는 기울기를 줄임
      if (isMobile) {
        if (absPos === 1) return pos * -35; // 바로 옆 카드
        return pos * 40; // 바깥쪽 카드
      }

      // 데스크톱 - 참고 코드와 동일한 기울기
      if (absPos === 1) return pos * -45; // 바로 옆 카드 기울기
      return pos * 50; // 바깥쪽 카드 기울기
    };

    // Scale (중앙은 1, 나머지는 0.75)
    const scale = isCenter ? 1 : 0.75;

    // Opacity - 모든 카드가 보이도록 조정
    const opacity = isCenter ? 1 : 0.6;

    // Z-index (중앙이 가장 높고, 바로 옆이 바깥보다 높음)
    const zIndex = isCenter ? 10 : 5 - absPos;

    // Transform 적용
    card.style.transform = `
      translateX(${getTranslateX(position)}px)
      translateZ(${getTranslateZ(position)}px)
      rotateY(${getRotateY(position)}deg)
      scale(${scale})
    `;
    card.style.opacity = opacity;
    card.style.zIndex = zIndex;
    card.style.pointerEvents = isCenter ? 'auto' : 'none';
  }

  /**
   * 카드 데이터 설정
   * @param {Array} recipesData - 레시피 데이터 배열
   */
  setRecipes(recipesData) {
    if (!this.cards || !Array.isArray(recipesData)) return;

    this.totalRecipes = recipesData.length;

    this.cards.forEach((card, index) => {
      if (index < recipesData.length) {
        const data = recipesData[index];

        const titleElement = card.querySelector('.recipe-card-title');
        const descElement = card.querySelector('.recipe-card-description');
        const metaElement = card.querySelector('.recipe-card-meta');
        const imageElement = card.querySelector('.recipe-card-image');

        if (titleElement) titleElement.textContent = data.title || '';
        if (descElement) descElement.textContent = data.description || '';
        if (metaElement) metaElement.textContent = data.meta || '';
        if (imageElement) {
          imageElement.src = data.image || '';
          imageElement.alt = data.title || 'Recipe';
        }

        card.setAttribute('data-index', index);
      }
    });

    this.updateCards();
  }

  /**
   * 현재 선택된 레시피 인덱스 가져오기
   * @returns {number}
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * 현재 선택된 레시피 데이터 가져오기
   * @returns {Object|null}
   */
  getCurrentRecipe() {
    const centerCard = Array.from(this.cards).find(card =>
      card.classList.contains('center')
    );
    return centerCard ? this.getCardData(centerCard) : null;
  }
}
