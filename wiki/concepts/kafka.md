---
type: concept
tags: [messaging, kafka, event-streaming, distributed-systems, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Apache Kafka

## 한 줄 정의

**시스템들 사이에서 대량의 이벤트 데이터를 빠르게 전달하고, 일정 기간 저장하며, 여러 소비자가
독립적으로 읽게 해 주는 분산 이벤트 스트리밍 플랫폼.**

"메시지 큐 아닌가?"라고 생각하기 쉽지만 범위가 더 넓다.
**전달 + 저장 + 다중 독립 소비 + 실시간 파이프라인**을 함께 제공한다.

## 이름의 세 단어

> Apache Kafka는 **분산(distributed) 이벤트(event) 스트리밍(streaming) 플랫폼**이다.

이 세 단어를 이해하면 Kafka가 거의 이해된다.

**이벤트** — "무언가 발생했다"는 기록. 명령이 아니라 **사실의 기록**이다.
```json
{ "eventType": "ORDER_CREATED", "orderId": 12345, "userId": 777,
  "price": 30000, "timestamp": "2026-09-03T12:30:00" }
```

**스트리밍** — 데이터가 발생하는 즉시 흘려보내며 처리한다. 하루치를 모아 새벽에 도는
Batch와 대비된다.
```
Batch:     하루치 축적 → 00:00 배치 실행 → 통계
Streaming: 12:00:01 주문 → Kafka → 분석 → 12:00:02 대시보드 반영
```

**분산** — 여러 서버(Broker)에 데이터를 나눠 저장하고 복제한다.
→ [[kafka-replication]]

## 왜 쓰는가 — 직접 호출의 한계

쇼핑몰에 주문·결제·재고·배송·알림·추천·분석 서비스가 있고, 주문이 발생하면 전부에게 알려야 한다.

```
주문 서비스
 ├── 결제 서비스 호출
 ├── 재고 서비스 호출
 ├── 배송 서비스 호출
 ├── 알림 서비스 호출
 ├── 추천 서비스 호출
 └── 분석 서비스 호출
```

**문제 1. 강한 결합** — 주문 서비스가 나머지 전부의 존재를 알아야 한다. 서비스가 하나
추가되면 주문 코드를 고친다.

**문제 2. 장애 전파** — 분석 서버가 죽어 타임아웃이 나면, 분석이 주문에 필수가 아닌데도
주문이 느려진다.

**문제 3. 트래픽 급증** — 평소 100건/s이던 주문이 이벤트로 100,000건/s이 되면 5,000건/s밖에
못 버티는 알림 서버가 터진다.

Kafka를 가운데 두면:

```
             ┌→ 결제
             ├→ 재고
주문 서비스 → Kafka ├→ 배송
             ├→ 알림
             ├→ 추천
             └→ 분석
```

주문 서비스는 `OrderCreated` **이벤트를 기록할 뿐**이고, 필요한 서비스가 알아서 가져간다.
새 소비자가 붙어도 주문 서비스는 그 사실조차 모른다.

## 핵심 구조: append-only log

Kafka를 이해하는 가장 중요한 개념이다. Kafka는 데이터를 **뒤에만 덧붙이는 로그**로 저장한다.

```
offset   0     1     2     3     4
        [A] → [B] → [C] → [D] → [E]
                                  ↑ 새 데이터는 항상 끝에 추가
```

중간을 수정하거나 삭제하지 않는다. **이 단순함이 Kafka가 빠른 이유의 상당 부분**이다 —
디스크의 순차 쓰기는 랜덤 쓰기보다 압도적으로 빠르고, 인덱스 갱신·락 경합·페이지 재배치 같은
비용이 없다. ([[database-index]]가 랜덤 접근을 빠르게 하려고 B+tree를 유지하는 대가와 정반대의
선택 — 목적이 다르면 자료구조 선택도 반대가 된다.)

각 메시지에는 **offset**이라는 순번이 붙고, Consumer는 "내가 어디까지 읽었는지"를 offset으로
기억한다. → [[kafka-topic-partition]]

## 일반 메시지 큐와 결정적으로 다른 점

일반 [[message-queue|큐]]는 소비하면 사라진다.
```
Queue: [A][B][C] → Consumer가 A 읽음 → [B][C]
```

Kafka는 읽어도 그대로 있다.
```
Kafka: [A][B][C] → Consumer가 A 읽음 → [A][B][C]  (그대로)
       Consumer 1 offset = 2
       Consumer 2 offset = 0
       Consumer 3 offset = 1
```

**메시지 삭제가 아니라 읽은 위치만 전진한다.** 여기서 두 가지 능력이 파생된다.

### ① 여러 시스템이 같은 이벤트를 독립적으로 소비
알림·분석·추천이 서로의 진행 속도에 영향을 주지 않고 각자 읽는다. → [[kafka-consumer-group]]

### ② Replay — 다시 읽기
분석 서비스에 버그가 있었다면, 고친 뒤 offset을 0으로 되돌려 처음부터 다시 처리할 수 있다.
```
offset = 5  →  버그 수정  →  offset = 0  →  전체 재처리
```
**"과거를 다시 흘려보낼 수 있다"** 는 것이 Kafka의 가장 강력한 무기다. 데이터 플랫폼·로그
시스템에서 이 능력이 결정적이다.

## Retention — 얼마나 보관하는가

Kafka는 메시지를 디스크에 저장하고, 설정된 기간(또는 크기)만큼 보관한다.

```
retention.ms = 604800000   # 약 7일
```

7일·30일·90일·무제한 모두 가능하다. **Consumer가 읽었는지 여부와 무관하게 시간 기준으로
지운다** — 이것이 "소비 = 삭제"인 큐와의 근본적 차이다.

## Kafka는 DB가 아니다

> "Kafka에 데이터를 저장하니 DB가 필요 없는 것 아닌가?"

목적이 다르다.

| | 저장하는 것 | 예 |
|---|---|---|
| DB | **현재 상태** | `order_id=100, status=배송완료` |
| Kafka | **상태 변화의 흐름** | OrderCreated → PaymentCompleted → ShippingStarted → DeliveryCompleted |

DB는 "지금 어떤가"에, Kafka는 "무슨 일들이 있었는가"에 답한다. Kafka에는 임의 조건 조회·
인덱스·업데이트가 없다. 둘은 대체재가 아니라 **시간 축을 담당하는 층이 하나 추가된 것**이다.

## 생태계

- **Kafka Connect** — 외부 시스템과 코드 없이 연결하는 커넥터 프레임워크
  (MySQL → Kafka, Kafka → Elasticsearch 등). [[change-data-capture|CDC]]의 실행 기반
- **Kafka Streams** — Kafka 데이터를 필터링·집계·조인·변환하는 Java 라이브러리.
  "토픽 → 처리 → 토픽" 구조로, 별도 클러스터 없이 애플리케이션 안에서 돈다
- **Flink / Spark** — 더 무거운 대규모 스트림·배치 처리 엔진과 함께 쓰이기도 한다

## 강점과 단점

**강점**
- 매우 높은 처리량 (순차 로그 + [[kafka-topic-partition|파티션]] 병렬성)
- 수평 확장 — 브로커·파티션을 늘려 처리량을 키운다 ([[horizontal-vs-vertical-scaling]])
- 장애 복구 — 복제 기반 ([[kafka-replication]], [[high-availability]])
- Replay·다중 Consumer Group

**단점**
- **운영이 복잡하다** — 클러스터·파티션 수·복제·리밸런싱·오프셋 관리 등 신경 쓸 것이 많다
- 작은 시스템에는 과하다 — 단순 작업 큐 하나 때문에 Kafka를 들이는 건 배보다 배꼽
- 라우팅 규칙·DLQ가 [[rabbitmq]]만큼 자연스럽지 않아 직접 설계해야 한다

## 비유

RabbitMQ가 **택배 시스템**("이 작업을 누가 처리할 것인가")이라면,
Kafka는 **신문 기록 보관소**("어떤 일이 발생했는가")에 가깝다.
발행된 신문은 독자가 읽어도 사라지지 않고, 나중에 온 사람도 지난 호를 찾아 읽을 수 있다.

## 영균의 실무 맥락

곧 투입될 프로젝트의 기술 스택에 Kafka가 있어 선행 학습으로 정리했다.
[[outbox-pattern]]에서 배운 "Publisher가 보내는 그 외부 시스템"의 정체가 대개 Kafka다 —
Outbox → Kafka → 여러 소비 시스템이 금융 도메인의 표준 조합이다. 실무 코드를 읽을 때는
**토픽 이름 · 파티션 키 · Consumer Group ID · 오프셋 커밋 시점 · 멱등성 처리** 다섯 개를
먼저 찾으면 흐름이 잡힌다.

## 관련 페이지

- [[kafka-topic-partition]] — Topic·Partition·Offset·Key, 순서 보장의 원리
- [[kafka-consumer-group]] — 병렬 소비와 리밸런싱
- [[kafka-replication]] — Broker·Cluster·Leader/Follower
- [[kafka-event-flow]] — Producer부터 소비까지 전체 흐름
- [[event-driven-architecture]] — Kafka가 가능하게 하는 아키텍처
- [[rabbitmq-vs-kafka]] — 선택 기준
- [[change-data-capture]] — DB 변경을 이벤트로 바꾸는 기법
- [[message-delivery-semantics]] — At-least-once·Exactly-once의 범위
- [[outbox-pattern]] · [[idempotency]] — 정합성 조합
- 출처: [[message-queue-note]]
