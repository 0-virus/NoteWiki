---
type: concept
tags: [css, frontend]
updated: 2026-05-19
sources: ["raw/notes/CSS 참조 우선순위.md"]
---

# CSS Modules

## 한 줄 정의

파일명이 `.module.css`로 끝나는 CSS 파일. 문법은 일반 CSS와 같지만 **클래스가 로컬 스코프**로 동작한다.

## 왜 필요한가

일반 CSS의 클래스는 **전역 스코프**다. 빌드 시 모든 CSS가 한 파일로 합쳐지면서
서로 다른 파일의 같은 클래스명(`.button` 등)이 충돌·오염된다.
CSS Modules는 이 충돌을 구조적으로 차단한다.

## 동작 방식

```jsx
import styles from "./Button.module.css"; // 객체로 import
<button className={styles.button}>클릭</button>;
```

빌드 시 클래스명이 **`파일명_클래스명__해시`** 형태로 변환된다:

```html
<button class="Button_button__a7x2k">클릭</button>
```

해시가 붙어 유니크해지므로 다른 파일과 절대 충돌하지 않는다.

> 부수효과: 외부 도구(크롤러·웹 클리퍼)가 [[css-selector]]로 잡으려 하면 빌드마다
> 클래스명이 새로 해시되어 selector가 깨진다. 그래서 외부 추출에는 클래스 대신
> `data-*` 속성을 우선 쓴다.

## 관련 페이지

- [[css-specificity]] — 일반 CSS의 우선순위 싸움. CSS Modules는 이 문제를 회피한다.
- [[css-selector]] — 해시된 클래스가 외부 추출을 깨뜨리는 메커니즘
- [[es-modules]] — `import styles from ...`는 default import다.
- 출처: [[css-cascade-priority]]
