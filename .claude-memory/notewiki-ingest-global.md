---
name: notewiki-ingest-global
description: NoteWiki 인제스트를 폴더 밖 어디서든 실행하는 전역 스킬 /notewiki-ingest
metadata: 
  node_type: memory
  type: reference
  originSessionId: 20afba32-2ae5-44f6-8b88-e23af00dc815
---

NoteWiki의 인제스트 작업은 두 진입점이 있다:

- **`/ingest`** — 프로젝트 명령어 (`<NW>\.claude\commands\ingest.md`). NoteWiki 폴더 안에서 작업할 때 사용. 정식 절차의 단일 출처.
- **`/notewiki-ingest`** — 전역 스킬 (`C:\Users\PC\.claude\skills\notewiki-ingest\SKILL.md`). NoteWiki 폴더 **밖**에서 호출할 때 사용. 절차를 복붙하지 않은 얇은 래퍼라서, `ingest.md`를 고치면 전역 스킬도 자동으로 최신이 된다.

전역 스킬에 NoteWiki 경로 `C:\Users\PC\Desktop\NoteWiki`가 하드코딩돼 있다. 저장소를 옮기면 SKILL.md 상단 "NoteWiki 저장소 위치" 한 줄만 갱신하면 된다.

`ingest.md`는 두 가지 `dialogue` 모드를 지원한다:
- `dialogue` (경로 없음) — 현재 대화를 `raw/dialogues/`에 새 파일로 저장 후 인제스트.
- `dialogue <raw/파일경로>` — 지정한 기존 raw 파일에 현재 대화를 이어 붙인 뒤 인제스트 (**대화 보완 모드**). 이미 인제스트된 파일도 강제 재처리한다.

`query.md`는 `raw/<파일경로>` 인자를 지원한다 — 지정된 raw 파일을 1차 근거로, wiki를 보조 출처로 삼아 답변한다.

`/commit` 커맨드(`.claude/commands/commit.md`)가 추가됐다 — `wiki/log.md` 기반으로 커밋 메시지를 자동 생성하고 관련 파일을 스테이징해 커밋한다. `--dry-run` 인자 지원.

관련: [[secondbrain-project]]
