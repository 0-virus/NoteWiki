---
type: concept
tags: [kafka, messaging, distributed-systems, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Kafka Topic · Partition · Offset

## 한 줄 정의

**Topic** = 이벤트를 분류하는 이름표, **Partition** = 그 토픽을 병렬 처리 가능하게 쪼갠
단위 로그, **Offset** = 파티션 안에서 각 메시지에 붙는 순번.

이 셋이 [[kafka]]의 성능·순서 보장·소비 방식을 전부 규정한다.

## Topic — 이벤트의 분류

Kafka는 데이터를 Topic 단위로 나눈다. DB의 테이블과 비슷한 감각이다.

```
order-created
payment-completed
delivery-started
user-login
server-log
```

토픽 안에는 이벤트가 계속 뒤에 추가된다.

```
order-created: [Order1][Order2][Order3][Order4]...
```

## Partition — 왜 쪼개는가

토픽은 실제로 하나의 거대한 로그가 아니라, 여러 **Partition**으로 나뉜다.

```
Topic: order

Partition 0: [A][D][G]
Partition 1: [B][E][H]
Partition 2: [C][F][I]
```

**이유는 병렬 처리다.** 토픽이 한 줄이라면 아무리 Consumer를 늘려도 결국 한 줄을 순서대로
읽어야 하므로 처리량의 상한이 생긴다. 파티션을 나누면 각 파티션을 다른 Consumer가 동시에
읽을 수 있다.

```
Partition 0 → Consumer A
Partition 1 → Consumer B   ← 동시 처리
Partition 2 → Consumer C
```

**파티션 수가 곧 Kafka의 병렬성 상한**이다. 이 규칙이 [[kafka-consumer-group]]의 배정
규칙으로 이어진다.

## Offset — 어디까지 읽었는가

각 파티션 안에서 메시지는 0부터 번호를 받는다.

```
offset:   0        1        2        3
        OrderA   OrderB   OrderC   OrderD
                            ↑
                    Consumer offset = 2 (여기까지 읽음, 다음은 3)
```

Kafka가 메시지를 지우면서 소비를 추적하는 대신 **"읽은 위치"라는 숫자 하나만 관리**한다는
점이 핵심이다. 이 설계 덕분에:

- 브로커는 누가 무엇을 읽었는지 메시지마다 상태를 들고 있을 필요가 없다 → 가볍고 빠르다
- offset을 되돌리면 **Replay**가 된다
- 여러 소비자가 각자 다른 offset을 가질 수 있다 → 독립 소비

offset은 **파티션 안에서만 의미가 있다.** 토픽 전체를 관통하는 전역 순번은 없다.

## 순서 보장의 진실

Kafka에서 가장 자주 오해되는 규칙이다.

> **Kafka는 Topic 전체의 순서를 보장하지 않는다.
> Partition 내부에서만 순서를 보장한다.**

```
Partition 0: A → B → C → D     ← 이 순서는 절대 유지된다

Partition 0: A C E
Partition 1: B D F
전체적으로 A B C D E F 순서? → 보장되지 않는다
```

**왜 이렇게 설계했는가.** 전역 순서를 보장하려면 결국 모든 메시지가 한 줄로 줄을 서야 하고,
그 순간 병렬성이 사라진다. Kafka는 **"전역 순서를 포기하는 대신 처리량을 얻는"** 거래를
선택했다. 대신 순서가 필요한 범위만 같은 파티션으로 모을 수단을 준다 — 그것이 Message Key다.

## Message Key — 순서를 지키는 열쇠

Kafka 메시지의 구조:

```
Key / Value / Timestamp / Headers
```

**같은 Key를 가진 메시지는 같은 파티션으로 간다** (기본 파티셔너가 키 해시로 결정).

```
Key = userId(100)
  Order1, Order2, Order3  →  모두 Partition 2
  → Order1 → Order2 → Order3 순서 유지
```

즉 **"어떤 단위로 순서를 지켜야 하는가"가 곧 파티션 키 선택**이다.

- 계좌별 입출금 순서가 중요하다 → key = 계좌번호
- 신청 건별 상태 변화 순서가 중요하다 → key = 신청ID
- 순서가 상관없다 → key 없음 (라운드로빈으로 고르게 분산)

**함정**: 키가 한쪽에 쏠리면(예: 대형 고객사 ID) 특정 파티션만 뜨거워지는
**hot partition**이 생긴다 — 파티션이 10개여도 실질 병렬성은 1이 될 수 있다.
[[database-index]]의 카디널리티 문제와 같은 종류의 함정이다.

또 하나: **파티션 수는 늘릴 수는 있어도 줄일 수 없고**, 늘리는 순간 키 → 파티션 매핑이
바뀌어 **기존 키의 순서 보장이 깨진다.** 그래서 파티션 수는 처음에 신중히 잡는다.

## 관련 페이지

- [[kafka]] — append-only log와 Replay의 기반
- [[kafka-consumer-group]] — 파티션이 Consumer에 배정되는 규칙
- [[kafka-replication]] — 파티션이 브로커에 복제되는 방식
- [[kafka-event-flow]] — 전체 흐름
- [[amqp-exchange]] — RabbitMQ의 라우팅과 비교
- [[database-index]] — 카디널리티 쏠림이라는 유사한 함정
- 출처: [[message-queue-note]]
