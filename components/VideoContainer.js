/**
 * Video Container Component
 * 비디오를 전체화면으로 재생하는 컴포넌트
 */
export class VideoContainer {
  constructor(containerId, onVideoEnd = null) {
    this.container = document.getElementById(containerId);
    this.videoElement = null;
    this.onVideoEnd = onVideoEnd;
    this.autoplayFailed = false;
    this.setupContainerClickHandler();
  }

  /**
   * 컨테이너 클릭 핸들러 설정 (자동재생 실패 시 수동 재생)
   */
  setupContainerClickHandler() {
    if (this.container) {
      this.container.addEventListener('click', () => {
        if (this.autoplayFailed && this.videoElement && this.videoElement.paused) {
          console.log('Playing video on user interaction');
          this.videoElement.play().catch(e => console.error('Play failed:', e));
          this.autoplayFailed = false;
        }
      });
    }
  }

  /**
   * 비디오 재생
   * @param {string} videoPath - 비디오 파일 경로
   * @param {Function} onEnd - 비디오 종료 시 콜백 함수
   * @param {Object} options - 재생 옵션 { autoplay: boolean }
   */
  play(videoPath, onEnd = null, options = {}) {
    if (!this.container) {
      console.error('Video container not found');
      return;
    }

    const { autoplay = true } = options;

    const loadStartTime = performance.now();
    console.log(`Loading video from: ${videoPath}`);

    // 기존 비디오 제거
    if (this.videoElement) {
      this.videoElement.remove();
    }

    // 새 비디오 엘리먼트 생성
    this.videoElement = document.createElement('video');
    this.videoElement.src = videoPath;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;

    // 오래된 iOS 기기 지원
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.setAttribute('webkit-playsinline', '');
    this.videoElement.setAttribute('x5-playsinline', ''); // WeChat 브라우저 지원

    // 디버깅용 이벤트 리스너
    this.videoElement.addEventListener('loadstart', () => {
      console.log('Video loadstart event fired');
    });

    this.videoElement.addEventListener('loadedmetadata', () => {
      console.log('Video loadedmetadata event fired');
    });

    this.videoElement.addEventListener('canplay', () => {
      console.log('Video canplay event fired');
    });

    // 비디오 준비 처리 함수
    const handleVideoReady = () => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.log(`Video ready in ${loadTime.toFixed(2)}ms`);

      // 비디오가 재생 중이 아니면 재생 시도
      if (autoplay && this.videoElement.paused) {
        console.log('Video ready, attempting to play...');
        const playPromise = this.videoElement.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started successfully');
              this.autoplayFailed = false;
            })
            .catch((error) => {
              console.warn('Autoplay was prevented:', error);
              console.log('Tap screen to play video');
              this.autoplayFailed = true;
              // 컨테이너에 시각적 힌트 추가
              this.container.style.cursor = 'pointer';
            });
        }
      } else if (!this.videoElement.paused) {
        console.log('Video already playing');
      }
    };

    // 이벤트 리스너 설정 - loadeddata와 canplay 둘 다 처리
    this.videoElement.addEventListener('loadeddata', handleVideoReady);
    this.videoElement.addEventListener('canplaythrough', handleVideoReady);

    this.videoElement.addEventListener('ended', () => {
      console.log('Video ended');
      this.videoElement.pause();

      // 콜백 함수 실행
      if (onEnd) {
        onEnd();
      } else if (this.onVideoEnd) {
        this.onVideoEnd();
      }
    });

    this.videoElement.addEventListener('error', (e) => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.error(`Error loading video after ${loadTime.toFixed(2)}ms:`, e);
      console.error('Failed video path:', videoPath);
      console.error('Video error details:', this.videoElement.error);
    });

    // 컨테이너에 비디오 추가
    this.container.appendChild(this.videoElement);

    // 비디오 표시
    this.container.classList.add('visible');

    // 모바일에서 비디오 로딩 강제
    console.log('Forcing video load...');
    this.videoElement.load();

    // 사용자 클릭 시 즉시 재생 시도 (동기 실행으로 사용자 액션 인식)
    if (autoplay) {
      console.log('Attempting immediate play on user action...');
      const immediatePlayPromise = this.videoElement.play();

      if (immediatePlayPromise !== undefined) {
        immediatePlayPromise
          .then(() => {
            console.log('Immediate play succeeded');
            this.autoplayFailed = false;
          })
          .catch((error) => {
            console.log('Immediate play failed (video not ready yet), will retry when loaded:', error.message);
            // 비디오가 준비되면 handleVideoReady에서 다시 시도
          });
      }
    }
  }

  /**
   * 비디오 숨기기
   */
  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
  }

  /**
   * 비디오 정지 및 제거
   */
  destroy() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.remove();
      this.videoElement = null;
    }
    this.hide();
  }
}
