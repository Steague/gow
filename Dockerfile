FROM node:alpine

ENV NPM_CONFIG_LOGLEVEL warn
ARG NPM_TOKEN
ENV NPM_TOKEN $NPM_TOKEN
ARG app_env
ENV APP_ENV $app_env

RUN mkdir -p /www
WORKDIR /www

COPY docker.npmrc .npmrc
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn
RUN rm -f .npmrc

COPY . .
CMD if [ ${APP_ENV} = production ]; \
	then \
	yarn global add http-server && \
	yarn run build && \
	cd build && \
	hs -p 3000; \
	else \
	yarn start; \
	fi

EXPOSE 3000
