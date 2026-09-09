---
type: concept
tags: [kafka, distributed-systems, high-availability, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Kafka Broker · Cluster · Replication

## 한 줄 정의

**Broker** = Kafka 서버 한 대, **Cluster** = 브로커들의 묶음,
**Replication** = 같은 [[kafka-topic-partition|파티션]] 데이터를 여러 브로커에 복제해 두는 것.
[[kafka]]의 "분산"을 담당하는 층이다.

## 왜 여러 대인가

이유는 둘이고, 서로 다른 문제를 푼다.

### ① 성능 — 나눠 담기
파티션을 브로커들에 분산 배치하면 읽기·쓰기 부하와 디스크가 나뉜다.

```
Broker1 → Partition 0
Broker2 → Partition 1
Broker3 → Partition 2
```

브로커를 추가해 처리량을 늘리는 **[[horizontal-vs-vertical-scaling|수평 확장]]**이다.

### ② 장애 대응 — 복제해 두기
분산만 해서는 오히려 위험하다. Partition 0이 Broker 1에만 있다면 그 서버가 죽는 순간
해당 데이터 전체에 접근할 수 없다. **분산은 장애 지점을 줄이는 게 아니라 늘린다** —
그래서 복제가 반드시 따라온다.

```
Broker 1: Partition 0  (Leader)
Broker 2: Partition 0  (Replica)
Broker 3: Partition 0  (Replica)

replication factor = 3
```

## Leader와 Follower

복제본이 여러 개일 때 "어느 사본이 진짜인가"를 정해야 한다. Kafka는 파티션마다
**Leader 하나 + Follower 여럿** 구조를 쓴다.

```
Partition 0
  Broker1 → Leader     ← Producer/Consumer는 여기와만 통신
  Broker2 → Follower   ← Leader에서 복제해 따라감
  Broker3 → Follower
```

**왜 읽기까지 Leader로 몰아주는가.** Follower에서도 읽게 하면 복제가 아직 안 끝난
사본에서 오래된 데이터를 읽을 수 있다. 창구를 하나로 고정하면 그 파티션에 대해서는
일관된 순서와 최신성이 보장된다 — **가용성을 위해 복제하되, 일관성을 위해 창구는 하나**로
두는 절충이다.

Leader가 죽으면 Follower 중 하나가 새 Leader로 승격된다.

```
Broker1 DOWN → Broker2가 New Leader → 서비스 계속
```

이 자동 승격이 Kafka가 장애에 강한 이유이고, [[high-availability|고가용성]]의 전형적인
구현 방식이다. ([[load-balancer]]의 헬스체크·페일오버와 같은 발상이 저장 계층에 적용된 것.)

## 실무에서 따라오는 설정

복제가 있다는 것만으로 무손실이 되지는 않는다. **Producer가 "성공"으로 간주하는 시점**을
같이 정해야 한다.

```
acks=0    보내고 확인 안 함        → 가장 빠름, 유실 가능
acks=1    Leader에만 기록되면 성공  → Leader가 곧바로 죽으면 유실 가능
acks=all  복제본까지 기록돼야 성공  → 가장 안전, 가장 느림
```

금융처럼 유실이 치명적인 도메인에서는 `replication factor ≥ 3` + `acks=all` 조합이 기본이다.
**안전성과 지연시간은 여기서도 정확히 맞바꿔진다.**

## 관련 페이지

- [[kafka]] — 상위 개념
- [[kafka-topic-partition]] — 복제 단위인 파티션
- [[kafka-consumer-group]] — 파티션을 소비하는 쪽
- [[high-availability]] · [[horizontal-vs-vertical-scaling]] — 같은 원리를 다루는 시스템 디자인 개념
- [[message-delivery-semantics]] — acks 설정이 결정하는 보장 수준
- 출처: [[message-queue-note]]
