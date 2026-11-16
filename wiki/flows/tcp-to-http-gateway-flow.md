---
type: flow
tags: [network, integration, tcp, http, gateway]
updated: 2026-09-17
sources: ["https://chatgpt.com/share/6aaba6cf-b6a4-83ee-aac2-421db98f1608"]
---

# TCP 전문 ↔ HTTP/JSON Gateway의 요청·응답 흐름

외부 시스템의 전용 전문 프로토콜과 내부 API를 연결하는 일반적인 흐름이다. 실제 회사의 주소·필드·전문 규격을 나타내지 않는다.

```text
외부 시스템
   │ TCP 연결 A: 전용 전문 바이트
   ▼
Gateway: 누적 → 프레이밍 → 전문 파싱 → DTO 매핑 → JSON 직렬화
   │ 별도 HTTP 연결 B: HTTP 요청·JSON 본문
   ▼
내부 API: HTTP 해석 → JSON 역직렬화 → Controller → Service
   │ HTTP 상태·JSON 응답
   ▼
Gateway: 응답 해석 → 필드 매핑 → 길이·패딩·인코딩 → 응답 전문
   │ TCP 연결 A로 응답 전송(연결 유지 규격인 경우)
   ▼
외부 시스템
```

## 단계별로 “무엇을 완성했는가” 확인하기

| 단계 | 완료 조건 | 흔한 착각 |
| --- | --- | --- |
| TCP 읽기 | 실제 수신 바이트 수를 확보 | 한 번 읽었으니 한 전문이다 |
| 프레이밍 | 규격대로 전문 한 건의 바이트가 모두 있음 | 버퍼 크기가 전문 길이다 |
| 파싱·검증 | 필드를 읽고 길이·형식이 유효함 | 문자열 길이와 바이트 길이가 같다 |
| 매핑·직렬화 | 내부 DTO와 JSON 표현을 생성 | JSON 변환이 TCP/IP 캡슐화다 |
| 내부 호출 | HTTP 응답을 수신·해석 | TCP ACK면 업무도 끝났다 |
| 업무 판정 | HTTP 계약과 업무 결과를 해석 | 연결 성공이나 HTTP 200이면 무조건 성공이다 |
| 응답 전문 생성 | 외부 규격의 길이·문자셋·필드를 충족 | 내부 오류 메시지를 그대로 보내도 된다 |

프레이밍은 [[tcp-message-framing]], 변환과 감싸기의 차이는 [[network-encapsulation]]·[[serialization]], 중간 시스템의 역할은 [[protocol-gateway]] 참고.

## 두 연결 사이에서 생기는 실패

- **외부 전문이 일부만 도착**: 내부 API 호출 전에 누적 길이와 수신 제한 시간을 확인한다.
- **내부 API 응답 지연**: 연결 A가 살아 있어도 연결 B 또는 내부 업무가 실패·지연될 수 있다.
- **내부 처리는 성공했는데 외부 응답 전송 실패**: 결과가 불명확한 외부 시스템이 같은 요청을 다시 보낼 수 있다. 업무 식별과 [[idempotency]]가 필요하다.

각 단계의 실패를 어떤 외부 응답으로 바꿀지는 연동 계약의 영역이다. Gateway가 두 TCP 연결을 잇는다고 양쪽 업무가 하나의 [[transaction]]으로 묶이는 것은 아니다. 로그도 구간·요청 식별자·누적 바이트 수·실패 단계를 구분해야 원인을 찾기 쉽다 → [[network-timeout]].

기존 흐름 연결: [[http-over-tcp-request-flow]] → [[spring-mvc-request-flow]]. 출처: [[tcp-ip-dialogue]].
