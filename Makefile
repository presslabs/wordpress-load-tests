NODE_MODULES ?= $(PWD)/node_modules
TSC        	 := $(NODE_MODULES)/.bin/tsc

dependencies:
	yarn install

run:
	k6 run tests/woocommerce-order.js

build:
	yarn webpack
	$(TSC) --build tsconfig.json

.PHONY: dependencies run build
