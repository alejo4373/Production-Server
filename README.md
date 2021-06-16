# Production App Server

Express server for the management of Todos and Journal Entries for my personal project called Production App

## Local Setup

1. `git clone` this repo
2. `npm install`
3. Make sure the environment variables are set and a database is available
4. Create and structure the database with `createdb production_dev_db && npm run dbm:up`
5. `npm start`

### Environment Variables
* `DATABASE_URL` pointing to an instance of Postgres running
* `SESSION_SECRET` a string for the signing of cookies

## Deployment

This app is deployed to Heroku. The following environment variables must be available

```sh
DATABASE_URL
PGSSLMODE=no-verify # heroku only (as far as I know)
REACT_APP_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET
SESSION_SECRET
```
