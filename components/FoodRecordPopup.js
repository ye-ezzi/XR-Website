export class FoodRecordPopup {
  constructor(options = {}) {
    this.options = {
      heroSrc: options.heroSrc || '/images/Capture food.png',
      recipeTitle: options.recipeTitle || '토마토 스파게티',
      onSave: options.onSave || null,
    };
    this.popup = null;
    this.textarea = null;
    this.stars = [];
    this.rating = 0;
    this.build();
  }

  build() {
    // 기존 요소가 있다면 제거
    const existing = document.getElementById('record-popup');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'record-popup';
    overlay.className = 'tab-popup';
    overlay.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'record-popup-card';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close-btn close-popup record-popup-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '닫기');
    closeBtn.innerHTML = `<img src="/images/x.svg" alt="" aria-hidden="true" />`;

    const heroImg = document.createElement('img');
    heroImg.className = 'record-popup-hero';
    heroImg.src = this.options.heroSrc;
    heroImg.alt = 'Capture Food';

    const body = document.createElement('div');
    body.className = 'record-popup-body';

    const header = document.createElement('div');
    header.className = 'record-popup-header';

    const dateEl = document.createElement('div');
    dateEl.className = 'record-popup-date';
    dateEl.textContent = this.formatDate();

    const dishEl = document.createElement('div');
    dishEl.className = 'record-popup-dish';
    dishEl.textContent = this.options.recipeTitle;

    const starsRow = document.createElement('div');
    starsRow.className = 'record-popup-stars';
    this.stars = Array.from({ length: 5 }).map((_, idx) => {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'record-star';
      star.setAttribute('aria-label', `${idx + 1}점`);
      star.textContent = '';
      star.addEventListener('click', () => this.setRating(idx + 1));
      starsRow.appendChild(star);
      return star;
    });

    header.appendChild(dateEl);
    header.appendChild(dishEl);
    header.appendChild(starsRow);

    const question = document.createElement('div');
    question.className = 'record-popup-question';

    this.textarea = document.createElement('textarea');
    this.textarea.id = 'food-description';
    this.textarea.className = 'record-popup-textarea';
    this.textarea.placeholder = '이번 요리는 어땠나요?';

    const aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.className = 'record-popup-ai-btn';
    aiBtn.textContent = 'AI 자동생성';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'record-save-btn';
    saveBtn.textContent = '저장하기';

    question.appendChild(this.textarea);
    question.appendChild(aiBtn);

    body.appendChild(header);
    body.appendChild(question);
    body.appendChild(saveBtn);

    card.appendChild(closeBtn);
    card.appendChild(heroImg);
    card.appendChild(body);

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    closeBtn.addEventListener('click', () => this.hide());
    aiBtn.addEventListener('click', () => this.fillExample());
    saveBtn.addEventListener('click', () => this.handleSave());

    this.popup = overlay;
  }

  fillExample() {
    if (this.textarea) {
      this.textarea.value = '토마토 풍미가 진한 파스타! 면은 탱글했고, 소스 농도도 적당했어요.';
      this.textarea.focus();
    }
  }

  setRating(value) {
    this.rating = value;
    this.stars.forEach((star, idx) => {
      star.classList.toggle('active', idx < value);
    });
  }

  formatDate() {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  handleSave() {
    if (typeof this.options.onSave === 'function') {
      this.options.onSave();
    } else if (typeof window.saveRecord === 'function') {
      window.saveRecord();
    }
  }

  show() {
    if (this.popup) {
      this.popup.style.display = 'flex';
    }
  }

  hide() {
    if (this.popup) {
      this.popup.style.display = 'none';
    }
  }

  getDescription() {
    return this.textarea?.value?.trim() || '';
  }
}
