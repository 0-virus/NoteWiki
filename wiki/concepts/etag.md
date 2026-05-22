---
type: concept
tags: [web, http, cache, spring]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# ETag (Entity Tag)

## 한 줄 정의

**리소스의 "버전 도장".** 서버가 응답할 때 `ETag: "abc123"` 같은 식별자를 같이 보내면, 클라이언트는 다음 요청에 그 도장을 들고 가서 "내 도장이랑 같으면 본문 안 줘도 돼"라고 묻는다.

## 왜 필요한가

같은 리소스를 매번 통째로 다시 보내는 건 낭비. 변경되지 않았다는 걸 **본문 없이 짧은 응답**으로 알릴 수 있으면 트래픽이 줄어든다.

### 얻는 것
1. **성능 향상** — 변경 없으면 본문 재전송 회피.
2. **네트워크 절약** — 큰 응답일수록 절감 효과 큼.
3. **동시성 제어** — "내가 본 그 버전 그대로일 때만 수정해" 같은 조건부 쓰기 (Optimistic Locking).

## 4단계 작동

### 1. 첫 응답에 ETag 발급

```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "abc123"

{ "id": 1, "name": "John Doe" }
```

### 2. 다음 요청에 `If-None-Match`로 ETag 제시

```http
GET /api/members/1 HTTP/1.1
If-None-Match: "abc123"
```

### 3-A. 변경 없음 → 본문 없이 304

```http
HTTP/1.1 304 Not Modified
```

본문이 없으므로 트래픽 거의 0. 클라이언트는 로컬 캐시를 그대로 쓴다.

### 3-B. 변경됨 → 새 ETag + 새 본문

```http
HTTP/1.1 200 OK
ETag: "def456"

{ "id": 1, "name": "John Doe (updated)" }
```

## Spring Boot에서 ETag 켜기

### 방법 1: 전역 Filter — `ShallowEtagHeaderFilter`

응답 본문을 해싱해서 ETag를 자동 생성. "Shallow"인 이유 — 본문이 만들어진 후 후속 처리로 ETag를 붙이는 방식이라, 본문은 어차피 다 만든다 (서버 비용은 절감 X, 네트워크 트래픽만 절감).

### 방법 2: 컨트롤러에서 직접

```java
@GetMapping("/members/{id}")
public ResponseEntity<Member> getMember(@PathVariable Long id) {
    Member member = memberService.findMember(id);
    String etag = String.valueOf(member.hashCode());
    return ResponseEntity.ok().eTag(etag).body(member);
}
```

`hashCode()`로 ETag를 만드는 게 가장 흔한 패턴. [[equals-hashcode]]와 자연스럽게 연결되는 지점.

> ⚠️ Entity의 `hashCode()`가 ID에만 의존하면 ETag가 변하지 않아 캐시가 영원히 유지된다.
> 필드 변경을 반영하려면 hashCode가 "변경 가능한 모든 필드"를 포함해야 한다.

## 어디서 의미가 있나 / 없나

| 시나리오                              | ETag 의미 |
| ------------------------------------- | --------- |
| GET 응답이 큼 + 자주 안 바뀜          | 큼 ✅     |
| GET 응답이 작음                       | 작음      |
| POST/PUT 응답                         | 거의 없음 (어차피 1회성) |
| 자주 변하는 리소스 (예: 실시간 시세)  | 거의 없음 |

ETag는 **GET 캐싱**을 위한 도구. POST/PUT 응답에 붙이면 의미가 없거나 오해를 부른다.

## 영균 학습 트리에서

- [[equals-hashcode]]를 만든 그 hashCode가 ETag 생성에도 쓰인다 → 해시 안정성이 캐시 정합성으로 이어지는 지점.
- 큰 응답이 자주 안 바뀌는 API에 적용하면 효과가 즉시 보인다 — 부트캠프 프로젝트의 "글 상세 조회" 같은 API가 좋은 대상.

## 관련 페이지

- [[equals-hashcode]] — ETag 생성에 hashCode를 활용
- [[restful-api]] — ETag가 빛나는 GET 응답의 무대
- [[content-negotiation]]·[[http-method-override]] — 같은 묶음의 HTTP 부가 기능
- 출처: [[spring-framework-1-note]]
