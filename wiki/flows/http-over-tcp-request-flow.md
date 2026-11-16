---
type: flow
tags: [network, http, tcp, servlet, spring]
updated: 2026-09-17
sources: ["https://chatgpt.com/share/6aaba6cf-b6a4-83ee-aac2-421db98f1608"]
---

# HTTP 요청이 TCP/IP를 거쳐 Controller에 도착하기까지

[[spring-mvc-request-flow]] 앞단의 네트워크 구간이다. **HTTP/1.1 또는 HTTP/2의 새 연결**을 기준으로 설명한다. 캐시·연결 재사용이 있으면 일부 준비 과정은 생략되며, HTTP/3는 [[tcp-ip]]의 QUIC/UDP 경로를 사용한다.

## 요청 흐름

1. **이름 확인**: URL의 호스트 이름을 DNS·로컬 캐시 등으로 IP 주소에 대응시킨다.
2. **전달 경로 확인**: OS가 라우팅 테이블로 다음 홉과 인터페이스를 정한다. 필요한 경우 IPv4 ARP로 로컬 다음 홉의 MAC을 얻는다 → [[ip-routing]].
3. **TCP 연결**: 클라이언트의 임시 포트와 서버 리스닝 포트 사이에 연결을 만든다 → [[socket]]·[[tcp]]. 이 핸드셰이크 패킷도 IP·링크 계층을 거친다.
4. **보안 준비**: HTTPS면 TLS 핸드셰이크로 인증서 검증과 암호 통신을 준비한다.
5. **HTTP 구성**: HTTP 클라이언트가 메서드·경로·헤더·본문을 해당 HTTP 버전 형식으로 만든다. 객체를 JSON으로 보내면 [[serialization]]도 이 위에서 수행한다.
6. **전송**: 소켓에 전달된 바이트를 OS가 TCP로 분할·전송하고, IP와 링크 계층으로 내려보낸다 → [[network-encapsulation]]. HTTPS에서는 TLS 레코드가 TCP에 실린다.
7. **수신**: 상대 OS가 IP·TCP를 처리하고 순서 있는 바이트를 소켓으로 제공한다. TLS 종단에서 복호화한 뒤 HTTP를 해석한다.
8. **서버 처리**: [[servlet-container]]가 HTTP 요청을 Servlet 요청 객체로 다루고, [[dispatcher-servlet]]을 거쳐 Controller·Service·Repository가 실행된다.
9. **응답**: 반환 객체가 응답 본문으로 직렬화되고 HTTP·TLS·TCP/IP 경로를 거슬러 클라이언트에 전달된다. 연결은 다음 요청에 재사용할 수 있다.

각 요청마다 새 TCP 연결을 만드는 것은 아니다. TLS가 [[reverse-proxy]]에서 끝나면 프록시와 애플리케이션 서버 사이에는 별도 연결과 별도 보안 설정이 적용된다.

## 코드에서 감춰진 책임

```text
DTO·Controller·HTTP 클라이언트: 업무 의미와 HTTP 사용
웹 서버·클라이언트 라이브러리: HTTP 형식·소켓 사용·연결 관리
OS TCP/IP 스택: 헤더·ACK·재전송·순서 복원·패킷 전달
```

따라서 HTTP 호출 코드에 TCP 헤더가 안 보여도 TCP가 사라진 것이 아니다. [[connection-pool]]은 이 아래 연결 비용을 재사용하는 발상과 연결된다. 실패 단계는 [[network-timeout]]으로 추적한다.

출처: [[tcp-ip-dialogue]].
