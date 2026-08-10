---
name: company-knowledge-boundary
description: "NoteWiki에는 일반 기술 지식만, 엔투소프트 고유 지식은 N2Wiki로 — 취업 후 확정한 경계 규칙"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ba818c42-2610-42db-aefb-557bd5bca3f0
  modified: 2026-07-28T06:14:36.437Z
---

취업(2026-07-13, 엔투소프트) 이후 raw/ 원본이 회사 업무에서도 나오기 시작하면서,
NoteWiki(git 원격 O)와 N2Wiki(로컬 전용, [[zerowiki-hub]] 참조)의 지식 경계를
2026-07-28에 명시적으로 확정했다.

- **NoteWiki에 남기는 것**: 회사색을 걷어내도 남는 일반 기술 개념·설계 패턴
  (예: Outbox 패턴, 멱등성 — 실제로 회사 배치/외부 API 업무에서 나왔지만 일반화해서 수록).
- **NoteWiki에 넣지 않는 것**: 사원명·고객사명·사내 시스템명·내부 API 스펙,
  여신 승인 로직 같은 회사 고유 도메인 규칙, 사내 컨벤션 — 이런 건 N2Wiki 영역.
- 판단은 1차로 영균이 원본을 넣을 때 이미 일반화하는 것이 원칙이고, AI(클로)는
  인제스트 시 재확인하는 최종 방어선 역할. 애매하면 사용자 확인 후 `wiki/log.md`에
  판단 근거를 남긴다 ("범위 판단" — coverage-standard 인제스트에서 먼저 쓰인 패턴).

**Why**: NoteWiki는 이직해도 들고 다닐 개인 자산이라 회사 종속적 지식이 섞이면 안 되고,
동시에 git 원격이 있어 회사 기밀이 새어나갈 위험도 있음. 두 이유가 겹쳐 엄격한 경계가 필요.

**How to apply**: `/ingest` 실행 시, 원본이 회사 업무에서 나온 것으로 보이면 이 경계
기준으로 먼저 걸러낸 뒤에 위키 페이지를 작성한다. 이미 `CLAUDE.md`·`raw/CLAUDE.md`·
`.claude/commands/ingest.md`에 절차로 명문화됨 — 이 메모리는 그 결정의 배경(왜 이렇게
정했는지)을 보존하기 위한 것.

관련: [[zerowiki-hub]], [[user-profile]], [[secondbrain-project]]
