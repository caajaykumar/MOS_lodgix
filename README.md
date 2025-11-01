This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


------------- this is the api end point kindly read this 
Create a reservation
https://www.lodgix.com/public-api/v2/reservations/
this is the payload 
{
  "from_date": "2019-08-24",
  "to_date": "2019-08-24",
  "adults": 1,
  "children": 0,
  "pets": 0,
  "guest_id": 0,
  "stay_type": "GUEST",
  "entities": [
    {
      "property_id": 0,
      "room_ids": [
        0
      ]
    }
  ]
}


------------
Block reservations
https://www.lodgix.com/public-api/v2/reservations/block/
payload is---
{
  "from_date": "2019-08-24",
  "to_date": "2019-08-24",
  "entities": [
    {
      "property_id": 0,
      "room_ids": [
        0
      ]
    }
  ]
}

-------------
Calculate quote
https://www.lodgix.com/public-api/v2/reservations/quote/
payload is---
{
  "from_date": "2019-08-24",
  "to_date": "2019-08-24",
  "entities": [
    {
      "property_id": 0,
      "room_ids": [
        0
      ]
    }
  ]
}


------
List all tax templates
https://www.lodgix.com/public-api/v2/tax-templates/
{
  "count": 123,
  "next": "http://api.example.org/accounts/?offset=400&limit=100",
  "previous": "http://api.example.org/accounts/?offset=200&limit=100",
  "results": [
    {
      "id": 0,
      "title": "string",
      "type": "CITYTAX",
      "value": "string",
      "is_flat": true,
      "is_advanced": true,
      "advanced_value": "string",
      "advanced_nights": 0,
      "frequency": "DAILY"
    }
  ]
}

--- 
Create a tax template
https://www.lodgix.com/public-api/v2/tax-templates/
payload is---

{
  "title": "string",
  "type": "string",
  "value": "string",
  "is_flat": true,
  "is_advanced": true,
  "advanced_value": "string",
  "advanced_nights": 1,
  "frequency": "DAILY"
}

---- List all property fees
https://www.lodgix.com/public-api/v2/property-fees/ 
{
  "count": 123,
  "next": "http://api.example.org/accounts/?offset=400&limit=100",
  "previous": "http://api.example.org/accounts/?offset=200&limit=100",
  "results": [
    {
      "id": 0,
      "property": {
        "id": 0,
        "name": "string"
      }
    }
  ]
}


