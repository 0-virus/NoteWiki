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

`ingest.md`는 `dialogue`(`대화`·`현재대화`) 인자를 지원한다 — 현재 진행 중인 대화를 `etc/clipper-template/clipper-claude.json` 포맷으로 `raw/dialogues/`에 저장한 뒤 인제스트한다. 두 진입점 모두 이 인자를 받는다.

관련: [[secondbrain-project]]
