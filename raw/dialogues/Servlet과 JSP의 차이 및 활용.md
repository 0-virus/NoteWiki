---
source_type: "claude-conversation"
title: "Servlet과 JSP의 차이 및 활용"
url: "https://claude.ai/chat/b6f3f664-1e15-47ad-85e4-c8324c399b52"
clipped: 2026-05-19
description: "Claude conversation with 18 messages"
status: "raw"
tags:
  - "clippings/claude"
---
> [!info] 원본 대화
> https://claude.ai/chat/b6f3f664-1e15-47ad-85e4-c8324c399b52

## 🗂 컨텍스트
<!-- AI 인제스트 시 이 섹션을 우선 읽는다. 대화의 배경·목적을 한 줄로 요약. -->
Claude conversation with 18 messages

## 💬 대화 본문
**You**

servlet과 jsp 비교 설명 좀. servlet이 자바엣 웹 페이지 생성 및 전송을 담당하고 jsp가 html 내에 자바 코드를 삽입한 문서라는 정도만 알아. 각각이 어떻게 활용되는지도 설명해줘.

---

**Claude**

### Servlet vs JSP

핵심 개념부터 잡고 가자.

---

#### Servlet

Java 클래스가 **웹 요청을 처리하는 주체** 야. 네가 알고 있는 것처럼 HTTP 요청을 받아서 응답을 만들어 보내는 역할인데, 구조를 보면 이해가 빠를 거야.

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        String name = req.getParameter("name"); // 요청 파라미터 읽기
        
        res.setContentType("text/html;charset=UTF-8");
        PrintWriter out = res.getWriter();
        
        // HTML을 Java 코드로 직접 작성
        out.println("<html><body>");
        out.println("<h1>Hello, " + name + "!</h1>");
        out.println("</body></html>");
    }
}
```

보이는 것처럼 **Java 코드 안에 HTML을 문자열로 끼워 넣는 구조** 야. 로직 처리는 강력한데, HTML이 많아질수록 유지보수가 지옥이 되지.

---

#### JSP (JavaServer Pages)

반대로 **HTML 파일 안에 Java 코드를 삽입** 하는 방식이야.

```
<%@ page contentType="text/html;charset=UTF-8" %>
<%
    String name = request.getParameter("name");
%>
<html>
<body>
    <h1>Hello, <%= name %>!</h1>
</body>
</html>
```

훨씬 HTML스럽지? 디자이너도 건드릴 수 있는 수준이야.

##### JSP 주요 태그

| 태그 | 용도 | 예시 |
| --- | --- | --- |
| `<% %>` | Java 코드 실행 | `<% int x = 1; %>` |
| `<%= %>` | 값 출력 | `<%= name %>` |
| `<%@ %>` | 지시자 (import 등) | `<%@ page import="java.util.*" %>` |
| `<%! %>` | 멤버 변수/메서드 선언 | `<%! int count = 0; %>` |

---

#### 핵심 관계: JSP는 결국 Servlet이다

여기가 제일 중요한 포인트야.

JSP 파일은 **서버에서 자동으로 Servlet 클래스로 변환되어 컴파일** 돼. 즉 위의 JSP는 내부적으로 아래처럼 바뀐다고 보면 돼.

```
hello.jsp → hello_jsp.java (Servlet) → hello_jsp.class → 실행
```

JSP는 Servlet을 **편하게 쓰기 위한 문법적 설탕(Syntactic Sugar)** 이야.

---

#### 실제 활용 패턴: MVC

현업에서 Servlet과 JSP는 **역할을 분리해서 같이 써**. 이게 MVC 패턴이야.

```
[브라우저]
    ↓ 요청
[Servlet] ← Controller 역할: 요청 처리, 비즈니스 로직, DB 접근
    ↓ 결과 데이터를 request에 담아서 forward
[JSP]     ← View 역할: 데이터를 받아서 HTML로 렌더링
    ↓ 응답
