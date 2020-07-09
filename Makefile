dependencies:
	yarn install

run:
	k6 run build/order.js

build:
	yarn webpack
