# Codex 설정

이 폴더는 NoteWiki에서 Codex가 Claude Code와 같은 프로젝트 맥락으로 일하기 위한
전용 참고 문서를 모은다.

## 우선순위

1. 루트 `AGENTS.md` — Codex가 직접 따르는 핵심 지시
2. 루트 `CLAUDE.md` — 프로젝트의 원본 맥락과 운영 철학
3. 각 폴더의 `CLAUDE.md` — `raw/`, `wiki/`, `Output/` 세부 규칙
4. `.codex/commands/*.md` — 반복 작업별 절차

## 명령 대응

Claude slash command는 Codex에서 자동 실행 명령으로 등록되어 있지 않다.
대신 사용자가 "ingest 해줘", "query 해줘", "lint 해줘"처럼 요청하면
아래 문서를 절차서처럼 읽고 수행한다.

- `commands/ingest.md`
- `commands/query.md`
- `commands/lint.md`
- `commands/sync-memory.md`

## 주의

- `.claude-memory/`는 Claude Code용 메모리 사본이다. Codex는 이를 자동으로 로드하지 않는다.
- Codex가 사용자 맥락을 파악해야 할 때는 `AGENTS.md`, `CLAUDE.md`, `My Context Summary.md`,
  `wiki/index.md`, `wiki/log.md`를 우선 읽는다.
