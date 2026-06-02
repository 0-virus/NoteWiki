# Codex Ingest

`raw/`의 새 원본을 `wiki/`에 반영하는 절차다.

## 모드

- 일반: 원본별로 짧게 맥락을 확인한 뒤 반영한다.
- 빠른 모드: 사용자가 "바로", "quick", "빠르게"라고 하면 인터뷰를 생략하고 `## 💭 내 메모`를 맥락으로 삼는다.
- 대화 저장 모드: 사용자가 현재 대화를 저장해 ingest하라고 하면 `raw/dialogues/`에 대화 원본을 만든 뒤 ingest한다.

## 절차

1. `wiki/index.md`, `wiki/log.md`, `raw/CLAUDE.md`, `wiki/CLAUDE.md`를 읽는다.
2. `raw/`의 파일을 나열한다. `raw/CLAUDE.md`는 원본 대상에서 제외한다.
3. `wiki/sources/` frontmatter의 `sources:`와 `wiki/log.md` ingest 기록을 대조해 미인제스트 원본을 찾는다.
4. 대상이 없으면 사용자에게 보고하고 종료한다.
5. 대상 원본을 읽는다. `raw/` 파일은 절대 수정하지 않는다.
6. 원본별로 핵심 주장, 언급된 엔티티, 다루는 개념을 정리한다.
7. 일반 모드라면 사용자에게 원본별 맥락 질문을 짧게 한다:
   - 왜 저장했나?
   - 지금 하는 일과 어떻게 연결되나?
   - 이걸로 무엇을 해보고 싶나?
8. `wiki/sources/`에 소스 요약 페이지를 만든다.
9. 관련 `wiki/concepts/`와 `wiki/flows/` 페이지를 생성·갱신한다.
10. 모든 새 페이지에 frontmatter를 넣고, 관련 페이지를 위키링크로 연결한다.
11. 새 위키링크 대상 파일이 실제로 존재하는지 점검한다.
12. `wiki/index.md`를 갱신한다.
13. `wiki/log.md`에 `## [YYYY-MM-DD] ingest | <제목>` 항목을 append한다.
14. 생성·갱신한 페이지와 핵심 연결을 사용자에게 간결히 보고한다.

## 대화 저장 모드

현재 대화를 원본으로 저장할 때는 아래 형식을 사용한다.

```markdown
---
source_type: "codex-conversation"
title: "<제목>"
url: ""
clipped: <YYYY-MM-DD>
description: "<한 줄 요약>"
status: "raw"
tags:
  - "clippings/codex"
---
> [!info] 원본 대화
> Codex 세션 — 공유 URL 없음

## 🗂 컨텍스트
<한 줄 요약>

## 💬 대화 본문
**You**

<사용자 발화>

---

**Codex**

<Codex 응답>

---

## 💭 내 메모

## 🔗 관련 노트
```

파일명은 `raw/dialogues/<YYYY-MM-DD> <제목>.md`를 사용한다.
