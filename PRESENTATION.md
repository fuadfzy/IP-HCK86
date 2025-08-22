# TableTalk Presentation Guide

This document is crafted for demo/presentation. It covers:
- API endpoints (what/why/protection)
- Frontend integration (where each endpoint is used)
- Redux implementation (definitions and usage across pages/components)

---

## 1) API Endpoints

Source: `backend/routes/*` and `backend/server.js`.

- Auth (Public)
  - GET `/auth/google` → initiates Google OAuth.
  - GET `/auth/google/callback` → backend issues JWT and redirects to frontend `/auth/callback?token=...&user=...`.

- Sessions (Public)
  - POST `/sessions` → body `{ qr_code }` → creates a 30-min table session.

- Menu (Protected: `Authorization: Bearer <JWT>`)
  - GET `/menu-items` → list menu items.

- Orders (Protected)
  - GET `/orders?session_id=optional` → list user’s orders (filtered by session if provided).
  - POST `/orders` → body `{ session_id, items: [{menu_item_id, quantity}] }` → creates order, status `pending`.
  - PUT `/orders/:id` → update items when order is `pending`.
  - DELETE `/orders/:id` → delete when order is `pending`.

- Payments
  - POST `/payments` (Protected) → body `{ order_id }` → returns Midtrans Snap `token`, `redirect_url`.
  - POST `/payments/notification` (Public) → Midtrans webhook; updates order status to `paid`/`pending`/`failed`.
  - GET `/payment/finish` (Public) → server redirects to frontend `/payment/finish`.
  - GET `/payment/unfinish` (Public) → server redirects to frontend `/payment/unfinish`.
  - GET `/payment/error` (Public) → server redirects to frontend `/payment/error`.

- AI (Protected)
  - POST `/ai/chat` → body `{ messages: [...] }` → returns `reply` (AI-text possibly with JSON menu).

Notes:
- Public routes do not require Authorization header.
- Protected routes require JWT via `Authorization: Bearer <token>`.
- `/payments/notification` must remain unauthenticated so Midtrans can call it.

---

## 2) Frontend Integration

- Env & Auth
  - Base URL from `import.meta.env.VITE_API_URL` (fallback `http://localhost:3001`).
  - After Google OAuth, backend redirects to `/auth/callback` with `token` and serialized `user`.
  - `src/pages/AuthCallback.jsx` stores them to `localStorage` and navigates user to `/choice`.

- QR Session
  - `src/pages/QRSessionPage.jsx` → POST `/sessions` with `{ qr_code }` after scanning/landing on `/session/:tableCode`.
  - Saves `sessionId` to `localStorage` for persistence across OAuth redirects.
  - `LoginPage.jsx` also persists `sessionId` when coming via navigation state.

- Orders
  - `src/pages/PaymentPage.jsx`
    - If creating a new order: POST `/orders` with `{ session_id, items }` (built from cart).
    - Then POST `/payments` with `{ order_id }` to obtain Midtrans Snap `token`.
    - Calls `window.snap.pay(token, { onSuccess, onPending, onError, onClose })`.
  - `src/pages/OrderHistoryPage.jsx` fetches orders via Redux thunk: GET `/orders?session_id=<localStorage.sessionId>`.
  - `src/pages/CartPage.jsx` updates pending orders via Redux thunk: PUT `/orders/:id`.

- Payments & Status
  - Snap callbacks in `PaymentPage.jsx`:
    - `onSuccess` → navigate `/payment/success`, clear `sessionId` and chat cache.
    - `onPending` → show pending warning; order remains `pending` until webhook updates it.
    - `onError` → navigate `/payment/error`.
    - `onClose` → navigate `/choice` with a message; order stays `pending`.
  - Backend webhook `/payments/notification` updates order to `paid|pending|failed`.
  - `OrderHistoryPage.jsx` auto-refreshes every 5s to reflect updates.

- AI Assistant
  - `src/pages/ChatPage.jsx` → POST `/ai/chat` and renders the reply.

---

## 3) Redux Implementation (Detailed)

- Store
  - File: `src/store/store.js`
  - Setup:
    ```js
    import { configureStore } from '@reduxjs/toolkit';
    import orderReducer from '../features/orders/orderSlice';

    export const store = configureStore({
      reducer: { orders: orderReducer },
    });
    ```

