---
type: concept
tags: [javascript, async]
updated: 2026-05-18
sources: ["raw/notes/비동기의 모든 것.md"]
---

# Callback

## 한 줄 정의

함수가 완료됐을 때 호출할 함수를, **인자로 넘겨주는** 가장 오래된 비동기 처리 방식.

## 왜 등장했나

비동기 작업의 "끝난 뒤 할 일"을 어딘가에 맡겨둬야 한다.
가장 단순한 답: 그 작업에게 함수를 통째로 넘겨, 끝나면 불러달라고 하는 것.

## 콜백 지옥 (Callback Hell)

작업을 순차로 이어가려면 콜백을 콜백 안에 중첩해야 한다.
중첩이 깊어질수록 코드가 오른쪽으로 밀려나는 "Pyramid of Doom"이 된다.

```jsx
fetchData(url, function (result) {
  process(result, function (processed) {
    save(processed, function () { console.log("완료"); });
  });
});
```

- 단계가 늘수록 가독성 급락, 단계마다 에러 처리까지 하면 더 복잡.
- 이 문제를 풀려고 [[promise]]가 등장했다.

## 관련 페이지

- [[javascript-async]] — 비동기 전체 맥락
- [[promise]] — 콜백 지옥의 해법
- [[js-async-evolution]] — Callback → Promise → async/await
- 출처: [[js-async]]
