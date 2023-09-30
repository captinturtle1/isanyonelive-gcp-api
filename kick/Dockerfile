FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN apk --no-cache add chromium \
    && apk --no-cache add udev ttf-freefont chromium-chromedriver
EXPOSE 8080
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
