npm run clean
npm run build
mkdir ./docs/
cp ./dist/index.html ./docs/
cp ./dist/app.css ./docs/
cp ./dist/app.js ./docs/
cp ./dist/favicon.ico ./docs/
cp ./src/headers ./docs/
cp CNAME ./docs/
