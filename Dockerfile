FROM node:7.2

# Set environment variables
ENV appDir /var/www/app/current
ENV PORT 9999

# Run updates and install deps
RUN apt-get update -y && \
    rm -rf /var/lib/apt/lists/*

# Set the work directory
RUN mkdir -p /var/www/app/current
WORKDIR ${appDir}

# Add our package.json and install *before* adding our app files
ADD package.json ./
RUN npm i

# Install pm2 so we can run our application
RUN npm i -g pm2

# Add app files
ADD . /var/www/app/current

#Expose the port
EXPOSE 9999

CMD ["pm2-docker", "processes.json"]