all: credger

credger: credger.cr ledger.cr shard.lock
	crystal build --release $<

pull-deps:
	shards install --production -v
	cd public/vendor; npm install

clean:
	-rm credger

clean-all: clean
	-rm -fr lib/ public/vendor/node_modules