[브라우저]
```

```java
// Servlet (Controller)
@WebServlet("/users")
public class UserServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        
        List<User> users = userService.findAll(); // 비즈니스 로직
        req.setAttribute("users", users);         // 데이터 전달
        req.getRequestDispatcher("/WEB-INF/users.jsp").forward(req, res); // JSP로 넘김
    }
}
```

```
<%-- JSP (View) --%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
<body>
    <c:forEach var="user" items="${users}">
        <p>${user.name}</p>
    </c:forEach>
</body>
</html>
```

Servlet이 데이터를 `setAttribute` 로 담아주면, JSP가 `${변수명}` 으로 꺼내서 HTML을 그리는 구조야.

---

#### 요약

|  | Servlet | JSP |
| --- | --- | --- |
| 형태 | Java 클래스 | HTML + Java 태그 |
| 강점 | 로직 처리, 흐름 제어 | 화면 렌더링 |
| MVC 역할 | Controller | View |
| 단점 | HTML 작성 불편 | 복잡한 로직 작성 불편 |

요즘은 Spring MVC나 Spring Boot가 이 역할을 훨씬 추상화해서 처리해주는데, 내부 동작 원리는 결국 이 구조 위에 있어. 기반을 알아두면 Spring 이해할 때 훨씬 수월해.

---

**You**

spring으로 넘어가기 전에 어느 정도로 이해해두는게 좋을 것 같아?

---

**Claude**

### Spring 전에 Servlet/JSP 어느 정도 알아야 할까?

결론부터 말하면 **"동작 원리 이해" 수준이면 충분** 하고, 능숙하게 짤 줄 알 필요는 없어.

---

#### 꼭 알아야 할 것들

**1\. 요청-응답 흐름**

- HTTP 요청이 들어오면 Servlet Container(Tomcat)가 어떻게 처리하는지
- `doGet` / `doPost` 분기가 왜 존재하는지
- `HttpServletRequest`, `HttpServletResponse` 가 뭘 담고 있는지

**2\. MVC 패턴 구조**

- 왜 Servlet(Controller)과 JSP(View)를 분리하는지
- `forward` vs `redirect` 차이 (Spring에서도 그대로 나옴)
- `setAttribute` / `getAttribute` 로 데이터 전달하는 흐름

**3\. JSP는 결국 Servlet이다**

- 변환 과정을 개념적으로 아는 것
- Spring이 왜 JSP 대신 Thymeleaf 같은 템플릿 엔진을 쓰는지 맥락 이해

**4\. Servlet Container의 역할**

- Tomcat이 뭘 해주는 건지
- Spring Boot가 왜 "내장 Tomcat"을 들고 나왔는지 이해하는 배경

---

#### 몰라도 되는 것들

- JSP 태그 문법 세세하게 (`<%!`, JSTL 등)
- web.xml 설정 직접 작성
- Servlet을 처음부터 능숙하게 짜는 것
- 필터, 리스너 같은 심화 개념

> Spring이 이것들을 다 추상화해서 감춰주기 때문에 직접 쓸 일이 거의 없어.

---

#### 실질적인 기준

Spring MVC 공부할 때 이 두 문장이 자연스럽게 이해되면 준비된 거야.

> `DispatcherServlet` 은 모든 요청을 받는 **Front Controller** 역할을 하는 Servlet이다.

> `@Controller` 의 메서드가 반환하는 뷰 이름은 ViewResolver가 실제 JSP/Thymeleaf 파일로 연결해준다.

이 문장들이 "아, Servlet이랑 MVC 패턴이 이렇게 이어지는구나" 하고 느껴지면 충분해. 지금 네 수준이면 거의 다 온 거야.

---

**You**

doGet과 doPost는 내가 아는 http 요청과 관련 있는거지?

---

**Claude**

응 맞아. 정확히 그거야.

HTTP 메서드 (`GET`, `POST`, `PUT`, `DELETE`...) 각각에 대응하는 메서드들이야.

```java
public class MyServlet extends HttpServlet {
    protected void doGet(...)    { } // GET 요청 처리
    protected void doPost(...)   { } // POST 요청 처리
    protected void doPut(...)    { } // PUT 요청 처리
    protected void doDelete(...) { } // DELETE 요청 처리
}
```

브라우저에서 해당 URL로 GET 요청이 오면 `doGet` 이 호출되고, POST 요청이 오면 `doPost` 가 호출되는 식이야.

---

근데 Spring으로 넘어오면 이게 훨씬 편해져.

```java
// Servlet 방식 - 메서드 오버라이드
protected void doGet(...) { ... }
protected void doPost(...) { ... }

