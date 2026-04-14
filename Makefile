.PHONY: build

dev:
	docker build -t ffneumarkt-dev .
	docker run --rm -it -p 4321:4321 -v $(CURDIR):/app -v /app/node_modules ffneumarkt-dev

sync:
	npx astro sync

clean:
	docker stop $$(docker ps -q)
