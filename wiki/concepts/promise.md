---
type: concept
tags: [javascript, async]
updated: 2026-05-18
sources: ["raw/notes/비동기의 모든 것.md"]
---

# Promise

## 한 줄 정의

비동기 작업의 **성공/실패와 결과 값을 담는 객체**. ES6에 등장.

## 왜 등장했나

[[callback]]은 "끝난 뒤 할 일"을 작업 안에 직접 중첩해야 해서 콜백 지옥을 낳았다.
Promise는 완료 신호를 **객체로 들고 다니며**, `.then()`으로 바깥에서 자유롭게
연결할 수 있게 해 중첩을 평탄화한다.

## 3가지 상태

| 상태 | 설명 |
|------|------|
| `pending` | 아직 완료되지 않은 초기 상태 |
| `fulfilled` | 성공 → `.then()` 실행 |
| `rejected` | 실패 → `.catch()` 실행 |

**상태 불변성**: 한 번 바뀐 상태는 다시 안 바뀐다. `resolve()`/`reject()`를
여러 번 호출해도 **첫 호출만 유효**하다.

## resolve / reject 동작

`new Promise()`에 넘기는 함수는 엔진이 `resolve`·`reject`를 만들어 인자로 준다.

- `resolve(값)` → `pending → fulfilled`, 값을 `.then()`/`await`로 전달
- `reject(에러)` → `pending → rejected`, 에러를 `.catch()`/`try-catch`로 전달

## 정적 메서드 (여러 Promise 다루기)

| 메서드 | 동작 |
|--------|------|
| `Promise.all` | 모두 성공 시 결과 배열. 하나라도 실패하면 즉시 reject |
| `Promise.allSettled` | 성공·실패 무관 전부 대기. 절대 reject 안 됨 |
| `Promise.race` | 가장 먼저 끝난 것의 결과(성공·실패 무관) |
| `Promise.any` | 가장 먼저 **성공한** 것. 모두 실패해야 reject |

> `race` vs `any`: race는 실패도 결과로 인정, any는 성공만 인정.

## 관련 페이지

- [[callback]] — Promise가 해결한 이전 방식
- [[async-await]] — Promise를 더 읽기 쉽게 감싼 문법
- [[javascript-async]] · [[js-async-evolution]]
- [[es-modules]] — 동적 `import()`도 Promise를 반환한다
- 출처: [[js-async]]
