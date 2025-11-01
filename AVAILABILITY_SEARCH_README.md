# Lodgix Availability Search Implementation

This implementation provides a complete Next.js availability search system that integrates with Lodgix's property-availabilities endpoint.

## 🏗️ Architecture Overview

The system follows this data flow:
1. **User Input** → Search form with date/guest validation
2. **API Proxy** → Next.js API route calls Lodgix availability endpoint
3. **Property Details** → Fetches details for available property IDs
4. **Results Display** → Shows available properties in responsive grid

## 📁 File Structure

```
src/app/search/
├── page.jsx                     # Main search page (client component)
├── components/
│   ├── SearchForm.jsx          # Search form with validation
│   └── ResultsGrid.jsx         # Property results display
└── api/availability/search/
    └── route.js                # API proxy to Lodgix
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add your Lodgix API credentials to `.env.local`:

```env
# Lodgix API Configuration
LODGIX_API_KEY=your_api_key_here
LODGIX_AUTH_TOKEN=your_auth_token_here

# For development
NODE_ENV=development
```

### 2. API Configuration

The system uses your existing `src/config/lodgix.js` configuration:

```javascript
const LODGIX_CONFIG = {
  API_BASE_URL: 'https://www.lodgix.com/public-api/v2',
  API_KEY: 'your_api_key',
  getHeaders: () => ({
    'Authorization': `Token ${LODGIX_CONFIG.API_KEY}`,
    // Alternative: 'Authorization': `Bearer ${LODGIX_CONFIG.API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  })
};
```

### 3. Image Configuration

Ensure `next.config.js` includes image domains:

```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures.lodgix.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // For demo images
        pathname: '/**',
      },
    ],
  },
}
```

## 🚀 Usage

### Basic Search URL
```
http://localhost:3000/search?from_date=2025-10-10&to_date=2025-10-15&guests=4&rooms=2
```

### API Endpoint
```
GET /api/availability/search?from_date=2025-10-10&to_date=2025-10-15&guests=4&rooms=2
```

## 🔌 API Integration Details

### Lodgix Availability Endpoint

**Endpoint:** `https://www.lodgix.com/public-api/v2/property-availabilities/`

**Parameters:**
- `from_date` (required): YYYY-MM-DD format
- `to_date` (required): YYYY-MM-DD format  
- `property_id` (optional): Check specific property

**Example Request:**
```
GET https://www.lodgix.com/public-api/v2/property-availabilities/?from_date=2025-10-10&to_date=2025-10-15&property_id=62271
```

**Example Response:**
```json
{
  "available_property_ids": [62271, 62283, 62287, 62291, 63927],
  "available_property_ids_rules_ignored": [62271, 62283, 62287, 62291, 63927]
}
```

### Property Details Integration

The system attempts to fetch property details from:
```
https://www.lodgix.com/public-api/v2/properties/{property_id}/
```

If this endpoint is not available, it falls back to mock data. **Replace the mock data section** in `route.js` with your actual property details API call.

## 🎨 UI Components

### SearchForm Features
- ✅ Date validation (check-in < check-out, no past dates)
- ✅ Guest/room counters with +/- buttons
- ✅ Bootstrap 3 styling
- ✅ Loading states and error handling
- ✅ Real-time validation feedback

### ResultsGrid Features
- ✅ Responsive Bootstrap 3 grid
- ✅ Property images with Next.js Image optimization
- ✅ Availability badges and guest capacity
- ✅ Loading skeletons
- ✅ Empty state and error handling
- ✅ Direct links to property detail pages

## 🧪 Testing

### Test with Mock Data
The system includes mock data that will be used if the Lodgix API is unavailable:

```javascript
// Test URLs
http://localhost:3000/search?from_date=2025-10-10&to_date=2025-10-15&guests=2&rooms=1
```

### Debug Information
In development mode, a debug panel shows:
- Available property IDs returned by Lodgix
- API endpoints being called
- Search criteria used

## 🔍 Validation Rules

### Form Validation
- Check-in date: Required, cannot be in the past
- Check-out date: Required, must be after check-in
- Guests: Minimum 1, maximum unlimited
- Rooms: Minimum 1, maximum unlimited

### API Validation
- Date format: Must be YYYY-MM-DD
- Date logic: from_date < to_date
- Guest filtering: Properties filtered by sleep capacity

## 🚨 Error Handling

### Client-Side Errors
- Form validation errors with Bootstrap styling
- Network errors with retry options
- Empty results with helpful suggestions

### Server-Side Errors
- Lodgix API errors with detailed messages
- Fallback to mock data for development
- Proper HTTP status codes and error responses

## 🔄 Data Flow Example

1. **User submits form** with dates 2025-10-10 to 2025-10-15
2. **API route receives** `GET /api/availability/search?from_date=2025-10-10&to_date=2025-10-15`
3. **Server calls Lodgix** `https://www.lodgix.com/public-api/v2/property-availabilities/?from_date=2025-10-10&to_date=2025-10-15`
4. **Lodgix returns** `{"available_property_ids": [62271, 62283, 62287]}`
5. **Server fetches details** for each property ID
6. **Client receives** complete property data with availability status
7. **UI displays** property cards with images, pricing, and booking links

## 🎯 Next Steps

1. **Replace mock data** in `fetchPropertyDetails()` with actual Lodgix property endpoint
2. **Add caching** for identical availability queries (Redis/memory cache)
3. **Implement rate limiting** to respect Lodgix API limits
4. **Add property filtering** by amenities, price range, etc.
5. **Integrate booking flow** with selected properties

## 📞 Support

For Lodgix API documentation and support:
- API Documentation: Check Lodgix developer portal
- Rate Limits: Implement appropriate delays between requests
- Authentication: Ensure API key has proper permissions

---

**Important:** This implementation uses the exact Lodgix endpoint structure you provided. The `available_property_ids` array is the authoritative source for property availability.
