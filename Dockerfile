FROM node:18.3.0-alpine

ENV TIME_ZONE=Asia/Shanghai

RUN \
  mkdir -p /usr/src/app \
  && apk add --no-cache tzdata \
  && echo "${TIME_ZONE}" > /etc/timezone \
  && ln -sf /usr/share/zoneinfo/${TIME_ZONE} /etc/localtime

WORKDIR /usr/src/app

# RUN npm i --registry=https://registry.npm.taobao.org

COPY . /usr/src/app

RUN yarn

EXPOSE 8080

CMD yarn start
