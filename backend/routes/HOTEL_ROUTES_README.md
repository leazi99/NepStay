# Hotel Routes Documentation

## Overview

This file defines all HTTP routes for hotel-related operations in the Hotel Booking System. Routes are organized into public endpoints (no authentication) and admin-only endpoints (require authentication and admin role).

## Route Structure

### Public Routes (No Authentication Required)

#### 1. GET /api/hotels
**Purpose**: List all hotels with optional filters  
**Handler**: `getHotels`  
**Authentication**: None  
**Query Parameters**:
- `city` (string): Filter by city (case-insensitive)
- `minPrice` (number): Minimum price per night
- `maxPrice` (number): Maximum price per night
- `minRating` (number): Minimum hotel rating (0-5)
- `amenities` (string): Comma-separated list of amenities
- `checkIn` (string): Check-in date (ISO format)
- `checkOut` (string): Check-out date (ISO format)
- `guests` (number): Number of guests
- `sort` (string): Sort order (`price_asc`, `price_desc`, `rating_desc`, `newest`)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)

**Response**:
```json
{
  "success": true,
  "hotels": [...],
  "total": 24,
  "page": 1,
  "pages": 2
}
```

**Requirements**: 3.1-3.9

---

#### 2. GET /api/hotels/featured
**Purpose**: Get featured hotels  
**Handler**: `getFeaturedHotels`  
**Authentication**: None  

**Response**:
```json
{
  "success": true,
  "hotels": [...]
}
```

**Requirements**: 3.10

---

#### 3. GET /api/hotels/:id
**Purpose**: Get detailed information about a specific hotel  
**Handler**: `getHotelById`  
**Authentication**: None  
**URL Parameters**:
- `id` (string): Hotel ID

**Response**:
```json
{
  "success": true,
  "hotel": {
    "_id": "...",
    "name": "The Grand Kathmandu",
    "slug": "the-grand-kathmandu",
    "description": "...",
    "rating": 4.5,
    "reviewCount": 120,
    "address": {...},
    "amenities": [...],
    "images": [...],
    ...
  }
}
```

**Requirements**: 3.11

---

#### 4. GET /api/hotels/:id/rooms
**Purpose**: Get all rooms for a specific hotel  
**Handler**: `getHotelRooms`  
**Authentication**: None  
**URL Parameters**:
- `id` (string): Hotel ID

**Response**:
```json
{
  "success": true,
  "rooms": [...]
}
```

**Requirements**: 3.12

---

### Admin-Only Routes (Authentication + Admin Role Required)

#### 5. POST /api/hotels
**Purpose**: Create a new hotel  
**Handler**: `createHotel`  
**Authentication**: Required (`userAuth` middleware)  
**Authorization**: Admin role only (`requireRole("admin")` middleware)  
**Content-Type**: `multipart/form-data`

**Request Body**:
```json
{
  "name": "The Grand Kathmandu",
  "description": "Luxury hotel in the heart of Kathmandu",
  "address": {
    "line1": "123 Main St",
    "city": "Kathmandu",
    "state": "Bagmati",
    "country": "Nepal",
    "postalCode": "44600"
  },
  "contactEmail": "info@grandkathmandu.com",
  "contactPhone": "+977-1-1234567",
  "amenities": ["WiFi", "Pool", "Gym", "Spa"]
}
```

**Files**:
- `logo`: Hotel logo image
- `coverImage`: Hotel cover image
- `images`: Multiple hotel images

**Response**:
```json
{
  "success": true,
  "hotel": {
    "_id": "...",
    "name": "The Grand Kathmandu",
    "slug": "the-grand-kathmandu",
    ...
  }
}
```

**Requirements**: 4.1-4.3

---

#### 6. PUT /api/hotels/:id
**Purpose**: Update an existing hotel  
**Handler**: `updateHotel`  
**Authentication**: Required (`userAuth` middleware)  
**Authorization**: Admin role only (`requireRole("admin")` middleware)  
**Content-Type**: `multipart/form-data`  
**URL Parameters**:
- `id` (string): Hotel ID

**Request Body**: Same as POST, all fields optional

**Response**:
```json
{
  "success": true,
  "hotel": {...}
}
```

**Requirements**: 4.4

---

#### 7. DELETE /api/hotels/:id
**Purpose**: Soft delete a hotel (sets `isActive: false`)  
**Handler**: `deleteHotel`  
**Authentication**: Required (`userAuth` middleware)  
**Authorization**: Admin role only (`requireRole("admin")` middleware)  
**URL Parameters**:
- `id` (string): Hotel ID

**Response**:
```json
{
  "success": true,
  "message": "Hotel deleted successfully"
}
```

**Requirements**: 4.5

---

## Middleware Chain

### Public Routes
```
Request → Route Handler → Response
```

### Admin Routes
```
Request → userAuth → requireRole("admin") → Route Handler → Response
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized. Login again."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Hotel not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch hotels"
}
```

## Testing

Run the route tests with:
```bash
npm test -- routes/hotelRoutes.test.js --run
```

## Dependencies

- **express**: Web framework
- **userAuth**: JWT authentication middleware
- **requireRole**: Role-based access control middleware
- **hotelController**: Hotel business logic handlers

## Related Files

- `/backend/controllers/hotelController.js` - Handler implementations
- `/backend/middleware/userAuth.js` - Authentication middleware
- `/backend/middleware/requireRole.js` - Authorization middleware
- `/backend/models/hotelModel.js` - Hotel data model
- `/backend/server.js` - Route registration

## Notes

1. All admin routes require both authentication (valid JWT) and admin role
2. Public routes are accessible without authentication
3. The hotel controller is responsible for implementing the actual business logic
4. Image uploads are handled via Cloudinary in the controller
5. Soft delete is used instead of hard delete to preserve data integrity
