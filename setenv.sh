#!/bin/bash

setenv() {
  if [ "$1" = "development" ] || [ "$1" = "test" ] || [ "$1" = "e2e" ]; then
    APP_ENV="$1"
    DEPLOYMENT="staging"
    API_BASE_URL="http://localhost:8080"
    CLIENT_URL="http://localhost:3000"
  fi

  if [ "$1" = "staging" ]; then
    APP_ENV="$1"
    DEPLOYMENT="staging"
    API_BASE_URL="https://api.ud-staging.com"
    CLIENT_URL="https://www.ud-staging.com"
  fi

  if [ "$1" = "production" ]; then
    APP_ENV="production"
    DEPLOYMENT="production"
    API_BASE_URL="https://unstoppabledomains.com"
    CLIENT_URL="https://unstoppabledomains.com"
  fi

  GIT_SHA="$(git rev-parse HEAD)"
  TZ="UTC"

  export TZ="${TZ}"
  if [ "$1" = "test" ]; then
    TS_CONFIG_PATHS="true"
    export TS_CONFIG_PATHS="${TS_CONFIG_PATHS}"
  fi

  export NODE_OPTIONS="--max_old_space_size=6144"
  export API_BASE_URL="${API_BASE_URL}"
  export APP_ENV="${APP_ENV}"
  export CLIENT_URL="${CLIENT_URL}"
  export COMMIT_SHA="${GIT_SHA}"
  export DEPLOYMENT="${DEPLOYMENT}"
  "${@:2}" 2>&1
}

setenv "$@"
