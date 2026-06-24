---
type: concept
tags: [docker, container, devops, deployment]
updated: 2026-06-15
sources: [raw/notes/docker.md]
---

# Docker

> Docker = **컨테이너 수준의 가상화**로 소프트웨어를 배포하는 PaaS(Platform as a Service)

개발 환경에서 작동하던 앱이 운영 서버에서 안 되는 "그 컴퓨터에선 되는데?" 문제를 해결한다. 코드·라이브러리·환경설정을 하나의 컨테이너 이미지로 묶어 어디서든 동일하게 실행한다.

## 3요소: 클라이언트 · 호스트 · 레지스트리

```
[개발자]
   │  docker CLI 명령
   ▼
[Docker Client]  ──API 요청──▶  [Docker Host (dockerd)]
                                       │
                               컨테이너 실행 관리
                                       │
                               ◀── 이미지 pull ──▶  [Docker Registry]
                                                      (Docker Hub 등)
```

| 요소 | 역할 |
|------|------|
| **Docker Client (CLI)** | 사용자가 명령을 내리는 터미널 도구 |
| **Docker Host** | Docker가 설치된 서버/가상머신. `dockerd`가 실행 중 |
| **Docker Registry** | 이미지를 저장·배포. Docker Hub가 대표 공개 레지스트리 |

## 내부 구성 요소 (실행 계층)

명령 하나가 실제로 컨테이너가 되기까지의 책임 분리 구조:

```
docker CLI
   │ (API)
   ▼
dockerd  ← Docker Daemon: API 수신 + 도커 객체 관리
   │
   ▼
containerd  ← 고수준 런타임: 컨테이너 생명주기 전체 관리
   │
   ▼
containerd-shim  ← containerd와 runc 사이 중간 프로세스
   │
   ▼
runc  ← 저수준 런타임: 실제 컨테이너 프로세스 생성
```

- **dockerd**: 백그라운드 데몬. docker API 요청을 받아 처리
- **containerd**: CNCF 프로젝트. pull·start·stop·delete 등 생명주기 전체
- **runc**: OCI 표준 구현. `fork()`로 격리된 프로세스를 실제로 띄움
- **containerd-shim**: containerd가 죽어도 컨테이너가 살아있게 하는 중간 레이어

### 왜 이렇게 계층을 나눴나?

Docker 초기엔 dockerd 하나가 모든 걸 했다. 컨테이너 실행 책임을 표준화(OCI)하고 다른 도구(Kubernetes 등)에서도 재사용할 수 있도록 containerd·runc로 분리됐다.

## 연결

- [[container-virtualization]] — 왜 컨테이너가 VM보다 가벼운지 (네임스페이스·3종 비교)
- [[docker-image]] — 이미지 개념·구조·명령어
- [[docker-container]] — 컨테이너 개념·실행 흐름·명령어

TODO: 쿠버네티스(Kubernetes) — 여러 도커 호스트를 오케스트레이션하는 도구. 도커 다음 단계.
