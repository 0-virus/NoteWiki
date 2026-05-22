---
type: concept
tags: [java, immutable, dto]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Java record

## 한 줄 정의

**불변 데이터를 담는 클래스를 한 줄로 정의하는 키워드.** JDK 16에서 정식 도입. `class` 자리에 `record`를 쓰면 끝.

## 코드 한 줄로 보는 차이

기존 클래스로 불변 데이터 객체를 만들려면:

```java
public class Student {
    private final String name;
    private final int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    public String getName() { return name; }
    public int getAge() { return age; }

    @Override public boolean equals(Object o) { ... }   // ↓ 자동 생성된 보일러플레이트
    @Override public int hashCode() { ... }
    @Override public String toString() { ... }
}
```

record로:

```java
public record Student(String name, int age) { }
```

끝.

## 자동으로 만들어지는 것들

`record`를 쓰면 컴파일러가 자동 생성:

| 자동 생성 | 효과 |
| --------- | ---- |
| `private final` 필드 | 불변 보장 |
| 모든 필드를 인자로 받는 **생성자** | 한 번에 초기화 |
| **getter** (필드명 그대로: `name()`) | 일반 `getName()`이 아니라 **필드명()** |
| **`equals()`** | 필드 값 기준 비교 |
| **`hashCode()`** | `equals`와 일관성 자동 보장 → [[equals-hashcode]] |
| **`toString()`** | `Student[name=영균, age=27]` 형식 |

## 왜 이런 게 생겼나 — 불변 데이터 캐리어의 표준화

[[mutable-immutable]]에서 불변 객체의 4가지 이득(공유·스레드 안전·hashCode 안정·보안)을 봤다. 그런데 **불변 클래스를 손으로 짜면 코드가 너무 길다** — final 필드 선언 + 생성자 + getter + equals + hashCode + toString.

Lombok `@Value` / `@Data`는 외부 라이브러리이고 어노테이션 처리에 의존. Java 16부터는 **언어 차원에서** 불변 데이터 캐리어를 정식 지원하기로 한 것이 record.

## Spring에서의 활용 — DTO

`record`의 자연스러운 무대가 [[dto-vs-entity]]의 **DTO**.

```java
public record PostDetailResponseDto(
    Long postId,
    String title,
    String body,
    int likes
) { }
```

- 데이터만 들고 다님 → 행위 없음 → record와 잘 맞는다.
- equals/hashCode/toString 자동 → 테스트·로깅에서 즉시 유용.
- 불변 → 직렬화·역직렬화 후 안전.

## 제한 — 어디서 쓰면 안 되나

- **상속 불가** — `record`는 다른 클래스를 상속할 수 없다 (모두 `java.lang.Record` 암묵 상속).
- **상태가 바뀌는 객체에 부적합** — Entity처럼 상태를 가진 도메인 객체에는 일반 class가 맞다.
- **JPA Entity로는 직접 사용 어렵다** — JPA가 기본 생성자·setter를 요구하는데 record는 둘 다 없음. → DTO에 한정.

## 영균 학습 트리에서

- [[mutable-immutable]]의 "불변 객체의 4가지 이득"을 **언어 차원에서 한 줄로** 누리는 방법.
- DTO를 손으로 길게 쓰지 않고 record로 짧게 → [[dto-vs-entity]]의 자연스러운 짝.
- JDK 17(Spring Boot 3.X) 환경에서는 마음 놓고 쓸 수 있다.

## 관련 페이지

- [[mutable-immutable]] — 불변 객체의 의미와 이득
- [[dto-vs-entity]] — record가 가장 잘 어울리는 자리
- [[equals-hashcode]] — record가 자동 생성해주는 두 메서드
- 출처: [[spring-framework-1-note]]
