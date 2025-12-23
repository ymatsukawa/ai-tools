---
name: go-pro
description: Professional golang programming skill (project)
---

# Go Programming Principles

## 1. Extremely Simple

- Write straightforward code that reads like prose
- Prefer explicit over implicit - no magic
- One function, one purpose
- Avoid premature abstraction - duplicate before you abstract
- Use standard library first, dependencies second
- Keep packages small and focused
- Meaningful name of variable and package
- Obey 80/24 Rule
  - 80 characters in 1 line, max 24 lines

## 2. Functional

- Prefer pure functions with no side effects
- Accept interfaces, return structs
- Use value receivers unless mutation is required
- Handle errors immediately where they occur
- Avoid global state - pass dependencies explicitly
- Use closures for encapsulation when appropriate

## 3. Practical

- Error messages should include context: `fmt.Errorf("fetch user %d: %w", id, err)`
- Table-driven tests for comprehensive coverage
- Use `context.Context` for cancellation and timeouts
- Struct tags for JSON/DB mapping, not logic
- `defer` for cleanup, not control flow
- Benchmark before optimizing