// Spring 방식 - 어노테이션으로 처리
@GetMapping("/users")
public String getUsers() { ... }

@PostMapping("/users")
public String createUser() { ... }
```

`@GetMapping`, `@PostMapping` 이런 어노테이션들이 결국 `doGet`, `doPost` 를 추상화한 거라고 보면 돼. 그래서 Spring 배울 때 이게 왜 저렇게 생겼는지 자연스럽게 이해가 될 거야.

---

**You**

forward랑 redirect는 뭔데? 개념부터 자세히 설명 좀.

---

**Claude**

### Forward vs Redirect

둘 다 "다른 페이지로 이동"시키는 건데, **누가 이동시키느냐** 가 핵심 차이야.

---

#### Forward

**서버 내부에서 이동** 하는 거야. 브라우저는 이동했다는 사실조차 몰라.

```
브라우저 → [GET /users] → 서버
                           서버 내부에서 servlet → jsp로 넘김
브라우저 ← [응답 HTML]  ← 서버
```

브라우저 주소창은 `/users` 그대로야. JSP로 넘어갔는지 전혀 모르는 거지.

```java
// Servlet에서 JSP로 forward
req.setAttribute("users", userList);  // 데이터 담고
req.getRequestDispatcher("/WEB-INF/users.jsp").forward(req, res);  // 넘김
```

데이터를 `setAttribute` 로 담아서 넘길 수 있어. **request 객체가 그대로 유지** 되니까.

---

#### Redirect

**브라우저에게 "딴 데로 가"라고 명령** 하는 거야. 브라우저가 직접 새 요청을 보내.

```
브라우저 → [POST /login] → 서버
브라우저 ← [302 + Location: /home] ← 서버   ← "거기로 가"
브라우저 → [GET /home] → 서버               ← 브라우저가 새 요청
브라우저 ← [응답 HTML] ← 서버
```

브라우저 주소창이 `/home` 으로 바뀌어. 요청이 **2번** 일어나는 거야.

```java
// Redirect
res.sendRedirect("/home");
```

새 요청이 생기기 때문에 **request 객체가 초기화** 돼. `setAttribute` 로 담은 데이터는 사라져.

---

#### 나란히 비교

|  | Forward | Redirect |
| --- | --- | --- |
| 이동 주체 | 서버 | 브라우저 |
| 요청 횟수 | 1번 | 2번 |
| 주소창 변화 | 없음 | 변경됨 |
| request 유지 | 유지됨 | 초기화됨 |
| 데이터 전달 | setAttribute 가능 | 불가 (세션/쿼리스트링 써야 함) |

---

#### 언제 뭘 쓰냐

**Forward** → 같은 요청 흐름 안에서 View만 바꿀 때

```
GET /users → (DB 조회) → users.jsp로 forward해서 렌더링
```

**Redirect** → 다른 흐름으로 완전히 넘길 때, 특히 POST 이후

```
POST /login → (로그인 처리) → /home으로 redirect
```

---

#### POST 후 Redirect가 왜 중요한가

이게 실제로 제일 중요한 케이스야.

로그인 폼에서 POST 요청을 보냈다고 해봐. 근데 처리 후 forward로 결과 페이지를 보여줬어.

```
브라우저 주소창: /login (POST)
```

이 상태에서 사용자가 **새로고침을 누르면?**

> 브라우저가 "POST /login 요청 다시 보낼까요?" 팝업을 띄워. 확인 누르면 로그인 요청이 또 날아가.

회원가입이나 결제라면 **중복 처리** 가 발생하는 거야. 이걸 막으려고 POST 처리 후엔 Redirect를 써. 이 패턴을 **PRG 패턴 (Post-Redirect-Get)** 이라고 불러.

```
POST /login → 처리 → Redirect → GET /home
```

새로고침해도 GET /home만 반복되니까 안전해.

Spring에서도 이 개념 그대로 쓰여서 알아두면 확실히 도움 돼.

---

**You**

내가 이해하기로는 redirect는 새로운 요청으로 넘어가는 거니까 원래 요청의 request 객체가 사라져서 이걸 세션이나 쿼리 스트링으로 해결한다는 건데 맞아?

---

**Claude**

응 정확히 이해한 거야.

보충하자면 쿼리스트링이랑 세션은 용도가 좀 달라.

**쿼리스트링** → 민감하지 않은 간단한 데이터

```
res.sendRedirect("/result?status=success");
// 받는 쪽에서
String status = req.getParameter("status");
```

URL에 그대로 노출되니까 비밀번호나 개인정보는 절대 안 돼.

**세션** → 로그인 정보처럼 민감하거나 여러 요청에 걸쳐 유지해야 할 데이터

```java
// redirect 전에 세션에 저장
req.getSession().setAttribute("loginUser", user);

