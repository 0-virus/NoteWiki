---
type: flow
tags: [rabbitmq, messaging, amqp, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# RabbitMQ 메시지 흐름 — 발행부터 ACK·DLQ까지

> [[rabbitmq]]에서 메시지 하나가 태어나 사라지기까지의 전 경로.
> 실무 코드를 읽을 때 "지금 어느 단계를 보고 있는가"를 짚기 위한 지도.

## 전체 경로

```
Producer
   │  publish (message + routingKey)
   ▼
Exchange
   │  Routing Key + Binding 규칙 평가
   ▼
Queue
   │  deliver
   ▼
Consumer
   ├─ 성공 → ACK  → 브로커가 메시지 제거
   └─ 실패 → NACK → 재큐 / Retry → 반복 실패 → DLQ
```

## 10단계

```
1. Producer가 메시지 생성
2. Producer가 Exchange로 전송 (routingKey = order.created)
3. Exchange가 Routing Key 확인
4. Binding Rule 확인
5. 조건에 맞는 Queue로 전달 (여러 개일 수 있음)
6. Queue가 메시지 저장
7. Consumer가 메시지 수신
8. Consumer가 작업 수행
9. Consumer가 ACK 전송
10. RabbitMQ가 메시지 제거
```

각 단계마다 "여기서 죽으면 어떻게 되는가"를 붙이면 [[rabbitmq]]의 안정성 장치가 왜 존재하는지가 보인다.

| 죽는 지점 | 결과 | 대응 장치 |
|---|---|---|
| 2번 도중 | 브로커가 못 받음 | **Publisher Confirm** |
| 5번에서 매칭 실패 | 메시지가 조용히 사라짐 | Binding 점검 / mandatory 플래그 |
| 6번 중 브로커 재시작 | 메시지 소실 | **Durable Queue + Persistent Message** |
| 8번 도중 | 작업 미완료 | **처리 후 ACK** (재전달) |
| 9번 직전 | 작업은 끝났는데 재전달 | **[[idempotency\|멱등성]]** |
| 8번 반복 실패 | 큐가 막힘 | **[[dead-letter-queue\|DLQ]]** |

**이 표가 RabbitMQ 설정의 전부**라고 봐도 무방하다. 각 설정은 특정 지점의 죽음에 대한 답이다.

## 구체 예 — 주문 이메일

**① 구조 정의** ([[spring-amqp]]의 `RabbitConfig`)
```
Queue:        order.email.queue   (durable)
Exchange:     order.exchange      (Direct)
Binding:      order.created → order.email.queue
```

**② 발행**
```java
rabbitTemplate.convertAndSend("order.exchange", "order.created", orderId);
```

**③ 라우팅**
```
routingKey "order.created" == binding key "order.created"  →  일치
→ order.email.queue에 적재
```
[[amqp-exchange|Topic Exchange]]였다면 `order.*`·`order.#` 같은 패턴 매칭으로 여러 큐에
동시에 복사됐을 것이다.

**④ 소비**
```java
@RabbitListener(queues = "order.email.queue")
public void consume(Long orderId) { ... }
```
메서드가 정상 종료 → 자동 ACK. 예외 → NACK → 재시도 정책에 따라 재큐 또는 DLQ.

## 실패 경로 상세

```
order.email.queue → Consumer → 실패
                                 ↓
                          1초 후 재시도 → 실패
                          10초 후 재시도 → 실패
                          1분 후 재시도 → 실패
                                 ↓
                          order.email.dlq
                                 ↓
                          운영자 확인 → 원인 수정 → 본 큐로 재투입
```

지연을 두는 이유, 일시적/영구적 오류를 구분하는 이유는 [[dead-letter-queue]] 참고.

## 확장 — Consumer를 늘릴 때

```
order.email.queue ├→ Consumer A
                  ├→ Consumer B
                  └→ Consumer C
```
한 메시지는 한 Consumer에게만 간다(Competing Consumers). 특정 Consumer에 몰리지 않게
**prefetch**로 선점 개수를 제한한다.

[[kafka]]였다면 같은 확장이 파티션 수에 묶인다 ([[kafka-consumer-group]]) — 이 차이가
두 브로커의 운영 감각을 가장 크게 가른다.

## DB와 함께 쓸 때 — 빠지기 쉬운 함정

```
OrderService
  ├─ DB 저장 (성공)
  └─ RabbitMQ 전송 (실패)   ← 주문은 있는데 이메일 이벤트는 없다
```

`@Transactional` 안에 넣어도 해결되지 않는다. 브로커 전송은 DB 트랜잭션의 롤백 대상이
아니기 때문이다. 정석 해법은 [[outbox-pattern]]:

```
BEGIN; INSERT order; INSERT outbox_event; COMMIT;
              ↓
        별도 Worker
              ↓
          RabbitMQ → Consumer
```

Kafka에서 설명되는 Outbox와 **원리가 완전히 동일**하다 — 브로커가 무엇이든 이중 쓰기 문제는 같다.

## 관련 페이지

- [[rabbitmq]] · [[amqp-exchange]] · [[spring-amqp]]
- [[dead-letter-queue]] · [[message-delivery-semantics]] · [[idempotency]]
- [[kafka-event-flow]] — Kafka 쪽의 대응 흐름
- [[rabbitmq-vs-kafka]] — 선택 기준
- [[outbox-pattern]]
- 출처: [[message-queue-note]]
