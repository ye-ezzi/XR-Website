# Cooking Mode Components

요리 모드의 재사용 가능한 컴포넌트들입니다.

## 구조

```
components/
├── VideoContainer.js       # 비디오 재생 컴포넌트
├── RecipePopup.js          # 레시피 팝업 컴포넌트
├── RecipeCarousel.js       # 3D 레시피 캐러셀 컴포넌트
├── cooking-components.js   # 통합 관리자
└── README.md               # 이 파일
```

## 사용 방법

### 1. 개별 컴포넌트 사용

#### VideoContainer

```javascript
import { VideoContainer } from './components/VideoContainer.js';

// 비디오 컨테이너 생성
const videoContainer = new VideoContainer('animation-container', () => {
  console.log('비디오 종료!');
});

// 비디오 재생
videoContainer.play('/videos/explore.mp4', () => {
  // 비디오 종료 시 실행할 코드
  showRecipePopups();
});

// 비디오 숨기기
videoContainer.hide();

// 비디오 정지 및 제거
videoContainer.destroy();
```

#### RecipePopup

```javascript
import { RecipePopup, RecipePopupManager } from './components/RecipePopup.js';

// 개별 팝업 사용
const microwavePopup = new RecipePopup('microwavePopup');
microwavePopup.show();
microwavePopup.hide();

// 팝업 데이터 설정
microwavePopup.setData({
  title: '전자레인지 레시피',
  subtitle: '67개의 레시피 ›',
  tags: ['5분 완성', '노오븐 베이킹', '다이어트'],
  image: '/images/recipe-example.jpg'
});

// 팝업 매니저 사용 (여러 팝업 관리)
const popupManager = new RecipePopupManager();
popupManager.register('microwavePopup', microwavePopup);
popupManager.register('fridgePopup', new RecipePopup('fridgePopup'));

// 모든 팝업 숨기기
popupManager.hideAll();

// 특정 팝업 표시
popupManager.show('microwavePopup');
```

#### RecipeCarousel

```javascript
import { RecipeCarousel } from './components/RecipeCarousel.js';

// 캐러셀 생성
const carousel = new RecipeCarousel('recipe-carousel-overlay', {
  totalRecipes: 5,
  onCardClick: (cardData, cardElement) => {
    console.log('카드 클릭:', cardData);
    // 중앙 카드 클릭 시 상세 페이지로 이동
    carousel.hide();
    showRecipeDetail(cardData);
  }
});

// 캐러셀 표시
carousel.show();

// 네비게이션
carousel.next();      // 다음 레시피
carousel.previous();  // 이전 레시피
carousel.goTo(2);     // 특정 인덱스로 이동

// 레시피 데이터 설정
carousel.setRecipes([
  {
    title: '토마토 스파게티',
    description: '신선한 토마토로 만드는 이탈리안 파스타',
    meta: 'Cooking time: 30 min • Difficulty: Easy',
    image: '/images/recipe1.jpg'
  },
  // ... 더 많은 레시피
]);

// 현재 선택된 레시피 가져오기
const currentRecipe = carousel.getCurrentRecipe();
console.log(currentRecipe);
```

### 2. 통합 관리자 사용

```javascript
import { CookingComponents } from './components/cooking-components.js';

const components = new CookingComponents();

// 모든 컴포넌트 한번에 초기화
const { videoContainer, recipePopupManager, recipeCarousel } = components.initAll({
  videoContainerId: 'animation-container',
  popupIds: ['microwavePopup', 'fridgePopup'],
  carouselId: 'recipe-carousel-overlay',
  carouselOptions: {
    totalRecipes: 5,
    onCardClick: (data) => {
      console.log('카드 클릭:', data);
    }
  },
  onVideoEnd: () => {
    // 비디오 종료 시 팝업 표시
    recipePopupManager.show('microwavePopup');
    recipePopupManager.show('fridgePopup');
  }
});

// 비디오 재생
videoContainer.play('/videos/explore.mp4');

// 캐러셀 표시
recipeCarousel.show();
```

### 3. 기존 cooking.js와 통합

