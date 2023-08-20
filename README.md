# Testing Lambdas Application

This repo holds a modified version of the FusionAuth 5 minute getting started guide. It uses the kickstart functionality to obviate manual configuration of FusionAuth.

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/app` directory contains a fully working version of the application.

## Project Dependencies
* Docker, for running FusionAuth
* Node.js 18 or later, for running the example application

## Running FusionAuth
To run FusionAuth, just stand up the docker containers using `docker-compose`.

```shell
docker-compose up
```

This will start a PostgreSQL database, and Elastic service, and the FusionAuth server.

## Running the Example App

```shell
cd app && \
npm install && \
npm start;
```

Visit the local webserver at `http://localhost:3000/` and sign in using the credentials:

* username: richard@example.com
* password: password
