# Export / Import

---

- Export: 한 파일에서 변수, 함수, 클래스 등을 다른 파일에서 사용할 수 있게 내보내는 것
- Import: 한 파일에서 Export로 내보낸 객체를 다른 파일에서 가져와 사용하는 것

# Named Export vs. Default Export

---

## Named Export

→ 이름을 지정해서 내보내는 방식.

```jsx
// utils.js
export const PI = 3.14;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  // ...
}
```

아래처럼 한 번에 여러 개를 내보낼 수도 있다.

```jsx
// utils.js
const PI = 3.14;
function add(a, b) {
  return a + b;
}
class Calculator {
  // ...
}

export { PI, add, Calculator };
```

가져올 때는 반드시 **중괄호**를 쓰고, 정확한 이름으로 가져와야 한다.

```jsx
// main.js
import { PI, add, Calculator } from "./utils.js";

console.log(add(1, 2)); // 3
```

혹은 `as` 를 이용해 이름을 바꿀 수도 있다.

```jsx
import { add as sum } from "./utils.js";
console.log(sum(1, 2)); // 3
```

주로 여러 함수를 제공하는 **라이브러리**나 **유틸 함수** 등에 선택적으로 가져올 수 있게 하기 위해 사용된다.

## Default Export

파일당 딱 하나만 기본으로 내보내는 방식.

```jsx
// Button.js
export default function Button() {
  return "<button>Click</button>";
}
```

가져올 때는 중괄호 없이 가져오고, 원하는 이름으로 가져올 수 있다.

```jsx
// main.js
import Button from "./Button.js";
import MyConfig from "./config.js"; // 이름 바꿔도 됨

Button();
```

주로 React 컴포넌트나 메인 클래스와 같이 파일당 하나의 주된 것만 내보내는 경우에 사용된다.

## 동작 원리

JavaScript 엔진에서는 내부적으로 두 방식을 아래와 같이 관리한다.

```json
// 모듈의 개념적 구조(실제로 이런 건 아님)
{
  namedExports: {
    API_KEY: 'abc123',
    fetchData: [Function]
  },
  defaultExport: [Class API]
}
```

- `import X from ...` → `defaultExport` 에서 가져옴
- `import { Y } from ...` → `namedExports` 에서 가져옴
  → 완전히 분리된 공간에서 가져옴. 따라서 Named Export와 Default Export를 같은 이름으로 해도 JavaScript는 정확히 어디에서 객체를 가져와야 할 지 안다.
  ```jsx
  // api.js
  class API {}
  export { API }; // named export
  export default API; // default export (같은 클래스)

  // main.js
  import DefaultAPI from "./api.js"; // default로 가져온 API
  import { API } from "./api.js"; // named로 가져온 API
  ```

# Tips

---

## 전체 가져오기

```jsx
import * from './utils.js'
```

## 동적 `import()`

파일 최상단에만 써야 하고 코드 실행 전에 동기적으로 다 로드되는 정적 import와 달리, 함수처럼 쓰고 런타임에 필요할 때만 모듈을 불러오는 방식. (Promise 객체를 반환)

```jsx
// 코드 어디서든 사용 가능
const module = await import("./utils.js");
console.log(module.add(1, 2));
```

Named Export는 그대로 가져오고, Default Export는 .default 프로퍼티로 접근해야 한다.

```jsx
// utils.js
export const PI = 3.14;
export function add(a, b) {
  return a + b;
}
export default class Calculator {}

// main.js
const { PI, add, default: Calculator } = await import("./utils.js");
```

- 주의사항
  - Top-level await 필요(모던 환경에서만 가능 ← async 바깥에서도 await가 사용 가능한 환경)
  - 에러 처리 필수
    ```jsx
    try {
      const module = await import("./maybe-missing.js");
    } catch (err) {
      console.error("로드 실패:", err);
    }
    ```
  - 같은 모듈을 여러 번 import하면 캐싱된 첫 번째 모듈을 재로드함.
