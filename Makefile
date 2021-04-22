all: credger public/js/app.min.js

credger: credger.cr ledger.cr shard.lock
	crystal build --release $<

public/js/app.js: public/ts/app.ts public/ts/services/API.ts public/ts/components/dashboard.ts public/ts/components/bucket.ts
	-./public/vendor/node_modules/.bin/tsc --project ./public/tsconfig.json

public/js/app.min.js: public/js/app.js
	./public/vendor/node_modules/.bin/google-closure-compiler-js $^ > $@

pull-deps:
	shards install --production -v
	cd public/vendor; npm install

clean:
	-rm public/js/app.min.js public/js/app.js credger

clean-all:
	-rm -fr lib/ public/vendor/node_modules
