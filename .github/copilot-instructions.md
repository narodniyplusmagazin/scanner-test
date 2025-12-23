<!-- Project-specific Copilot instructions. Keep concise and actionable. -->
# Copilot instructions for the admin app

## Purpose
Admin dashboard for "magazin" subscription management system. Built with Vite + React + TypeScript.

## Architecture
**Entry:** [src/main.tsx](../src/main.tsx) → [src/App.tsx](../src/App.tsx) (react-router-dom routes)  
**Routes:**
- `/` - Home with nav links
- `/admin/users` - [UsersList.tsx](../src/admin/UsersList.tsx) - user management + subscription viewer
- `/admin/subscription` - [SubscriptionPlanEdit.tsx](../src/admin/SubscriptionPlanEdit.tsx) - plan CRUD
- `/qr` - [QRScanner.tsx](../src/components/QRScanner/QRScanner.tsx) - camera-based QR validation

**Backend:** REST API at `API_BASE_URL` in [src/config.ts](../src/config.ts). Currently set to local IP (`http://172.20.10.6:5050`), commented production URL. All API calls use axios with `API_BASE_URL` prefix.

## Key Patterns

### State management
- Local React state with `useState` for all data (no global state library)
- **Loading pattern**: `useState<T | null>(null)` → `useEffect` with mounted flag → set state or error
- **Async cleanup**: Always return cleanup fn: `return () => { mounted = false }`
- **Error/success states**: Separate `useState` for `loading`, `error`, `success` flags
  - Example: [UsersList.tsx](../src/admin/UsersList.tsx#L12-L15) has `deleting`, `deleteError`, `loadError`, `subscriptionsError`

### API integration
- Pattern: `axios.get<Type>(API_BASE_URL + '/endpoint')` with typed responses
- Error handling: Extract `error.response?.data?.message || error.message || 'fallback'`
- Endpoints:
  - `GET /users` → `User[]`
  - `GET /subscriptions/my-subscriptions/:userId` → `MySubscription[]`
  - `GET /subscriptions/plan` → `SubscriptionPlan`
  - `PUT /subscriptions/plan` (update), `POST /subscriptions/create` (create)
  - `DELETE /users/:userId`
  - `POST /one-c/qr/validate` (with `x-api-key` header)

### Custom hooks pattern
Two QRScanner hooks demonstrate extraction pattern:
- **[useCameraScanner.ts](../src/components/QRScanner/useCameraScanner.ts)**: Hardware interaction (camera, video, canvas). Uses refs for DOM, cleanup in `useEffect` return. Tries native `BarcodeDetector` API first, falls back to jsQR library.
- **[useQRValidation.ts](../src/components/QRScanner/useQRValidation.ts)**: API calls (fetch with headers, error handling). Parses JSON from QR, extracts `subId`, formats for backend.

When adding features with external dependencies or async logic, extract to custom hook following this pattern.

### Component structure
- **Small presentational components** in `src/admin/components/` or `src/components/` subdirs
  - [FeaturesList.tsx](../src/admin/components/FeaturesList.tsx): Controlled input with callbacks
  - [ModeToggle.tsx](../src/admin/components/ModeToggle.tsx), [StatusMessages.tsx](../src/admin/components/StatusMessages.tsx), [PlanInfo.tsx](../src/admin/components/PlanInfo.tsx)
- **Page components** in `src/admin/` or root of feature folder
  - Manage all state, handle API calls, compose smaller components
  - Colocate styles (e.g., `Admin.css` used by both UsersList and SubscriptionPlanEdit)

### TypeScript types
- **Shared types** in `src/types/`: [subscription.types.ts](../src/types/subscription.types.ts), [user.types.ts](../src/types/user.types.ts)
- Backend DTOs: `CreateUserDto`, `UpdateSubscriptionPlanDto`
- Const enums: `Gender` object with `as const` for type narrowing

### Forms
- Controlled inputs: `value={formData.field}` + `onChange={(e) => handleInputChange('field', e.target.value)}`
- Single `formData` state object (UpdateSubscriptionPlanDto) updated via helper fn
- Submit: `onSubmit={handleSubmit}` with `e.preventDefault()`, set loading/error/success flags
- Mode toggle: [SubscriptionPlanEdit.tsx](../src/admin/SubscriptionPlanEdit.tsx#L12) uses `'edit' | 'create'` mode state. Starts in edit, switches to create on 404.

## Workflows
```bash
npm run dev       # Vite dev server with HMR (http://localhost:5173)
npm run build     # tsc -b && vite build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

## Adding features
1. **New page**: Add route in [App.tsx](../src/App.tsx), create component in `src/admin/` or `src/components/`
2. **New API endpoint**: Update `API_BASE_URL` calls, add types to `src/types/`
3. **Reusable logic**: Extract to custom hook (see useCameraScanner/useQRValidation pattern)
4. **Styles**: Colocate CSS files, import at top of component (`import './Component.css'`)

## Known constraints
- No tests: Manual verification required
- No authentication: Assumes internal admin access
- Camera permission: QR scanner needs `getUserMedia` approval in browser
- No optimistic updates: UI waits for API responses before updating state

## When in doubt
- Check [UsersList.tsx](../src/admin/UsersList.tsx) for canonical async pattern (mounted flag, error handling)
- Check [SubscriptionPlanEdit.tsx](../src/admin/SubscriptionPlanEdit.tsx) for form/CRUD pattern
- Check [QRScanner/](../src/components/QRScanner/) for custom hook extraction and hardware API usage
