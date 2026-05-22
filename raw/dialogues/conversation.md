# 대화 내용 정리

---

## 1. HTTP 500 – NullPointerException (ProductController)

**오류 메시지:**

```
java.lang.NullPointerException: Cannot invoke "String.hashCode()" because "<local5>" is null
    ch05.ProductController.doGet(ProductController.java:37)
```

**원인:**
`req.getParameter("action")`이 `null`을 반환할 때 `switch(action)`이 내부적으로 `null.hashCode()`를 호출하면서 NPE 발생.

**수정:**

```java
String action = req.getParameter("action");
if (action == null) action = "list";
switch (action) { ... }
```

---

## 2. productInfo의 `${product.xxx}`가 resolve되지 않는 이유

**원인 세 가지:**

| 원인                  | 내용                                                       |
| --------------------- | ---------------------------------------------------------- |
| attribute 이름 불일치 | 컨트롤러는 `"productList"`로 set, JSP는 `${products}` 참조 |
| JSTL taglib URI 누락  | `uri=""`로 JSTL 비활성화 → `<c:forEach>` 동작 안 함        |
| 빈 EL 표현식          | `${}`에 변수명이 없어 렌더링 불가                          |

**수정:**

```jsp
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
...
<c:forEach var="p" items="${productList}">
    <td>${p.id}</td>
    <td><a href="/pcontrol?action=info&id=${p.id}">${p.name}</a></td>
    <td>${p.price}</td>
</c:forEach>
```

---

## 3. productInfo.jsp EL 표현식이 문자 그대로 출력되는 문제

**원인:**
`productInfo.jsp`에 `isELIgnored="false"`가 없음. `productList.jsp`에는 있는데 누락됨.

**수정:**

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" isELIgnored="false" %>
```

---

## 4. Docker 명령어 오류

**잘못된 명령어:**

```
docker run -d --name mysql-web -e MYSQL_ROOT_PASSWORD=1234 -P 3306:3306 MYSQL:8.0.45-debian
```

**오류 원인 두 가지:**

1. `-P` (대문자) → `-p` (소문자): 대문자 `-P`는 포트를 랜덤 매핑하는 옵션이라 `3306:3306`을 이미지 이름으로 해석함
2. `MYSQL` → `mysql`: Docker 이미지 이름은 대소문자를 구분하며 공식 이미지는 소문자

**올바른 명령어:**

```
docker run -d --name mysql-web -e MYSQL_ROOT_PASSWORD=1234 -p 3306:3306 mysql:8.0.45-debian
```

---

## 5. JDBC Driver 문자열 설명

```
com.mysql.cj.jdbc.Driver
│── com.mysql        : MySQL 회사 패키지 (제조사)
│── cj               : Connector/J (MySQL의 Java 드라이버 이름)
│── jdbc             : JDBC 표준 인터페이스 구현체
└── Driver           : JDBC Driver 클래스
```

**DB별 JDBC_DRIVER 값:**

| DB            | JDBC_DRIVER                                    |
| ------------- | ---------------------------------------------- |
| MySQL         | `com.mysql.cj.jdbc.Driver`                     |
| Oracle        | `oracle.jdbc.driver.OracleDriver`              |
| MariaDB       | `org.mariadb.jdbc.Driver`                      |
| PostgreSQL    | `org.postgresql.Driver`                        |
| MS SQL Server | `com.microsoft.sqlserver.jdbc.SQLServerDriver` |

---

## 6. StudentDAO findAll 반환값 형태

`Student` 객체가 여러 개이니 `List<Student>`를 반환.

```java
public List<Student> findAll() { ... }
```

DB에서 ResultSet으로 행을 한 줄씩 읽으면서 `Student` 객체를 만들어 리스트에 `add`하고, 마지막에 리스트를 `return`하는 구조.

---

## 7. StudentDAO 코드 피드백 (1차)

**문제: `while(true)` + 종료 조건 없음**

`rs.next()`는 다음 행이 있으면 `true`, 없으면 `false`를 반환. 반환값을 무시하고 무조건 루프를 돌아서, 데이터가 다 끝나도 멈추지 않고 없는 행을 읽으려다 예외 발생. 결국 `SQLException`을 던지며 종료되는데, 이건 정상 종료가 아님.

**올바른 패턴:**

```java
while (rs.next()) {
    studentList.add(new Student(...));
}
return studentList;
```

**findById도 같은 문제:**
`rs.next()` 반환값을 확인하지 않아서 해당 id가 없으면 빈 ResultSet에서 컬럼을 읽으려다 예외 발생. `if (rs.next())`로 감싸고 없으면 `null`을 반환하는 게 안전.

---

## 8. StudentDAO 코드 피드백 (2차 수정 후)

`findAll`, `findById` 모두 올바르게 수정됨.

**남은 문제:**

- 불필요한 `import com.mysql.cj.protocol.Resultset` 제거 필요 (실제 사용하는 건 `java.sql.ResultSet`이고 `import java.sql.*`로 이미 포함)
- `close()`가 비어 있어 DB 커넥션이 계속 열린 채 남음

---

## 9. close() 구현

`conn.close()`만 있을 때의 문제: `pstmt`도 같이 닫아야 하며, 닫는 순서는 열었던 순서의 역순 (pstmt → conn).

```java
public void close() {
    try {
        if (pstmt != null) pstmt.close();
        if (conn != null) conn.close();
    } catch (SQLException e) {
        throw new RuntimeException(e);
    }
}
```

`null` 체크를 하는 이유: `open()` 실패 시 `conn`이나 `pstmt`가 null인 상태에서 `close()`를 호출하면 NPE가 나기 때문.

---

## 10. create 메서드 추론

`create`는 INSERT 쿼리를 실행하는 메서드.

- 파라미터: `Student` 객체 하나 받음
- SQL: `INSERT INTO student VALUES (?, ?, ?, ?, ?)`
- 실행: `find`류는 `executeQuery()`를 쓰지만 INSERT/UPDATE/DELETE는 **`executeUpdate()`**를 씀
- 반환값: `void` 또는 `int` (영향받은 행 수, 보통 성공 시 1)

---

## 11. Date 파싱 방법

`SimpleDateFormat`을 사용.

```java
String input = "2020-01-01";
Date birth = new SimpleDateFormat("yyyy-MM-dd").parse(input);
```

`parse()`가 `ParseException`을 던지므로 try-catch 또는 메서드에 `throws ParseException` 선언 필요.

---

## 12. DAO + Controller 코드 피드백

**StudentController 문제:**

1. **forward 누락** — `service()` 메서드에서 `view`를 만들고 끝남. `req.getRequestDispatcher(view).forward(req, resp)`가 없어서 화면으로 이동하지 않음
2. **날짜 포맷 오타** — `"yyyy-mm-dd"`에서 `mm`은 **분(minute)**. 월(month)은 대문자 `MM` → `"yyyy-MM-dd"`
3. **`info`가 id를 하드코딩** — `findById(1)`로 고정. `Integer.parseInt(req.getParameter("id"))`로 받아야 함
4. **불필요한 import** — `import ch05.Product` 사용되지 않음
5. **`action` null 체크 없음** — `action`이 null이면 switch에서 NPE 발생

**StudentDAO 문제:**

6. **`create`의 Date 캐스팅 위험** — `(java.sql.Date) birth`는 `java.util.Date`를 강제 캐스팅. `SimpleDateFormat.parse()`로 만든 객체는 실제로 `java.util.Date`이므로 런타임에 `ClassCastException` 발생

```java
// 잘못된 방법
pstmt.setDate(4, (java.sql.Date) birth);

