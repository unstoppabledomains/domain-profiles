#!/bin/bash

setenv() {
  echo "Setting app env to ${1}..."
  if [ "$1" = "development" ] || [ "$1" = "test" ]; then
    APP_ENV="$1"
    CLIENT_URL="http://localhost:3000"
  fi

  if [ "$1" = "staging" ]; then
    APP_ENV="staging"
    CLIENT_URL="https://staging.ud.me"
  fi

  if [ "$1" = "production" ]; then
    APP_ENV="production"
    CLIENT_URL="https://ud.me"
  fi

  GIT_SHA="$(git rev-parse HEAD)"
  TZ="UTC"

  export TZ="${TZ}"
  if [ "$1" = "test" ]; then
    TS_CONFIG_PATHS="true"
    export TS_CONFIG_PATHS="${TS_CONFIG_PATHS}"
  fi

  export NODE_OPTIONS="--max_old_space_size=6144"
  export APP_ENV="${APP_ENV}"
  export CLIENT_URL="${CLIENT_URL}"
  export COMMIT_SHA="${GIT_SHA}"
  "${@:2}" 2>&1
}

setenv "$@"
