---
type: source
tags: [web, http, cache, article]
updated: 2026-07-03
sources: ["raw/notes/🌐 웹 브라우저의 Cache 전략 & 헤더 다루기.md"]
---

# 소스: 🌐 웹 브라우저의 Cache 전략 & 헤더 다루기

- **원본**: `raw/notes/🌐 웹 브라우저의 Cache 전략 & 헤더 다루기.md`
- **유형**: 아티클 (블로그) — [Inpa Dev](https://inpa.tistory.com/), 2022-12-27
- **URL**: https://inpa.tistory.com/entry/HTTP-🌐-웹-브라우저의-캐시-전략-Cache-Headers-다루기
- **클리핑**: 2026-07-03

## 맥락 (왜 저장했나)

**레퍼런스로 비축.** 브라우저 캐시의 원리와 헤더를 원리부터 정리된 참고 자료로 위키에 넣어둔 것. 이미 정리해둔 [[etag]] 페이지의 상위 그림(캐시 전체 전략) 안에 ETag를 자리매김하고, 나중에 실무에서 `Cache-Control`·`304`·CDN 캐싱을 다룰 때 꺼내 쓸 색인. 같은 날 [[cors-article]](CORS)와 쌍으로 클리핑 — CORS 예비 요청 캐싱이 이 캐시 메커니즘을 그대로 쓴다.

## 핵심 주장 (Key Claims)

1. **HTTP 캐시는 OS 캐시와 같은 발상** — 느린 원본 접근을 빠른 임시 저장소로 대체.
2. **캐시는 양날의 검** — 잘못 캐싱하면 낡은(stale) 리소스를 준다. "얼마나 유지할지"엔 정답이 없고 데이터 성격에 맞춰야 한다.
3. **`Cache-Control`이 핵심 헤더** — `Expires`(절대 날짜)·`Pragma`(HTTP/1.0)를 대체. 상대 시간 + 세밀한 정책.
4. **만료 ≠ 폐기** — [[conditional-request|조건부 요청]]으로 검증해 `304`면 캐시 재사용(본문 없이 0.1MB).
5. **[[etag]]가 `Last-Modified`의 한계(초 단위·롤백·세밀 제어)를 극복.**
6. **`no-cache` ≠ 캐시 안 함** — "쓸 때마다 검증하라"는 뜻. `no-store`가 진짜 저장 금지.
7. **`no-cache` + `must-revalidate`** — 원서버 장애 시 프록시가 낡은 데이터를 200으로 주는 걸 504로 차단.
8. **private(브라우저) vs public([[proxy]] 캐시)** — CDN이 public 캐시의 대표.

## 언급된 엔티티

- 인물/블로그: 인파(Inpa Dev)
- 응답 헤더: `Cache-Control`(max-age·s-maxage·no-cache·no-store·public·private·must-revalidate)·`Expires`·`Pragma`·`Last-Modified`·`ETag`·`Age`
- 요청 헤더: `If-Modified-Since`·`If-None-Match`·`If-Unmodified-Since`·`If-Match`
- 상태 코드: `304 Not Modified`·`412 Precondition Failed`·`504 Gateway Timeout`

## 다루는 개념 → 위키 매핑

| 원본 내용 | 위키 페이지 |
| --- | --- |
| 캐시 원리·private/public·CORS 얽힘 | [[http-cache]] (신규) |
| Cache-Control 파라미터·무효화 | [[cache-control]] (신규) |
| 검증 헤더·304·Last-Modified vs ETag | [[conditional-request]] (신규) |
| 요청→만료→검증 타임라인 | [[browser-cache-flow]] (신규 flow) |
| 버전 해시 검증 | [[etag]] (보강) |
| 프록시 캐시·CDN | [[proxy]]·[[reverse-proxy]] |

## 관련 페이지

- [[http-cache]]·[[cache-control]]·[[conditional-request]]·[[browser-cache-flow]] — 이 소스가 낳은 페이지
- [[etag]] — 이 소스로 보강됨
- [[cors-article]] — 같은 날 클리핑한 쌍
