# Production App Server

Express server for the management of Todos and Journal Entries for my personal project called Production App

## Local Setup

1. `git clone` this repo
2. `npm install`
3. Make sure the environment variables are set and a database is available
4. Create and structure the database with `NODE_ENV=dev createdb production_dev_db && npm run dbm:up`
5. `npm start`

### Environment Variables

- `SESSION_SECRET` a string for the signing of cookies

## Deployment

This app is deployed to AWS Elasticbeanstak. To deploy this app one must

1. `eb init` being in the root directory of the app
2. `eb create --database` to create an elastic beanstalk environment.
   - Follow the steps in the prompt
   - This will zip the application code and send it to an S3 for deployment
   - This will provision a db (hence `--database`). The DB would be provisioned with the settings specified in `.ebextensions/db-instance-options.config`
     - Follow the prompts to set a username and password for the db. Remember those
3. Set needed environment variables

   - `REACT_APP_RECAPTCHA_SITE_KEY` is used by React at build time and injected in the client code. The client react app is built by `.platform/hooks/predeploy/01_build-client.sh` when deploying

   ```
   eb setenv \
   SESSION_SECRET=<A_SESSION_SECRET_STRING> \
   RECAPTCHA_SECRET=<RECAPTCHA_SECRET_KEY> \
   REACT_APP_RECAPTCHA_SITE_KEY=<RECAPTCHA_SITE_KEY>
   ```

### Connecting to the database for inspection, restoration or dump

The database does not offer direct access, as such one needs to "Set up EC2 connection" for it. This allows connecting to the DB thru an EC2 instance which we can connect to via SSH

1. On the RDS console, select the db one wants to connect. Then "Actions" -> "Set up EC2 connection"
2. Connect to the the EC2 instance that was selected to connect to the DB using SSH port forwarding. Something like:

   ```
   ssh -i SSH_KEY -L LOCAL_PORT:RDS_INSTANCE_HOST.AWS_REGION.rds.amazonaws.com:REMOTE_PORT ec2-user@EC2_HOST`
   ```

   - `LOCAL_PORT` AND `REMOTE_PORT` is usually 5432
   - `RDS_INSTANCE_HOST` can be found in the database instance dashboard

   For more details see:

   - https://repost.aws/knowledge-center/rds-connect-ec2-bastion-host
   - Or https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html

3. Then locally `psql postgresql://RDS_USERNAME:RDS_PASSWORD@localhost:5432/DB_NAME` or `psql --host=localhost --username=ebroot --dbname=ebdb`

   3.1 If restoring the database from a dump, append `-f DUMP_FILE.dump`

## Setting up an SSL Certificate for the application to use HTTPS

Setting up a ssl certificate was done by requesting a public certificate in [ACM](https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/list) for the domain you want to use with the application use, in my case that was `production.alejandrofran.co`

The requested certificate must be verified with your DNS provider (Google domains in my case). To verify the certificate you need to add a temporary CNAME record to your dns provider with the CNAME name and CNAME value displayed in your Certificate's ACM page. This is used for aws to verify you are the owner of the domain you're requesting a cert for.

This is what my certificate looks like in ACM
![my cert on acm](./docs/assets/cert-on-acm.png)

Then on my DNS I set up the following records
![dns records showing two CNAME records one for validation and the other for actual forwarding](./docs/assets/dns-validation.png)

The last step outlined in pink is to add one last CNAME for your actual domain/subdomain (production.alejandrofran.co in my case) to point to the load balancer (in my case `code-server-load-balancer...`)

## Debugging tips

- `/var/log/eb-engine.log` contains the log of nginx startup and error if any
- `journalctl -xe` shows all logs including logs from from the application
- `journalctl -xe -u nginx`
- `/var/app/current` location of the app in the ec2 instance

## Todo

- [ ] Setup db migrations to trigger on deploy
