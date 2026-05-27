---
type: concept
tags: [tool, agent, pi]
updated: 2026-05-27
sources: ["raw/dialogues/2026-05-27 pi 하네스 이해와 설정 — 슬래시 커맨드·스킬·익스텐션 구조.md"]
---

# pi (코딩 에이전트)

## 한 줄 정의

**Claude Code 위에 씌워진 코딩 에이전트 하네스.** `@earendil-works/pi-coding-agent`.  
모델·툴·세션·리소스를 관리하는 런타임이며, 익스텐션·스킬·프롬프트 템플릿으로 기능을 확장한다.

## 리소스 3계층

pi에서 "커스텀 동작"을 추가하는 방법은 세 가지다. 층마다 동작하는 위치와 주체가 다르다.

```
사용자 입력
    │
    ▼
[Prompt Template]  ← 사용자 메시지를 미리 저장한 단축키
    │ (내용이 메시지로 펼쳐져 모델에게 전달)
    ▼
[모델 + Skill]     ← 에이전트가 읽고 따르는 전문 절차서
    │ (모델이 SKILL.md를 읽고 기존 툴로 수행)
    ▼
[Extension]        ← pi 프로세스 내부 TypeScript 코드
    │ (모델 판단과 무관하게 pi 동작 자체를 가로채거나 바꿈)
    ▼
툴 실행 (bash·read·edit·write 등)
```

### Prompt Template — "내 메시지 단축키"

- `/커맨드명` 입력 시 `.md` 파일 전체가 즉시 사용자 메시지로 펼쳐진다.
- 로드 위치: `.pi/prompts/`, `~/.pi/agent/prompts/`
- Claude Code 호환: `.pi/settings.json`에 `"prompts": [".claude/commands"]` 추가 시 `.claude/commands/*.md`도 인식.
- 인자 지원: `$1`, `$2`, `$ARGUMENTS`

### Skill — "에이전트 전문 워크플로우"

- 시스템 프롬프트에 **이름·설명만** 항상 포함 (컨텍스트 절약). 필요 시 `SKILL.md` 전체 로드.
- 모델이 자율적으로 로드하거나, `/skill:이름`으로 명시 호출.
- 구조: 디렉토리 (`SKILL.md` + 스크립트 + 참조 문서).
- 로드 위치: `.pi/skills/`, `~/.pi/agent/skills/`, `~/.agents/skills/`
- Claude Code 호환: `settings.json`에 `"skills": ["~/.claude/skills"]`

### Extension — "pi 내부 코드 훅"

- TypeScript 모듈이 pi 프로세스 안에서 직접 실행된다.
- 툴 호출 **차단** 가능 (`return { block: true }`), 새 툴 **등록** 가능, UI 조작 가능.
- 이벤트 라이프사이클 훅: `tool_call`, `before_agent_start`, `resources_discover` 등.
- 로드 위치: `.pi/extensions/`, `~/.pi/agent/extensions/`

### 셋의 차이 한눈에

| | Prompt Template | Skill | Extension |
|---|---|---|---|
| 누가 쓰나 | 사용자 | 에이전트(모델) | pi 프로세스 |
| 형태 | `.md` 파일 | 디렉토리 패키지 | TypeScript |
| 툴 호출 차단 | ❌ | ❌ | ✅ |
| 새 툴 등록 | ❌ | ❌ | ✅ |
| 컨텍스트 비용 | 호출 시 전체 | 설명만 상시 | 없음 |
| 작성 난이도 | 쉬움 | 중간 | 높음 |

## 컨텍스트 파일

시작 시 `AGENTS.md` 또는 `CLAUDE.md`를 자동 로드한다 (네이티브 지원).  
현재 디렉토리에서 루트까지 올라가며 탐색. 글로벌: `~/.pi/agent/AGENTS.md`.

시스템 프롬프트 교체는 `.pi/SYSTEM.md`, 추가는 `.pi/APPEND_SYSTEM.md`.

## 설정 파일

| 위치 | 범위 |
|---|---|
| `~/.pi/agent/settings.json` | 글로벌 |
| `.pi/settings.json` | 프로젝트 (글로벌 위에 병합) |

주요 설정: `defaultProvider`, `defaultModel`, `defaultThinkingLevel`, `theme`,  
`skills`, `prompts`, `extensions`, `packages`, `compaction`, `enabledModels`

## 이 프로젝트(NoteWiki) 현재 설정

```
.pi/settings.json
  "prompts": [".claude/commands"]    → /lint, /ingest, /query, /sync-memory 자동 인식

~/.pi/agent/settings.json
  "skills": ["~/.claude/skills"]     → graphify, notewiki-ingest 전역 로드
```

## 관련 페이지

- [[llm-wiki-pattern]] — 이 NoteWiki가 따르는 AI 위키 패턴
- [[obsidian]] — NoteWiki의 뷰어 도구
- 출처: [[pi-dialogue]]
