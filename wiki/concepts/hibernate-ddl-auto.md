---
type: concept
tags: [hibernate, jpa, spring-boot, schema, ddl, configuration]
updated: 2026-07-26
sources: ["raw/articles/Flyway 란 무엇일까.md", "raw/lectures/JPA.md"]
---

# spring.jpa.hibernate.ddl-auto

## 한 줄 정의

**[[hibernate]]가 엔티티 클래스를 보고 DB 테이블을 자동으로 만들거나 맞춰주는 설정.**
개발 속도를 극적으로 올려주지만, **운영에서는 쓰면 안 되는** 기능이다.

## 옵션

| 값 | 동작 | 쓰는 곳 |
| --- | --- | --- |
| `none` | 아무것도 안 함 | 운영 |
| `validate` | 엔티티와 테이블이 맞는지 **검증만**, 다르면 기동 실패 | 운영 ★ |
| `update` | 부족한 테이블/컬럼을 **추가**. 삭제·타입 변경은 안 함 | 로컬 개발 |
| `create` | 기동 시 **drop 후 create** | 로컬 실험 |
| `create-drop` | create + 종료 시 drop | 테스트 |

## 왜 편한가 — 엔티티가 곧 스키마

[[jpa-entity-mapping|엔티티 매핑]]에 필드를 하나 추가하고 앱을 재시작하면 컬럼이 생긴다.
스키마를 따로 관리할 필요가 없으니, 도메인 설계를 빠르게 실험하는 로컬 단계에서는 최적이다.

```java
@Entity
public class Member {
    @Id @GeneratedValue Long id;
    String email;
    String phone;   // ← 이 한 줄 추가 후 재시작하면 컬럼이 생김 (update)
}
```

## 왜 운영에서는 못 쓰는가 (★ 핵심)

### 1. `create` / `create-drop` — 데이터가 사라진다

말 그대로 테이블을 `DROP`한다. 운영 DB에서 이건 사고가 아니라 재해다.

### 2. `update` — "안전해 보여서" 더 위험하다

`update`는 삭제를 안 하니까 안전할 것 같지만, 실무에서 금기시되는 이유가 따로 있다.

| 문제 | 내용 |
| --- | --- |
| **무엇을 실행할지 예측 불가** | Hibernate가 생성하는 DDL을 사람이 미리 볼 수도, 리뷰할 수도 없다. 운영 DB에 **검토되지 않은 DDL이 자동 실행**된다 |
| **이력이 남지 않는다** | 컬럼이 언제 왜 생겼는지 기록이 없다 — [[database-migration|형상 관리]]의 정반대 |
| **변경을 반영 못 하는 게 더 많다** | 컬럼 삭제·타입 변경·이름 변경·제약 조건 변경은 무시된다. 결국 **엔티티와 실제 스키마가 조용히 어긋난다** |
| **락 제어가 안 된다** | Hibernate가 임의 시점에 `ALTER TABLE`을 던진다 → [[ddl-lock|메타데이터 락]]으로 서비스가 멈출 수 있는데 통제 수단이 없다 |
| **인덱스·성능 고려 없음** | 자동 생성 DDL은 [[database-index|인덱스]] 전략을 모른다 |

한 줄 요약: **`update`는 "스키마를 관리하지 않겠다"는 선언**이다. 로컬에서는 그래도 되지만 운영에서는 안 된다.

## 그래서 운영은 어떻게 하나

```
로컬  : ddl-auto: update   (또는 create — 빠른 실험)
운영  : ddl-auto: validate + Flyway 마이그레이션
```

**`validate` + [[flyway]] 조합이 표준 답**이다. 역할이 깔끔하게 갈린다.

- **Flyway** — 스키마를 *바꾸는* 유일한 주체. 변경은 전부 리뷰된 SQL 파일로.
- **`validate`** — Hibernate는 바꾸지 않고 *검사만* 한다. 엔티티와 실제 테이블이 어긋나면 **기동을 실패**시켜 조기에 잡아준다.

> ⚠️ Flyway를 켜면서 `ddl-auto: update`를 그대로 두면 **두 주체가 같은 스키마를 두고 싸운다.**
> Flyway 도입 시 반드시 `validate`나 `none`으로 내린다.

## 영균의 맥락

지금 개인 Spring 프로젝트는 `update`로 굴러가도 문제없다 — 로컬뿐이니까.
**배포하는 순간** 이 설정이 첫 번째 지뢰가 된다.
전환 절차는 [[entity-to-production-schema]] 참조.

## 관련 페이지

- [[hibernate]] — 이 설정의 주체
- [[flyway]] · [[database-migration]] — 운영에서의 대체재
- [[jpa-entity-mapping]] — 스키마 변경을 유발하는 쪽
- [[ddl-lock]] — 자동 DDL이 위험한 근본 이유
- [[spring-boot]] — `application.yml` 설정 위치
- [[entity-to-production-schema]] — 전체 흐름
- 출처: [[flyway-article]] · [[jpa-lecture]]
