---
type: concept
tags: [serialization, encoding, data, jwt]
updated: 2026-06-07
sources: ["raw/notes/인증.md"]
---

# 직렬화 (Serialization)

## 왜 필요한가

컴퓨터 메모리 안의 객체는 메모리 주소 기반으로 존재하기 때문에 **그대로 전송하거나 저장할 수 없다**.
다른 컴퓨터나 프로세스에서는 그 주소가 의미 없기 때문.

## 직렬화란

```
메모리 객체 (2차원 구조)
{ user_id: 42, role: "admin" }

↓ 직렬화 (flatten)

전송 가능한 문자열 (1차원 = 직렬)
'{"user_id":42,"role":"admin"}'
```

2차원 구조를 1차원(선형)으로 **납작하게 펴는 것** → "직렬"화.

## 역직렬화 (Deserialization)

반대 방향: 문자열을 받아서 다시 객체로 복원.

```
'{"user_id":42,"role":"admin"}'  ← 문자열 도착
→ JSON 파싱
→ { user_id: 42, role: "admin" }  ← 객체 복원
```

## JWT에서의 직렬화

[[jwt]]의 Payload는 두 단계를 거친다:

```
객체
→ JSON 직렬화   → '{"user_id":42,"role":"admin"}'
→ Base64URL 인코딩 → 'eyJ1c2VyX2lkIjo0Mn0'  ← 토큰에 삽입

수신 시:
Base64URL 디코딩 → JSON 역직렬화 → 객체 복원
```

Base64URL: 바이너리/특수문자가 포함된 JSON을 URL-safe 문자열로 만들기 위한 인코딩.
(일반 Base64에서 `+`→`-`, `/`→`_` 치환)

## 직렬화 형식 비교

| 형식 | 특징 | 사용처 |
|------|------|--------|
| JSON | 사람이 읽기 쉬운 텍스트 | API 통신, JWT Payload |
| XML | 태그 기반, 무거움 | 레거시 시스템, SOAP |
| Base64 | 바이너리를 ASCII로 인코딩 | 이진 데이터 HTTP 전송 |
| Protobuf | 이진 형식, 빠르고 작음 | gRPC, 고성능 시스템 |

## 관련 페이지

[[jwt]] — 직렬화가 실제로 사용되는 맥락 (Payload 인코딩)
