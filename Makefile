.PHONY: dev build test sync clean icons

dev:
	docker build -t ffneumarkt-dev .
	docker run --rm -it -p 4321:4321 -v $(CURDIR):/app -v /app/node_modules ffneumarkt-dev

build:
	docker build -t ffneumarkt-dev .
	docker run --rm -v $(CURDIR):/app -v /app/node_modules ffneumarkt-dev npm run astro build

test:
	docker build -t ffneumarkt-dev .
	docker run --rm -v $(CURDIR):/app -v /app/node_modules ffneumarkt-dev npm test

# Regenerates public/icons from the logo, requires Python with Pillow.
icons:
	python3 scripts/generate-pwa-icons.py

sync:
	npx astro sync

clean:
	docker stop $$(docker ps -q)