// redirect 후 새 요청에서 꺼냄
User user = (User) req.getSession().getAttribute("loginUser");
```

세션은 서버에 저장되고 브라우저엔 세션 ID만 쿠키로 남으니까 상대적으로 안전해.

---

한 줄로 정리하면

- **쿼리스트링** → 가볍고 공개돼도 되는 데이터
- **세션** → 무겁지만 민감하거나 지속적으로 유지할 데이터

Spring 가면 세션이나 `RedirectAttributes` 같은 걸로 이 문제를 더 깔끔하게 처리하는데, 지금 이 개념 잡혀 있으면 그것도 바로 이해될 거야.

---

**You**

네가 꼭 알아야 할 것들에 대해 설명한 것들 중 3번과 관련해서 더 자세히 설명해줄 수 있을까?

---

**Claude**

어떤 3번인지 확인하려고 이전 대화 찾아볼게.

---

**You**

4번에 대해서도 이야기해줘. tomcat과 같은 컨테이너가 꼭 필요한 이유가 뭐고, 어떻게 쓰이는 건지 궁금해

---

**Claude**

### Servlet Container (Tomcat)

#### 왜 필요한가

Java 코드는 그냥 혼자서 HTTP를 다룰 수 없어. 한번 생각해봐.

브라우저에서 요청이 오면 이런 일들이 일어나야 해.

- TCP 연결 수락
- HTTP 텍스트를 파싱해서 메서드, URL, 헤더, 바디 분리
- 적절한 Servlet 찾아서 실행
- Servlet이 만든 응답을 HTTP 형식으로 변환해서 전송
- 연결 종료 or 유지

이걸 개발자가 매번 직접 구현하면? 비즈니스 로직 짤 시간이 없지. Tomcat이 이 모든 걸 대신 처리해줘. 개발자는 `doGet` 안에 비즈니스 로직만 채우면 돼.

---

#### Tomcat이 하는 일 흐름

```
브라우저
  ↓ HTTP 요청 (텍스트)
  
[Tomcat]
  1. TCP 연결 수락
  2. HTTP 파싱 → HttpServletRequest 객체 생성
  3. URL 보고 어떤 Servlet인지 찾음 (Servlet 매핑)
  4. Servlet 인스턴스 없으면 생성 (최초 1회)
  5. doGet / doPost 호출
  6. Servlet이 HttpServletResponse에 결과 작성
  7. Response 객체를 HTTP 텍스트로 변환
  8. 브라우저에 전송

브라우저
  ↓ HTML 수신
```

2번에서 만들어진 `HttpServletRequest` 가 바로 `doGet(req, res)` 에서 쓰는 그 `req` 야.

---

#### Servlet 생명주기

Tomcat이 Servlet을 관리하는 방식도 중요해.

```
최초 요청
  → init() 호출       ← Servlet 인스턴스 생성 (딱 1번)
  → service() 호출    ← doGet/doPost 분기
  → 응답 전송

이후 요청
  → service() 바로 호출  ← 인스턴스 재사용

서버 종료
  → destroy() 호출    ← 정리 작업
