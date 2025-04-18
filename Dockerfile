#
# 🏡 Production Build
#
FROM node:22-alpine AS build

WORKDIR /app

COPY --chown=node:node . .

RUN npm ci

# Set to production environment
ENV NODE_ENV=production

RUN npm run build

#
# 🚀 Production Server
#
FROM node:22-alpine AS prod

WORKDIR /app

# Copy only the necessary files
COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./

# Set Docker as non-root user
USER node

EXPOSE 3000

CMD ["node", "index.js"]
