## 대표 Functional Interface 종류

|           | Type Parameters         | Method   | Return     |
| --------- | ----------------------- | -------- | ---------- |
| Runnable  | X                       | run()    | X          |
| Supplier  | T(return)               | get()    | O          |
| Consumer  | T(parameter)            | accept() | X          |
| Function  | T(parameter), R(return) | apply()  | O          |
| Predicate | T(parameter)            | test()   | O(boolean) |
