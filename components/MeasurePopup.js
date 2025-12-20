export class MeasurePopup {
  constructor(options = {}) {
    this.onSearch = options.onSearch || null;
    this.overlay = null;
    this.createPopup();
  }

  createPopup() {
    // 기존 엘리먼트가 있으면 재사용
    if (document.getElementById('measure-popup-overlay')) {
      this.overlay = document.getElementById('measure-popup-overlay');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'measure-popup-overlay';
    overlay.className = 'measure-popup-overlay';
    overlay.innerHTML = `
      <div class="measure-popup-sheet">
        <div class="measure-popup-backdrop"></div>
        <div class="measure-info-row">
          <div class="measure-info-thumb">
            <img src="/images/onion.png" alt="양파" />
          </div>
          <div class="measure-info-body">
            <div class="measure-info-top">
              <div class="measure-info-name">적양파</div>
              <div class="measure-info-kcal">56kcal</div>
            </div>
            <div class="measure-info-weight">300g</div>
          </div>
        </div>
        <div class="measure-info-row">
          <div class="measure-info-thumb">
            <img src="/images/broccoli.png" alt="브로콜리" />
          </div>
          <div class="measure-info-body">
            <div class="measure-info-top">
              <div class="measure-info-name">브로콜리</div>
              <div class="measure-info-kcal">32kcal</div>
            </div>
            <div class="measure-info-weight">280g</div>
          </div>
        </div>
        <button class="measure-popup-button" type="button">레시피 탐색</button>
      </div>
    `;

    const button = overlay.querySelector('.measure-popup-button');
    button.addEventListener('click', () => {
      if (typeof this.onSearch === 'function') {
        this.onSearch();
      }
      this.hide();
    });

    // 바깥 클릭 시 닫기
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
      }
    });

    this.overlay = overlay;
    document.body.appendChild(overlay);
  }

  show() {
    if (!this.overlay) this.createPopup();
    this.overlay.classList.add('active');
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
  }
}
