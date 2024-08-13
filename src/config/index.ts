import { logger } from "../core/utils";

require('dotenv').config();

function getEnv(variable: string, optional: boolean = false) {
    if (process.env[variable] === undefined) {
        if (optional) {
            logger.warn(
                `[@env]: Environmental variable for ${variable} is not supplied.`,
            );
        } else {
            throw new Error(
                `You must create an environment variable for ${variable}`,
            );
        }
    }

    return process.env[variable]?.replace(/\\n/gm, '\n');
}

//Environments
export const env = {
    isDev: String(process.env.NODE_ENV).toLowerCase().includes('dev'),
    isProd: String(process.env.NODE_ENV).toLowerCase().includes('prod'),
    env: process.env.NODE_ENV,
};

export const PORT = getEnv('PORT')!;
export const GITHUB_TOKEN = getEnv('GITHUB_TOKEN')!;

// Postgres
export const POSTGRES_HOST = getEnv('POSTGRES_HOST', true);
export const POSTGRES_USER = getEnv('POSTGRES_USER', true);
export const POSTGRES_PASSWORD = getEnv('POSTGRES_PASSWORD', true);
export const POSTGRES_PORT = getEnv('POSTGRES_PORT', true);
export const POSTGRES_DB = getEnv('POSTGRES_DB', true);
export const POSTGRES_URL = getEnv('POSTGRES_URL', true);


// Redis
export const REDIS_URL = getEnv('REDIS_URL')!;
