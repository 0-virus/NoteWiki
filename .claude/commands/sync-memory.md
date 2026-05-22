---
description: 클로의 메모리 폴더를 저장소(.claude-memory/)와 동기화. push=머신→저장소, pull=저장소→머신, init=훅 셋업
argument-hint: [push|pull|init]
---

# /sync-memory — 메모리 동기화

클로가 너에 대해 기억하는 내용(`~/.claude/projects/<slug>/memory/`)을
이 저장소의 `.claude-memory/`와 동기화한다. 다른 머신에 클론해도 같은 기억으로 이어가기 위한 장치.

## 모드

- `push` — 머신 메모리 → 저장소 `.claude-memory/` (커밋 전, 자동 Stop 훅과 동일)
- `pull` — 저장소 `.claude-memory/` → 머신 메모리 (클론·풀 직후)
- `init` — 새 머신 셋업: `core.hooksPath`를 `.githooks`로 지정하고 초기 pull 수행
- 인자 없음 → `push` 후 현재 상태 보고

## 처리 절차

`$ARGUMENTS`를 보고 분기.

### push (또는 인자 없음)

1. `node .claude/scripts/sync-memory.mjs push` 실행.
2. 결과를 그대로 보고 (몇 개 복사·삭제됐는지).

### pull

1. `node .claude/scripts/sync-memory.mjs pull` 실행.
2. 결과를 그대로 보고.
3. 사용자에게 안내: "다음 대화부터 새 메모리가 반영됨" (현재 대화는 이미 로드된 메모리 사용).

### init (새 머신 1회 셋업)

1. `git config core.hooksPath .githooks` 실행. → 저장소에 들어있는 `.githooks/`가 활성화.
2. `node .claude/scripts/sync-memory.mjs pull` 실행. → 머신 메모리 폴더 채움.
3. 셋업 완료 안내 + 이후 자동 동기화가 어떻게 도는지 한 줄 요약.

## 주의

- 양쪽이 동시에 수정되면 **마지막 실행이 이긴다**(mirror 동작). 자동 머지 없음.
- `push`는 머신 메모리 폴더가 없으면 조용히 종료(에러 아님). 최초 사용 시 흔한 상황.
- `pull`은 머신 메모리 폴더를 **덮어쓴다**. 머신에만 있는 변경은 사라지므로, 우려되면 먼저 `push`부터.
