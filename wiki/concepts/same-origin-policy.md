---
type: concept
tags: [web, browser, security, cors]
updated: 2026-07-03
sources: ["raw/notes/🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏.md"]
---

# 동일 출처 정책 (Same-Origin Policy, SOP)

## 한 줄 정의

**브라우저의 기본 방어선.** "다른 출처(Origin)의 리소스와는 함부로 상호작용하지 마라"는 규칙. [[cors]]는 이 벽에 낸 **예외 통로**다.

## 출처(Origin)란?

출처는 URL 전체가 아니라 **딱 3개**로 결정된다.

```
Origin = Protocol(scheme) + Host + Port
         https           + domain.com + :3000
```

- Path·Query String·Fragment는 출처 판단에 **포함되지 않는다**.
- 셋 중 **하나라도 다르면** 다른 출처(Cross-Origin).

`https://www.domain.com:3000` 기준 비교:

| URL | 동일 출처? | 이유 |
| --- | --- | --- |
| `…:3000/about?x=1` | O | 프로토콜·호스트·포트 동일 (뒤는 무관) |
| `http://…:3000` | X | 프로토콜 다름 (http ≠ https) |
| `https://another.com:3000` | X | 호스트 다름 |
| `https://…:8888` | X | 포트 다름 |
| `https://www.domain.com` | X | 포트 다름 (443 ≠ 3000) |

JS로 현재 출처: `location.origin` → `"https://www.naver.com"` (기본 포트 80/443은 생략).

## 왜 필요한가 — 이게 없으면 벌어지는 일

출처가 다른 앱끼리 자유롭게 소통하면 다음 공격이 열린다.

1. 사용자가 악성 사이트에 접속한다.
2. 심어둔 JS가 사용자 몰래 포털 사이트로 요청을 보낸다.
3. 브라우저에 **이미 저장된 [[cookie]]** 로 자동 로그인되어, 개인정보 응답을 받아 해커 서버로 빼돌린다.

이런 CSRF(Cross-Site Request Forgery)·XSS(Cross-Site Scripting) 계열 공격을 막으려고, **다른 출처의 스크립트가 응답을 읽지 못하도록** 브라우저가 사전 차단한다. (CSRF·XSS는 아직 독립 페이지 없음 — TODO)

## 요청 방식에 따라 다르게 적용된다

SOP는 "모든 것"을 막지 않는다. **JS 스크립트 요청만** 집중적으로 막는다.

| 방식 | 기본 정책 |
| --- | --- |
| `<img>`·`<link>`·`<script>`·`<video>` 태그의 리소스 로드 | Cross-Origin **허용** |
| `XMLHttpRequest`·`fetch` (JS ajax) | Same-Origin (막힘 → [[cors]] 필요) |
| 웹폰트 CSS `@font-face` | Same-Origin |

> 그래서 `<img src="타출처">`는 되는데 `fetch("같은 타출처")`는 CORS 에러가 난다. 태그 로드는 "화면에 그리기만" 하지만, JS는 **응답 내용을 읽을 수 있어서** 위험하기 때문이다.

## 핵심 오해 — 차단은 서버가 아니라 브라우저가 한다

새내기가 가장 많이 착각하는 지점. **서버는 응답을 정상적으로 다 보냈다.** 그 응답을 받아본 브라우저가 "출처가 다르네" 하고 **읽기를 거부**하는 것이다.

이 사실이 두 가지 실전 함의를 낳는다.

1. **서버-to-서버 통신엔 SOP가 없다.** 브라우저를 거치지 않으니까. → [[proxy]] 서버를 중계로 두면 [[cors]]를 우회할 수 있는 이유.
2. 크롬 설정으로 SOP를 끌 수도 있지만(권장 X), 근본 해결은 서버가 [[cors]] 허용 헤더를 내려주는 것.

## 관련 페이지

- [[cors]] — SOP의 예외 통로. 이 페이지의 후속
- [[cookie]] — SOP가 지키려는 핵심 자산(자동 전송되는 인증정보)
- [[proxy]] — 브라우저를 우회하는 서버 간 통신
- 출처: [[cors-article]]
