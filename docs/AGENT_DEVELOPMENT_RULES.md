# Custom Agent Development Rules & Standards

## 1. Architecture & Code Organization

### 1.1 Directory Structure

- **`src/components`**: Group by feature (e.g., `auth`, `dashboard`) or type (`ui`, `shared`).
    - **`ui/`**: Core design system components (Shadcn/Radix wrappers). Do not modify these unless updating the design system itself.
    - **`shared/`**: Reusable components used across multiple features (e.g., `Navbar`, `ThemeSwitcher`).
- **`src/pages`**: Split into `public` and `protected`.
- **`src/services/apis`**: All API calls must be encapsulated here. Do not make direct `axios` calls in components.
- **`src/stores`**: Zustand stores for global client state (e.g., `authStore`, `themeStore`).
- **`src/hooks`**: Custom React hooks (camelCase).

### 1.2 Modularity

- **Feature Modules**: Keep related components, hooks, and utils together if they are specific to a feature.
- **Barrels**: Use `index.ts` files to export public API of a directory, but avoid circular dependencies.

## 2. Naming Conventions

| Entity                 | Convention       | Example                    |
| ---------------------- | ---------------- | -------------------------- |
| **Files (Components)** | PascalCase       | `AcceptInvitationForm.tsx` |
| **Files (Utilities)**  | camelCase        | `dateUtils.ts`             |
| **Components**         | PascalCase       | `UserProfile`              |
| **Functions/Hooks**    | camelCase        | `useAuth`, `formatDate`    |
| **Types/Interfaces**   | PascalCase       | `User`, `AuthPayload`      |
| **Constants**          | UPPER_SNAKE_CASE | `API_ENDPOINT`             |

## 3. Component Development Standards

### 3.1 Design System

- **Shadcn UI**: ALWAYS use components from `src/components/ui` for base elements (Button, Input, Card).
- **Icons**: Use `lucide-react`. Import individual icons to enable tree-shaking.
- **Styling**: Use Tailwind CSS utility classes.
    - Use `cn()` utility for merging classes.
    - Avoid inline styles.
    - Use CSS variables for theming (e.g., `bg-primary`, `text-foreground`).

### 3.2 Props & Types

- Define `Props` interface for every component.
- Use strict TypeScript types. Avoid `any`.
- Export component props if they are reusable.

### 3.3 Composition

- Prefer composition over inheritance.
- Use `children` prop for wrapper components.

## 4. State Management Patterns

### 4.1 Server State (Data Fetching)

- **Library**: Use `@tanstack/react-query` (v5).
- **Pattern**: Create custom hooks in `src/services/apis/` that wrap `useQuery` or `useMutation`.
- **Keys**: Use const arrays for query keys to ensure consistency (e.g., `['user', userId]`).

### 4.2 Client State (UI)

- **Library**: Use `zustand`.
- **Pattern**: Store separate slices in `src/stores/`.
- **Persistence**: Use `persist` middleware for data that needs to survive reloads (e.g., `authStore`).

## 5. Error Handling & Validation

### 5.1 API Errors

- **Interceptors**: Global 401/403 handling is already configured in `src/services/axiosClient.ts`.
- **User Feedback**: Use `showErrorToast` from `src/utills/toast` for API errors.
    ```tsx
    onError: (error) => {
        showErrorToast(error.message || 'Something went wrong');
    };
    ```

### 5.2 Form Validation

- **Library**: `react-hook-form` + `zod`.
- **Schema**: Define Zod schemas in the component file or a separate `schemas.ts`.
- **Feedback**: Display field-level errors using `FormMessage` component.

## 6. Performance Optimization

### 6.1 Code Splitting

- **Routes**: All page components in `src/routes/routes.tsx` MUST be lazy-loaded using the `lazyWithRetry` wrapper.

### 6.2 Rendering

- **Memoization**: Use `useMemo` for expensive calculations and `useCallback` for functions passed as props to memoized children.
- **Images**: Use proper `width`/`height` attributes to reduce layout shift.

## 7. Security Protocols

### 7.1 Authentication

- **Tokens**: Access tokens are stored in `localStorage` and attached via Axios interceptor.
- **Protected Routes**: Wrap private pages in `ProtectedRoutes` component.
- **Redirects**: Unauthenticated users hitting protected routes must be redirected to `/login`.

### 7.2 Data Safety

- **XSS**: React handles this by default. Do not use `dangerouslySetInnerHTML` unless absolutely necessary and sanitized.
- **Input**: Validate all user inputs with Zod before submission.

## 8. Integration & API Pattern

### 8.1 Service Layer

All API requests must follow this pattern:

```typescript
// src/services/apis/exampleApi.ts
import axiosInstance from '../axiosClient';

export const getExampleData = async () => {
    const response = await axiosInstance.get('/example');
    return response.data;
};

// Hook wrapper
export const useExampleData = () => {
    return useQuery({
        queryKey: ['example'],
        queryFn: getExampleData,
    });
};
```

## 9. Testing Requirements (Recommended)

- **Unit Tests**: Vitest + React Testing Library.
- **Scope**:
    - Utility functions (100% coverage).
    - Complex components (focus on user interactions).
    - Custom hooks.

## 10. Compliance Checklist for New Agents/Features

- [ ] Does the feature follow the directory structure?
- [ ] Are all new files strictly typed (no `any`)?
- [ ] Are API calls isolated in `services/apis`?
- [ ] Is `react-query` used for data fetching?
- [ ] Is `zustand` used for global state?
- [ ] Are Tailwind classes used for styling (no vanilla CSS)?
- [ ] Are user-facing strings spell-checked?
- [ ] Is error handling implemented with Toasts?
- [ ] Are new routes lazy-loaded?
