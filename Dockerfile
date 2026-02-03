# Development stage
FROM node:22 AS development

WORKDIR /app

# Copy package files and yarn.lock
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:dev"]

# Production stage
FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copy package files and yarn.lock
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from development stage
COPY --from=development /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