```

Servlet은 **싱글톤** 으로 관리돼. 인스턴스가 하나만 만들어지고 모든 요청이 그걸 공유해. 그래서 Servlet에 인스턴스 변수 쓰면 동시성 문제가 생겨. 이게 나중에 Spring Bean이 싱글톤인 이유랑도 연결돼.

---

#### Spring Boot의 내장 Tomcat

원래 전통적인 배포 방식은 이랬어.

```
1. Tomcat 서버 별도 설치
2. 프로젝트를 .war로 패키징
3. Tomcat의 webapps 폴더에 .war 복사
4. Tomcat 실행
```

서버 설정이랑 앱이 분리돼 있으니까 환경 맞추는 게 번거로웠어.

Spring Boot는 이걸 뒤집었어.

```
Tomcat을 앱 안에 내장
  → .jar 하나로 패키징
  → java -jar app.jar 한 줄로 실행
```

```java
// Spring Boot 시작점
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args); // 여기서 내장 Tomcat도 같이 뜸
    }
}
```

`SpringApplication.run()` 호출하면 내장 Tomcat이 같이 뜨고, 포트 열고, 요청 받을 준비까지 다 해줘. 네가 `localhost:8080` 으로 접속할 수 있는 게 이것 때문이야.

---

#### 한 줄 요약

Tomcat은 HTTP의 복잡한 처리를 대신 해주는 중간 관리자야. Spring Boot는 거기서 한 발 더 나아가서 Tomcat을 앱 안에 내장시켜버려서 배포를 단순화한 거고. `DispatcherServlet` 도 결국 Tomcat 위에서 동작하는 Servlet이라는 점에서 이 구조가 Spring 전체를 관통해.

---

**You**

servlet의 생명주기 부분이 잘 이해가 안 돼. servlet이 싱글톤인 이유나 동시성 문제가 뭔지 좀 더 자세히 알려주고, spring bean이 뭔지도 간단하게만 설명해줘.

---

**Claude**

### Servlet 생명주기 & 싱글톤

#### 왜 싱글톤으로 관리하냐

Servlet 인스턴스를 매 요청마다 새로 만든다고 생각해봐.

```
요청 1 → new HelloServlet() → doGet() → 응답 → 인스턴스 버림
요청 2 → new HelloServlet() → doGet() → 응답 → 인스턴스 버림
요청 3 → new HelloServlet() → doGet() → 응답 → 인스턴스 버림
```

트래픽이 몰리면 초당 수천 개의 인스턴스가 생성/소멸을 반복해. 메모리랑 GC에 엄청난 부담이야.

그래서 Tomcat은 이렇게 해.

```
최초 요청 → new HelloServlet() → 인스턴스 보관

요청 1 ──┐
요청 2 ──┼──→ 같은 HelloServlet 인스턴스 → doGet() 동시 실행
요청 3 ──┘
```

인스턴스 하나를 만들어두고 모든 요청이 공유하는 거야. 이게 싱글톤이야.

---

#### 동시성 문제

여기서 문제가 생겨. 아래 코드를 봐.

```java
public class BadServlet extends HttpServlet {

    private int count = 0; // 인스턴스 변수 (위험!)

    protected void doGet(HttpServletRequest req, HttpServletResponse res) {
        count++;  // 여러 요청이 동시에 이 줄을 실행하면?
        res.getWriter().println("count: " + count);
    }
}
```

요청 A와 요청 B가 동시에 들어오면 이런 일이 생겨.

```
요청 A 스레드: count 읽음 (0)
요청 B 스레드: count 읽음 (0)   ← A가 아직 저장 안 했는데 B도 읽어버림
요청 A 스레드: count = 0 + 1 = 1 저장
요청 B 스레드: count = 0 + 1 = 1 저장  ← 2가 되어야 하는데 1이 됨
```

둘 다 1을 저장해버려서 카운트가 엉켜. 이게 **동시성 문제 (Race Condition)** 야.

반면 **지역 변수** 는 괜찮아.

```java
public class GoodServlet extends HttpServlet {

