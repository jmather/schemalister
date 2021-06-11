Forked from https://github.com/benedwards44/schemalister

# Schema Lister

Django application for listing and exporting all objects and fields within a Salesforce Org. This app is designed to run on Heroku, but could be amended to run locally or any desired server

## Requirements
- Python 2.7.18
- Postgres DB (or other Django compatible DB)
- Redis

## Prep

Copy `.env.template` to `.env`.

## Setting up Salesforce

1. Create a new **Connected App** in the **App Manager**.
2. Fill out the *Basic Information* as appropriate.
3. Enable OAuth Settings
   1. The callback url will be `http://localhost:8000/oauth_response`.
   2. Add "Full Access" to the "Selected OAuth Scopes"
   3. Leave "Require Secret for Web Server Flows" checked.
   4. Save.
   5. Copy the **Consumer Key** value into `.env` as the value for **SALESFORCE_CONSUMER_KEY**.
   6. Copy the **Consumer Secret** value into `.env` as the value for **SALESFORCE_CONSUMER_SECRET**
   7. Ensure **SALESFORCE_API_VERSION** in `.env` matches your target environment's latest API version.

## Using with Docker (First Time)

1. Run: `docker-compose up -d`
2. Then go to: http://localhost:8000 and use it!