---
type: concept
tags: [messaging, distributed-systems, reliability, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# 메시지 전달 보장 (Delivery Semantics)

## 한 줄 정의

**메시지가 "몇 번 처리되는가"에 대한 약속.** At-most-once(최대 한 번),
At-least-once(최소 한 번), Exactly-once(정확히 한 번) 세 가지가 있다.

## 왜 이런 구분이 생기는가

분산 시스템에서는 **"메시지를 처리했다"와 "처리했다고 알렸다"가 별개의 사건**이다.
이 둘 사이에 네트워크나 프로세스가 죽을 수 있고, 그 순간을 관측할 방법이 없다.

```
Consumer: 메시지 수신 → 작업 수행 → ACK 전송
                    ↑            ↑
              여기서 죽으면?   여기서 죽으면?
```

브로커 입장에서는 "Consumer가 처리 전에 죽었다"와 "처리는 했는데 ACK만 못 보냈다"가
**구분 불가능**하다. 둘 다 "ACK가 안 옴"으로 똑같이 보인다. 그래서 선택지는 둘뿐이다.

- 다시 보낸다 → 중복 가능 (At-least-once)
- 안 보낸다 → 유실 가능 (At-most-once)

**이 둘 사이에 공짜 점심은 없다.** 어느 쪽 위험을 감수할지의 선택이다.

## ACK — 모든 것의 기준점

**ACK**(acknowledgement)는 Consumer가 "이 메시지 처리 끝냈다"고 브로커에 보내는 신호다.
브로커는 ACK를 받아야 메시지를 제거하거나 오프셋을 확정한다.

**ACK를 언제 보내느냐가 보장 수준을 결정한다.**

```
① 메시지 받자마자 ACK → 작업 중 죽으면 유실  → At-most-once
② 작업 끝낸 뒤 ACK    → ACK 직전 죽으면 중복 → At-least-once
```

**NACK**는 반대로 "처리 실패했다"고 명시적으로 알리는 신호다. 설정에 따라 재큐잉,
폐기, [[dead-letter-queue|DLQ]] 이동 중 하나로 처리된다. NACK가 있으면 브로커가
타임아웃을 기다릴 필요 없이 즉시 조치할 수 있다.

## 세 가지 보장 수준

### At-most-once — 최대 한 번
```
유실 가능 O / 중복 없음
```
처리 전에 ACK를 먼저 보내는 방식. 빠르지만 안전하지 않다.
**로그 수집·지표 전송처럼 몇 건 빠져도 무방한 데이터**에 쓴다.

### At-least-once — 최소 한 번
```
유실 거의 없음 / 중복 가능 O
```
처리 완료 후 ACK. **실무에서 압도적으로 흔한 선택**이다. 유실보다 중복이 훨씬 다루기
쉽기 때문이다 — 중복은 [[idempotency|멱등성]]으로 소비자 쪽에서 무해화할 수 있지만,
유실된 메시지는 되살릴 방법이 없다.

> **핵심 통찰**: 실무의 표준 조합은
> **"At-least-once 전달 + 멱등한 Consumer"** = 사실상 Exactly-once.
> [[outbox-pattern]]이 최종적으로 노리는 지점도 정확히 여기다.

### Exactly-once — 정확히 한 번
```
유실 없음 / 중복 없음
```
이상적이지만 **분산 환경에서 진짜로 달성하기 매우 어렵다.**
[[kafka]]는 idempotent producer(중복 발행 제거)와 트랜잭션(읽기-처리-쓰기를 원자적으로)으로
"Kafka 안에서의 Exactly-once semantics"를 지원한다.

하지만 **범위가 Kafka 내부로 한정된다.** Consumer가 처리 결과를 외부 DB나 API에 쓰는
순간, 그 쓰기는 Kafka 트랜잭션 밖이다 — [[outbox-pattern]]이 지적하는 이중 쓰기 문제가
그대로 재등장한다. 그래서 실무에서는 "Exactly-once를 켰으니 안심"이 아니라, **경계를
넘는 순간마다 멱등성을 다시 설계해야 한다.**

## 정리

| 보장 | 유실 | 중복 | ACK 시점 | 쓰임 |
|---|---|---|---|---|
| At-most-once | 가능 | 없음 | 처리 전 | 지표·로그 등 손실 허용 |
| At-least-once | 거의 없음 | 가능 | 처리 후 | 대부분의 업무 (+ 멱등성) |
| Exactly-once | 없음 | 없음 | 트랜잭션 커밋 | 결제·정산 (범위 제한적) |

## 영균의 실무 맥락

금융 도메인에서는 **중복 처리 = 중복 승인/중복 입금**이라 치명적이다. 그렇다고
At-most-once로 신청 건을 유실할 수도 없다. 결국 답은 하나 — **At-least-once로 받고
`eventId` 기반 멱등성으로 막는다.** [[outbox-pattern]]에서 배운 "최소 한 번 + 소비자
멱등성" 조합이 왜 표준인지가 여기서 완성된다.

## 관련 페이지

- [[idempotency]] — At-least-once의 중복을 무해화하는 짝
- [[message-queue]] — ACK/재전달의 기본 동작
- [[kafka]] — Exactly-once semantics를 지원하는 범위와 한계
- [[rabbitmq]] — ACK/NACK·Publisher Confirm의 구체적 구현
- [[dead-letter-queue]] — 재시도가 끝난 뒤의 처리
- [[outbox-pattern]] — Producer 쪽 유실을 막는 패턴
- 출처: [[message-queue-note]]