    protected void doGet(HttpServletRequest req, HttpServletResponse res) {
        int count = 0; // 지역 변수 (안전!)
        // 각 요청의 스레드가 자기만의 스택에 독립적으로 갖는 변수라서
        // 다른 요청이랑 공유 안 됨
        count++;
        res.getWriter().println("count: " + count);
    }
}
```

지역 변수는 각 스레드의 스택에 독립적으로 생성되니까 서로 건드릴 수 없어.

```
// 인스턴스 변수: 힙에 하나 → 모든 스레드 공유 → 위험
// 지역 변수:     스택에 각자 → 스레드마다 독립 → 안전
```

그래서 Servlet 안에서 **상태를 인스턴스 변수로 갖지 말라** 는 게 기본 원칙이야.

---

#### Spring Bean이란

Spring Bean은 쉽게 말하면 **Spring이 대신 만들어서 관리해주는 객체** 야.

원래 Java에서 객체는 개발자가 직접 만들잖아.

```java
// 개발자가 직접 생성
UserService userService = new UserService();
UserRepository userRepository = new UserRepository();
```

Spring에선 이걸 Spring이 대신 해줘.

```java
@Service  // "이 클래스 네가 관리해줘" 라고 Spring한테 알려주는 것
public class UserService {
    ...
}
```

```java
// 개발자는 그냥 가져다 쓰기만 함
@Autowired
private UserService userService; // Spring이 알아서 넣어줌
```

이렇게 Spring이 객체의 생성과 관리를 책임지는 걸 **IoC (제어의 역전)** 라고 해.

---

#### Servlet 싱글톤이랑 연결되는 지점

Spring Bean도 기본적으로 **싱글톤** 이야.

```
Servlet 싱글톤: Tomcat이 관리
Spring Bean 싱글톤: Spring Container가 관리
```

관리 주체가 다를 뿐 같은 이유야. 매번 새로 만들면 비용이 크니까. 그래서 Spring Bean에서도 똑같이 **인스턴스 변수로 상태 갖지 말라** 는 원칙이 그대로 적용돼.

나중에 Spring 하면 `@Controller`, `@Service`, `@Repository` 같은 어노테이션 볼 텐데, 그게 다 "이 클래스를 Spring Bean으로 등록해줘"라는 뜻이야. 그리고 그 Bean들이 전부 싱글톤으로 관리된다는 거 기억해두면 돼.

---

**You**

트랜잭션 동시성 문제랑 연결이 되는 거구나?

---

**Claude**

맞아, 잘 연결했어. 근데 레벨이 살짝 달라.

---

**Servlet 동시성 문제** → **메모리 (힙)** 레벨

여러 스레드가 같은 인스턴스 변수를 동시에 읽고 쓰는 문제야.

```
스레드 A ──┐
           ├──→ count (메모리) 동시 접근 → 값 꼬임
스레드 B ──┘
```

**트랜잭션 동시성 문제** → **DB** 레벨

여러 트랜잭션이 같은 데이터를 동시에 읽고 쓰는 문제야.

```
트랜잭션 A ──┐
             ├──→ DB의 같은 row 동시 접근 → 데이터 꼬임
트랜잭션 B ──┘
```

---

근본 원인은 같아.

> **공유 자원에 여러 주체가 동시에 접근할 때 생기는 문제**

해결 방식도 비슷한 방향이야.

|  | Servlet/Java | DB 트랜잭션 |
| --- | --- | --- |
| 문제 | 인스턴스 변수 공유 | 같은 row 동시 접근 |
| 해결 | 상태를 인스턴스 변수로 갖지 않음 | 격리 수준, 락 |

전에 Java 프로젝트에서 트랜잭션 격리 수준 공부했던 거 기억나지? 그게 DB 레벨에서의 동시성 제어고, 오늘 한 얘기는 애플리케이션 레벨에서의 동시성 제어인 거야. 같은 문제를 다른 층에서 다루는 거지.

---

## 💭 내 메모
<!-- 왜 저장했나 · 핵심 takeaway · 후속 액션 · 궁금한 점.
     AI 인제스트 시 이 메모를 컨텍스트로 최우선 반영한다. -->

## 🔗 관련 노트
<!-- 연결되는 프로젝트·TIL·문서 링크 -->
