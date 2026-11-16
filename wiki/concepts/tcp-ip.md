---
type: concept
tags: [network, tcp-ip, osi, http]
updated: 2026-09-17
sources: ["https://chatgpt.com/share/6aaba6cf-b6a4-83ee-aac2-421db98f1608", "https://www.rfc-editor.org/rfc/rfc9114.html"]
---

# TCP/IP — 통신을 계층으로 나누는 이유

TCP/IP는 단일 프로토콜이 아니라 인터넷 통신의 프로토콜 집합이다. HTTP 개발자가 재전송·라우팅·전기 신호까지 구현하지 않도록 각 계층이 다른 문제를 맡는다.

| TCP/IP 계층 | 해결하는 문제 | 대표 기술 | OSI 대응 |
| --- | --- | --- | --- |
| 애플리케이션 | 데이터의 형식과 의미 | HTTP, DNS, 전용 전문 프로토콜 | L7·L6·L5 |
| 전송 | 통신 끝점 구분과 전송 방식 | TCP, UDP, 포트 | L4 |
| 인터넷 | 목적지 주소와 패킷 전달 | IP, ICMP | L3 |
| 네트워크 접근 | 같은 링크의 다음 장비로 전달 | Ethernet, Wi-Fi | L2·L1 |

OSI와의 대응은 이해를 위한 모델이다. ARP는 IPv4 주소와 링크 계층 주소를 연결한다 → [[ip-routing]].

## HTTP와 TCP는 어떻게 연결되나

```text
HTTP/1.1 또는 HTTP/2 → (HTTPS라면 TLS) → TCP → IP → 링크
HTTP/3 → QUIC(TLS 보안 통합) → UDP → IP → 링크
```

HTTP는 요청·응답을 해석하는 규칙이고 [[tcp]]는 바이트 전달을 맡는다. 실무의 “TCP 연동 vs HTTP 연동”은 보통 **TCP 위 전용 전문 프로토콜 vs HTTP**를 비교하는 말이다. HTTP/3의 전송 구조는 [RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html) 참고.

| 비교 | TCP | UDP 자체 |
| --- | --- | --- |
| 전달 단위 | 바이트 스트림, 메시지 경계 없음 | 데이터그램 경계 유지 |
| 연결 수립 | 핸드셰이크로 상태 공유 | TCP식 연결 수립 없음 |
| 순서·손실 대응 | 재정렬·재전송 | 기본 제공하지 않음 |
| 흐름·혼잡 제어 | 제공 | 기본 제공하지 않음 |

UDP 위에서 신뢰성과 혼잡 제어를 구현할 수 있다. 따라서 “UDP면 항상 빠르다”거나 “UDP 위 통신은 모두 비신뢰적이다”로 단정하지 않는다.

## 주소와 이름을 구분하기

- **도메인 이름**: 사람이 서비스를 찾는 이름. DNS의 A/AAAA 레코드 등으로 IP 주소를 조회한다 → [[domain]].
- **IP**: 호스트·인터페이스의 논리적 주소. 하나의 호스트가 여러 IP를 가질 수 있다.
- **포트**: TCP/UDP의 통신 끝점 구분자. 하나의 프로세스가 여러 포트를 쓰거나 한 서버 포트에 여러 연결이 들어올 수 있다 → [[socket]].
- **MAC**: Ethernet 같은 로컬 링크에서 프레임 전달에 사용하는 주소. 원격 서버로 보낼 때 첫 프레임의 목적지는 보통 게이트웨이의 MAC이다.

DNS 조회는 캐시가 있으면 거기서 끝날 수 있다. 캐시가 없다면 재귀 리졸버가 필요에 따라 루트·TLD·권한 서버를 조회한다. 매 요청마다 브라우저가 모든 DNS 서버를 직접 순회하는 것은 아니다.

## 학습 경로

[[socket]] → [[tcp]] → [[tcp-message-framing]] → [[network-encapsulation]] → [[ip-routing]] → [[http-over-tcp-request-flow]] 순서로 읽는다. 실무 연동은 [[tcp-to-http-gateway-flow]], 장애 해석은 [[network-timeout]]으로 연결한다.

[[load-balancer]]의 L4는 주로 IP·포트·전송 계층 정보를, L7은 HTTP 경로·헤더 같은 애플리케이션 정보를 기준으로 분배한다.

출처: [[tcp-ip-dialogue]].
