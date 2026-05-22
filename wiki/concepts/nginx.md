---
type: concept
tags: [system-design, nginx, reverse-proxy, load-balancing, tool]
updated: 2026-05-21
sources: [
  "raw/youtube/Proxy(프록시)란 Forward vs Reverse Proxy 차이점은 무엇일까 시스템 디자인.md",
  "raw/youtube/Load Balancing 로드 밸런싱이 뭔가요 쉽게 이해하는 로드 밸런서의 기초 개념과 역할 시스템 디자인.md"
]
---

# Nginx

## 한 줄 정의

오픈소스 **웹 서버 / 리버스 프록시 / 로드 밸런서**.
한 바이너리가 [[reverse-proxy]] · [[load-balancer]] · 정적 파일 서버 · TLS 종단 역할을 동시에 한다.

## 왜 이렇게 자주 등장하는가

- **이벤트 기반 비동기 아키텍처** — Apache의 thread-per-request 모델과 달리
  단일 워커가 수천 커넥션을 처리. 메모리 사용이 매우 적다.
- **설정이 명시적**이고 문서가 두텁다 — 처음 만지는 사람도 따라 쓸 수 있다.
- **한 도구로 여러 역할**을 묶을 수 있어, 작은 시스템에서는 Nginx 하나로 인프라 절반이 끝난다.

부트캠프 발표나 면접에서 **"앞단에 Nginx 둡니다"** 라는 말이 가장 흔한 첫 답인 이유.

## 핵심 설정 단위

```nginx
http {
    upstream backend {       # 백엔드 서버 풀 정의 (LB 대상)
        server 127.0.0.1:8080;
        server 127.0.0.1:8081;
    }

    server {                 # 가상 호스트 (포트·도메인 단위)
        listen 80;
        server_name example.com;

        location / {         # URL 패턴별 처리 규칙
            proxy_pass http://backend;   # ← upstream으로 전달
        }
    }
}
```

- `upstream` — 어디로 보낼 백엔드 서버 풀
- `server` — 어떤 포트·도메인으로 요청을 받을지
- `location` — 그 안에서 URL 패턴별 분기
- `proxy_pass` — 실제로 백엔드로 전달하는 지시어

## 실습 예시 1 — Tomcat 앞에 [[reverse-proxy|리버스 프록시]] 한 대

가장 단순한 시작. **외부 80 → Nginx → Tomcat 8080.**

```nginx
# /etc/nginx/conf.d/myapp.conf
server {
    listen 80;
    server_name myapp.local;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- `proxy_set_header X-Real-IP` — Tomcat 쪽에서 진짜 클라이언트 IP를 알 수 있게.
  안 주면 Tomcat 로그에는 모두 Nginx의 IP(127.0.0.1)만 찍힌다.
- 이 한 파일이 [[reverse-proxy]]의 정의 그 자체다.

## 실습 예시 2 — Tomcat 두 대 + [[load-balancer]]

`upstream` 블록에 서버를 늘리면 자동으로 LB가 된다.

```nginx
upstream tomcat_cluster {
    # 기본은 Round Robin
    server 127.0.0.1:8080;
    server 127.0.0.1:8081;
}

server {
    listen 80;

    location / {
        proxy_pass http://tomcat_cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### [[load-balancing-algorithm|알고리즘 바꾸기]]

```nginx
upstream tomcat_cluster {
    # least_conn;          # Least Connection — 응답 시간 들쭉날쭉할 때
    # ip_hash;             # IP Hash — 세션 어피니티 필요할 때

    server 127.0.0.1:8080 weight=2;   # Weighted RR — 더 좋은 서버
    server 127.0.0.1:8081 weight=1;
    server 127.0.0.1:8082 backup;     # 다른 서버 죽었을 때만 활성화
}
```

키워드 한 줄로 [[load-balancing-algorithm]]의 4가지 알고리즘을 다 전환할 수 있다.

### 헬스체크 / 장애 대응

```nginx
upstream tomcat_cluster {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
}
```

- `max_fails=3 fail_timeout=30s`: 30초 동안 3번 실패하면 그 서버를 30초간 분배 대상에서 제외.
- 이게 [[high-availability]]를 만들어주는 가장 단순한 장치다.

## 실습 예시 3 — 정적 파일은 Nginx가 직접, 동적은 Tomcat으로

```nginx
server {
    listen 80;
    root /var/www/myapp;

    # 정적 자원: Nginx가 즉시 응답
    location ~* \.(css|js|png|jpg|svg|ico)$ {
        expires 30d;
        access_log off;
    }

    # 그 외(동적): Tomcat으로
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }
}
```

정적 처리는 Nginx가 훨씬 빠르고, Tomcat은 동적 처리에만 집중 → 전체 처리량↑.
[[reverse-proxy]]의 캐싱·정적 서빙 효용이 이 한 파일에 나온다.

## 운영 명령어 (Ubuntu 기준)

```bash
sudo systemctl start nginx       # 시작
sudo systemctl reload nginx      # 무중단 재적용 (설정 바꿨을 때)
sudo nginx -t                    # 설정 문법 검사 (reload 전에 항상)
sudo tail -f /var/log/nginx/access.log    # 요청 로그
sudo tail -f /var/log/nginx/error.log     # 에러 로그
```

> ⚠️ **`reload`와 `restart`의 차이**: `reload`는 새 설정을 들고 워커를 점진적으로 교체해서
> 무중단. `restart`는 전체를 죽였다 살리므로 잠깐 다운. 거의 항상 `reload`.

## 자주 한 실수 (예방 체크리스트)

- `proxy_set_header Host $host` 를 빼먹어서 백엔드 앱이 호스트를 잘못 인식
- `X-Forwarded-For` 안 줘서 IP 로깅이 다 Nginx IP로 찍힘
- 설정 바꾸고 `nginx -t` 안 돌리고 reload → 문법 오류로 다운
- `upstream` 안의 서버가 다 죽으면 502 Bad Gateway가 뜸 — 백엔드 살았는지부터 확인
- HTTPS만 받으려고 80을 막았는데 80→443 리다이렉트를 안 걸어서 사용자가 못 들어옴

## 영균의 학습 맥락

부트캠프 다른 팀이 인프라 그림에 Nginx를 그렸을 때 영균이 막혔던 지점이 바로 여기였다.
**위 실습 예시 1·2** 까지만 손으로 따라 해봐도, 그 그림이 정확히 어떤 의미였는지 체감된다.
[[servlet-container|Tomcat]] 위에 한 층을 더 올려보는 일 — 학습 트리의 다음 가지.

## 관련 페이지

- [[proxy]] · [[reverse-proxy]] · [[load-balancer]]
- [[load-balancing-algorithm]] — `upstream` 블록에서 키워드로 전환
- [[high-availability]] — 헬스체크·다중 서버 구성
- [[scaling-a-web-app]] — Nginx가 등장하는 흐름의 전체 그림
- 출처: [[proxy-forward-reverse-video]] · [[load-balancing-video]]
