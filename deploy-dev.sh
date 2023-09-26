export PROJECT_ID=solsubs-dev
gcloud config set project solsubs-dev

apps="trpc"
for app in $apps
do 
cd apps/$app
    yarn build:deploy
    cd ../../
done
