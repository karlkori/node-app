# :package: Test node app

## Build Image

1. Retrieve the docker login command and run it to authenticate your Docker client to your registry:
`eval $(aws ecr get-login --region us-east-1)`

2. Build your Docker image using the following command. For information on building a Docker file from scratch see the instructions here. 
  You can skip this step if your image is already built:
`docker build -t node-app .`

3. After the build completes, tag your image so you can push the image to this repository:
`docker tag node-app:latest 433478262461.dkr.ecr.us-east-1.amazonaws.com/node-app:latest`

4. Run the following command to push this image to your newly created AWS repository:
`docker push 433478262461.dkr.ecr.us-east-1.amazonaws.com/node-app:latest`

## Restart service at AWS

1. Update task definition "node-app" by creating new revision (update only of you need to change the service options)

2. Select a main task of our service and stop it - ECS will start new task from updated docker image and with updated options 
