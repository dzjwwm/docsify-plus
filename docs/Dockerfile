FROM node:latest
LABEL description="我的个人笔记"
WORKDIR /docs
RUN npm install -g docsify-cli@latest --registry=https://registry.npm.taobao.org/
EXPOSE 3000/tcp
ENTRYPOINT docsify serve .