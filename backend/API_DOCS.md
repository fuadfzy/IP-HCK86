
# API Documentation

## Authentication

### Google OAuth
- `GET /auth/google` — Redirect to Google login
- `GET /auth/google/callback` — Google OAuth callback, returns JWT and user info

**All endpoints below require JWT in Authorization header:**
```
Authorization: Bearer <JWT>
```

---

## Menu Items
### Get all menu items
- `GET /menu-items`
	- **Response 200:**
		```json
		[
			{ "id": 1, "name": "Nasi Goreng", "price": 20000, "image_url": "..." },
			...
		]
		```
	- **Errors:**
		- `401/403/404` (unauthorized)
		- `500` (DB error)

---

## Tables
### Get all tables
- `GET /tables`
	- **Response 200:**
		```json
		[
			{ "id": 1, "qr_code": "TBL001" },
			...
		]
		```
	- **Errors:**
		- `401/403/404` (unauthorized)
		- `500` (DB error)

---

## Sessions
### Create session by QR code
- `POST /sessions`
	- **Body:**
		```json
		{ "qr_code": "TBL001" }
		```
	- **Response 201:**
		```json
		{ "id": 1, "table_id": 1, "started_at": "...", "expires_at": "..." }
		```
	- **Errors:**
		- `400` (qr_code required)
		- `404` (table not found)
		- `500` (DB error)

### Get session info
- `GET /sessions/:id`
	- **Response 200:**
		```json
		{ "id": 1, "table_id": 1, "started_at": "...", "expires_at": "..." }
		```
	- **Errors:**
		- `404` (not found)
		- `500` (DB error)

---

## Orders
### List orders by session or table
- `GET /orders?session_id=...` — List by session
- `GET /orders?table_id=...` — List by table
	- **Response 200:**
		```json
		[
			{
				"id": 1,
				"session_id": 1,
				"total": 40000,
				"status": "pending",
				"OrderItems": [
					{ "id": 1, "menu_item_id": 1, "quantity": 2, "total_price": 40000, "MenuItem": { ... } }
				]
			},
			...
		]
		```
	- **Errors:**
		- `401/403/404` (unauthorized)
		- `500` (DB error)

### Create new order
- `POST /orders`
	- **Body:**
		```json
		{ "session_id": 1, "items": [ { "menu_item_id": 1, "quantity": 2 } ] }
		```
	- **Response 201:**
		```json
		{ "order_id": 1, "total": 40000, "status": "pending" }
		```
	- **Errors:**
		- `400` (missing/invalid, items not array/empty)
		- `404` (session/menu not found)
		- `401` (session expired)
		- `500` (DB error)

### Get order details
- `GET /orders/:id`
	- **Response 200:**
		```json
		{
			"id": 1,
			"session_id": 1,
			"total": 40000,
			"status": "pending",
			"OrderItems": [ ... ]
		}
		```
	- **Errors:**
		- `404` (not found)
		- `500` (DB error)

---

## Order Items
### Update order item quantity
- `PATCH /order-items/:id`
	- **Body:**
		```json
		{ "quantity": 2 }
		```
	- **Response 200:**
		```json
		{ "id": 1, "order_id": 1, "menu_item_id": 1, "quantity": 2, "total_price": 40000 }
		```
	- **Errors:**
		- `400` (quantity < 1)
		- `404` (order item/order not found)
		- `403` (order paid)
		- `500` (DB error)

### Delete order item
- `DELETE /order-items/:id`
	- **Response 204:** (No Content)
	- **Errors:**
		- `404` (order item/order not found)
		- `403` (order paid)
		- `500` (DB error)

---

## Payments
### Create payment transaction
- `POST /payments`
	- **Body:**
		```json
		{ "order_id": 1 }
		```
	- **Response 200:**
		```json
		{ "token": "...", "redirect_url": "..." }
		```
	- **Errors:**
		- `400` (missing order_id)
		- `404` (order not found)
		- `500` (Midtrans error)

### Midtrans notification webhook
- `POST /payments/notification`
	- **Body:**
		```json
		{ "order_id": "ORDER-1-123", "transaction_status": "settlement" }
		```
	- **Response 200:**
		```text
		OK
		```
	- **Errors:**
		- `400` (invalid order_id)
		- `404` (order not found)
		- `500` (DB error)

---

## AI Recommendation
### Chat-based menu recommendation
- `POST /ai/chat`
	- **Body:**
		```json
		{ "messages": [ { "role": "user", "content": "Saya mau makan apa?" } ] }
		```
	- **Response 200:**
		```json
		{ "reply": [ { "name": "Nasi Goreng", "description": "...", "price": 20000, "imageUrl": "..." }, ... ] }
		```
	- **Errors:**
		- `400` (missing/invalid messages)
		- `500` (OpenAI error)

---

## Error Response Format
```json
{ "error": "Error message" }
```

---

## Notes
- Semua endpoint yang di-test sudah tercakup di sini.
- Semua error case dan edge case yang di-test juga sudah didokumentasikan.
- Untuk detail field, lihat juga README.md dan hasil response API asli.
