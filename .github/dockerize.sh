docker build -t jefftian/bedrock:"$1" .
docker images
docker run --network host -e CI=true -d -p 127.0.0.1:8080:8080 --name bedrock jefftian/bedrock:"$1"
docker ps | grep -q bedrock
docker ps -aqf "name=bedrock$"
docker push jefftian/bedrock:"$1"
docker logs $(docker ps -aqf name=bedrock$)
curl localhost:8080 || docker logs $(docker ps -aqf name=bedrock$)
docker kill bedrock || echo "bedrock killed"
docker rm bedrock || echo "bedrock removed"
