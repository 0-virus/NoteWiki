---
type: flow
tags: [web, http, cache, flow]
updated: 2026-07-03
sources: ["raw/notes/🌐 웹 브라우저의 Cache 전략 & 헤더 다루기.md"]
---

# 브라우저 캐시 전체 흐름 (요청 → 재사용 → 만료 → 검증)

한 리소스(`star.jpg`, 1.1MB)가 브라우저 캐시를 거치며 겪는 생애를 시간순으로 따라간다. [[http-cache]]의 3단계를 하나의 타임라인으로 잇는 페이지.

## 1단계 — 첫 요청 & 저장

```
클라 ──GET star.jpg──▶ 서버
클라 ◀─200 + 본문(1.1MB) + Cache-Control: max-age=60 + Last-Modified/ETag── 서버
```

브라우저는 본문을 캐시에 저장하면서 **유효 시간(60초)** 과 **검증자(Last-Modified·ETag)** 도 함께 기록한다. → [[cache-control]]

## 2단계 — 유효 기간 내 재요청 (fresh)

```
클라 ──GET star.jpg──▶ [캐시 조회] → 60초 이내 → 캐시 HIT ✅
```

**서버로 가지 않는다.** 네트워크 0. 이게 캐시의 최대 이득.

## 3단계 — 만료 후 재요청 (stale → 검증)

60초가 지나면 캐시는 stale. 하지만 바로 버리지 않고 [[conditional-request|조건부 요청]]으로 검증한다.

```
클라 ──GET + If-Modified-Since(또는 If-None-Match: ETag)──▶ 서버
                        │
        ┌───────────────┴───────────────┐
   내용 안 바뀜                       내용 바뀜
        │                               │
클라 ◀─304 Not Modified─ 서버     클라 ◀─200 + 새 본문 + 새 검증자─ 서버
   (본문 없음, ~0.1MB)                (전체 재다운로드)
        │                               │
  캐시 재사용 + 유효기간 갱신        새 리소스로 캐시 교체
```

- `304`는 **본문이 없다** → 1.1MB 대신 0.1MB(헤더만)만 오간다. 실측에선 994KB → 192B 수준.
- 결국 "네트워크 왕복은 있지만 다운로드는 거의 없는" 절충. → [[etag]]가 이 검증을 정밀하게 만든다.

## 4단계 — 프록시 캐시가 낀 경우

[[proxy]] 캐시 서버(CDN)가 중간에 있으면 `public`·`s-maxage`로 별도 관리된다. `no-cache` + `must-revalidate` 조합으로 원서버 장애 시 낡은 데이터 반환을 막는 흐름은 [[cache-control]] 참고.

## 왜 이 흐름이 중요한가

"캐시=빠름"만 알면 stale 데이터에 당한다. **fresh → stale → 검증 → 304/200** 의 분기를 이해해야, 정적 리소스엔 긴 `max-age`, 자주 바뀌는 API엔 `no-cache`+ETag 식으로 **리소스 성격에 맞는 전략**을 짤 수 있다.

## 관련 페이지

- [[http-cache]] — 이 흐름의 개념 뿌리
- [[cache-control]] · [[conditional-request]] · [[etag]] — 각 단계의 부품
- [[cors]] — [[preflight-request|예비 요청]] 캐싱도 같은 메커니즘
- 출처: [[browser-cache-article]]
