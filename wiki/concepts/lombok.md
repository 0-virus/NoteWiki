---
type: concept
tags: [java, lombok, di, annotation]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10 Spring @Component · Bean · DI · Security Filter Chain 개념 문답.md"]
---

# Lombok

## 한 줄 정의

**반복적인 Java 보일러플레이트 코드(생성자·Getter·Setter·toString 등)를 어노테이션으로 컴파일 시 자동 생성하는 라이브러리.**

## 왜 쓰나

Java는 DTO나 Service 클래스에 생성자, Getter/Setter, equals 등을 일일이 작성해야 한다. Lombok은 이를 어노테이션 하나로 컴파일 시 자동 생성한다.

```java
// Lombok 없이
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
}

// Lombok 사용
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // 생성자가 컴파일 시 자동 생성됨
}
```

## DI에서 가장 중요한 두 어노테이션

### `@RequiredArgsConstructor` — DI에 적합

`final` 필드와 `@NonNull` 필드만 모아 생성자를 자동 생성.

```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;    // 포함 (final)
    private final PasswordEncoder passwordEncoder;  // 포함 (final)
    private String tempValue;                       // 제외 (final 아님)
}
// 자동 생성:
// public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) { ... }
```

생성자가 하나이므로 Spring 4.3+에서 `@Autowired` 생략 가능 → **현재 실무 표준 패턴.**

### `@AllArgsConstructor` — DI에 부적합

모든 필드(final 여부 무관)를 생성자에 포함.

**왜 DI에 부적합한가**: `final`이 아닌 필드까지 포함되어 의도치 않은 파라미터가 생기고, 필드 순서가 바뀌면 컴파일 오류 없이 조용히 버그가 생길 수 있다.

## 세 생성자 어노테이션 비교

| | `@RequiredArgsConstructor` | `@AllArgsConstructor` | `@NoArgsConstructor` |
|---|---|---|---|
| 대상 | `final` + `@NonNull` 필드 | 모든 필드 | 없음 (기본 생성자) |
| DI 용도 | 적합 | 부적합 | X |
| 주 사용처 | Service, Repository 등 | DTO 테스트 데이터 생성 | JPA Entity, DTO |

> JPA `@Entity`에는 기본 생성자가 필수라 `@NoArgsConstructor`가 필요하다. → [[jpa-entity-mapping]]

## 자주 쓰는 다른 어노테이션

| 어노테이션 | 역할 |
|---|---|
| `@Getter` | 모든 필드에 Getter 자동 생성 |
| `@Setter` | 모든 필드에 Setter 자동 생성 |
| `@ToString` | `toString()` 자동 생성 |
| `@EqualsAndHashCode` | `equals()`·`hashCode()` 자동 생성 |
| `@Data` | @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor |
| `@Builder` | 빌더 패턴으로 객체 생성 |

> `@Data`는 편리하지만 [[spring-bean|싱글톤]] Bean에 `@Setter`까지 붙이는 위험이 있어 Service 클래스에는 쓰지 않는다.

## 관련 페이지

- [[dependency-injection]] — 생성자 주입과 @RequiredArgsConstructor의 관계
- [[spring-annotations]] — Spring 어노테이션 참조 인덱스
- [[jpa-entity-mapping]] — @NoArgsConstructor가 필요한 이유 (JPA Entity 기본 생성자)
- [[equals-hashcode]] — @EqualsAndHashCode와 연결