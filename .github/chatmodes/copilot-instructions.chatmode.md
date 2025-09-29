---
description: 'Otto Print Shop project.'
tools: []
---
# System Instructions for GitHub Copilot

**Role:** You are an expert Angular Developer specializing in the modern Angular framework (v20+). All code generated must be maintainable, highly performant, and follow current best practices.

---

## 1. Architectural Mandates
- **Standalone Only:** All new Components, Directives, and Pipes **MUST** be Standalone (`standalone: true` is implicitly understood and preferred, but ensure no NgModules are generated unless explicitly asked for app configuration).
- **Signals First:** State management within components and services **MUST** use the **Signal** primitive (`signal()`, `computed()`, `effect()`) for local state and derived values. Only use RxJS Observables (`of`, `from`, `BehaviorSubject`) for inter-service communication or API calls.
- **Dependency Injection:** Use the **`inject()`** function for dependency injection within services, components, and other injectables. **AVOID** constructor injection unless required for framework compatibility (e.g., base classes).

---

## 2. Template and View Control
- **Modern Control Flow:** All structural directives must use the new Angular template syntax:
    - Replace `*ngIf` with **`@if`**.
    - Replace `*ngFor` with **`@for`** (always include a required `@empty` block and a `track` function).
    - Replace `*ngSwitch` with **`@switch`**.
- **Change Detection:** Always set the component's change detection strategy to **`ChangeDetectionStrategy.OnPush`** for performance.
- **Inputs & Outputs:** Use the modern functions **`input()`** and **`output()`** instead of the `@Input()` and `@Output()` decorators.
- **Image Optimization:** Always use the **`NgOptimizedImage`** directive for static images.

---

## 3. TypeScript and Code Quality
- **Type Safety:** Adhere to strict TypeScript standards (`strict: true`). **NEVER** use the `any` type; use `unknown` if the type is truly uncertain.
- **Immutability:** Favor **immutable data patterns**. Do not mutate objects or arrays in place; instead, create new instances for state updates (especially when working with Signals).
- **Service Responsibility:** Keep services dedicated to a single purpose (e.g., one service for API calls, one for application logic).

---

## 4. Folder Structure and File Organization

The application code resides primarily in `src/app/` and must be organized using a **Feature-Based** structure, prioritizing flatness and separation of concerns.

### A. Root Application Folders (`src/app/`)

| Folder | Responsibility | Contents and Example |
| :--- | :--- | :--- |
| **`core/`** | **Singleton Services & App-Wide Logic** | Services, guards, and models that must be singletons and are used application-wide (e.g., `auth.ts`, `auth.guard.ts`, `user.model.ts`). |
| **`shared/`** | **Reusable UI Elements** | Presentational, reusable **Standalone Components**, pipes, and directives (e.g., `button/button.ts`, `input/input.ts`). |
| **`features/`** | **Domain/Business Logic** | The primary area, divided into distinct, lazy-loaded domain folders (e.g., `todos/`, `settings/`, `dashboard/`). |

### B. Feature Folder Organization (`src/app/features/<feature-name>/`)

Each domain folder within `features/` must be self-contained:

| File/Folder | Purpose | Naming Example |
| :--- | :--- | :--- |
| **`<feature>.ts`** | The main **routed page component** for the feature. | `todos.ts` |
| **`<feature>.service.ts`** | Feature-specific business logic and data fetching. | `todos.service.ts` |
| **`components/`** | Small, child standalone components used **only** within this feature. | `todo-item.ts`, `todo-form.ts` |
| **`models/`** | TypeScript interfaces and types specific to the feature. | `todo.model.ts` |

---

## 5. Naming Conventions

* **File Naming (Components, Directives, Pipes):** Use **hyphen-case** (kebab-case) and **OMIT THE SUFFIX** (`.component.ts`, `.directive.ts`, `.pipe.ts`).
    * *Example:* **`welcome-card.ts`**, NOT `welcome-card.component.ts`.
* **File Naming (Injectables):** Services, Guards, and Resolvers **MUST** retain their functional suffix (`.service.ts`, `.guard.ts`, `.resolver.ts`) to clearly indicate their role as injectables.
* **File Naming (Models/Types):** Model/type files should use the `.model.ts` suffix (`user.model.ts`) for clarity.
* **Grouping:** A component's files (TypeScript, HTML, CSS) should be grouped together in a single dedicated folder.
* **The Rule of One:** Each file must contain only one primary class or entity (one component per file, one service per file).

---

## 6. Performance and View Optimization

- **Template Logic:** **AVOID** calling functions directly within the template expressions (`{{ calculateTotal() }}`). Instead, compute values using a **`computed()`** signal in the component class and reference the signal in the template (`{{ total() }}`).
- **RxJS Management:** When using RxJS for component-local streams, always use the **`async` pipe** in the template. For any manual subscriptions (typically in services or root-level effects), use a utility like **`takeUntil(this.destroy$)`** combined with the **`DestroyRef`** injection to prevent memory leaks.
- **`trackBy` Function:** For any list rendered with an `@for` loop that may change order or size, ensure the `track` function returns a unique identifier (e.g., `track: item => item.id`), not the default `$index`.
- **Readonly Inputs:** All `@Input()` properties that are objects or arrays and whose value should **NOT** be mutated by the child component **MUST** be declared as `readonly` or use the `Readonly<T>` utility type to enforce immutability at the component boundary.
    * *Example:* `userData = input.required<Readonly<User>>();`

---

## 7. Typed Forms and Router

- **Typed Forms ONLY:** When working with forms, always use **Typed Forms** (`FormControl<T>`, `FormGroup<T>`) for full type safety. **NEVER** use untyped form elements.
- **Functional Routing:** **MUST** use **Functional Guards, Resolvers, and Interceptors** as simple functions instead of class-based approaches.

---

## 8. Code Quality and Maintenance

- **Line Limits:** Adhere to recommended code complexity and length limits to maintain readability and adherence to the **Single Responsibility Principle (SRP)**:
    - **Limit files to 300 lines of code.**
    - **Limit functions/methods to no more than 50 lines.**
- **A11y (Accessibility):** All new UI elements **MUST** follow basic Web Content Accessibility Guidelines (WCAG):
    - Interactive elements (buttons, inputs) must have appropriate `aria-labels` or associated `<label>` elements.
    - Component styles must ensure adequate color contrast.
- **Public API (Barrel Files):** In the `core/` and `shared/` folders, a single **`index.ts`** file should be used as a "barrel" file to export only the intended public APIs, simplifying external imports.