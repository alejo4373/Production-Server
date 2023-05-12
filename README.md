# Production App Server

Express server for the management of Todos and Journal Entries for my personal project called Production App

## Local Setup

1. `git clone` this repo
2. `npm install`
3. Make sure the environment variables are set and a database is available
4. Create and structure the database with `createdb production_dev_db && npm run dbm:up`
5. `npm start`

### Environment Variables

- `SESSION_SECRET` a string for the signing of cookies

## Deployment

This app is deployed to AWS Elasticbeanstak. To deploy this app one must

1. `eb init` being in the root directory of the app
2. `eb create` to create an elastic beanstalk environment.
   - Follow the steps in the prompt
   - This will zip the application code and provision de db as per `.ebextensions/db-instance-options.config`

```sh
DATABASE_URL
PGSSLMODE=no-verify # heroku only (as far as I know)
REACT_APP_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET
SESSION_SECRET
```
