---
type: concept
tags: [jwt, security, authentication, token]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# JWT Claims

## 한 줄 정의
**JWT Claims는 JWT Payload 안에 들어 있는 key-value 정보 묶음이다.**

JWT는 보통 `Header.Payload.Signature` 세 부분으로 나뉜다. 이 중 Payload에 담긴 각각의 정보가 claim이고, 그 묶음이 claims다. [[jwt]]의 본문 정보 영역이라고 보면 된다.

## 예시
```json
{
  "sub": "1",
  "email": "test@example.com",
  "role": "USER",
  "iat": 1710000000,
  "exp": 1710003600
}
```

| Claim | 의미 | 비고 |
|---|---|---|
| `sub` | subject, 토큰의 주인 | ZeroVerse에서는 userId 문자열 |
| `email` | 사용자 이메일 | 커스텀 claim |
| `role` | 사용자 권한 | 커스텀 claim |
| `iat` | issued at, 발급 시간 | 표준 claim |
| `exp` | expiration, 만료 시간 | 표준 claim |

## 왜 중요한가
JWT 인증 필터는 DB 세션을 조회하는 대신 토큰의 Claims를 읽어 현재 요청의 사용자를 복원한다.

```text
Bearer Token
-> 서명 검증
-> Claims 읽기
-> userId, role 추출
-> [[security-context]]에 Authentication 저장
```

Claims는 암호화된 비밀 저장소가 아니다. Payload는 Base64URL로 인코딩되어 있을 뿐이라 누구나 디코딩해 볼 수 있다. 따라서 비밀번호, 주민번호, Refresh Token 원문 같은 민감 정보는 Claims에 넣지 않는다.

## 관련 페이지
- [[jwt]] - Header/Payload/Signature와 서명 검증 원리
- [[spring-security-jwt-auth-flow]] - Claims가 인증 요청에서 쓰이는 위치
- [[security-context]] - Claims에서 만든 인증 객체가 저장되는 곳
- [[serialization]] - 객체를 전송 가능한 문자열로 바꾸는 개념