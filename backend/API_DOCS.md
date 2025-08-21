
# Tabletalk API Documentation

## Authentication

### Google OAuth
- `GET /auth/google` — Redirect to Google OAuth login
- `GET /auth/google/callback` — Google OAuth callback, redirects with JWT token

**All endpoints below require JWT in Authorization header:**
```
Authorization: Bearer <JWT>
```

**Error Responses:**
- `401` — Authorization header missing or malformed
- `403` — Invalid or expired token

---

## Menu Items

### Get all menu items
- `GET /menu-items`
	- **Requires:** Authentication
	- **Response 200:**
		```json
		[
			{ "id": 1, "name": "Nasi Goreng", "price": "20000", "image_url": "..." },
			{ "id": 2, "name": "Mie Ayam", "price": "15000", "image_url": "..." }
		]
		```
	- **Errors:**
		- `401` — No authorization header
		- `403` — Invalid token
		- `500` — Database error

---

## Sessions

### Create session by QR code
- `POST /sessions`
	- **Body:**
		```json
		{ "qr_code": "TEST-QR-001" }
		```
	- **Response 201:**
		```json
		{ "id": 1, "table_id": 1, "started_at": "2024-01-01T00:00:00.000Z", "expires_at": "2024-01-01T01:00:00.000Z" }
		```
	- **Errors:**
		- `400` — qr_code is required
		- `404` — Table not found for this QR code
		- `500` — Database error

---

## Orders

### List user orders
- `GET /orders`
	- **Requires:** Authentication (only returns user's orders)
	- **Query Parameters:** `session_id` (optional)
	- **Response 200:**
		```json
		[
			{
				"id": 1,
				"session_id": 1,
				"user_id": 1,
				"total": "20000",
				"status": "pending",
				"OrderItems": [
					{
						"id": 1,
						"order_id": 1,
						"menu_item_id": 1,
						"quantity": 1,
						"total_price": "20000",
						"MenuItem": { "id": 1, "name": "Nasi Goreng", "price": "20000", "image_url": "..." }
					}
				]
			}
		]
		```
	- **Errors:**
		- `401/403` — Authentication required
		- `500` — Database error

### Create new order
- `POST /orders`
	- **Requires:** Authentication
	- **Body:**
		```json
		{ 
			"session_id": 1, 
			"items": [
				{ "menu_item_id": 1, "quantity": 2 }
			]
		}
		```
	- **Response 201:**
		```json
		{ "order_id": 1, "total": 40000, "status": "pending" }
		```
	- **Errors:**
		- `400` — session_id and items are required / items must be non-empty array
		- `401` — Session expired. Please scan your table QR code again
		- `404` — Session not found / Menu item not found
		- `500` — Database error

### Update existing order
- `PUT /orders/:id`
	- **Requires:** Authentication (owner only)
	- **Body:**
		```json
		{ 
			"items": [
				{ "menu_item_id": 1, "quantity": 3 }
			]
		}
		```
	- **Response 200:**
		```json
		{ "message": "Order updated successfully", "order_id": 1, "total": 60000, "status": "pending" }
		```
	- **Errors:**
		- `400` — items are required / Cannot edit order with status: paid
		- `404` — Order not found / Menu item not found
		- `500` — Database error

### Delete order
- `DELETE /orders/:id`
	- **Requires:** Authentication (owner only)
	- **Response 204:** No Content
	- **Errors:**
		- `400` — Cannot delete order with status: paid/failed
		- `404` — Order not found
		- `500` — Database error

---

## Payments

### Create payment transaction
- `POST /payments`
	- **Requires:** Authentication
	- **Body:**
		```json
		{ "order_id": 1 }
		```
	- **Response 200:**
		```json
		{ "token": "midtrans-token", "redirect_url": "https://app.sandbox.midtrans.com/..." }
		```
	- **Errors:**
		- `400` — order_id is required / Order is already paid or failed
		- `404` — Order not found
		- `500` — Failed to create payment transaction

### Payment notification webhook (Midtrans)
- `POST /payments/notification`
	- **Public endpoint** (no authentication)
	- **Body:**
		```json
		{ 
			"order_id": "ORDER-1-1640995200000", 
			"transaction_status": "settlement",
			"payment_type": "bank_transfer"
		}
		```
	- **Response 200:** `OK` (text)
	- **Transaction Status Mapping:**
		- `settlement`, `capture` → `paid`
		- `pending` → `pending`
		- `deny`, `cancel`, `expire`, `failure` → `failed`
	- **Errors:**
		- `400` — Invalid order_id (returns "Invalid order_id")
		- `500` — Database error (returns "Error processing notification")

### Payment redirect pages
- `GET /payment/finish` — Payment success page (HTML)
- `GET /payment/unfinish` — Payment pending page (HTML)  
- `GET /payment/error` — Payment error page (HTML)

---

## AI Chat

### Menu recommendation chat
- `POST /ai/chat`
	- **Requires:** Authentication
	- **Body:**
		```json
		{ 
			"messages": [
				{ "role": "user", "content": "Saya mau makan apa?" }
			]
		}
		```
	- **Response 200:**
		```json
		{ "reply": "Selamat datang di Tabletalk! Saya siap membantu, mau pesan makanan atau minuman?" }
		```
	- **Errors:**
		- `400` — messages array is required
		- `401/403` — Authentication required
		- `500` — Failed to get AI chat

---

## Error Handling

### Common Error Scenarios
- **Expired sessions:** `401` — Session expired. Please scan your table QR code again
- **Malformed JWT:** `403` — Invalid or expired token
- **Missing Authorization:** `401` — Authorization header missing or malformed
- **Database errors:** `500` — Failed to [action]

### Error Response Format
```json
{ "error": "Error message" }
```

---

## Notes

### Order Status Flow
1. `pending` — Order created, awaiting payment
2. `paid` — Payment successful (cannot be edited/deleted)
3. `failed` — Payment failed (cannot be edited/deleted)

### Authentication
- All routes except `/auth/*`, `/sessions`, and `/payments/notification` require JWT
- Orders are user-scoped (users can only access their own orders)
- Sessions are not user-scoped (anyone can create with valid QR code)

### Payment Integration
- Uses Midtrans Sandbox for payment processing
- Order IDs in Midtrans format: `ORDER-{order_id}-{timestamp}`
- Webhook endpoint is unprotected as required by Midtrans
