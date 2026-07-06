---
type: concept
tags: [web, browser, cors, http]
updated: 2026-07-03
sources: ["raw/notes/🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏.md"]
---

# 예비 요청 (Preflight Request)

## 한 줄 정의

**본 요청을 보내기 전, 브라우저가 `OPTIONS` 메서드로 "이거 보내도 안전해?"를 먼저 물어보는 사전 확인 요청.** [[cors]]의 3시나리오 중 실무에서 가장 흔한 기본 모드.

## 왜 존재하는가

`DELETE`·`PUT`이나 `application/json` 본문처럼 **부수효과가 클 수 있는 요청**을 무턱대고 서버에 날렸다가, 서버가 CORS 미허용이면 이미 데이터가 바뀐 뒤다. 그래서 브라우저는 **실제 요청을 보내기 전에 허가부터 받는다.** "실행 전 안전 점검"이 예비 요청의 존재 이유.

## 흐름 — OPTIONS 왕복 후 본 요청

```
브라우저 ──OPTIONS(예비)──▶ 서버
   "Origin: http://localhost:3000
    Access-Control-Request-Method: DELETE
    Access-Control-Request-Headers: content-type"

브라우저 ◀──200 + 허용정책── 서버
   "Access-Control-Allow-Origin: http://localhost:3000
    Access-Control-Allow-Methods: GET,POST,DELETE
    Access-Control-Allow-Headers: content-type
    Access-Control-Max-Age: 3600"

── 브라우저가 요청 vs 정책 대조 → 안전하면 ──

브라우저 ──DELETE(본 요청)──▶ 서버
브라우저 ◀──200 + 데이터──── 서버   → JS로 전달
```

개발자 도구 Network 탭에서 본 요청(xhr) 앞에 `Preflight`(OPTIONS)가 한 줄 더 찍히는 게 이것.

## 문제점 — 요청이 2배가 된다

예비 요청은 안전하지만, **모든 요청마다 왕복이 한 번 더** 생긴다. API 호출이 많을수록 서버 부하·지연이 배로 늘어난다.

### 해결 — `Access-Control-Max-Age`로 캐싱

서버가 응답에 `Access-Control-Max-Age: 3600`(초)을 주면, 그 기간 동안 브라우저는 **같은 예비 요청을 재전송하지 않고** 캐시된 허가를 재사용한다. [[http-cache]]의 캐싱 메커니즘과 동일한 원리.

```
1. 예비 요청 전에 Preflight 캐시부터 조회
2. 없으면 서버에 OPTIONS → Max-Age만큼 결과 저장
3. 있으면 서버로 안 보내고 캐시된 허가 사용
```

> 캐싱 상한: 크로미엄 계열 최대 7200초(2시간), 파이어폭스 86400초(24시간).

## 단순 요청과의 경계

아래 [[cors]] 단순 요청 3조건을 **전부** 만족하면 예비 요청이 **생략**된다. 하나라도 어기면(특히 `Content-Type: application/json`) 예비 요청으로 동작. → 대부분의 REST API는 예비 요청.

## 관련 페이지

- [[cors]] — 예비 요청이 속한 상위 개념
- [[http-cache]] — `Max-Age` 캐싱이 기대는 원리
- [[http-status-codes]] — `OPTIONS`·`200`·`204` 응답
- 출처: [[cors-article]]
