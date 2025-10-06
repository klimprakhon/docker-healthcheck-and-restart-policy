# Healthcheck and Restart Policy

## Prerequisite

- [ ] Docker Desktop (Docker + Docker Compose)
- [ ] k3d

## Setup the Application

- Node.js: 22+

### Install Dependencies

```bash
cd ./app && npm install
```

Test if the application is able to run correctly

```bash
npm run dev
```

Expect to see this in the Terminal

```
> app@1.0.0 dev
> ts-node src/index.ts

App listening at http://localhost:8000
```

## Healthcheck

- Build images and run containers

```bash
docker compose -f docker-compose.healthcheck.yaml up -d --build
```

- Expect to see an Error with `unhealthy_app` container

```bash
 ✔ unhealthy-app:0.0.1                                          Built
 ✔ healthy-app:0.0.1                                            Built
 ✔ Network health-check-and-restart-policy_default              Created
 ✔ Container healthy_app                                        Healthy
 ✘ Container unhealthy_app                                      Error
 ✔ Container health-check-and-restart-policy-hello-unhealthy-1  Created
 ✔ Container health-check-and-restart-policy-hello-healthy-1    Started
dependency failed to start: container unhealthy_app is unhealthy
```

- Check all containers on system

```bash
docker ps -a
```

- Only `health-check-and-restart-policy-hello-healthy-1` container successfully executed and Exit with Code 0

```bash
CONTAINER ID   IMAGE                 COMMAND                  CREATED         STATUS                     PORTS                                         NAMES
c4262f7f163c   hello-world           "/hello"                 4 minutes ago   Exited (0) 4 minutes ago                                                 health-check-and-restart-policy-hello-healthy-1
d682cd000c92   hello-world           "/hello"                 4 minutes ago   Created                                                                  health-check-and-restart-policy-hello-unhealthy-1
5779907b54c3   unhealthy-app:0.0.1   "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes (unhealthy)   0.0.0.0:8001->8001/tcp, [::]:8001->8001/tcp   unhealthy_app
9240bf26902a   healthy-app:0.0.1     "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes (healthy)     0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp   healthy_app
```

- Recheck by logs within both containers

```bash
docker logs health-check-and-restart-policy-hello-unhealthy-1
docker logs health-check-and-restart-policy-hello-healthy-1
```

- Unhealthy container will show nothing, while the healthy one will shows the content as showing below

```bash

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (arm64v8)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/

```

- Test the service in `healthy_app` container

```bash
curl http://localhost:8000/
```

- Expect to see the response from the service

```bash
Hello World!%
```

- Then test the service in `unhealthy_app` container

```bash
curl http://localhost:8001/
```

- Result will be

```bash
Hello World!%
```

## Restart Policy

- Build images and run containers

```bash
docker compose -f docker-compose.restart-policy.yaml up -d --build
```

### Restart Policy: Always

- Make the application stop

```bash
curl http://localhost:8003/done
```

```bash
{"message":"Shutting down in 5 seconds with exit code 0"}%
```

- Recheck all containers

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS          PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   13 minutes ago   Up 1 second     0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
1e219ad449a9   app-no-restart:0.0.1       "docker-entrypoint.s…"   13 minutes ago   Up 13 minutes   0.0.0.0:8002->8002/tcp, [::]:8002->8002/tcp   app_no_restart
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   13 minutes ago   Up 13 minutes   0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
c245cdcdd574   app-on-failure:0.0.1       "docker-entrypoint.s…"   13 minutes ago   Up 13 minutes   0.0.0.0:8004->8004/tcp, [::]:8004->8004/tcp   app_on_failure
```

- Make the application crash

```bash
curl http://localhost:8003/fail
```

```bash
{"message":"Crashing in 5 seconds with exit code 1"}%
```

- Recheck all containers

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS          PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   14 minutes ago   Up 3 seconds    0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
1e219ad449a9   app-no-restart:0.0.1       "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes   0.0.0.0:8002->8002/tcp, [::]:8002->8002/tcp   app_no_restart
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes   0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
c245cdcdd574   app-on-failure:0.0.1       "docker-entrypoint.s…"   14 minutes ago   Up 14 minutes   0.0.0.0:8004->8004/tcp, [::]:8004->8004/tcp   app_on_failure
```

