# NutriTrack - Backend (TypeScript)

## Quickstart

1. Copy into `backend/` folder.
2. `cd backend`
3. `npm install`
4. Create `.env` based on `.env.example`
5. `npm run dev`

### Endpoints (examples)

- `POST /api/auth/register` — { name, email, password }
- `POST /api/auth/login` — { email, password }
- `GET /api/food/search?q=chicken`
- `POST /api/food-log/add` (protected)
- `GET /api/food-log/daily?date=YYYY-MM-DD` (protected)
- `POST /api/weight/add` (protected)
- `GET /api/weight/history` (protected)
- `PUT /api/user/update-goal` (protected)
- `GET /api/analytics/weight?start=YYYY-MM-DD&end=YYYY-MM-DD` (protected)

Tokens: include `Authorization: Bearer <token>` header for protected routes.
fucking hell
This starter provides essential models and controllers. Extend validation, request DTOs, and tests as needed.
