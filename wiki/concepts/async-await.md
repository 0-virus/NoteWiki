---
type: concept
tags: [javascript, async]
updated: 2026-05-18
sources: ["raw/notes/비동기의 모든 것.md"]
---

# async / await

## 한 줄 정의

[[promise]]를 **동기 코드처럼 읽히게** 만드는 문법. ES2017에 등장한 문법 설탕(syntactic sugar).

## 왜 등장했나

Promise의 `.then()` 체이닝도 길어지면 읽기 힘들다.
async/await은 내부적으로 Promise와 똑같이 동작하지만, 코드는 위에서 아래로
순서대로 읽히는 동기 코드처럼 보인다.

```jsx
async function loadUser() {
  try {
    const res = await fetch("/api/user"); // 결과 나올 때까지 일시정지
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
```

## 핵심 규칙

- `await`는 **Promise를 반환하는 것 앞**에서만 의미가 있다.
- `async` 함수는 내부에서 무엇을 `return`하든 **항상 Promise로 감싸** 반환한다.
  ```jsx
  async function getNumber() { return 42; } // 실제론 Promise.resolve(42)
  ```
- `await`는 Promise가 아닌 값에도 쓸 수 있지만 즉시 반환되어 의미가 없다.
- 에러는 `try/catch`로 처리한다 ([[promise]]의 `.catch()`에 대응).

## 관련 페이지

- [[promise]] — async/await이 감싸는 실제 메커니즘
- [[callback]] · [[javascript-async]]
- [[js-async-evolution]] — 세 방식의 발전 흐름
- 출처: [[js-async]]
