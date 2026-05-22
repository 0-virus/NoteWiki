---
type: concept
tags: [obsidian, tool]
updated: 2026-05-19
sources: ["raw/youtube/옵시디언 쌩 기초는 탄탄하게, 이 한 영상으로 완벽하게 익히세요.md"]
---

# 옵시디언 속성 (Properties)

## 한 줄 정의

노트 맨 위 `---` 사이에 적는 **메타데이터**. [[markdown|마크다운]]에서는 frontmatter라고 부른다.

## 왜 쓰는가

본문에 담기 애매한 **맥락 정보**(작성 날짜, 노트 종류, 소속, 태그 등)를 구조화해 둔다.
옵시디언은 이 속성을 기준으로 **노트를 검색·필터**할 수 있다 —
예: "`type`이 concept인 노트만", "`updated`가 2024인 노트만".

## 작성법

노트 **맨 첫 줄**에서 `---`를 입력하면 속성 영역이 열린다 (단축키 `Ctrl + ;`).
속성마다 타입(텍스트·날짜·태그·리스트 등)을 지정할 수 있다.

```yaml
---
type: concept
tags: [obsidian]
updated: 2026-05-18
---
```

## NoteWiki와의 관계

이 위키의 **모든 페이지가 속성을 쓴다** — `type` / `tags` / `updated` / `sources`
(루트 `CLAUDE.md`의 페이지 작성 규칙). [[web-clipper]] 템플릿도 클리핑 시
`source_type`·`url`·`published` 같은 속성을 자동 생성한다.
즉 속성은 NoteWiki의 검색·인제스트가 돌아가는 토대다.

## 관련 페이지

- [[obsidian-tags]] — 속성의 `tags` 필드가 쓰는 태그 시스템
- [[web-clipper]] — 클리핑 시 속성을 자동으로 채운다
- [[markdown]] — 속성(frontmatter)이 얹히는 바탕 형식
- 출처: [[obsidian-basics-video]]