```javascript
// cooking.js
import { cookingComponents } from './components/cooking-components.js';

document.addEventListener('DOMContentLoaded', () => {
  // 컴포넌트 초기화
  const { videoContainer, recipePopupManager, recipeCarousel } = cookingComponents.initAll({
    onVideoEnd: () => {
      // 비디오 종료 후 레시피 팝업 표시
      recipePopupManager.show('microwavePopup');
      recipePopupManager.show('fridgePopup');
    },
    carouselOptions: {
      totalRecipes: 5,
      onCardClick: (data) => {
        // 중앙 카드 클릭 시 기존 3d-receipt-popup 표시
        recipeCarousel.hide();
        document.getElementById('3d-receipt-popup').style.display = 'flex';
      }
    }
  });

  // Explore 비디오 재생 함수
  window.playExploreVideo = function() {
    videoContainer.play('/videos/explore.mp4');
  };

  // 3D Recipe 버튼 클릭 시 캐러셀 표시
  window.showRecipeCarousel = function() {
    recipeCarousel.show();
  };

  window.closeRecipeCarousel = function() {
    recipeCarousel.hide();
  };

  window.nextRecipe = function() {
    recipeCarousel.next();
  };

  window.previousRecipe = function() {
    recipeCarousel.previous();
  };

  // 기존 코드...
});
```

## CSS 파일

컴포넌트 스타일은 별도 CSS 파일로 분리되어 있습니다:

```html
<!-- cook.html -->
<link rel="stylesheet" href="/styles/cooking-mode.css">
<link rel="stylesheet" href="/styles/components/video-container.css">
<link rel="stylesheet" href="/styles/components/recipe-popup.css">
<link rel="stylesheet" href="/styles/components/recipe-carousel.css">
```

## 이벤트 흐름 예시

```
1. 페이지 로드
   ↓
2. VideoContainer.play('/videos/explore.mp4')
   ↓
3. 비디오 재생 종료
   ↓
4. onVideoEnd 콜백 실행
   ↓
5. RecipePopup 표시 (전자레인지, 냉장고)
   ↓
6. 사용자가 3D Recipe 버튼 클릭
   ↓
7. RecipeCarousel.show()
   ↓
8. 사용자가 중앙 카드 클릭
   ↓
9. onCardClick 콜백 실행
   ↓
10. 레시피 상세 페이지 표시
```

## API 문서

### VideoContainer

| 메서드 | 설명 |
|--------|------|
| `play(videoPath, onEnd)` | 비디오 재생 |
| `hide()` | 비디오 컨테이너 숨기기 |
| `destroy()` | 비디오 정지 및 제거 |

### RecipePopup

| 메서드 | 설명 |
|--------|------|
| `show()` | 팝업 표시 |
| `hide()` | 팝업 숨기기 |
| `setData(data)` | 레시피 데이터 설정 |

### RecipePopupManager

| 메서드 | 설명 |
|--------|------|
| `register(id, popup)` | 팝업 등록 |
| `show(id)` | 특정 팝업 표시 |
| `hide(id)` | 특정 팝업 숨기기 |
| `hideAll()` | 모든 팝업 숨기기 |
| `get(id)` | 팝업 인스턴스 가져오기 |

### RecipeCarousel

| 메서드 | 설명 |
|--------|------|
| `show()` | 캐러셀 표시 |
| `hide()` | 캐러셀 숨기기 |
| `next()` | 다음 레시피로 이동 |
| `previous()` | 이전 레시피로 이동 |
| `goTo(index)` | 특정 인덱스로 이동 |
| `setRecipes(data)` | 레시피 데이터 설정 |
| `getCurrentIndex()` | 현재 인덱스 가져오기 |
| `getCurrentRecipe()` | 현재 레시피 데이터 가져오기 |

## 장점

1. **재사용성**: 각 컴포넌트를 독립적으로 사용 가능
2. **유지보수**: 각 기능이 분리되어 있어 수정 용이
3. **테스트**: 개별 컴포넌트 단위 테스트 가능
4. **확장성**: 새로운 기능 추가 시 기존 코드 영향 최소화
5. **가독성**: 코드가 명확하고 이해하기 쉬움
