# Codex Sync Memory

이 저장소의 메모리 동기화 장치는 Claude Code용이다.

## 사실 관계

- 저장소 사본: `.claude-memory/`
- Claude Code 실제 메모리: `~/.claude/projects/<slug>/memory/`
- 동기화 스크립트: `.claude/scripts/sync-memory.mjs`
- Claude 설정: `.claude/settings.json`

Codex는 `.claude-memory/`를 자동으로 메모리처럼 읽거나 쓰지 않는다.
따라서 Codex의 프로젝트 맥락은 `AGENTS.md`, `CLAUDE.md`, `My Context Summary.md`,
`wiki/index.md`, `wiki/log.md`를 통해 파악한다.

## 사용자가 동기화를 요청한 경우

- `push`: `node .claude/scripts/sync-memory.mjs push`
- `pull`: `node .claude/scripts/sync-memory.mjs pull`
- `init`: `git config core.hooksPath .githooks` 후 `node .claude/scripts/sync-memory.mjs pull`

주의: `pull`은 머신 메모리 폴더를 mirror하므로, 머신에만 있는 Claude 메모리는 사라질 수 있다.
