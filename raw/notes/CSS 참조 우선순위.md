# CSS 어렵다…

---

기업 해커톤 때 그렇게나 우리를 괴롭히던 CSS 속성 문제… 여기서 또 발생하고 만 것이다.(이마짚)

![세상 킹받는 오른쪽 여백…](attachment:675d553f-4e97-4a33-a473-07a8be87e489:image.png)

세상 킹받는 오른쪽 여백…

# CSS 우선순위

---

CSS는 명시도(Specificity)와 작성 순서로 우선순위가 결정된다.

1. 중요도 순위

   ```css
   /* 1순위: !important (제일 강함, 남발하면 안 됨) */
   .class { color: red !important; }

   /* 2순위: 인라인 스타일 */
   <div style="color: blue;">

   /* 3순위: 일반 CSS (명시도 및 순서에 따라) */
   /* 4순위: 브라우저 기본 스타일 */
   ```

2. 명시도 → 명시도가 다르면 순서 무의미

   ```html
   <!-- 1순위: 인라인 스타일 -->
   <div style="color: red;"></div>
   ```

   ```css
   /* 2순위: ID 선택자 */
   #header {
     color: blue;
   }
   ```

   ```css
   /* 3순위: 클래스, 속성, 가상 클래스 */
   .menu {
     color: green;
   }
   [type="text"] {
   }
   :hover {
   }
   ```

   ```css
   /* 4순위: 태그, 가상 요소 */
   div {
     color: black;
   }
   ::before {
   }
   ```

   ```css
   /* 5순위: 전체 선택자 */
   * {
   }
   ```

3. 명시도가 같다면 → 나중에 쓴 게 적용됨

   ```css
   .box {
     color: red;
   }
   .box {
     color: blue;
   } /* 이게 적용됨 */
   ```

따라서 이런 중복 문제를 일으키지 않기 위해서는, 구체적으로 요소를 지정하거나 여러 클래스를 지정하는 것이 좋다.

```css
/* 구체적으로 작성 */
.header .nav-item {
} /* header 클래스의 하위 요소 nav-item 클래스 */

/* 여러 클래스 조합 */
.button.primary {
} /* button과 primary 클래스를 동시에 가지는 요소 */
```

또한, 커스텀 스타일을 이용하는 경우 라이브러리 CSS를 항상 먼저 import하고, 커스텀 CSS를 나중에 import해야 한다.

- 잘못된 순서
  ```jsx
  import "./custom.css";
  import "bootstrap/dist/css/bootstrap.min.css";
  // 부트스트랩이 내 커스텀 스타일을 덮어씀!
  ```
- 올바른 순서
  ```jsx
  import "bootstrap/dist/css/bootstrap.min.css"; // 라이브러리 먼저
  import "./custom.css"; // 내 스타일 나중
  // 내 스타일로 부트스트랩 커스터마이징 가능
  ```

참고로, 개발자 도구(F12)를 이용해 요소 검사를 하면 다른 스타일에 우선순위가 밀려 사라진 스타일은 취소선이 그어져 있다.

# Appendix

---

## CSS Modules

파일명이 `.module.css` 로 끝나는 특수한 CSS파일이다. 일반 CSS 파일과 문법은 똑같지만 동작 방식이 다르다.

### **일반 CSS - 전역 스코프**

```css
/* Button.css */
.button {
  color: red;
}
```

```jsx
import "./Button.css";

// HTML에 그대로 반영됨
<button className="button">클릭</button>;
```

문제점: 다른 파일에도 `.button`이 있으면 충돌

```jsx
/* Card.css */
.button {
  color: blue;  /* Button.css의 .button을 덮어씀 */
}
```

### CSS Modules - 로컬 스코프

```css
/* Button.module.css - 파일명에 .module 붙음 */
.button {
  color: red;
}
```

```jsx
import styles from "./Button.module.css"; // 객체로 import

// 변환된 유니크 클래스명 사용
<button className={styles.button}>클릭</button>;
```

실제 랜더링: 빌드 시 **`파일명_클래스명__해시`** 형태로 변환되기 때문에 절대 충돌이 나지 않음

```html
<button class="Button_button__a7x2k">클릭</button>
```

프로젝트 빌드 시 HTML, CSS, JS 파일을 하나로 합치는데, 이때 CSS 파일이 오염될 수 있다.(다른 파일에서도 사용 가능한 문제 발생) 이때 CSS Modules가 이를 방지하는 방법으로도 쓰인다.