// 올바른 방법
pstmt.setDate(4, new java.sql.Date(birth.getTime()));
```

---

## 13. 수정 후 재피드백 + 다음 단계

이전 지적 사항들 모두 수정됨. 남은 문제: `action` null 체크 미수정 (`switch(action)`에 null 진입 가능).

**다음으로 할 것: JSP 화면 제작**

| action      | JSP 경로                   |
| ----------- | -------------------------- |
| list        | `/ch06/student/list.jsp`   |
| info        | `/ch06/student/info.jsp`   |
| create (폼) | `/ch06/student/create.jsp` |

---

## 14. JSP 파일 생성

세 파일 생성: `list.jsp`, `info.jsp`, `create.jsp`

컨트롤러 경로 조합 주의사항: `"/ch06/" + "/student/info.jsp"` = `/ch06//student/info.jsp`로 이중 슬래시가 생김. 메서드의 반환값에서 앞 슬래시를 빼는 게 맞음.

추가로 `create` 폼을 보여주는 action이 없음: `list.jsp`의 "신규 등록" 링크가 `/student?action=create`(GET)로 가는데, 컨트롤러의 `create()`는 폼 처리(POST)용이므로 `action=form` 케이스를 추가해야 함.

---

## 15. form action 추가

```java
case "form":
    view += "student/create.jsp";
    break;
```

`list.jsp`의 "신규 등록" 링크도 `/student?action=form`으로 수정.

**전체 흐름:** 목록(`list`) → 신규 등록 클릭 → 폼(`form`) → 제출 → `create` 처리 → 목록으로 이동

---

## 16. 주소창 입력 방법

프로젝트 `artifactId`가 `jwbook`이므로 컨텍스트 경로 `/jwbook` 기준:

```
http://localhost:8080/jwbook/student?action=list
http://localhost:8080/jwbook/student?action=info&id=1
http://localhost:8080/jwbook/student?action=form
```

---

## 17. HTTP 404 디버깅

**시도 1:** JDBC URL에 포트 추가 (`127.0.0.1` → `127.0.0.1:3306`) → 여전히 404

**시도 2:** 빌드 후 확인 (`target/classes/ch06/StudentController.class` 존재 확인) → 여전히 404

**원인 발견:** SmartTomcat 설정(`workspace.xml`)에서 `contextPath`가 `/`로 설정되어 있었음. `/jwbook`이 아님.

**올바른 URL:**

```
http://localhost:8080/student?action=form
http://localhost:8080/student?action=list
http://localhost:8080/student?action=info&id=1
```
