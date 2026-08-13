# HurngMoto REST API Documentation

**Project:** HurngMoto — Motorcycle Repair Shop Management System  
**API Version:** v1  
**Base URL:** `/api/v1`  
**Database:** PostgreSQL + Prisma  
**Authentication:** JWT Access Token + HttpOnly Refresh Token Cookie

---

## 1. API Conventions

### Authentication Headers

Protected routes:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Refresh-token routes (`/auth/refresh`, `/auth/logout`) use the HttpOnly cookie:

```http
Cookie: refreshToken=<refresh_token>
```

Frontend Axios should use `withCredentials: true`.

### Roles

| Role | Access |
|---|---|
| `ADMIN` | Full shop management |
| `STAFF` | POS, daily sales, own performance, read catalog |
| `MEMBER` | Own profile, motorcycles, spending/order history |
| `PUBLIC` | No authentication |

### Standard success

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

### Standard error

```json
{
  "success": false,
  "message": "Error message.",
  "error": "ERROR_CODE"
}
```

### Common status codes

| Code | Meaning |
|---:|---|
| `200` | Success |
| `201` | Created |
| `400` | Validation / bad request |
| `401` | Authentication required / invalid token |
| `403` | Role not permitted |
| `404` | Resource not found |
| `409` | Conflict / duplicate |
| `422` | Business rule failed |
| `429` | Too many requests |
| `500` | Internal server error |

---

# 2. Authentication API

## 2.1 `POST /auth/register`

**Access:** PUBLIC  
**Auth:** None

