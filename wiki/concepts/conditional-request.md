---
type: concept
tags: [web, http, cache, validation]
updated: 2026-07-03
sources: ["raw/notes/🌐 웹 브라우저의 Cache 전략 & 헤더 다루기.md"]
---

# 조건부 요청 & 캐시 검증 (Conditional Request)

## 한 줄 정의

**만료된 캐시를 버리기 전에 "이거 그대로야?"를 서버에 가볍게 물어보는 요청.** 안 바뀌었으면 본문 없이 `304 Not Modified`만 받아 **기존 캐시를 재사용**한다.

## 왜 필요한가

[[cache-control|max-age]]가 만료됐다고 무조건 전체 리소스(1.1MB)를 다시 받는 건 낭비다. **내용이 안 바뀌었다면** 헤더만 주고받아(0.1MB) 캐시를 계속 쓰는 게 이득. 관건은 "클라이언트 캐시 == 서버 최신본"임을 **어떻게 싸게 확인하느냐**다. HTTP는 검증 헤더로 이를 푼다.

## 두 가지 검증 방식

| 서버가 주는 검증자 (응답) | 클라이언트가 되묻는 헤더 (요청) | 비교 대상 |
| --- | --- | --- |
| `Last-Modified` | `If-Modified-Since` | 최종 수정 **시각** |
| [[etag]] `ETag: "abc"` | `If-None-Match` | 리소스 **버전 해시** |

두 경우 모두: **같으면 `304`(캐시 재사용), 다르면 `200`+새 본문**.

### 1. 문서 수정 시간 방식 — `Last-Modified` / `If-Modified-Since`

가장 단순. 서버가 첫 응답에 `Last-Modified: Tue, 15 Mar 2022 …`를 주면 클라가 캐시에 함께 저장하고, 만료 후 재요청 시 `If-Modified-Since`에 그 시각을 실어 보낸다. 서버가 자기 파일 수정 시각과 비교해 같으면 `304`.

**한계 3가지:**
1. 초 미만(0.x초) 단위 변경을 못 잡는다.
2. `A→B→A` 롤백처럼 **내용은 같은데 시각만 바뀐** 경우 불필요하게 다시 받는다.
3. 주석·공백처럼 "의미 없는 변경"을 캐시 유지로 처리하고 싶어도 못 한다 (서버가 캐시 로직을 세밀히 못 만짐).

### 2. 버전 해시 방식 — [[etag]] / `If-None-Match`

리소스의 **고유 해시/버전값**을 검증자로 쓴다. `If-None-Match`에 캐시된 ETag를 실어 보내고, 서버 ETag와 같으면 `304`.

**Last-Modified의 한계를 극복:** 검증 기준을 "시각"이 아니라 **서버가 관리하는 임의의 값**으로 두므로, 배포 주기에 맞춰 ETag를 일괄 갱신하거나 "내용 같으면 ETag 유지" 같은 세밀한 제어가 가능하다. 클라이언트는 이 값을 되돌려주기만 하면 되고 내부 로직을 몰라도 된다.

## 반대 방향 헤더 (쓰기 동시성 제어)

`If-Unmodified-Since`·`If-Match`는 위와 **반대** 역할: "내가 본 그 버전 그대로일 때만 수정 진행"에 쓰이며, 조건 불충족 시 `412 Precondition Failed`. → [[etag]]의 낙관적 락 활용, [[optimistic-pessimistic-lock]]과 연결되는 지점.

## 전체 흐름

만료 후 검증 흐름의 그림은 [[browser-cache-flow]]에서 단계별로 본다.

## 관련 페이지

- [[http-cache]] — 이 검증이 속한 캐시 3단계의 2단계
- [[etag]] — 정밀 검증 수단 (버전 해시)
- [[cache-control]] — `no-cache`가 이 검증을 강제
- [[http-status-codes]] — `304`·`412`
- [[optimistic-pessimistic-lock]] — `If-Match`의 낙관적 락 응용
- 출처: [[browser-cache-article]]
