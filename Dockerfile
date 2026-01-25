# ----------------------------------------------------------------------------------------
ARG BUN_VERSION=latest
# ----------------------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /usr/src/app
# ----------------------------------------------------------------------------------------
FROM base AS deps

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production
# ----------------------------------------------------------------------------------------
FROM base AS release
LABEL maintainer="Joseph Carras <joscarras@gmail.com>"

ARG API_VERSION=1.0.0 \
    ENV=production \
    TZ=Etc/UTC

ENV API_VERSION=${API_VERSION} \
    ENV=production \
    TZ=${TZ}

SHELL ["/bin/bash", "-c"]

COPY --from=deps /usr/src/app/node_modules node_modules
COPY package.json .
COPY tsconfig.json .
COPY src ./src

RUN set -eux; \
    sed -i "s/x.x.x/${API_VERSION:1}/g" package.json;

USER bun
EXPOSE 3000/tcp
CMD [ "bun", "run", "serve" ]
# ----------------------------------------------------------------------------------------
