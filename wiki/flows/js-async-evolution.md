---
type: flow
tags: [javascript, async]
updated: 2026-05-18
sources: ["raw/notes/비동기의 모든 것.md"]
---

# 흐름: JS 비동기의 발전 — Callback → Promise → async/await

## 흐름 한눈에

```
Callback  →  Promise  →  async/await
 (구식)      (개선)       (현재 표준)
```

각 단계는 **이전 단계의 문제를 해결**하며 등장했다. 셋은 대체 관계가 아니라
**포함 관계**다 — `Callback ⊂ Promise ⊂ async/await`.

## 단계별 흐름

### 1. [[callback]] — 출발점
완료 후 할 일을 함수로 넘긴다. 순차 작업을 이으려면 중첩이 깊어져
**콜백 지옥**(Pyramid of Doom)이 된다.

### 2. [[promise]] — 콜백 지옥의 해결
완료 신호를 객체로 만들어 `.then()`으로 바깥에서 연결 → 중첩이 평탄해진다.
`pending/fulfilled/rejected` 상태와 정적 메서드로 여러 비동기를 다룰 수 있다.

### 3. [[async-await]] — 가독성의 완성
Promise를 동기 코드처럼 위→아래로 읽히게 한다. 내부 동작은 Promise 그대로다.

## 같은 동작, 세 가지 표현

```jsx
// ① Callback — 콜백 지옥
fetchUser(id, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => console.log(comments));
  });
});

// ③ async/await — 평탄하게
const user = await fetchUser(id);
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);
```

## 왜 셋 다 알아야 하나

async/await을 쓰더라도 그 아래는 [[promise]]이고, Promise를 이해하려면
[[callback]]이 왜 불편했는지를 알아야 한다. 현재 표준만 외우면 디버깅에서 막힌다.

## 관련 페이지

- [[javascript-async]] — 비동기가 왜 필요한가(싱글 스레드)
- 출처: [[js-async]]
