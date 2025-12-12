/**
 * Video Container Component
 * 비디오를 전체화면으로 재생하는 컴포넌트
 */
export class VideoContainer {
  constructor(containerId, onVideoEnd = null) {
    this.container = document.getElementById(containerId);
    this.videoElement = null;
    this.onVideoEnd = onVideoEnd;
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

    // 이벤트 리스너 설정
    this.videoElement.addEventListener('loadeddata', () => {
      const loadEndTime = performance.now();
      const loadTime = loadEndTime - loadStartTime;
      console.log(`Video loaded in ${loadTime.toFixed(2)}ms`);

      if (autoplay) {
        this.videoElement.play();
      }
      this.container.classList.add('visible');
      console.log('Video container faded in');
    });

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
    });

    // 컨테이너에 비디오 추가
    this.container.appendChild(this.videoElement);
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