- Slice & Thunks
  - File: `src/features/orders/orderSlice.js`
  - State shape:
    ```js
    {
      list: [],        // orders array
      loading: false,  // global loading flag for orders operations
      error: null,     // last error message
      lastAction: null // semantic marker: 'fetch_success'|'update_error'|...
    }
    ```
  - Thunks (all attach JWT from `localStorage.token`):
    - `fetchOrders(sessionId?)` → GET `/orders` (optionally `?session_id=`) → fills `list`.
    - `createOrder(orderData)` → POST `/orders` → returns new order meta.
    - `updateOrder({ orderId, orderData })` → PUT `/orders/:id` → updates item details.
    - `deleteOrder(orderId)` → DELETE `/orders/:id` → removes from `list`.
  - Reducers:
    - `clearError()` and `clearLastAction()` for UI cleanup.
  - Extra reducers handle pending/fulfilled/rejected to update `loading`, `error`, `list`, and `lastAction` consistently.

- Usage in Pages/Components
  - Provider: `src/App.jsx` wraps routes in `<Provider store={store}>`.
  - Order listing: `src/pages/OrderHistoryPage.jsx`
    - `useSelector((s) => s.orders)` to read slice state.
    - `useEffect(() => dispatch(fetchOrders(sessionId)), [sessionId])` + 5s interval refresh.
    - Shows modals based on `lastAction` and `error`.
  - Order editing: `src/pages/CartPage.jsx`
    - Dispatches `updateOrder({ orderId, orderData })` when saving edits.
    - Uses `useSelector` to show `loading`/`error` and feedback via `CustomModal`.
  - Payment: `src/pages/PaymentPage.jsx`
    - Currently posts order via `fetch` then requests payment token. Could switch to `dispatch(createOrder(...)).unwrap()` for uniform Redux handling if desired.

- Error modes & UX
  - If JWT invalid/expired: server responds 401/403; UI can redirect to `/login`.
  - Edits/deletes on non-`pending` orders are rejected server-side; Redux stores `error` and UI shows modal.
  - Network failures set `error` and `lastAction` to `*_error`; UI displays retry guidance.

---

## Quick Demo Script

- Scan QR → `QRSessionPage.jsx` creates session, stores `sessionId`.
- Login with Google → `AuthCallback.jsx` stores token/user, routes to `/choice`.
- Browse menu or use AI → add to cart → go to cart.
- Pay: `PaymentPage.jsx` creates order → requests Snap token → opens popup.
- Close/Success/Error flows handled by Snap callbacks; webhook finalizes status.
- View `OrderHistoryPage.jsx` to see status updates in near real-time.

---

## 4) Google Auth Flow (End-to-End)

- Start: User clicks Login → hits backend `GET /auth/google`.
- Callback: `GET /auth/google/callback` issues JWT and redirects to frontend `/auth/callback?token=...&user=...`.
- Frontend handler: `src/pages/AuthCallback.jsx` parses token/user, stores in `localStorage`, then navigates to `/choice` while preserving any existing `sessionId`.
- Protection: All protected requests attach `Authorization: Bearer <token>`.

Notes for demo:
- If token missing/expired, protected calls 401/403; UI can route back to `/login`.

## 5) QR Scanning Modes

- In-app camera scan: `src/components/QRScanner.jsx` uses `qr-scanner` to read codes.
  - If scanned data is a full URL → redirect immediately to that URL.
  - If scanned data is a table code (e.g., `TBL-005`) → call `onScan(tableNumber)` and route to `/session/:tableCode`.
- Direct URL scan: Users can scan the external QR code using default camera → opens `https://tabletalk-2025.web.app/session/TBL-005` directly.

## 6) Session Lifecycle

- Creation: `QRSessionPage.jsx` POST `/sessions` with `{ qr_code }` → receives `sessionId` (30-min expiry).
- Persistence across OAuth: `LoginPage.jsx` and `AuthCallback.jsx` copy `sessionId` into `localStorage` so it survives Google redirects.
- Usage: `PaymentPage.jsx`, `OrderHistoryPage.jsx`, and others read `sessionId` from state/localStorage to scope orders.
- Cleanup: On successful payment, `PaymentPage.jsx` clears `sessionId` and any ephemeral caches.

## 7) Midtrans Status & Redirects

- Token: `POST /payments` returns Snap token; frontend calls `window.snap.pay(token, callbacks)`.
- Webhook: Midtrans `POST /payments/notification` updates order status to `paid | pending | failed` based on `transaction_status`.
- User redirects: Midtrans may open `/payment/finish | /payment/unfinish | /payment/error` on backend, which immediately forward to frontend `/payment/*` pages.
- UX mapping in `PaymentPage.jsx` callbacks:
  - onSuccess → navigate `/payment/success` and clear session.
  - onPending → show pending; wait for webhook to finalize.
  - onError → navigate `/payment/error`.
  - onClose → return to `/choice`; order remains pending.

Production note:
- Backend redirects now point to `FRONTEND_URL` (env) or `https://tabletalk-2025.web.app` by default.
