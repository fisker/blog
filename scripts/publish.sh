npm run clean
npm run build
cp -R ./dist/ ./docs/
cp ./src/headers ./docs/
cp CNAME ./docs/
