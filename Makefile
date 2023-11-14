TAG ?= latest
NS ?= dhf0820
# NS ?= lovelygru
APP_NAME := uc_blaze
image_name := uc_blaze
stack_config_file := uc_blaze-stack.yml
stack_config_file80 := uc_blaze-stack80.yml
stack_name := gui

.PHONY: build run stop clean

build:
	@docker compose build --build-arg TAG=$(TAG) --build-arg METEOR_DISABLE_OPTIMISTIC_CACHING=1

push:
	@docker image tag $(image_name):$(TAG) $(NS)/$(image_name):$(TAG)
	@docker image push $(NS)/$(image_name):$(TAG)

deploy:
	@docker stack deploy --compose-file $(stack_config_file) $(stack_name)

deploy80:
	@docker stack deploy --compose-file $(stack_config_file_80) $(stack_name)

stop:
	@docker stack rm $(stack_name)
	

clean:
	@docker system prune --volumes --force
