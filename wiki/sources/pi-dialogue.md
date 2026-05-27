---
type: source
tags: [pi, agent, tool]
updated: 2026-05-27
sources: ["raw/dialogues/2026-05-27 pi 하네스 이해와 설정 — 슬래시 커맨드·스킬·익스텐션 구조.md"]
---

# 소스: pi 하네스 이해와 설정 대화

## 원본 정보

- **파일**: `raw/dialogues/2026-05-27 pi 하네스 이해와 설정 — 슬래시 커맨드·스킬·익스텐션 구조.md`
- **유형**: Claude Code 세션
- **날짜**: 2026-05-27

## 핵심 takeaway

1. **pi는 Claude Code 위에 씌워진 하네스**다. 슬래시 커맨드는 `.pi/prompts/`에서 로드하며, `.claude/commands/`는 pi가 자동으로 읽지 않는다. → `.pi/settings.json`에 `"prompts": [".claude/commands"]`를 추가해 연동.

2. **pi 리소스 3계층 구조**:
   - Prompt Template: 사용자 메시지 단축키 (호출 즉시 전체 내용이 메시지로 전송)
   - Skill: 에이전트 전문 워크플로우 (설명만 시스템 프롬프트에 상시 대기, 필요 시 전체 로드)
   - Extension: pi 프로세스 내부에 꽂는 TypeScript 코드 (툴 차단·등록·UI 조작 가능)

3. **CLAUDE.md는 pi가 네이티브 지원** — AGENTS.md와 함께 자동 로드. 별도 설정 불필요.

4. **이 세션 결과로 완료된 설정**:
   - `.pi/settings.json` 생성: `prompts: [".claude/commands"]`
   - `~/.pi/agent/settings.json` 갱신: `skills: ["~/.claude/skills"]`

## 언급 개념

- [[pi]] — pi 코딩 에이전트 하네스
- [[llm-wiki-pattern]] — 이 NoteWiki가 따르는 패턴

## 관련 결과물

- `Output/pi-guide.md` — 이 대화 중 작성한 pi 사용법 정리본
