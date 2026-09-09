---
type: concept
tags: [messaging, distributed-systems, transaction, backend]
updated: 2026-09-07
sources: ["raw/notes/Outbox_패턴_상세_설명.md", "raw/notes/Message Queue.md"]
---

# Outbox 패턴

## 한 줄 정의

**DB 변경과 "외부로 보낼 메시지"를 같은 로컬 트랜잭션 안에 함께 저장**해서,
서로 다른 두 자원(DB + 외부 시스템)에 쓰는 작업의 정합성 문제를 우회하는 설계 패턴.

## 왜 필요한가 — 이중 쓰기 문제 (Dual Write Problem)

애플리케이션이 "① DB 상태 변경"과 "② 외부 시스템에 이벤트 전달"을 함께 해야 할 때,
[[transaction]]의 원자성(A)은 **DB 안에서만** 보장된다. 외부 API 호출이나 메시지
브로커 전송은 그 트랜잭션의 커밋/롤백과 아무 관계가 없다.

```
DB 먼저 변경 → 커밋 성공 → 외부 전송 실패
  → 내부 DB: 새 상태 / 외부 시스템: 이전 상태

외부 먼저 전송 → 내부 DB 변경 실패 → 롤백
  → 내부 DB: 이전 상태 / 외부 시스템: 새 상태
```

**순서를 바꾸는 것만으로는 해결되지 않는다** — 항상 한쪽이 실패할 여지가 남는다. 이것이
이중 쓰기 문제다.

## 핵심 아이디어 — 외부 전송을 미루고, 저장을 트랜잭션 안으로

Outbox 패턴은 외부 호출 자체를 트랜잭션 안에서 하지 않는다. 대신 **"보낼 메시지"를
DB 레코드로 저장하는 행위**를 원래 트랜잭션에 끼워 넣는다.

```sql
BEGIN;
UPDATE resources SET status = 'ACTIVE' WHERE resource_id = 100;
INSERT INTO outbox_message (message_id, event_type, payload, send_status, ...)
VALUES ('msg-1', 'RESOURCE_ACTIVATED', '{"resourceId":"100"}', 'PENDING', ...);
COMMIT;  -- 두 작업이 함께 성공하거나 함께 실패
```

이제 정합성 문제는 "내부 DB ↔ 외부 시스템" 사이가 아니라 "내부 데이터 ↔ 같은 DB 안의
Outbox 테이블" 사이로 좁혀진다 — 둘 다 같은 트랜잭션이므로 [[transaction|ACID]]가 그대로 적용된다.

```
데이터 변경 트랜잭션
├── 내부 데이터 변경
└── Outbox 메시지 저장       ← 여기까지는 원자적 (같은 DB 트랜잭션)
       ↓ COMMIT
Outbox Publisher                ← 여기부터는 별도 프로세스, 별도 시도
       ↓
외부 시스템 / 메시지 브로커
```

이후 별도의 **Publisher(또는 Worker)**가 Outbox 테이블을 읽어 실제 외부 전달을 담당한다.
메시지 상태는 `PENDING → PROCESSING → SENT / RETRY / FAILED`로 관리한다.

## 무엇을 보장하고, 무엇을 보장하지 않는가

| 보장하는 것 | 보장하지 않는 것 |
| --- | --- |
| 내부 변경이 커밋됐다면 대응하는 메시지도 DB에 존재 | 외부 시스템이 즉시 처리한다 |
| 전송 대상 유실 방지, 재전송 가능 | 두 시스템이 항상 같은 상태를 가진다 |
| 서버 재시작 후에도 미처리 메시지 복구 | 메시지가 정확히 한 번만 전달된다 |

→ Outbox는 불일치를 **없애는** 패턴이 아니라 **식별하고 복구 가능한 형태로 바꾸는** 패턴이다.
따라서 이 패턴을 쓰는 시스템은 필연적으로 [[eventual-consistency|최종 일관성]]을 받아들여야 한다.

## 최소 한 번 전달과 멱등성

Publisher가 외부 전송에 성공했지만 응답이 유실되면, Publisher는 실패로 판단해 재전송한다
→ 외부 시스템은 같은 메시지를 두 번 받을 수 있다. Outbox는 **메시지 누락 가능성을 낮추는
대신 중복 가능성을 허용**하는 쪽(At-Least-Once Delivery)을 택한다.

그래서 Outbox는 반드시 소비자 쪽 [[idempotency|멱등성]]과 짝을 이뤄야 완성된다 —
"발신 쪽 최소 한 번" + "수신 쪽 멱등 처리" = 사실상의 정확히 한 번 효과.

## Payload는 스냅샷이어야 한다

Outbox에 ID만 저장하고 전송 시점에 원본 테이블을 다시 읽으면, 그 사이 원본이 바뀌어
**이벤트 발생 당시의 값**을 재구성하지 못할 수 있다. 그래서 Outbox에는 보통 이벤트
발생 시점의 전체 스냅샷(JSON)을 저장한다. 대가는 데이터 중복과 스키마 버전 관리 부담.

## 전달 방식 — Polling vs CDC

