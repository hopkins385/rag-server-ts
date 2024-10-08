#
# 🏡 Production Build
#
FROM node:20-alpine as build

WORKDIR /app

COPY --chown=node:node . .

RUN npm ci

# Set to production environment
ENV NODE_ENV=production

RUN npm run build

# Set Docker as a non-root user
USER node

#
# 🚀 Production Server
#
FROM node:20-alpine as prod

WORKDIR /app

# Copy only the necessary files
COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist/src ./

# Set Docker as non-root user
USER node

EXPOSE 3000

CMD ["node", "index.js"]
