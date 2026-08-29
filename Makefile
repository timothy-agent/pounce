NODE_IMAGE := node:24.18.0-alpine
NODE_RUN   := docker run --rm -v $(CURDIR):/app -w /app \
	-v pounce-npm-cache:/root/.npm \
	-v pounce-node-modules:/app/node_modules \
	$(NODE_IMAGE)

.PHONY: install lint test build dev

install:
	$(NODE_RUN) npm install

lint:
	$(NODE_RUN) npm run lint

test:
	$(NODE_RUN) npm test

build:
	$(NODE_RUN) npm run build

# HMR needs the Vite port published. Load chrome://extensions → dist/ still
# works for a static build; `make dev` is for iterating on popup/options.
dev:
	docker run --rm -it -v $(CURDIR):/app -w /app \
		-v pounce-npm-cache:/root/.npm \
		-v pounce-node-modules:/app/node_modules \
		-p 5173:5173 \
		$(NODE_IMAGE) npm run dev -- --host 0.0.0.0
