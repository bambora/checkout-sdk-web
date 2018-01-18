FROM busybox:latest

ENTRYPOINT sh -c "yes | cp -rf /tmp/hooks/. /tmp/.git/hooks/"