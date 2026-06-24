---
type: source
tags: [docker, container, virtualization, devops]
updated: 2026-06-15
sources: [raw/notes/docker.md]
---

# 소스 요약: Docker 입문 노트

**원본**: `raw/notes/docker.md`  
**작성일**: 2026-06-15  
**형태**: 직접 작성 학습 노트 (독학)

## 맥락

배포를 Docker로 해보고 싶어서 독학 시작. 나중에 ZeroVerse Spring 프로젝트를 컨테이너화하는 것이 목표. Kubernetes도 함께 알아두고 싶음.  
이 위키는 **나중에 꺼내쓰는 레퍼런스** 역할 — 도커/쿠버네티스 동작 원리 + 기본 명령어.

## 핵심 주장 (Key Claims)

- Docker = 컨테이너 수준의 가상화로 소프트웨어를 배포하는 PaaS
- 컨테이너 가상화는 호스트 OS를 공유하므로 VM보다 가볍다
- Docker Image = 특정 시점의 스냅샷(패키지); Container = Image의 실행 인스턴스
- dockerd → containerd → runc 계층으로 컨테이너 실행 책임이 분리된다

## 다루는 개념

- [[container-virtualization]] — 호스트/하이퍼바이저/컨테이너 가상화 3종류
- [[docker]] — 도커 정의, 구성 요소, 클라이언트-호스트-레지스트리 구조
- [[docker-image]] — 이미지 개념, 구조(인덱스·매니페스트·레이어), 명령어
- [[docker-container]] — 컨테이너 개념, 실행 흐름, 명령어

## 언급된 엔티티

- **Docker Hub** — 공개 레지스트리 (library/hello-world 등)
- **containerd** — 고수준 컨테이너 런타임 (CNCF 프로젝트)
- **runc** — OCI 표준 저수준 컨테이너 런타임