### Request
```json
{
  "firstName": "Win",
  "lastName": "Sai",
  "email": "win@example.com",
  "password": "StrongPassword123!"
}
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Verification code sent to your email.",
  "data": {
    "email": "win@example.com",
    "expiresIn": 300
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid registration data. | `VALIDATION_ERROR` |
| `400` | Please enter a valid email domain. | `INVALID_EMAIL_DOMAIN` |
| `409` | An account with this email already exists. | `EMAIL_ALREADY_EXISTS` |
| `429` | Please wait before requesting another verification code. | `OTP_RATE_LIMITED` |
| `500` | Unable to send verification email. | `EMAIL_SEND_FAILED` |

---

## 2.2 `POST /auth/verify-email`

**Access:** PUBLIC  
**Auth:** None

### Request
```json
{
  "email": "win@example.com",
  "otp": "428193"
}
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Email verified and account created successfully.",
  "data": {
    "user": {
      "id": 12,
      "firstName": "Win",
      "lastName": "Sai",
      "email": "win@example.com",
      "role": "MEMBER",
      "emailVerifiedAt": "2026-08-13T14:10:00.000Z"
    }
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Verification code is invalid. | `INVALID_OTP` |
| `400` | Verification code has expired. | `OTP_EXPIRED` |
| `404` | Pending registration was not found. | `PENDING_REGISTRATION_NOT_FOUND` |
| `429` | Too many incorrect verification attempts. | `OTP_ATTEMPTS_EXCEEDED` |
| `409` | User account already exists. | `USER_ALREADY_EXISTS` |

---

## 2.3 `POST /auth/resend-otp`

**Access:** PUBLIC  
**Auth:** None

### Request
```json
{ "email": "win@example.com" }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "A new verification code has been sent.",
  "data": { "expiresIn": 300 }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `404` | Pending registration was not found. | `PENDING_REGISTRATION_NOT_FOUND` |
| `429` | Please wait before requesting another code. | `OTP_RATE_LIMITED` |
| `500` | Unable to send verification email. | `EMAIL_SEND_FAILED` |

---

## 2.4 `POST /auth/login`

**Access:** PUBLIC  
**Auth:** None

### Request
```json
{
  "email": "win@example.com",
  "password": "StrongPassword123!"
}
```

### Success — `200 OK`
Sets HttpOnly refresh-token cookie.

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "accessToken": "<jwt-access-token>",
    "user": {
      "id": 12,
      "firstName": "Win",
      "lastName": "Sai",
      "email": "win@example.com",
      "role": "MEMBER"
    }
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Email and password are required. | `VALIDATION_ERROR` |
| `401` | Invalid email or password. | `INVALID_CREDENTIALS` |
| `403` | Your account is inactive. | `ACCOUNT_INACTIVE` |
| `403` | Please verify your email first. | `EMAIL_NOT_VERIFIED` |

---

## 2.5 `POST /auth/refresh`

**Access:** Session  
**Auth:** HttpOnly `refreshToken` cookie

### Request
No JSON body.

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Access token refreshed.",
  "data": { "accessToken": "<new-access-token>" }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Refresh token is missing. | `REFRESH_TOKEN_MISSING` |
| `401` | Session is invalid or revoked. | `SESSION_INVALID` |
| `401` | Refresh token has expired. | `REFRESH_TOKEN_EXPIRED` |

---

## 2.6 `POST /auth/logout`

**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token + refresh-token cookie

### Success — `200 OK`
Revokes matching `AuthSession` and clears refresh-token cookie.

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `401` | Session is invalid. | `SESSION_INVALID` |

---

## 2.7 `GET /auth/me`

**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Authenticated user retrieved.",
  "data": {
    "id": 12,
    "firstName": "Win",
    "lastName": "Sai",
    "email": "win@example.com",
    "phone": null,
    "role": "MEMBER",
    "isActive": true,
    "emailVerifiedAt": "2026-08-13T14:10:00.000Z"
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `404` | User was not found. | `USER_NOT_FOUND` |

---

# 3. User / Profile / Staff API

## 3.1 `GET /users/me`

**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": 12,
    "firstName": "Win",
    "lastName": "Sai",
    "email": "win@example.com",
    "phone": null,
    "role": "MEMBER",
    "isActive": true,
    "userInfo": { "photoUrl": null }
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `404` | User was not found. | `USER_NOT_FOUND` |

---

## 3.2 `PATCH /users/me`

**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Request
```json
{
  "firstName": "Win",
  "lastName": "Sai"
}
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": 12,
    "firstName": "Win",
    "lastName": "Sai"
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid profile data. | `VALIDATION_ERROR` |
| `401` | Authentication required. | `UNAUTHORIZED` |

---

## 3.3 `GET /users/me/info`

**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "User information retrieved.",
  "data": {
    "id": 3,
    "userId": 12,
    "photoUrl": "https://example.com/profile.jpg"
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `404` | User information was not found. | `USER_INFO_NOT_FOUND` |

---

## 3.4 `PATCH /users/me/info`

**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Request
```json
{ "photoUrl": "https://example.com/profile.jpg" }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "User information updated.",
  "data": {
    "userId": 12,
    "photoUrl": "https://example.com/profile.jpg"
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid user information. | `VALIDATION_ERROR` |
| `401` | Authentication required. | `UNAUTHORIZED` |

---

## 3.5 `GET /users/me/motors`

**Access:** MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycles retrieved successfully.",
  "data": [
    {
      "id": 21,
      "motor": {
        "id": 5,
        "model": "Click 160",
        "type": "AUTOMATIC",
        "motorBrand": { "id": 1, "name": "Honda" }
      }
    }
  ]
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `403` | Member access required. | `FORBIDDEN` |

---

## 3.6 `POST /users/me/motors`

**Access:** MEMBER  
**Auth:** Bearer access token

### Request
```json
{ "motorId": 5 }
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Motorcycle added to your profile.",
  "data": { "id": 21, "userId": 12, "motorId": 5 }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Motor ID is required. | `VALIDATION_ERROR` |
| `403` | Member access required. | `FORBIDDEN` |
| `404` | Motorcycle model was not found. | `MOTOR_NOT_FOUND` |
| `409` | This motorcycle is already in your profile. | `USER_MOTOR_EXISTS` |

---

## 3.7 `DELETE /users/me/motors/:userMotorId`

**Access:** MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycle removed from your profile.",
  "data": null
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `403` | You cannot remove another user's motorcycle. | `FORBIDDEN` |
| `404` | User motorcycle was not found. | `USER_MOTOR_NOT_FOUND` |

---

## 3.8 `GET /users`

**Access:** ADMIN  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/users?role=MEMBER&isActive=true&page=1&limit=20
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": {
    "items": [
      {
        "id": 12,
        "firstName": "Win",
        "lastName": "Sai",
        "email": "win@example.com",
        "role": "MEMBER",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 124,
      "totalPages": 7
    }
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `403` | Admin access required. | `FORBIDDEN` |

---

## 3.9 `GET /users/:id`

**Access:** ADMIN  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "User retrieved successfully.",
  "data": {
    "id": 12,
    "firstName": "Win",
    "lastName": "Sai",
    "email": "win@example.com",
    "role": "MEMBER",
    "isActive": true,
    "userInfo": { "photoUrl": null },
    "userMotors": []
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | User was not found. | `USER_NOT_FOUND` |

---

## 3.10 `PATCH /users/:id/status`

**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "isActive": false }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "User status updated successfully.",
  "data": { "id": 12, "isActive": false }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid status value. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | User was not found. | `USER_NOT_FOUND` |

---

## 3.11 `PATCH /users/:id/role`

**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "role": "STAFF" }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "User role updated successfully.",
  "data": { "id": 12, "role": "STAFF" }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid role. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | User was not found. | `USER_NOT_FOUND` |

---

# 4. Motor Brand API

## 4.1 `GET /motor-brands`
**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motor brands retrieved.",
  "data": [{ "id": 1, "name": "Honda", "isActive": true }]
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |

---

## 4.2 `POST /motor-brands`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "name": "Honda" }
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Motor brand created.",
  "data": { "id": 1, "name": "Honda", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Brand name is required. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `409` | Motor brand already exists. | `MOTOR_BRAND_EXISTS` |

---

## 4.3 `GET /motor-brands/:id`
**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motor brand retrieved.",
  "data": { "id": 1, "name": "Honda", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `404` | Motor brand was not found. | `MOTOR_BRAND_NOT_FOUND` |

---

## 4.4 `PATCH /motor-brands/:id`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "name": "Honda Motorcycle", "isActive": true }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motor brand updated.",
  "data": { "id": 1, "name": "Honda Motorcycle", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Motor brand was not found. | `MOTOR_BRAND_NOT_FOUND` |
| `409` | Brand name is already in use. | `MOTOR_BRAND_EXISTS` |

---

## 4.5 `DELETE /motor-brands/:id`
**Access:** ADMIN  
**Auth:** Bearer access token  
**Behavior:** Soft delete (`isActive = false`)

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motor brand deactivated.",
  "data": { "id": 1, "isActive": false }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Motor brand was not found. | `MOTOR_BRAND_NOT_FOUND` |

---

# 5. Motor API

## 5.1 `GET /motors`
**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/motors?brandId=1&isActive=true
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycles retrieved.",
  "data": [
    {
      "id": 5,
      "model": "Click 160",
      "type": "AUTOMATIC",
      "isActive": true,
      "motorBrand": { "id": 1, "name": "Honda" }
    }
  ]
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |

---

## 5.2 `POST /motors`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{
  "motorBrandId": 1,
  "model": "Click 160",
  "type": "AUTOMATIC"
}
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Motorcycle model created.",
  "data": {
    "id": 5,
    "motorBrandId": 1,
    "model": "Click 160",
    "type": "AUTOMATIC",
    "isActive": true
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid motorcycle data. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Motor brand was not found. | `MOTOR_BRAND_NOT_FOUND` |
| `409` | This model already exists for the selected brand. | `MOTOR_EXISTS` |

---

## 5.3 `GET /motors/:id`
**Access:** ADMIN, STAFF, MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycle retrieved.",
  "data": {
    "id": 5,
    "model": "Click 160",
    "type": "AUTOMATIC",
    "motorBrand": { "id": 1, "name": "Honda" }
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `404` | Motorcycle model was not found. | `MOTOR_NOT_FOUND` |

---

## 5.4 `PATCH /motors/:id`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "model": "Click 160 ABS", "type": "AUTOMATIC", "isActive": true }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycle model updated.",
  "data": { "id": 5, "model": "Click 160 ABS", "type": "AUTOMATIC", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Motorcycle model was not found. | `MOTOR_NOT_FOUND` |
| `409` | Motorcycle model already exists. | `MOTOR_EXISTS` |

---

## 5.5 `DELETE /motors/:id`
**Access:** ADMIN  
**Auth:** Bearer access token  
**Behavior:** Soft delete

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycle model deactivated.",
  "data": { "id": 5, "isActive": false }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Motorcycle model was not found. | `MOTOR_NOT_FOUND` |

---

# 6. Product Category API

## 6.1 `GET /product-categories`
**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product categories retrieved.",
  "data": [{ "id": 1, "name": "Tires", "isActive": true }]
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |

---

## 6.2 `POST /product-categories`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "name": "Tires" }
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Product category created.",
  "data": { "id": 1, "name": "Tires", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Category name is required. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `409` | Product category already exists. | `PRODUCT_CATEGORY_EXISTS` |

---

## 6.3 `GET /product-categories/:id`
**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product category retrieved.",
  "data": { "id": 1, "name": "Tires", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |
| `404` | Product category was not found. | `PRODUCT_CATEGORY_NOT_FOUND` |

---

## 6.4 `PATCH /product-categories/:id`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "name": "Motorcycle Tires", "isActive": true }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product category updated.",
  "data": { "id": 1, "name": "Motorcycle Tires", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Product category was not found. | `PRODUCT_CATEGORY_NOT_FOUND` |
| `409` | Category name already exists. | `PRODUCT_CATEGORY_EXISTS` |

---

## 6.5 `DELETE /product-categories/:id`
**Access:** ADMIN  
**Auth:** Bearer access token  
**Behavior:** Soft delete

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product category deactivated.",
  "data": { "id": 1, "isActive": false }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Product category was not found. | `PRODUCT_CATEGORY_NOT_FOUND` |

---

# 7. Product / Inventory API

## 7.1 `GET /products`
**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/products?categoryId=1&search=Michelin&isActive=true
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Products retrieved.",
  "data": [
    {
      "id": 23,
      "sku": "TIRE-001",
      "name": "Michelin City Grip 2",
      "sellingPrice": "1950.00",
      "stockQuantity": 10,
      "unit": "piece",
      "isActive": true
    }
  ]
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |

---

## 7.2 `POST /products`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{
  "productCategoryId": 1,
  "sku": "TIRE-001",
  "name": "Michelin City Grip 2",
  "description": "Scooter tire",
  "costPrice": 1500,
  "sellingPrice": 1950,
  "stockQuantity": 10,
  "unit": "piece"
}
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Product created.",
  "data": {
    "id": 23,
    "sku": "TIRE-001",
    "name": "Michelin City Grip 2",
    "sellingPrice": "1950.00",
    "stockQuantity": 10
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid product data. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Product category was not found. | `PRODUCT_CATEGORY_NOT_FOUND` |
| `409` | SKU already exists. | `SKU_EXISTS` |

---

## 7.3 `GET /products/:id`
**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product retrieved.",
  "data": {
    "id": 23,
    "sku": "TIRE-001",
    "name": "Michelin City Grip 2",
    "description": "Scooter tire",
    "costPrice": "1500.00",
    "sellingPrice": "1950.00",
    "stockQuantity": 10,
    "unit": "piece"
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |
| `404` | Product was not found. | `PRODUCT_NOT_FOUND` |

---

## 7.4 `PATCH /products/:id`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "sellingPrice": 2050, "description": "Updated description", "isActive": true }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product updated.",
  "data": { "id": 23, "sellingPrice": "2050.00", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid product data. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Product was not found. | `PRODUCT_NOT_FOUND` |
| `409` | SKU already exists. | `SKU_EXISTS` |

---

## 7.5 `DELETE /products/:id`
**Access:** ADMIN  
**Auth:** Bearer access token  
**Behavior:** Soft delete

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product deactivated.",
  "data": { "id": 23, "isActive": false }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Product was not found. | `PRODUCT_NOT_FOUND` |

---

## 7.6 `PATCH /products/:id/stock`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "quantity": 15 }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product stock updated.",
  "data": { "id": 23, "stockQuantity": 15 }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Stock quantity must be zero or greater. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Product was not found. | `PRODUCT_NOT_FOUND` |

---

# 8. Service API

## 8.1 `GET /services`
**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Services retrieved.",
  "data": [
    {
      "id": 4,
      "name": "Tire Installation",
      "description": "Install motorcycle tire",
      "price": "180.00",
      "isActive": true
    }
  ]
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |

---

## 8.2 `POST /services`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{
  "name": "Tire Installation",
  "description": "Install motorcycle tire",
  "price": 180
}
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Service created.",
  "data": { "id": 4, "name": "Tire Installation", "price": "180.00", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid service data. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `409` | Service name already exists. | `SERVICE_EXISTS` |

---

## 8.3 `GET /services/:id`
**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Service retrieved.",
  "data": {
    "id": 4,
    "name": "Tire Installation",
    "description": "Install motorcycle tire",
    "price": "180.00"
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |
| `404` | Service was not found. | `SERVICE_NOT_FOUND` |

---

## 8.4 `PATCH /services/:id`
**Access:** ADMIN  
**Auth:** Bearer access token

### Request
```json
{ "price": 200, "isActive": true }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Service updated.",
  "data": { "id": 4, "price": "200.00", "isActive": true }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid service data. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Service was not found. | `SERVICE_NOT_FOUND` |
| `409` | Service name already exists. | `SERVICE_EXISTS` |

---

## 8.5 `DELETE /services/:id`
**Access:** ADMIN  
**Auth:** Bearer access token  
**Behavior:** Soft delete

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Service deactivated.",
  "data": { "id": 4, "isActive": false }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Admin access required. | `FORBIDDEN` |
| `404` | Service was not found. | `SERVICE_NOT_FOUND` |

---

# 9. Order / POS API

## 9.1 `POST /orders`

**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

The backend must calculate `handledById`, prices, totals, and discounts from trusted database/authentication data.

### Guest Request
```json
{
  "customerType": "GUEST",
  "motorId": 3,
  "items": [
    { "itemType": "PRODUCT", "productId": 8, "quantity": 2 },
    { "itemType": "SERVICE", "serviceId": 4, "quantity": 1 }
  ]
}
```

### Member Request
```json
{
  "customerType": "MEMBER",
  "memberId": 12,
  "motorId": 3,
  "items": [
    { "itemType": "PRODUCT", "productId": 8, "quantity": 1 }
  ]
}
```

### Success — `201 Created`
```json
{
  "success": true,
  "message": "Sale completed successfully.",
  "data": {
    "id": 101,
    "orderNumber": "HM-000101",
    "customerType": "MEMBER",
    "subtotal": "1950.00",
    "discountRate": "10.00",
    "discountAmount": "195.00",
    "finalTotal": "1755.00",
    "status": "COMPLETED",
    "handledBy": { "id": 7, "firstName": "Myo" },
    "items": [
      {
        "itemNameSnapshot": "Michelin City Grip 2",
        "quantity": 1,
        "unitPrice": "1950.00",
        "lineTotal": "1950.00"
      }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Order must contain at least one item. | `EMPTY_ORDER` |
| `400` | Invalid order item. | `VALIDATION_ERROR` |
| `403` | Staff or admin access required. | `FORBIDDEN` |
| `404` | Member was not found. | `MEMBER_NOT_FOUND` |
| `404` | Product was not found. | `PRODUCT_NOT_FOUND` |
| `404` | Service was not found. | `SERVICE_NOT_FOUND` |
| `409` | Product does not have enough stock. | `INSUFFICIENT_STOCK` |
| `422` | MEMBER customer type requires a valid member. | `INVALID_CUSTOMER_TYPE` |
| `500` | Sale could not be completed. | `ORDER_TRANSACTION_FAILED` |

---

## 9.2 `GET /orders`

**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

**Role behavior:** ADMIN can view all orders. STAFF should normally see allowed daily/own sales according to your controller policy.

### Example
```http
GET /api/v1/orders?status=COMPLETED&from=2026-08-13&to=2026-08-13
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Orders retrieved.",
  "data": {
    "items": [
      {
        "id": 101,
        "orderNumber": "HM-000101",
        "customerType": "MEMBER",
        "finalTotal": "1755.00",
        "status": "COMPLETED",
        "createdAt": "2026-08-13T13:40:00.000Z"
      }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | Staff or admin access required. | `FORBIDDEN` |
| `400` | Invalid filter parameters. | `VALIDATION_ERROR` |

---

## 9.3 `GET /orders/:id`

**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Order retrieved.",
  "data": {
    "id": 101,
    "orderNumber": "HM-000101",
    "subtotal": "1950.00",
    "discountAmount": "195.00",
    "finalTotal": "1755.00",
    "status": "COMPLETED",
    "member": { "id": 12, "firstName": "Win" },
    "items": []
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `403` | You are not allowed to view this order. | `FORBIDDEN` |
| `404` | Order was not found. | `ORDER_NOT_FOUND` |

---

## 9.4 `PATCH /orders/:id/status`

**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

### Request
```json
{ "status": "CANCELLED" }
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Order status updated.",
  "data": { "id": 101, "status": "CANCELLED" }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid order status. | `VALIDATION_ERROR` |
| `403` | You cannot update this order. | `FORBIDDEN` |
| `404` | Order was not found. | `ORDER_NOT_FOUND` |
| `422` | This order cannot transition to the requested status. | `INVALID_STATUS_TRANSITION` |

---

## 9.5 `GET /orders/my`

**Access:** MEMBER  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Order history retrieved.",
  "data": {
    "summary": {
      "totalOrders": 14,
      "totalSpent": "18450.00"
    },
    "orders": [
      {
        "id": 101,
        "orderNumber": "HM-000101",
        "finalTotal": "1755.00",
        "createdAt": "2026-08-13T13:40:00.000Z"
      }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `401` | Authentication required. | `UNAUTHORIZED` |
| `403` | Member access required. | `FORBIDDEN` |

---

# 10. Reports / Analytics API

## 10.1 `GET /reports/dashboard`

**Access:** ADMIN  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/reports/dashboard?range=today
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Dashboard report generated.",
  "data": {
    "revenue": 24860,
    "orders": 42,
    "productsSold": 38,
    "servicesSold": 28,
    "memberOrders": 14,
    "guestOrders": 28,
    "lowStockProducts": 6
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid report range. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |

---

## 10.2 `GET /reports/sales`

**Access:** ADMIN  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/reports/sales?from=2026-08-01&to=2026-08-13
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Sales report generated.",
  "data": {
    "totalRevenue": 186400,
    "totalOrders": 314,
    "averageOrderValue": 593.63,
    "memberRevenue": 72400,
    "guestRevenue": 114000
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid date range. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |

---

## 10.3 `GET /reports/products`

**Access:** ADMIN  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/reports/products?range=30d
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Product report generated.",
  "data": {
    "topProducts": [
      {
        "productId": 8,
        "name": "Michelin City Grip 2",
        "quantitySold": 48,
        "revenue": 93600
      }
    ],
    "lowStock": [
      { "productId": 14, "name": "Brake Pad", "stockQuantity": 4 }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid report filter. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |

---

## 10.4 `GET /reports/services`

**Access:** ADMIN  
**Auth:** Bearer access token

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Service report generated.",
  "data": {
    "topServices": [
      {
        "serviceId": 4,
        "name": "Tire Installation",
        "timesSold": 74,
        "revenue": 13320
      }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid report filter. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |

---

## 10.5 `GET /reports/staff`

**Access:** ADMIN, STAFF  
**Auth:** Bearer access token

**Role behavior:** ADMIN may request any staff user using `staffId`. STAFF receives only their own report.

### Example
```http
GET /api/v1/reports/staff?staffId=7&range=7d
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Staff performance report generated.",
  "data": {
    "staff": { "id": 7, "firstName": "Myo" },
    "ordersHandled": 61,
    "revenueHandled": 39400
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid report range. | `VALIDATION_ERROR` |
| `403` | Staff or admin access required. | `FORBIDDEN` |
| `404` | Staff user was not found. | `STAFF_NOT_FOUND` |

---

## 10.6 `GET /reports/motorcycles`

**Access:** ADMIN  
**Auth:** Bearer access token

### Example
```http
GET /api/v1/reports/motorcycles?range=30d
```

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Motorcycle analytics generated.",
  "data": {
    "topModels": [
      {
        "motorId": 5,
        "brand": "Honda",
        "model": "Click 160",
        "orders": 82,
        "revenue": 64000
      }
    ],
    "topBrands": [
      { "brand": "Honda", "orders": 142 }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid report filter. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |

---

## 10.7 `GET /reports/customers`

**Access:** ADMIN  
**Auth:** Bearer access token

Used to identify registered repeat customers, frequent visitors, and high-value members. Guest orders cannot be grouped as repeat customers because `memberId = null`.

### Example
```http
GET /api/v1/reports/customers?range=30d&sort=visits
```

Supported sort values: `visits`, `spending`, `recent`.

### Success — `200 OK`
```json
{
  "success": true,
  "message": "Customer analytics generated.",
  "data": {
    "totalMembers": 124,
    "activeCustomers": 68,
    "returningCustomers": 31,
    "topCustomers": [
      {
        "userId": 12,
        "firstName": "Win",
        "lastName": "Sai",
        "email": "win@example.com",
        "visitCount": 14,
        "totalSpent": "18450.00",
        "lastVisitAt": "2026-08-12T09:30:00.000Z",
        "motors": [
          { "brand": "Honda", "model": "Click 160" }
        ]
      }
    ]
  }
}
```

### Errors
| Status | Message | Error |
|---:|---|---|
| `400` | Invalid analytics filter. | `VALIDATION_ERROR` |
| `403` | Admin access required. | `FORBIDDEN` |

---

# 11. Endpoint Summary

## Authentication — 7
```text
POST /auth/register
POST /auth/verify-email
POST /auth/resend-otp
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

## Users / Profile / Staff — 11
```text
GET    /users/me
PATCH  /users/me
GET    /users/me/info
PATCH  /users/me/info
GET    /users/me/motors
POST   /users/me/motors
DELETE /users/me/motors/:userMotorId
GET    /users
GET    /users/:id
PATCH  /users/:id/status
PATCH  /users/:id/role
```

## Motor Brands — 5
```text
GET    /motor-brands
POST   /motor-brands
GET    /motor-brands/:id
PATCH  /motor-brands/:id
DELETE /motor-brands/:id
```

## Motors — 5
```text
GET    /motors
POST   /motors
GET    /motors/:id
PATCH  /motors/:id
DELETE /motors/:id
```

## Product Categories — 5
```text
GET    /product-categories
POST   /product-categories
GET    /product-categories/:id
PATCH  /product-categories/:id
DELETE /product-categories/:id
```

## Products / Inventory — 6
```text
GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
PATCH  /products/:id/stock
```

## Services — 5
```text
GET    /services
POST   /services
GET    /services/:id
PATCH  /services/:id
DELETE /services/:id
```

## Orders / POS — 5
```text
POST  /orders
GET   /orders
GET   /orders/:id
PATCH /orders/:id/status
GET   /orders/my
```

## Reports / Analytics — 7
```text
GET /reports/dashboard
GET /reports/sales
GET /reports/products
GET /reports/services
GET /reports/staff
GET /reports/motorcycles
GET /reports/customers
```

# 12. Total Endpoints

| Module | Count |
|---|---:|
| Authentication | 7 |
| Users / Profile / Staff | 11 |
| Motor Brands | 5 |
| Motors | 5 |
| Product Categories | 5 |
| Products / Inventory | 6 |
| Services | 5 |
| Orders / POS | 5 |
| Reports / Analytics | 7 |
| **Total** | **56** |

---

# 13. Role Matrix

| Feature | MEMBER | STAFF | ADMIN |
|---|:---:|:---:|:---:|
| Authentication / own profile | ✅ | ✅ | ✅ |
| Own motorcycles | ✅ | — | — |
| Own order history | ✅ | — | — |
| Read motor catalog | ✅ | ✅ | ✅ |
| POS create sale | — | ✅ | ✅ |
| Daily/allowed sales | — | ✅ | ✅ |
| Read products/categories/services | — | ✅ | ✅ |
| CRUD products/categories/services | — | — | ✅ |
| CRUD motor brands/models | — | — | ✅ |
| User/staff management | — | — | ✅ |
| Own 7-day staff report | — | ✅ | ✅ |
| Full reports and analytics | — | — | ✅ |
| Customer behavior analytics | — | — | ✅ |

---

# 14. Recommended Authorization Middleware

Admin only:

```js
router.post(
  "/products",
  authenticate,
  authorize("ADMIN"),
  createProduct
);
```

Staff/Admin:

```js
router.post(
  "/orders",
  authenticate,
  authorize("ADMIN", "STAFF"),
  createOrder
);
```

Member only:

```js
router.post(
  "/users/me/motors",
  authenticate,
  authorize("MEMBER"),
  addMyMotor
);
```

---

# 15. POS Security / Transaction Rules

The frontend should send customer selection, IDs, and quantities. Do **not** trust these values from the client:

```text
handledById
unitPrice
lineTotal
subtotal
discountRate
discountAmount
finalTotal
```

Server calculation:

```text
authenticated user -> handledById
Product.sellingPrice / Service.price -> unitPrice
quantity × unitPrice -> lineTotal
sum(lineTotal) -> subtotal
MEMBER -> 10% discount
GUEST -> 0% discount
subtotal - discount -> finalTotal
```

Create the final sale inside one Prisma transaction:

```text
Create Order
+
Create OrderItems
+
Decrease Product Stock
=
One Database Transaction
```

If any step fails, roll back the complete transaction.

---

**End of HurngMoto API v1 Documentation**
