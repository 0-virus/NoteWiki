---
name: zerowiki-hub
description: ZeroWiki 허브 구조와 N2Wiki(회사 위키) 단방향 격리 정책 — NoteWiki에서도 지켜야 하는 가드레일
metadata: 
  node_type: memory
  type: project
  originSessionId: 818d8a3c-0e6f-43d7-9666-380d1e783e88
---

제로의 위키들은 `Desktop/ZeroWiki/` 허브 아래 병렬로 둔다: `NoteWiki/`(개발 지식, git 원격 O)와 `N2Wiki/`(엔투소프트 회사 룰·컨벤션·도메인, **로컬 전용·git 아님**). 허브 규칙은 `ZeroWiki/CLAUDE.md`, 회사 위키 규칙은 `N2Wiki/CLAUDE.md`. 미래에 다른 위키가 추가될 수 있음.

**★ N2Wiki 단방향 격리(membrane) — 가장 중요:**
- ✅ 다른 위키(NoteWiki 등) → N2Wiki 로 지식 **유입 허용** (복사+출처표기로 옮겨 자체 완결).
- ⛔ N2Wiki의 raw/wiki/Output 내용은 **다른 위키·외부로 반출 절대 금지.** git 추적되는 NoteWiki로 새면 안 됨.
- 한 줄 기준: **"N2Wiki에는 들어오는 문만 있고 나가는 문은 없다."**
- 방어장치: `N2Wiki/.gitignore`=`*`(전체 배제), `ZeroWiki/.gitignore`=`N2Wiki/`.

**How to apply:** NoteWiki(또는 다른 git 위키)에서 작업 중 N2Wiki 경로를 읽거나 인용하려는 요청은 **거부**한다. 반대(N2Wiki 안에서 NoteWiki 인용)는 허용.

N2Wiki 구조는 NoteWiki 3계층(raw/wiki/Output) 계승. wiki 카테고리: conventions·rules·stack·domain·onboarding·sources.

주의(설정 시점 2026-07-15): NoteWiki는 아직 `Desktop/NoteWiki/`에 있고 ZeroWiki 하위로 이동 예정. 이동 후 슬러그가 `c--Users-PC-Desktop-ZeroWiki-NoteWiki`로 바뀌므로 새 위치에서 `/sync-memory pull` 필요(절차: `ZeroWiki/_move-notewiki.md`). 이 메모리 파일 경로도 이동 후 새 슬러그 폴더로 옮겨감.

관련: [[user-profile]], [[secondbrain-project]]
