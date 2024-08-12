import { Queue, Worker } from 'bullmq';
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import Redis from "ioredis";
import { REDIS_URL } from '../config';
import { db, repositories } from '../core/database/schema';
import { updateCommitsInRepo } from '../core/services/commit';
import { fetchCommits } from '../core/services/github';
import { logger } from '../core/utils';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null
})

const queueOptions = {
  defaultJobOptions: {
    removeOnComplete: true, // this indicates that the job should be removed from the queue once it's complete
    removeOnFail: true, // this indicates that the job should be removed from the queue if it fails
  },
  connection: redis,
}

const commitQueue = new Queue('commit-fetching', queueOptions);


const worker = new Worker('commit-fetching', async (job: {
  data: {
    owner: string, repoName: string, lastFetchDate: Date | null
  }
}) => {
  const { owner, repoName, lastFetchDate } = job.data;
  logger.log("hita")

  try {
    logger.log({ lastFetchDate })
    const { commits: newCommits } = await fetchCommits(owner, repoName, {
      sinceDate: lastFetchDate ? lastFetchDate.toString() : null,
      limit: 30
    });
    if (newCommits.length > 0) await updateCommitsInRepo(newCommits);

    logger.log(`Fetched ${newCommits.length} new commits for ${owner}/${repoName}`);

    // Update the last fetch date for this repository
    await db.update(repositories)
      .set({ last_fetch_date: new Date() })
      .where(and(eq(repositories.owner, owner), eq(repositories.name, repoName)))
      .execute();


  } catch (error) {
    logger.error(`Error fetching commits for ${owner}/${repoName}:`, error);
  }
}, {
  connection: redis,
});


/**
 * Schedules commit fetching for all repositories in the database.
 * 
 * This function performs the following steps:
 * 1. Retrieves all repositories from the database.
 * 2. Removes any existing repeatable job with a specific key.
 * 3. Iterates through each repository and creates a new commit fetching job.
 * 
 * @async
 * @function scheduleCommitFetching
 * @throws {Error} If there's an issue accessing the database or scheduling jobs.
 */
async function scheduleCommitFetching() {
  logger.log("Scheduling commit fetching for all repositories");
  try {
    // Fetch all repositories from the database
    const repos = await db.select({
      owner: repositories.owner,
      name: repositories.name,
      last_fetch_date: repositories.last_fetch_date,
    }).from(repositories).execute();

    // Schedule a new job for each repository
    for (const repo of repos) {
      await createCommitFetchingJob(repo.owner, repo.name, repo.last_fetch_date);
    }

    logger.log(`Scheduled commit fetching for ${repos.length} repositories`);
  } catch (error) {
    logger.error("Error scheduling commit fetching:", error);
    throw error;
  }
}

/**
 * Creates a job to fetch commits for a specific repository.
 * 
 * @async
 * @function createCommitFetchingJob
 * @param {string} owner - The owner of the repository.
 * @param {string} repoName - The name of the repository.
 * @param {Date} lastFetchDate - The date of the last commit fetch for this repository.
 * @throws {Error} If there's an issue adding the job to the queue.
 */
export async function createCommitFetchingJob(owner: string, repoName: string, lastFetchDate: Date | null, once = false) {
  await commitQueue.add(`fetch-${owner}/${repoName}`, {
    owner: owner,
    repoName: repoName,
    lastFetchDate: lastFetchDate || null // Use Unix epoch if no last fetch date
  }, {
    ...(!once && {
      repeat: {
        every: 500000 // Repeat every 20 seconds (20000 ms)
      }
    })
  });
}

// Initial scheduling
scheduleCommitFetching();

// Reschedule every day to pick up any new repos
setInterval(scheduleCommitFetching, 86400000); // 24 hours in milliseconds
