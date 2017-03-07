#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# more bash-friendly output for jq
JQ="jq --raw-output --exit-status"

configureAwsCli(){
	aws --version
	aws configure set default.region us-east-1
	aws configure set default.output json
}

pushImage() {
   eval $(aws ecr get-login --region us-east-1)
   docker tag node-app:$CIRCLE_BRANCH 433478262461.dkr.ecr.us-east-1.amazonaws.com/node-app:$CIRCLE_BRANCH
   docker push 433478262461.dkr.ecr.us-east-1.amazonaws.com/node-app:$CIRCLE_BRANCH
}

makeTaskDefinition() {

	taskTemplate='[{
		"volumesFrom": [],
		"portMappings": [{
			"hostPort": 9999,
			"containerPort": 9999,
			"protocol": "tcp"
		}],
		"essential": true,
		"mountPoints": [],
		"name": "node-app",
		"environment": [],
		"image": "433478262461.dkr.ecr.us-east-1.amazonaws.com/node-app:%s",
		"logConfiguration": {
			"logDriver": "awslogs",
			"options": {
				"awslogs-group": "node-app",
				"awslogs-region": "us-east-1"
			}
		},
		"cpu": 0,
		"memoryReservation": 512
	}]' 

    taskDefinition=$(printf "$taskTemplate" $CIRCLE_BRANCH)

}

registerDefinition() {

    if revision=$(aws ecs register-task-definition --container-definitions "$taskDefinition" --family $family | $JQ '.taskDefinition.taskDefinitionArn'); then
        echo "Revision: $revision"
    else
        echo "Failed to register task definition"
        return 1
    fi

}

deployCluster() {

    family="node-app-task-definition-development"
	cluster="default"
	service="node-app-service"

    makeTaskDefinition
    registerDefinition
	
    if [[ $(aws ecs update-service --cluster $cluster --service $service --task-definition $revision | \
                   $JQ '.service.taskDefinition') != $revision ]]; then
        echo "Error updating service."
        return 1
    fi

    # wait for older revisions to disappear
    # not really necessary, but nice for demos
    for attempt in {1..30}; do
        if stale=$(aws ecs describe-services --cluster $cluster --services $service | \
                       $JQ ".services[0].deployments | .[] | select(.taskDefinition != \"$revision\") | .taskDefinition"); then
            echo "Waiting for stale deployments:"
            echo "$stale"
            sleep 5
        else
            echo "Deployed!"
            return 0
        fi
    done
    echo "Service update took too long."
    return 1
}

configureAwsCli
pushImage
deployCluster