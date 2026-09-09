---
type: concept
tags: [kafka, messaging, distributed-systems, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Kafka Consumer Group

## 한 줄 정의

**같은 일을 나눠 하는 Consumer들의 묶음.** [[kafka]]는 파티션을 그룹 안의 Consumer들에게
나눠 배정해 병렬 처리하고, **서로 다른 그룹은 같은 데이터를 독립적으로 읽는다.**

## 두 가지 요구를 한 개념으로

메시징 시스템에는 상충하는 두 요구가 있다.

- **작업 분배** — "이 일은 한 명만 하면 된다" (한 메시지를 한 번만 처리)
- **브로드캐스트** — "이 사건은 모두가 알아야 한다" (여러 시스템이 각자 처리)

[[rabbitmq]]는 이를 큐(분배)와 Fanout Exchange(브로드캐스트)로 나눠 푼다.
Kafka는 **Consumer Group 하나로 둘 다** 해결한다.

```
그룹 안에서는 나눠 갖는다  (분배)
그룹끼리는 전부 다 읽는다  (브로드캐스트)
```

## 규칙 ① — 그룹 안: 한 파티션은 한 Consumer만

```
Group: order-processing
Partition 0 → Consumer A
Partition 1 → Consumer B
Partition 2 → Consumer C
```

**한 파티션을 그룹 내 두 Consumer가 동시에 읽는 일은 없다.** 그래야 중복 처리가 없고,
[[kafka-topic-partition|파티션 내 순서]]도 지켜진다.

Consumer 수에 따라 배정이 달라진다.

```
파티션 3, Consumer 2       파티션 3, Consumer 4
C1 → P0, P1                C1 → P0
C2 → P2                    C2 → P1
                           C3 → P2
                           C4 → idle (놀고 있음)
```

여기서 Kafka 운영의 가장 중요한 공식이 나온다.

> **Consumer 병렬성의 최대치 = 파티션 개수**

Consumer를 아무리 늘려도 파티션보다 많으면 남는 Consumer는 논다. **처리량이 부족할 때
서버부터 늘리는 것이 소용없는 이유**가 이것이다 — 파티션 수를 먼저 봐야 한다.

## 규칙 ② — 그룹 밖: 각자 다 읽는다

```
Topic: order-created   [Order1][Order2][Order3]

                 ┌→ Group: notification    (offset = 5)
order-created →  ├→ Group: analytics       (offset = 3)
                 └→ Group: recommendation  (offset = 1)
```

**Offset은 Consumer Group 단위로 관리**되므로 그룹마다 진도가 다르다. 분석 서비스가
느려도 알림 서비스는 영향받지 않는다. 하나의 이벤트를 여러 시스템이 각자의 속도로
활용할 수 있다는 것 — 이것이 [[event-driven-architecture]]의 실질적 토대다.

> 실무 함정: **Consumer Group ID를 실수로 공유하면** 브로드캐스트하려던 두 서비스가
> 서로 메시지를 나눠 갖게 되어 각자 절반씩만 처리한다. 반대로 **인스턴스마다 다른
> 그룹 ID를 주면** 스케일아웃하려던 것이 전부 중복 처리가 된다.
> **그룹 ID = "역할 이름"**이지 "인스턴스 이름"이 아니다.

## Offset 커밋 — 언제 확정하는가

Consumer는 처리한 위치를 브로커에 **커밋**해 기록한다. 커밋 시점이
[[message-delivery-semantics|전달 보장]]을 결정한다.

```
읽자마자 커밋 → 처리 중 죽으면 그 메시지 유실   (At-most-once)
처리 후 커밋  → 커밋 전 죽으면 재처리 = 중복    (At-least-once)
```

기본값인 자동 커밋(`enable.auto.commit=true`)은 주기적으로 백그라운드에서 커밋하기 때문에
**"아직 처리 안 한 것까지 커밋되어 유실"**이 생길 수 있다. 정확성이 중요하면 수동 커밋으로
바꾸고, 중복은 [[idempotency|멱등성]]으로 막는 것이 정석이다.

## Rebalancing — 재배정

그룹에 Consumer가 추가·제거되면 파티션 배정을 다시 계산한다.

```
기존:  C1 → P0, P1 / C2 → P2, P3
C3 합류 후:  C1 → P0 / C2 → P1 / C3 → P2, P3
```

편리해 보이지만 **운영에서 매우 중요한 주의 지점**이다. 리밸런싱 동안 해당 파티션의
**소비가 잠시 멈춘다**(stop-the-world). 배포로 인스턴스가 순차 재시작되면 리밸런싱이
연쇄적으로 일어나 지연이 커질 수 있다.

리밸런싱의 흔한 원인은 배포뿐이 아니다. **처리가 너무 오래 걸려 하트비트를 놓치면**
브로커가 "죽었다"고 판단해 리밸런싱을 시작한다 — 그러면 그 Consumer가 처리 중이던
메시지는 다른 Consumer에게 재배정되어 **중복 처리**가 된다. 한 건의 처리 시간이 길다면
`max.poll.records`를 줄이거나 `max.poll.interval.ms`를 늘려야 한다.

## 관련 페이지

- [[kafka]] — 상위 개념
- [[kafka-topic-partition]] — 배정 단위인 파티션과 순서 보장
- [[kafka-replication]] — 파티션의 물리적 배치
- [[message-delivery-semantics]] — 오프셋 커밋 시점과 보장 수준
- [[rabbitmq]] — Competing Consumers·Prefetch와의 비교
- [[idempotency]] — 리밸런싱발 중복 처리 대비
- 출처: [[message-queue-note]]
