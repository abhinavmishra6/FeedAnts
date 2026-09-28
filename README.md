# Feedants competition details

A production-oriented technical-assignment implementation: an Expo React Native competition page backed by Express and MongoDB.

## Architecture

```
mobile/                 Expo application
  src/api               Axios client and endpoint calls
  src/features          Redux competition state
  src/components        Reusable screen building blocks
  src/screens           Composed competition page
server/                 Express REST API
  src/models            Mongoose schemas and indexes
  src/controllers       HTTP orchestration
  src/services          Transactional registration business logic
  src/middleware        Authentication, validation, errors
```

The mobile app never contains MongoDB credentials or competition records. It loads the selected competition from the API and sends authenticated registration actions to the API.

## Features

- Dynamic competition details, dates, rewards, winners, and availability
- Live countdown and lifecycle-aware call to action
- JWT sign-up/sign-in with locally persisted demo session
- Atomic registration transaction and unique `(competition, user)` registration index
- Duplicate, full-capacity, closed-registration, invalid-ID, loading, error, empty, and success states
- Responsive native cards and reusable UI components modeled after the supplied reference

## Prerequisites

- Node 20+ (Node 24 supported)
- Local MongoDB at `mongodb://127.0.0.1:27017/feedants` (use a replica set for transaction guarantees in production)
- Expo Go on your phone

## Setup

1. Copy `server/.env.example` to `server/.env`, set `MONGODB_URI` and a long `JWT_SECRET`.
2. Copy `mobile/.env.example` to `mobile/.env`. For a physical device, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP, e.g. `http://192.168.1.20:4000/api`.
3. Install and run each app:

```powershell
cd server
npm install
npm run seed
npm run dev
```

```powershell
cd mobile
npm install
npx expo start
```

Scan the Expo QR code while phone and computer are on the same Wi-Fi. The bundled screen signs up a demo user on its first use; use the `Reset demo session` button in the error area if a new test user is needed.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create user and return token |
| POST | `/api/auth/login` | Obtain token |
| GET | `/api/home` | Authenticated home feed |
| GET | `/api/competitions` | Server-side search, lifecycle, fee, and sort filters |
| GET | `/api/competitions/:id` | Details, availability, and requesting user's state |
| POST | `/api/competitions/:id/registrations` | Register current user atomically |
| GET/POST/PATCH/DELETE | `/api/competitions/:id/participants` | Manage registered participants |
| GET/POST/DELETE | `/api/competitions/:id/submissions` | Read, multipart-upload, or remove a video |
| GET/PATCH | `/api/users/me` | Read and update persisted profile |
| POST | `/api/users/me/avatar` | Upload a profile image |
| GET/POST | `/api/referrals/me`, `/api/referrals/track` | Referral link and attribution |
| GET/POST | `/api/competitions/:id/reviews` | Participant reviews |

Pass `Authorization: Bearer <token>` to protected competition endpoints.

## API test cases

Use Postman to register two users and call the endpoints. The API returns `409` for duplicate or full registration, `422` when registration has closed, `404` for a missing competition, and `400` for malformed requests. To exercise the last-spot race, set a seeded competition capacity to one and issue two registration requests simultaneously with different tokens; only one transaction can commit.

## Assumptions and trade-offs

- Uploads use validated multipart local storage (`uploads/`) and metadata is stored in MongoDB. Replace this with private object storage in production.
- Payments deliberately remain unavailable until server-side Razorpay/webhook credentials are configured; the app never claims a payment succeeded.
- Referral attribution and a ₹10 point reward are persisted, with self-referral and duplicate attribution blocked.
- MongoDB transactions require Atlas or a local replica set. A standalone local MongoDB supports development, but a replica set is required to exercise the transactional registration path under concurrency.
- The demo session is created automatically to make Expo Go testing immediate. A complete product would expose dedicated onboarding screens and refresh-token rotation.

## Production improvements

* Add payment-webhook idempotency, audit logs, observability, private object storage, pagination, RBAC, OpenAPI documentation, integration tests using a MongoDB replica set, and CI.
* Managed MongoDB with replica sets and optimized indexes
* Refresh-token rotation and secure token storage
* API rate limiting and centralized validation
* Structured logging, monitoring, and error handling
* Automated unit, integration, and E2E testing
* CI/CD pipeline and database migrations
* Secure media storage using CDN/object storage
* Production payment integration with webhook verification
* Load testing and scalability monitoring
* Secure secrets management, HTTPS, and production CORS
* Admin/organizer audit logging

