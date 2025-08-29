# Project Installation

1. Create a `.env` file based on `.env.example` inside each project in the `apps` folder.
3. `yarn install`
4. `yarn dev` (working with the admin panel)
5. `yarn dev:pay` (working with the payment form)
   - domain/pay/wallet/:payerId
   - domain/pay/store/:slug/:externalId

# Build

1. `yarn build:dv-admin` (build the admin panel without TS check)
2. `yarn build:pay` (build the payment form without TS check)
3. `yarn build-only` (build both admin panel and payment form without TS check)
4. `yarn build` (build both admin panel and payment form with TS check)
