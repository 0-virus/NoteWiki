---
type: concept
tags: [css, frontend, dom, scraping]
updated: 2026-05-19
sources: []
---

# CSS Selector

## 한 줄 정의

DOM 트리에서 **어떤 요소를 가리킬지** 짧게 적는 주소 문법.
원래는 CSS가 "어디에 스타일을 적용할지" 정하려고 만든 문법인데, 너무 잘 설계돼서
JS·크롤러·웹 클리퍼 등 거의 모든 DOM 도구가 같은 문법을 빌려 쓴다.

## 왜 CSS의 문법이 표준이 됐나

DOM 트리를 표현하는 가장 **짧고 표현력 있는 언어**였고, 브라우저 엔진이 페이지를
그릴 때마다 어차피 빠르게 매칭해야 해서 네이티브로 극단적으로 최적화돼 있었다.
그 결과 다른 도구들이 전부 같은 문법을 채택했다.

| 도구 | API |
| --- | --- |
| JavaScript | `document.querySelector(".message")` |
| jQuery | `$(".message")` |
| Python BeautifulSoup | `soup.select(".message")` |
| Playwright / Puppeteer | `page.locator(".message")` |
| Obsidian Web Clipper | `{{selectorHtml:.message}}` ([[web-clipper]]) |

→ selector를 한 번 익히면 **브라우저·크롤러·자동화 도구 전체에서 같은 문법이 통한다.**

## 기본 문법

| 문법 | 의미 |
| --- | --- |
| `div` | 모든 `<div>` 태그 |
| `.message` | **클래스** — `class="message ..."` 인 요소 |
| `#root` | **ID** — `id="root"` 인 요소 (페이지에 하나뿐이어야 함) |
| `[data-role]` | 속성이 **있는** 요소 |
| `[data-role="user"]` | 속성 값이 정확히 user |
| `[class*="msg"]` | 속성 값에 msg가 **포함된** 것 |
| `article p` | **자손** — article 안 어디든 p |
| `article > p` | **자식** — article 바로 아래 p만 |
| `h1 + p` | **바로 다음 형제** |
| `:not(.hidden)` | 가상 클래스 — hidden이 아닌 것 |
| `.a, .b` | **또는** — 둘 중 하나라도 |
| `article.message[data-role="user"]` | **결합** — 모두 만족 (공백 없이 붙임) |

직관:
- 점(`.`) = 클래스, 샵(`#`) = ID, 대괄호(`[]`) = 속성.
- 공백 = "안에", `>` = "바로 아래", 콤마(`,`) = "또는".
- 공백 없이 붙이면 = "둘 다 만족".

## [[css-specificity]]와의 관계 — selector가 하는 두 가지 일

CSS selector는 동시에 두 가지를 결정한다.

1. **무엇을 가리킬지** — 이 페이지의 주제 (DOM 매칭).
2. **여러 규칙이 충돌하면 누가 이길지** — [[css-specificity]] (명시도 점수).

명시도는 selector를 어떻게 쓰느냐로 계산된다 — `#id`(100점) > `.class`/`[attr]`(10점)
> 태그(1점). 즉 **같은 selector 문법이 "매칭"과 "우선순위"를 동시에 정한다.**

## 해시된 클래스명 문제 — [[css-modules]] 부수효과

React + [[css-modules]] / CSS-in-JS / Tailwind를 쓰는 사이트는 빌드할 때마다
클래스명이 `_message_h3k2a` 같은 **해시 형태로 새로 생성**된다.
- 페이지 내부 스타일링에는 문제 없음(클래스 충돌 방지가 목적).
- **외부에서 selector로 잡으려는 도구(크롤러·클리퍼)에는 직격탄** — 한 번 배포되면 깨진다.

그래서 외부에서 selector를 만들 때 **안정성 우선순위**가 있다.

| 우선순위 | 기준 | 이유 |
| --- | --- | --- |
| 1 | `[data-*]` 속성 | 개발자가 **의미를 담아** 붙인 것. 보통 안 바꿈. |
| 2 | 의미적 태그 (`article`, `main`, `nav`) | 페이지 구조 자체라 잘 안 바뀜. |
| 3 | 손으로 쓴 안정적 클래스 (`.message`, `.prose`) | 해시 안 붙은 것. |
| 4 | 위치 기반 (`:nth-child`, 자손 경로) | **가장 약함** — 사이트 개편에 직격. |

> ChatGPT가 `[data-message-author-role="user"]`처럼 의미 속성을 메시지에 박아 둔 이유가
> 이거다 — 해시되지 않는 의미 속성은 빌드를 거쳐도 살아남는다.

## selector를 찾는 법 — DevTools 30초

1. 브라우저에서 페이지 열기.
2. 잡고 싶은 요소 위에서 **우클릭 → 검사(Inspect)** (또는 `F12`).
3. Elements 패널에서 그 요소의 `class`·`data-*` 속성을 확인.
4. **`data-*` 속성을 우선** 골라 selector를 직접 작성.

DevTools의 "Copy → Copy selector"는 `body > div:nth-child(3) > div > main > ...`
처럼 트리 위치를 통째로 박아 사이트 개편 한 번에 깨진다. **위치 기반은 마지막 수단.**

## [[web-clipper]]에서 활용

Obsidian Web Clipper는 `noteContentFormat` 안에서 `{{content}}` 대신 selector 변수를
박을 수 있다.

```jsonc
// AI 채팅 메시지만 골라 뽑기
"noteContentFormat": "## 💬 대화\n{{selectorHtml:[data-message-author-role]}}\n"
```

- `{{selector:CSS}}` — 텍스트만 추출.
- `{{selectorHtml:CSS}}` — HTML째로 가져와 마크다운 변환.

가상 스크롤 사이트(ChatGPT·Gemini)는 selector를 써도 **화면 밖 메시지가 DOM에 없을 수
있다** — 클립 전 대화 끝까지 스크롤해 올라갔다 내려와야 한다.

## 관련 페이지

- [[css-specificity]] — selector 문법으로 계산되는 우선순위 점수
- [[css-modules]] — 클래스명 해시 메커니즘 (외부에서 selector를 약하게 만드는 원인)
- [[web-clipper]] — selector를 실제로 박는 도구
