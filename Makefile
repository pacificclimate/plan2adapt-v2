# These variables are set to make it convenient to run the docker image locally.
tag = $(shell git rev-parse --abbrev-ref HEAD)
port = 30667
public_url = http://localhost:${port}

image:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml build --build-arg REACT_APP_VERSION='$(shell ./generate-commitish.sh)'

up:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml up -d
	@docker logs -f plan2adapt-v2-frontend

down:
	@SDP_TAG=$(tag) SDP_PORT=$(port) SDP_PUBLIC_URL=$(public_url) docker-compose -f docker/docker-compose.yaml down
