all: credger public/js/app.min.js

credger: credger.cr ledger.cr
	crystal build $<

public/js/app.js: public/ts/app.ts public/ts/services/API.ts public/ts/components/dashboard.ts public/ts/components/bucket.ts
	-./public/vendor/node_modules/.bin/tsc --project ./public/tsconfig.json

public/js/app.min.js: public/js/app.js
	./public/vendor/node_modules/.bin/google-closure-compiler-js $^ > $@

clean:
	-rm public/js/app.min.js public/js/app.js
