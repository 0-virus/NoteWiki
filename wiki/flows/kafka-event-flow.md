---
type: flow
tags: [kafka, messaging, event-streaming, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Kafka 이벤트 흐름 — 발행부터 다중 소비까지

> [[kafka]]에서 이벤트 하나가 발행되어 여러 시스템에 도달하는 전 경로.
> [[rabbitmq-message-flow]]와 나란히 보면 두 모델의 차이가 선명해진다.

## 전체 구조

```
주문 서비스 (Producer)
       │  OrderCreated
       ▼
┌──────── Kafka Cluster ────────┐
│  Broker 1   Broker 2   Broker 3│
│                                │
│  Topic: order-created          │
│  Partition 0 / 1 / 2           │
└────────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
 Group: notification  Group: analytics  Group: recommendation
  C1  C2  C3           C1  C2           C1
       │
       ▼
 문자 / Push / 이메일 발송
```

## 단계별

**① Producer가 이벤트를 발행한다**
```json
{ "eventType": "ORDER_CREATED", "orderId": 1001, "price": 2000000 }
```
key를 지정하면 같은 key는 같은 파티션으로 간다 → 그 key 안에서 **순서 보장**.
key를 안 주면 파티션에 고르게 분산된다 ([[kafka-topic-partition]]).

**② 브로커가 로그 끝에 덧붙인다**
```
Partition 1: [... ][ ][OrderCreated]
                          ↑ offset = 4821
```
파티션은 [[kafka-replication|Leader 브로커]]에 쓰이고 Follower로 복제된다.
`acks=all`이면 복제까지 확인해야 Producer가 성공 응답을 받는다.

**③ 저장된다 (사라지지 않는다)**
소비돼도 지워지지 않고 retention 기간(예: 7일) 동안 남는다.
**이 한 가지가 나머지 모든 차이의 출발점**이다.

**④ Consumer Group들이 각자 읽는다**
```
Group: notification    offset = 4821  (실시간 추종)
Group: analytics       offset = 4100  (조금 뒤처져도 무방)
Group: recommendation  offset = 3200
```
그룹 안에서는 파티션을 나눠 갖고, 그룹끼리는 서로 전혀 간섭하지 않는다
([[kafka-consumer-group]]).

**⑤ 처리 후 offset을 커밋한다**
커밋 시점이 [[message-delivery-semantics|보장 수준]]을 결정한다.
실무 기본값은 "처리 후 커밋(At-least-once) + 멱등한 Consumer".

## 소비자를 추가하면 — RabbitMQ와의 결정적 차이

새 서비스가 `order-created`를 구독하고 싶다고 하자.

```
새 Consumer Group 하나 만들고 auto.offset.reset = earliest
→ retention 안에 남아 있는 과거 이벤트까지 전부 읽을 수 있다
```

**Producer도, 기존 소비자도 아무것도 바꾸지 않는다.** 게다가 **자기가 붙기 전에 발생한
이벤트까지 처리할 수 있다.** RabbitMQ에서는 큐를 새로 바인딩해도 그 시점 이후 메시지만
받는다 — 과거는 이미 소비되어 사라졌기 때문이다.

## Replay — 되감기

```
분석 서비스에 버그 발견
  → 코드 수정
  → Consumer Group의 offset을 0(또는 특정 시각)으로 리셋
  → 처음부터 다시 처리
```

DB만 있었다면 "이미 잘못 집계된 결과"를 손으로 고쳐야 하지만, Kafka에서는 **원천 이벤트가
남아 있으므로 다시 계산하면 된다.** 이것이 Kafka를 데이터 플랫폼의 중추로 쓰는 이유다.

## DB와 함께 쓸 때 — Outbox

```
BEGIN
  INSERT order
  INSERT outbox_event      ← 같은 트랜잭션
COMMIT
       ↓
 별도 Worker 또는 CDC 파이프라인
       ↓
     Kafka
       ↓
  각 Consumer Group
```

DB 저장은 성공했는데 Kafka 전송이 실패하면 두 시스템이 어긋난다.
[[outbox-pattern]]이 이 문제를 푼다 — **Kafka를 쓰는 실무에서 거의 항상 같이 등장**하는 이유다.

## 실무 예 — 대출 신청

```
플랫폼 → 대출 서비스 → DB 저장
                        ↓ LOAN_APPLICATION_CREATED
                      Kafka
                        ├→ 심사 시스템
                        ├→ 알림 시스템
                        ├→ 감사 로그
                        └→ 분석
```

```json
{ "eventType": "LOAN_APPLICATION_CREATED",
  "applicationId": "A10001", "customerId": "C5001" }
```

대출 서비스는 각 소비 시스템의 구현을 알 필요가 없고, 새 시스템이 붙어도 코드가 바뀌지 않는다
([[event-driven-architecture]]). 이벤트가 그대로 남으므로 **감사 이력**도 자연히 확보된다.
(위 값들은 구조 설명용 가상 예시다.)

## 실무 코드를 읽을 때 찾을 것

```
1. Topic 이름            5. offset 커밋 방식 (auto? manual?)
2. 파티션 키              6. acks 설정
3. Consumer Group ID     7. 재시도·DLT 처리
4. 파티션 수             8. 멱등성 처리 여부
```

## 관련 페이지

- [[kafka]] · [[kafka-topic-partition]] · [[kafka-consumer-group]] · [[kafka-replication]]
- [[rabbitmq-message-flow]] — 대응하는 RabbitMQ 흐름
- [[rabbitmq-vs-kafka]] — 선택 기준
- [[event-driven-architecture]] · [[outbox-pattern]] · [[change-data-capture]]
- [[message-delivery-semantics]] · [[idempotency]]
- 출처: [[message-queue-note]]
