rimraf src/tokens/propierties/*.json 
rimraf src/tokens/styles/*.scss

build_path=node_modules/@ods/ods/lib/tokens/

node ${build_path}/gen-token-files.js
node ${build_path}/style-dictionary.js
node ${build_path}/gen-themes.js
