---
type: concept
tags: [obsidian, tool, workflow]
updated: 2026-05-19
sources: ["raw/youtube/옵시디언 쌩 기초는 탄탄하게, 이 한 영상으로 완벽하게 익히세요.md"]
---

# 옵시디언 웹 클리퍼 (Web Clipper)

## 한 줄 정의

웹 페이지를 마크다운 노트로 변환해 옵시디언 Vault에 저장하는 **브라우저 확장 프로그램**.

## 왜 쓰는가

읽은 글·영상을 복붙·정리 없이 한 번에 Vault로 들여온다.
세컨드 브레인에서 **원본 수집(sourcing)의 마찰을 없애는** 도구 —
수집이 쉬워야 위키가 꾸준히 자란다.

## 템플릿

클리퍼는 **템플릿**으로 동작한다. 템플릿은 저장 위치(`path`), 자동 생성할
[[obsidian-properties|속성]], 본문 형식을 정의한다. URL 트리거로 페이지 종류에 맞는
템플릿이 자동 선택되게 할 수도 있다.

## NoteWiki와의 관계

영균이 옵시디언을 쓰려는 **직접적 목표 ②**.
이 저장소 루트의 `clipper-article/youtube/podcast/book/research.json`이 바로 그 템플릿이며,
각각 [[obsidian|Vault]]의 `raw/articles`·`raw/youtube` 등으로 저장한다.
클리핑된 원본은 `source_type` 등의 속성을 갖춰 곧바로 **Ingest** 대상이 된다.

> 이 위키의 [[obsidian-basics-video]] 소스도 `clipper-youtube.json`으로 클리핑된 것이다.

## 정밀 추출 — [[css-selector]] 활용

기본 `{{content}}`는 Mozilla Readability(블로그 본문 추출용)를 돌리는데, AI 채팅
페이지처럼 가상 스크롤·복잡 DOM에는 약하다. 이때 `noteContentFormat` 안에
[[css-selector]] 변수를 박아 정밀 추출한다.

```jsonc
"noteContentFormat": "## 💬 대화\n{{selectorHtml:[data-message-author-role]}}\n"
```

- `{{selector:CSS}}` — 텍스트만.
- `{{selectorHtml:CSS}}` — HTML째 → 마크다운 변환.

가상 스크롤 사이트는 selector를 써도 **화면 밖 메시지가 DOM에 없을 수 있다** —
클립 전 대화 끝까지 스크롤 후 다시 내려와야 한다.

## 관련 페이지

- [[obsidian-properties]] — 클리퍼가 자동 생성하는 메타데이터
- [[obsidian-tags]] — 클리핑 시 붙는 `clippings/<type>` 중첩 태그
- [[obsidian]] — 클리핑 결과가 저장되는 Vault
- [[css-selector]] — 정밀 추출 시 `{{selectorHtml:...}}`에 박는 문법
- 출처: [[obsidian-basics-video]]