- Check the count of restart times

```bash
docker inspect app_always --format '{{.RestartCount}}'
```

```bash
2
```

### Restart Policy: No Restart

- Make the application stop

```bash
curl http://localhost:8002/done
```

```bash
{"message":"Shutting down in 5 seconds with exit code 0"}%
```

- Check the running containers

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS              PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   16 minutes ago   Up About a minute   0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   16 minutes ago   Up 16 minutes       0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
c245cdcdd574   app-on-failure:0.0.1       "docker-entrypoint.s…"   16 minutes ago   Up 16 minutes       0.0.0.0:8004->8004/tcp, [::]:8004->8004/tcp   app_on_failure
```

- Check all containers on the system

```bash
docker ps -a
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS                     PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   16 minutes ago   Up 2 minutes               0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
1e219ad449a9   app-no-restart:0.0.1       "docker-entrypoint.s…"   16 minutes ago   Exited (0) 7 seconds ago                                                 app_no_restart
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   16 minutes ago   Up 16 minutes              0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
c245cdcdd574   app-on-failure:0.0.1       "docker-entrypoint.s…"   16 minutes ago   Up 16 minutes              0.0.0.0:8004->8004/tcp, [::]:8004->8004/tcp   app_on_failure
```

- Check the count of restart times

```bash
docker inspect app_no_restart --format '{{.RestartCount}}'
```

```bash
0
```

### Restart Policy: On Failures

- Make the application crash

```bash
curl http://localhost:8004/fail
```

```bash
{"message":"Crashing in 5 seconds with exit code 1"}%
```

- Check the running containers

```bash
docker ps
```

```bash
docker ps
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS          PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   21 minutes ago   Up 6 minutes    0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   21 minutes ago   Up 21 minutes   0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
c245cdcdd574   app-on-failure:0.0.1       "docker-entrypoint.s…"   21 minutes ago   Up 3 seconds    0.0.0.0:8004->8004/tcp, [::]:8004->8004/tcp   app_on_failure
```

- Make the application stop

```bash
curl http://localhost:8004/done
```

```bash
{"message":"Shutting down in 5 seconds with exit code 0"}%
```

- Recheck the running containers

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS          PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   23 minutes ago   Up 8 minutes    0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   23 minutes ago   Up 23 minutes   0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
```

- Check the count of restart times

```bash
docker inspect app_on_failure --format '{{.RestartCount}}'
```

```bash
1
```

### Restart Policy: Unless Stopped

- Make the application stop

```bash
curl http://localhost:8005/done
```

```bash
{"message":"Shutting down in 5 seconds with exit code 0"}%
```

- Check the running containers

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS          PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   25 minutes ago   Up 10 minutes   0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   25 minutes ago   Up 25 minutes   0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
```

- Make the application crash

```bash
curl http://localhost:8005/fail
```

```bash
{"message":"Crashing in 5 seconds with exit code 1"}%
```

- Recheck the running containers

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS          PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   25 minutes ago   Up 10 minutes   0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   25 minutes ago   Up 2 seconds    0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
```

- Check the count of restart times

```bash
docker inspect app_unless_stopped --format '{{.RestartCount}}'
```

```bash
2
```

- Manually Restart the Docker, then recheck the running containers

```bash
docker desktop restart
```

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED          STATUS         PORTS                                         NAMES
50cfca751750   app-always:0.0.1           "docker-entrypoint.s…"   29 minutes ago   Up 4 seconds   0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
4e42c83d6746   app-unless-stopped:0.0.1   "docker-entrypoint.s…"   29 minutes ago   Up 4 seconds   0.0.0.0:8005->8005/tcp, [::]:8005->8005/tcp   app_unless_stopped
```

- Manually stop both containers

```bash
docker stop app_always
docker stop app_unless_stopped
```

- Restart Docker over and check the running containers again

```bash
docker desktop restart
```

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE              COMMAND                  CREATED          STATUS         PORTS                                         NAMES
50cfca751750   app-always:0.0.1   "docker-entrypoint.s…"   32 minutes ago   Up 5 seconds   0.0.0.0:8003->8003/tcp, [::]:8003->8003/tcp   app_always
```
