---
type: source
tags: [messaging, distributed-systems, transaction, backend]
updated: 2026-07-28
sources:
  - raw/notes/Outbox_패턴_상세_설명.md
---

# Outbox 패턴 상세 설명

- **원본**: `raw/notes/Outbox_패턴_상세_설명.md`

## 맥락

영균이 **금융솔루션 회사에 입사**한 뒤 실무 프로젝트에서 처음 마주친 문제에서 출발한 노트.
배치 실행 시 **외부 API 요청**과 **내부 시스템(DB) 상태** 사이의 괴리를 최소화할 방법을 찾다가
Outbox 패턴을 발견했다. 메시징/이벤트 아키텍처로 들어가는 **첫 진입점**.

## 핵심 주장

1. DB 변경과 외부 시스템 호출은 서로 다른 자원에 쓰는 것이라 하나의 로컬 트랜잭션으로 묶을 수 없다 (이중 쓰기 문제).
2. 순서를 바꿔도(DB 먼저/외부 먼저) 문제는 해결되지 않는다 — 항상 한쪽이 실패할 여지가 남는다.
3. 해법은 외부 전송을 트랜잭션 **밖**이 아니라 **Outbox 테이블에 저장하는 행위를 트랜잭션 안**으로 끌어들이는 것.
4. Outbox는 정합성을 즉시 보장하지 않는다 — **최종 일관성(Eventual Consistency)** 을 받아들이는 패턴.
5. Publisher는 보통 **최소 한 번 전달(At-Least-Once)**을 목표로 하며, 중복 전달은 소비자의 **멱등성**으로 방어한다.
6. Payload는 조회 시점이 아니라 **이벤트 발생 시점의 스냅샷**을 저장해야 한다.
7. Polling vs CDC(Change Data Capture)는 지연·인프라 비용의 트레이드오프.
8. 재시도는 일시적 오류와 영구적 오류를 구분해야 하며, 지수 백오프 + 지터로 부하를 분산한다.
9. 여러 Worker의 동시 처리는 조건부 UPDATE 또는 `FOR UPDATE SKIP LOCKED`로 선점한다.

## 다루는 개념

- [[outbox-pattern]]
- [[idempotency]]
- [[eventual-consistency]]
- [[transaction]]

## 관련 페이지

- [[transaction]] — Outbox가 활용하는 "같은 트랜잭션" 보장의 근거
- [[connection-pool]] · [[thread-pool]] — Publisher/Worker가 자원을 재사용하는 방식과의 유비
