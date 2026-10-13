# shopKart

A simple e-commerce app with a React frontend and an Express + MongoDB backend. Features include products, cart, wishlist, orders, and Razorpay (test mode) checkout.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Razorpay

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
node index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See [backend/.env.example](backend/.env.example):

- `MONGO_URI` – MongoDB connection string
- `PORT` – backend port (default `5050`)
- `JWT_SECRET` – secret for signing auth tokens
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` – Razorpay test mode keys
