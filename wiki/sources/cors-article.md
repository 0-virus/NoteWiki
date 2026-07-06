---
type: source
tags: [web, cors, browser, security, article]
updated: 2026-07-03
sources: ["raw/notes/🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏.md"]
---

# 소스: 🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏

- **원본**: `raw/notes/🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏.md`
- **유형**: 아티클 (블로그) — [Inpa Dev](https://inpa.tistory.com/), 2022-11-28
- **URL**: https://inpa.tistory.com/entry/WEB-📚-CORS-💯-정리-해결-방법-👏
- **클리핑**: 2026-07-03

## 맥락 (왜 저장했나)

**레퍼런스로 비축.** 당장 특정 프로젝트에서 CORS 에러를 만나 급히 찾은 건 아니고, 웹 개발자라면 반드시 겪는 CORS를 **원리부터 정석 해결책까지 한 번에 정리된 참고 자료**로 위키에 넣어둔 것. 나중에 실무에서 CORS 에러를 만났을 때 즉시 꺼내 쓸 색인 역할. 같은 날 [[browser-cache-article]](캐시)와 쌍으로 클리핑 — 둘은 예비 요청 캐싱으로 서로 물려 있다.

## 핵심 주장 (Key Claims)

1. **차단하는 건 서버가 아니라 브라우저다.** 서버는 응답을 정상 전송했고, 브라우저가 [[same-origin-policy|SOP]] 위반으로 판단해 응답 읽기를 거부한다.
2. **CORS는 에러가 아니라 해결책이다.** SOP가 막은 다른 출처 요청을, 서버가 `Access-Control-Allow-Origin` 헤더로 허락하면 통과시키는 예외 정책.
3. **출처(Origin) = Protocol + Host + Port** 3개로만 결정. Path·Query는 무관.
4. **대부분의 API는 [[preflight-request|예비 요청]]으로 동작.** `application/json` 때문에 단순 요청 조건을 못 맞춘다.
5. **인증된 요청은 규칙이 더 엄격.** `Allow-Credentials: true` + `Allow-Origin`에 와일드카드 `*` 금지.
6. **정석 해결은 서버 헤더 세팅.** 크롬 확장·프록시는 임시방편.

## 언급된 엔티티

- 인물/블로그: 인파(Inpa Dev)
- 헤더: `Origin`, `Access-Control-Allow-Origin/Methods/Headers/Credentials`, `Access-Control-Max-Age`, `Access-Control-Expose-Headers`
- 도구/서버: 크롬 Allow CORS 확장, cors-anywhere·cors.sh 프록시, Node/Express(cors)·Spring(`@CrossOrigin`·`CorsRegistry`)·Servlet Filter·Tomcat `CorsFilter`·Apache·Nginx·AWS S3
- 심화(미인제스트): CORS 보안 취약점 가이드, 크롬 PNA, 캐시로 인한 CORS 에러

## 다루는 개념 → 위키 매핑

| 원본 내용 | 위키 페이지 |
| --- | --- |
| SOP·출처 정의·왜 필요한가 | [[same-origin-policy]] (신규) |
| CORS 동작·3시나리오·헤더·해결법 | [[cors]] (신규) |
| 예비 요청·OPTIONS·Max-Age 캐싱 | [[preflight-request]] (신규) |
| 서버-to-서버 우회 | [[proxy]] |
| Servlet/Spring 처리 위치 | [[filter]]·[[spring-security]] |
| 인증정보 | [[cookie]]·[[jwt]]·[[refresh-token]] |

## 관련 페이지

- [[cors]]·[[same-origin-policy]]·[[preflight-request]] — 이 소스가 낳은 개념
- [[browser-cache-article]] — 같은 날 클리핑한 쌍