| 방식 | 동작 | 장점 | 단점 |
| --- | --- | --- | --- |
| **Polling Publisher** | Outbox 테이블을 주기적으로 `SELECT` | 구조 단순, 추가 인프라 불필요 | 조회 지연, 빈 조회 반복, 테이블 커지면 인덱스 관리 필요 |
| **CDC (Change Data Capture)** | DB 변경 로그에서 INSERT를 감지해 브로커로 전달 | 짧은 지연, 반복 조회 부하 없음 | 추가 인프라(Debezium 등), 운영 복잡도 증가 |

## 동시 Worker 처리 — 선점

여러 Worker가 같은 `PENDING` 메시지를 동시에 읽지 않도록 **선점**한다.

```sql
UPDATE outbox_message
SET send_status = 'PROCESSING', processing_owner = 'worker-a'
WHERE outbox_id = 100 AND send_status IN ('PENDING', 'RETRY');
-- 수정된 행 수 1 = 선점 성공, 0 = 다른 Worker가 이미 가져감
```

DB가 지원하면 `SELECT ... FOR UPDATE SKIP LOCKED`로 병렬 선점도 가능. 선점이 있어도
"외부 전송 성공 직후 Worker 중단" 같은 경우는 막지 못한다 — 최종 방어선은 여전히
소비자의 [[idempotency|멱등성]]이다.

## 재시도 정책

일시적 오류(연결 실패, 5xx, 타임아웃)와 영구적 오류(필수 필드 누락, 인증 오류)를
구분해야 한다. 구분하지 않으면 절대 성공할 수 없는 메시지를 무한 재시도하게 된다.
재시도 간격은 **지수 백오프**(1s → 2s → 4s → 8s...) + **지터**(임의 지연)로 여러
Worker가 동시에 재시도해 상대 시스템에 부하를 몰아주는 것을 막는다.

## 흔한 오해

> "Outbox를 쓰면 두 시스템은 항상 같은 상태다" → 아니다. 최종 일관성이며, 일시적
> 불일치가 항상 존재한다.
>
> "Outbox를 쓰면 정확히 한 번만 전송된다" → 아니다. 최소 한 번 전달 + 소비자 멱등성의
> 조합으로 "사실상 한 번"에 가깝게 만드는 것이다.

## 영균의 실무 맥락

금융솔루션 회사 입사 후 **배치 실행 시 외부 API 요청과 내부 시스템 사이의 괴리**를
줄이는 방법을 찾다가 만난 개념. 영균의 학습 트리에서 **메시징/이벤트 아키텍처로 들어가는
첫 진입점**이다 — 지금까지의 [[transaction]]·[[jdbc]]·[[jpa]] 학습은 모두 "DB 하나
안에서의 정합성"이었다면, Outbox는 처음으로 "DB 밖의 시스템과의 정합성"을 다룬다.

## 새 가지 — 그 "외부 시스템"의 정체 (2026-09-07 추가)

이 페이지를 처음 쓸 때 Publisher가 메시지를 보내는 대상은 "외부 시스템 / 메시지 브로커"라고만
적혀 있었다. 그 브로커의 실체가 [[message-queue|메시지 큐]]이며, 실무에서는 대개
[[kafka]] 또는 [[rabbitmq]]다.

브로커를 알고 나면 Outbox 패턴의 위치가 더 선명해진다.

```
BEGIN; INSERT order; INSERT outbox_event; COMMIT;
              ↓ Publisher (또는 CDC)
          Kafka / RabbitMQ
              ↓
        여러 Consumer
```

- **왜 브로커를 써도 Outbox가 필요한가** — 브로커 전송은 DB 트랜잭션의 롤백 대상이 아니다.
  `@Transactional` 메서드 안에서 `rabbitTemplate.convertAndSend()`를 호출해도 이중 쓰기
  문제는 그대로다. **브로커 종류와 무관한 문제**다 ([[rabbitmq-message-flow]]·[[kafka-event-flow]]).
- **Publisher 워커를 안 만들 수도 있다** — Outbox 테이블을 [[change-data-capture|CDC]]로
  구독하면 폴링 워커 없이 트랜잭션 로그에서 곧바로 이벤트를 뽑아낼 수 있다.
  Outbox의 정합성 + CDC의 누락 없음을 동시에 얻는 조합.
- **"최소 한 번 + 소비자 멱등성"의 정체** — 이 조합이 왜 표준인지는
  [[message-delivery-semantics]]에서 정리했다.
- Outbox가 흘려보낸 이벤트를 여러 시스템이 각자 소비하는 구조가 곧
  [[event-driven-architecture]]다.

## 관련 페이지

- [[message-queue]] · [[kafka]] · [[rabbitmq]] — Publisher가 메시지를 보내는 대상
- [[message-delivery-semantics]] — Outbox가 제공하는 보장 수준(At-least-once)의 정의
- [[change-data-capture]] — Publisher 워커를 대체할 수 있는 접근
- [[event-driven-architecture]] — Outbox가 참여하는 상위 아키텍처
- [[transaction]] — Outbox가 활용하는 "같은 트랜잭션" 원자성의 근거
- [[idempotency]] — Outbox의 At-Least-Once를 상쇄하는 소비자 쪽 방어선
- [[eventual-consistency]] — Outbox가 받아들이는 일관성 모델
- [[connection-pool]] · [[thread-pool]] — Publisher/Worker가 자원을 재사용하는 방식과의 유비
- 출처: [[outbox-pattern-note]] · [[message-queue-note]]
