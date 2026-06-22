---
type: concept
tags: [docker, image, layer, registry]
updated: 2026-06-15
sources: [raw/notes/docker.md]
---

# Docker Image

> 컨테이너 형태로 소프트웨어를 배포하기 위해 필요한 모든 요소를 **실행 가능한 포맷으로 컴파일·빌드한 패키지**

특정 시점의 도커 컨테이너 상태를 담은 **스냅샷**과 같다. 이미지 자체는 불변(immutable).

## 왜 이미지가 필요한가?

컨테이너는 이미지 없이는 시작할 수 없다. 이미지는 "무엇을 실행할지"를 정의하고, 컨테이너는 "그것을 실행한 상태"다. 이미지를 공유하면 어느 환경에서든 동일한 컨테이너를 실행할 수 있다.

## 이미지 구조

```
Image Index (Digest: sha256:abc...)
   └── Image Manifest × N  (플랫폼별: linux/amd64, linux/arm64 등)
           ├── Config (설정 파일)
           └── Layers × N  (각 레이어마다 고유 digest)
```

| 구성 요소 | 설명 |
|-----------|------|
| **이미지 인덱스** | 매니페스트 리스트. `docker pull` 시 나오는 digest가 이것 |
| **이미지 매니페스트** | 설정 파일 + 레이어 목록. 플랫폼(OS/아키텍처)별로 다름 |
| **레이어** | 실제 파일시스템 변경 단위. 레이어마다 digest 값을 가짐 |

레이어를 쌓는 구조이므로 이미지를 빌드할 때 변경된 레이어만 다시 빌드한다 → 빌드 캐시의 근거.

## 기본 명령어

```bash
# 이미지 다운로드 (태그 없으면 latest)
docker image pull nginx
docker image pull nginx:1.25
docker image pull nginx@sha256:<digest>

# 로컬 이미지 목록 확인
docker image ls
```

## 연결

- [[docker]] — 이미지를 사용하는 전체 도커 구조
- [[docker-container]] — 이미지를 실행하면 컨테이너가 됨
