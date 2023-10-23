###########################################################
# Build container
###########################################################
FROM launcher.gcr.io/google/nodejs AS builder

# Prepare arguments
ARG service
ARG APP_ENV=production
ARG APP_VERSION=docker-build
ARG CLIENT_URL=https://ud.me

# Use development environment during build to allow development dependencies
# to be installed which includes build tools
ENV NODE_ENV development
ENV APP_ENV $APP_ENV
ENV APP_VERSION $APP_VERSION
ENV CLIENT_URL $CLIENT_URL
ENV NEXT_TELEMETRY_DISABLED 1
ENV YARN_IGNORE_NODE 1

# Prepare dependencies
RUN install_node v16.13.0
RUN yarn set version 3.2.0

# Copy project files
WORKDIR /app
COPY . .

# Build project dependencies including dev dependencies
RUN yarn install
RUN yarn build
RUN NODE_ENV=production yarn workspace server build:next

## Remove extra files to reduce image size
RUN rm -rf node_modules \
  && NODE_ENV=production yarn install
RUN rm -rf .yarn/cache

###########################################################
# Runtime container
###########################################################
FROM launcher.gcr.io/google/nodejs

# Runtime environment variables
ARG service
ENV NEXT_TELEMETRY_DISABLED 1
ENV YARN_IGNORE_NODE 1

# Runtime dependencies
RUN install_node v16.13.0
RUN yarn set version 3.2.0

# Copy project files
WORKDIR /app
COPY --from=builder /app .

# Server start command
CMD ["yarn", "workspace", "server", "run", "start"]
