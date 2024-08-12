# GitHub Commits Indexer

## Overview

This project is a robust GitHub Commits Indexer that indexes commits on any provided GitHub repository and keeps the index up-to-date. 

## Features

- Fetch comprehensive repository details (name, owner, description, forks, stars, etc.)
- Retrieve and analyze commit history
- Utilizes PostgreSQL for data persistence
- Implements Redis for job queues
- Includes a comprehensive test suite for reliability

## Tech Stack

- Node.js
- TypeScript
- PostgreSQL
- Redis
- Vitest (for testing)

## Prerequisites

- Node.js (v14 or later)
- GitHub Personal Access Token

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/princecodes247/savanna-interview.git
   cd savanna-interview
   ```

2. Create a `.env` from `.env.example` file in the root directory and add the following environment variables:
   ```
   NODE_ENV=development
   GITHUB_TOKEN=your_github_personal_access_token
   PORT=3000
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=postgresdb
   POSTGRES_PORT=5432
   REDIS_URL=redis
   REDIS_PORT=6379
   ```
   Replace `your_github_personal_access_token` with your actual GitHub token.

3. Run the installation:
   ```
   npm install
   ```

4. Run the dev server:
   ```
   npm run api:watch
   ```
The application should now be running on `http://localhost:3000`

5. Run the cron:
   ```
   npm run cron:watch
   ```

## Running Tests

To run the test suite:

   ```
   npm run test
   ```
