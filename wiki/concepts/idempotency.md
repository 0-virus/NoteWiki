---
type: concept
tags: [messaging, distributed-systems, http, backend]
updated: 2026-09-07
sources: ["raw/notes/Outbox_패턴_상세_설명.md", "raw/notes/Message Queue.md"]
---

# 멱등성 (Idempotency)

## 한 줄 정의

**같은 요청(또는 같은 메시지)을 여러 번 처리해도 결과가 한 번 처리한 것과 같은 성질.**
"두 번 눌러도 한 번 누른 것과 같다"는 안전장치.

## 왜 필요한가

네트워크는 응답 유실을 완전히 막을 수 없다. 요청은 성공했는데 응답만 유실되면,
호출자는 실패로 판단하고 재시도한다 — 수신 측은 같은 요청을 두 번 받는다.

```
1. 클라이언트가 결제 요청 전송
2. 서버가 결제 처리 성공
3. 성공 응답이 네트워크에서 유실
4. 클라이언트는 실패로 판단, 재전송
5. 서버는 같은 결제를 다시 처리할 위험
```

"재시도해도 안전한 시스템"을 만들려면 **재시도 자체를 막는 게 아니라, 중복 도착을
무해하게 만드는 것**이 현실적인 답이다.

## 구현 방법 — 고유 ID + 처리 기록

가장 기본적인 패턴은 요청(또는 메시지)마다 **고유 식별자**를 부여하고, 처리한 ID를
기록해 두는 것.

```json
{ "messageId": "msg-1", "eventType": "RESOURCE_ACTIVATED", ... }
```

```sql
BEGIN;
INSERT INTO processed_message (message_id, processed_at) VALUES ('msg-1', NOW());
UPDATE read_model SET status = 'CONFIRMED' WHERE object_id = '100';
COMMIT;
```

핵심은 **"상태 변경"과 "처리 완료 기록"을 같은 트랜잭션으로 묶는 것**이다. 따로
처리하면 그 사이에 중단됐을 때 "처리는 됐는데 기록은 안 된" 틈이 생겨 멱등성이 깨진다.
`message_id`에 DB 고유 제약(UNIQUE)을 걸면 동시 중복 처리까지 방어할 수 있다.

## Outbox 패턴과의 관계

[[outbox-pattern]]은 구조적으로 **최소 한 번 전달(At-Least-Once)**만 보장한다 —
정확히 한 번 전달은 보장하지 않는다. 그래서 Outbox를 실전에서 쓰려면 소비자 쪽에
반드시 멱등성이 있어야 한다.

```
발신 쪽: 최소 한 번 보장 (Outbox)
   +
수신 쪽: 중복을 무해하게 처리 (멱등성)
   =
사실상 "정확히 한 번" 효과
```

## HTTP에서의 멱등성

REST에서는 메서드 자체에 멱등성이 정의돼 있다 — 몇 번을 호출해도 서버 상태가 같아야
한다는 규약이다. `GET`·`PUT`·`DELETE`는 멱등, `POST`는 멱등이 아니다 (호출마다 새
리소스를 만들 수 있음). [[restful-api]]의 메서드 선택 기준이 여기서 나온다.

결제 API처럼 `POST`인데도 멱등성이 필요한 경우, `Idempotency-Key` 헤더를 클라이언트가
생성해 보내고 서버가 같은 키의 재요청을 감지해 원래 응답을 그대로 돌려주는 패턴을 쓴다
— 위 "메시지 ID + 처리 기록"과 같은 원리다.

## 관련 페이지

- [[outbox-pattern]] — 멱등성이 방어하는 대상(최소 한 번 전달의 중복)
- [[message-delivery-semantics]] — At-least-once가 왜 표준인지, 멱등성이 왜 짝인지
- [[message-queue]] · [[kafka]] · [[rabbitmq]] — 중복 전달이 실제로 발생하는 지점
  (ACK 직전 다운, [[kafka-consumer-group|리밸런싱]] 중 재배정)
- [[restful-api]] — HTTP 메서드별 멱등성 규약
- [[transaction]] — "상태 변경 + 처리 기록"을 원자적으로 묶는 근거
- 출처: [[outbox-pattern-note]] · [[message-queue-note]]
