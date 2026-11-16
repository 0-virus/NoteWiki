---
type: concept
tags: [network, integration, gateway, adapter, protocol]
updated: 2026-09-17
sources: ["https://chatgpt.com/share/6aaba6cf-b6a4-83ee-aac2-421db98f1608"]
---

# Protocol Gateway — 서로 다른 통신 규칙을 잇기

한쪽의 메시지 형식과 통신 규칙을 이해한 뒤, 다른 쪽이 이해하는 형식으로 새 요청·응답을 만드는 중간 시스템이다. 예를 들어 **TCP 위 고정 길이 전문 ↔ HTTP/JSON**을 연결한다.

## 왜 프록시만으로 설명하기 부족한가

[[proxy]]는 통신을 대신 받거나 중계하는 넓은 역할이다. 그 중 전문을 해석하고 필드·응답 의미를 변환한다면 Gateway/Adapter의 역할까지 수행한다. 이름보다 실제로 어느 책임을 맡는지 보는 것이 중요하다.

[[reverse-proxy]]의 일반적인 HTTP 중계와 비교하면, 이 구조에는 [[tcp-message-framing]]·전문 파싱·DTO 매핑·[[serialization]]·응답 역변환이 추가된다. 네트워크 [[network-encapsulation]]은 이 결과를 전송하는 아래 계층의 과정이다.

## 두 구간은 별개의 연결

```text
외부 시스템 ← TCP 연결 A → Gateway ← TCP 연결 B(HTTP/1.1·2) → 내부 API
```

Gateway는 A의 바이트를 받아 애플리케이션 데이터를 복원한 뒤 B에 새 HTTP 요청을 보낸다. A의 TCP 헤더를 B로 그대로 전달하는 것이 아니다. 각 연결은 별도 포트 조합·시퀀스·버퍼·수명을 가진다 → [[socket]].

두 연결이 업무상 이어져도 연결 수가 반드시 1:1인 것은 아니다. 내부 HTTP 연결을 풀에서 재사용할 수 있고, 외부 요청과 내부 결과의 대응 관계는 Gateway가 관리해야 한다.

## 책임 범위

- 완전한 전문 확보와 필드 검증
- 외부 필드와 내부 DTO의 매핑, 문자 인코딩·길이·패딩 처리
- HTTP 호출과 상태·업무 결과 해석
- 내부 응답을 외부 규격으로 변환해 전송
- 구간별 [[network-timeout]]과 재시도·[[idempotency]] 정책의 구분

이 일반화된 흐름만으로 실제 구현의 전문 길이·문자셋·오류 코드·재시도 가능 여부는 알 수 없다. 세부 계약은 각 연동 규격에서 확인한다. 전체 요청·응답 흐름: [[tcp-to-http-gateway-flow]].

출처: [[tcp-ip-dialogue]].
