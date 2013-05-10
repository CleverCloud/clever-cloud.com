all: build

build: site
	./site build

site: site.hs RouteFactories.hs CustomTags.hs Utils.hs
	ghc --make site.hs
	./site clean

preview: site
	./site preview

clean: site
	./site clean

mrproper: clean
	rm site
	rm *.hi
	rm *.o

publish: build
	git stash save
	git checkout publish || git checkout --orphan publish
	find . -maxdepth 1 ! -name '.' ! -name '.git*' ! -name '_site' -exec rm -rf {} +
	find _site -maxdepth 1 -exec mv {} . \;
	rmdir _site
	git add -A && git commit -m "Publish" || true
#	git push -f git+ssh://git@push.clever-cloud.com/app_677f8135-4df4-4f57-899f-e080a00fce92.git \
	    publish:master
	git checkout master
	git clean -fdx
	git stash pop || true
