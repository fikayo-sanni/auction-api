# Auction Api

## Description

The above project was implemented using the nestjs framework. There are 2 main way to get started with it

- Yarn/NPM
- Docker

## Working with Yarn

### Creating a .env file

Start by creating a .env file, a good example can be found in the .env.example file provided in the root folder. It provides a good overview and description of the required variables

### Installation

```bash
$ yarn install
```

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Test

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

## Working with Docker

Start by filling out the required enviromnetal variables in the docker-compose.yml file in the root folder of the application, you can also look at the  .env.example file for further guidiance on the what each individual variable means.

### Build and Run

```bash
# inital build
$ docker-compose up --build


# subsequent docker compose
$ docker-compose up 
```

Both of these methods serve the application over [https://localhost:3000](local deployment)

Remote URL: [https://auction-api-2-bwjwsipn3a-uc.a.run.app](Remote Deployment)
Postman Documentation: [https://documenter.getpostman.com/view/778610/2sA35Bc519](Docs)

## License

Nest is [MIT licensed](LICENSE).
