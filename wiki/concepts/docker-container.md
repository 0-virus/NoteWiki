---
type: concept
tags: [docker, container, runtime]
updated: 2026-06-15
sources: [raw/notes/docker.md]
---

# Docker Container

> [[docker-image]]를 실행한 **인스턴스**. 이미지가 클래스라면 컨테이너는 객체(인스턴스)다.

## 컨테이너의 특성

- **자체 파일시스템**: 각 컨테이너는 독립적인 파일시스템을 가짐
- **독립 실행**: 컨테이너끼리 서로를 격리 (네임스페이스 덕분)
- **OS 공유**: 가상 머신과 달리 운영체제를 전부 포함하지 않고 **도커 엔진과 OS 커널을 공유** → 가벼운 이유

## `docker run hello-world` 실행 흐름

```
1. docker CLI → dockerd에 "hello-world 실행" API 요청
2. dockerd → 로컬에 hello-world:latest 이미지 검색
3. 없으면 → Docker Hub에서 library/hello-world pull
4. 이미지를 컨테이너로 실행
5. 컨테이너 내부 프로세스 실행 후 종료
6. 컨테이너 상태: Exited
```

- `digest`: 다운로드한 이미지의 해시 식별값 (이미지 인덱스의 digest)

## 컨테이너 생명주기

컨테이너 내부 프로세스가 **모두 종료되면 컨테이너도 종료(Exited)** 된다.  
종료된 컨테이너는 삭제되지 않고 디스크에 남아있다.

```
Created → Running → Exited → (Removed)
```

## 기본 명령어

```bash
# 이미지로 컨테이너 실행
docker container run nginx

# 실행 중인 컨테이너 목록
docker container ls

# 종료된 컨테이너까지 모두 확인
docker container ls -a
```

> 종료된 컨테이너는 `docker container ls`에 안 잡힌다 → `-a` 플래그 필요

## 연결

- [[docker-image]] — 컨테이너의 원본
- [[docker]] — 전체 도커 구조
- [[container-virtualization]] — 컨테이너가 VM보다 가벼운 이유 (네임스페이스)
