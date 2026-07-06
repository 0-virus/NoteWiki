---
type: concept
tags: [web, http, cache, header]
updated: 2026-07-03
sources: ["raw/notes/🌐 웹 브라우저의 Cache 전략 & 헤더 다루기.md"]
---

# Cache-Control 헤더

## 한 줄 정의

**[[http-cache|HTTP 캐시]]를 조종하는 핵심 응답 헤더.** "이 리소스를 얼마나·어디에·어떻게 캐시할지"를 서버가 지시한다.

## 왜 이 헤더인가

과거엔 `Expires`(만료 날짜)·`Pragma`(HTTP/1.0)로 캐시를 제어했지만, 절대 날짜는 시계 오차에 취약하고 표현력이 부족했다. `Cache-Control`은 **상대 시간(초)** 과 세밀한 정책 파라미터로 이를 대체했다.

> `Expires`와 `max-age`가 함께 있으면 `Expires`는 무시된다. `Pragma: no-cache`는 하위 호환용.

## 유효 시간 파라미터

| 파라미터 | 의미 |
| --- | --- |
| `max-age=초` | 캐시 유효 시간. 이 기간엔 서버에 안 묻고 캐시 사용(fresh) |
| `s-maxage=초` | [[proxy]] 캐시 서버 전용 max-age (public 캐시) |

```
Cache-Control: max-age=86400          # 1일간 브라우저·중간 캐시 저장
Cache-Control: private, max-age=600   # 10분간 브라우저만 저장
Cache-Control: public, max-age=31536000  # 1년간 모든 캐시 저장
```

## 저장 위치 파라미터

| 파라미터 | 의미 |
| --- | --- |
| `private` | 개인 브라우저 캐시에만 저장 (기본값) |
| `public` | [[proxy]] 캐시 서버에도 저장 허용 |

→ 위치 구분의 배경은 [[http-cache]]의 private/public 절 참고.

## 캐시 금지·재검증 파라미터

만료 전에도 **매번 서버 검증**을 강제하거나 아예 저장을 막는 옵션.

| 파라미터 | 의미 |
| --- | --- |
| `no-cache` | 캐시는 하되 **쓰기 전 항상 원서버에 검증**. (`max-age=0`과 유사) 이름과 달리 "캐시 안 함"이 아니다 |
| `no-store` | **저장 자체 금지**. 민감 정보용. 메모리에서 쓰고 즉시 삭제 |
| `must-revalidate` | 만료 후 검증 시 원서버 접근 실패하면 반드시 `504` 발생 |

### `no-cache` vs `no-store` 혼동 주의

- `no-cache` = "저장은 OK, **쓸 땐 반드시 물어봐**" → [[conditional-request|조건부 요청]]으로 `304` 받으면 캐시 재사용 (트래픽 적음)
- `no-store` = "저장하지 마" → 매번 전체 다운로드

### `no-cache` + `must-revalidate` 조합의 이유

`no-cache`만 쓰면, 검증 도중 원서버가 끊겼을 때 일부 [[proxy]] 캐시 서버가 **검증 없이 낡은 데이터를 200으로 반환**해버린다. 통장 잔고 같은 중요 데이터엔 치명적. `must-revalidate`를 더하면 이 경우 **강제로 504**를 띄워, 클라이언트가 "서버 문제"를 인지하고 재처리하게 만든다.

> `max-age=0` 우회보다 `no-store`가 더 명확하다 — 일부 모바일 브라우저는 `max-age=0`이어도 앱 재시작 전까지 캐시를 안 버리는 경우가 있다.

## 관련 페이지

- [[http-cache]] — 이 헤더가 조종하는 전체 캐시 그림
- [[conditional-request]] — `no-cache`가 유발하는 검증 요청
- [[proxy]] — `public`·`s-maxage`의 대상
- [[http-status-codes]] — `304`·`504`
- 출처: [[browser-cache-article]]
