
test:
	@./support/expresso/bin/expresso \
		-I lib \
		-I support

.PHONY: test