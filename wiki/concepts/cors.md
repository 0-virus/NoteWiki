---
type: concept
tags: [web, browser, security, cors, http, spring]
updated: 2026-07-03
sources: ["raw/notes/🌐 악명 높은 CORS 개념 & 해결법 - 정리 끝판왕 👏.md"]
---

# CORS (Cross-Origin Resource Sharing)

## 한 줄 정의

**교차 출처 리소스 공유.** [[same-origin-policy]]가 막아둔 "다른 출처 요청"을 **조건부로 허용**하는 정책. 욕먹는 그 빨간 에러는 사실 SOP 위반을 **뚫는 해결책**이다.

## 왜 존재하는가

SOP만 있으면 다른 출처는 전부 차단이다. 그런데 실무에선 남의 회사 API를 쓰거나, 프론트(`:3000`)와 백엔드(`:8080`)를 분리 운영하는 일이 흔하다. 그래서 **"서버가 허락한 출처면 통과"** 시키는 예외 규칙이 필요했다 — 그게 CORS다.

> 핵심: **SOP를 위반해도, CORS 규칙을 따르면 다른 출처라도 허용된다.**

## 기본 동작 — 헤더 한 쌍의 악수

1. **클라이언트**: 요청 헤더에 `Origin: http://localhost:3000` 을 담아 보낸다. (브라우저가 자동으로, 위조 불가)
2. **서버**: 응답 헤더에 `Access-Control-Allow-Origin: http://localhost:3000` 을 담아 "이 출처는 허용" 이라 답한다.
3. **브라우저**: 내 `Origin` == 서버의 `Access-Control-Allow-Origin` 이면 응답을 넘겨주고, 아니면 **버린다**(= CORS 에러).

즉 **해결의 열쇠는 서버**가 쥐고 있다. `Access-Control-Allow-Origin` 헤더를 안 줘서 나는 에러다 → **백엔드가 고칠 부분.**

## 3가지 작동 시나리오

같은 CORS라도 요청 성격에 따라 흐름이 셋으로 갈린다.

### 1. 단순 요청 (Simple Request)

[[preflight-request|예비 요청]]을 **생략**하고 바로 본 요청을 보낸다. 단, 아래 3조건을 **모두** 만족할 때만.

1. 메서드가 `GET`·`HEAD`·`POST` 중 하나
2. 수동 지정 헤더가 안전 목록(`Accept`·`Content-Language` 등)에 한정
3. `Content-Type`이 `application/x-www-form-urlencoded`·`multipart/form-data`·`text/plain` 중 하나

> 대부분의 API는 `application/json`으로 통신 → 3번 위반 → **거의 다 예비 요청으로 동작**한다. 단순 요청은 실전에서 드물다.

### 2. 예비 요청 (Preflight Request)

본 요청 전에 `OPTIONS` 메서드로 "이 요청 보내도 돼?"를 먼저 묻는다. → 별도 페이지 [[preflight-request]] 참고. **API 요청의 기본 모드.**

### 3. 인증된 요청 (Credentialed Request)

[[cookie]]·`Authorization` 토큰 같은 **자격 인증 정보**를 실어 보내는 요청. 규칙이 더 빡빡하다.

- **클라이언트**: 명시적으로 인증정보 전송을 켜야 한다. (기본은 안 보냄)
  ```js
  fetch(url, { credentials: "include" })   // fetch
  axios.post(url, data, { withCredentials: true })  // axios
  ```
  `credentials` 값: `same-origin`(기본, 동일 출처만) · `include`(모든 요청) · `omit`(안 보냄)
- **서버**: 두 조건을 반드시 지켜야 한다.
  1. `Access-Control-Allow-Credentials: true`
  2. `Access-Control-Allow-Origin` 에 **와일드카드(`*`) 금지** → 정확한 출처 명시 필수

> 왜 `*` 금지? 인증정보는 민감하니 "누구나(`*`)"에게 열어주면 위험하다. 반드시 콕 집은 출처여야 한다. [[jwt]]·[[refresh-token]]을 쿠키로 주고받는다면 이 시나리오다.

## CORS 관련 HTTP 헤더 정리

| 헤더 | 방향 | 의미 |
| --- | --- | --- |
| `Origin` | 요청 | 내 출처 (브라우저가 자동) |
| `Access-Control-Allow-Origin` | 응답 | 허용 출처 (`*`=전체) |
| `Access-Control-Allow-Methods` | 응답 | 허용 메서드 |
| `Access-Control-Allow-Headers` | 응답 | 허용 요청 헤더 |
| `Access-Control-Allow-Credentials` | 응답 | 쿠키 등 인증정보 허용 여부 |
| `Access-Control-Max-Age` | 응답 | [[preflight-request|예비 요청]] 캐시 시간(초) |
| `Access-Control-Expose-Headers` | 응답 | JS에 노출 허용할 응답 헤더 |

## 해결법 총정리

| 방법 | 성격 |
| --- | --- |
| 크롬 확장(Allow CORS) | 로컬 테스트용 임시. 실전 X |
| [[proxy]] 서버 경유 | 서버-to-서버엔 SOP 없음을 이용. 직접 구축 권장 |
| **서버에서 `Access-Control-Allow-Origin` 세팅** | **정석 해결책** |

### Spring 세팅 (영균 실무 지점)

```java
// 전역 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")  // 허용 출처
            .allowedMethods("GET", "POST")
            .allowCredentials(true)   // 쿠키 인증 허용
            .maxAge(3000);            // 예비 요청 캐싱
    }
}

// 특정 컨트롤러/메서드만
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class MyController { ... }
```

- 서블릿 레벨에선 [[filter]]로 처리한다 (Tomcat `org.apache.catalina.filters.CorsFilter`, 직접 만든 `CORSInterceptor implements Filter`). [[spring-security]]를 쓰면 시큐리티 필터 체인에도 CORS 설정이 필요하다.

> ⚠️ 보안 함정: 귀찮다고 `Access-Control-Allow-Origin: *` 로 열면 정체불명 출처까지 허용 → 오히려 취약해진다. 원리상 CORS는 SOP가 막던 걸 억지로 뚫는 것이므로, **넓게 열수록 위험**하다.

## 관련 페이지

- [[same-origin-policy]] — CORS가 예외를 내는 그 벽. 먼저 읽을 것
- [[preflight-request]] — CORS 3시나리오 중 기본 모드
- [[cookie]]·[[jwt]]·[[refresh-token]] — 인증된 요청의 대상
- [[filter]]·[[spring-security]] — 서버 측 CORS 처리 위치
- [[proxy]] — 우회 해결책
- [[http-cache]] — 예비 요청 캐싱이 걸치는 지점
- 출처: [[cors-article]]
