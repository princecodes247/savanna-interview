import axios from 'axios';
import { GITHUB_TOKEN } from '../../config';
import { NewCommit } from '../database/schema';
import { logger, parseData } from '../utils';

const baseUrl = 'https://api.github.com';

const client = axios.create({
  baseURL: baseUrl,
  headers: {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28'
  }
});


export async function fetchRepositoryDetails(owner: string, repoName: string) {
  logger.log({ GTH: GITHUB_TOKEN })
  const url = `/repos/${owner}/${repoName}`;
  const response = await client.get(url);
  const data = response.data;
  return data
}
export async function fetchCommits(owner: string, repoName: string, options: {
  limit?: number;
  page?: number;
  sinceDate?: string | null;
} = {
    page: 1,
    limit: 100
  }
) {
  const url = `/repos/${owner}/${repoName}/commits`;
  const params: {
    since?: string;
    per_page?: number;
    page?: number;
  } = {};

  if (options.sinceDate) {
    params.since = options.sinceDate;
  }

  params.page = options?.page ?? 1;
  params.per_page = options.limit ?? 100;

  let pagesRemaining = true
  let commits: NewCommit[] = [];
  let authorCommitCounts = new Map<string, number>();

  while (pagesRemaining) {
    let retries = 0;
    const maxRetries = 3;
    let success = false;

    while (retries < maxRetries && !success) {
      try {
        const response = await client.get(url, { params });
        const linkHeader = response.headers.link;
        pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);
        const pagesLeft = linkHeader ? (linkHeader.match(/page=(\d+)&per_page=(\d+)>; rel="last"/) || [])[1] : '1';
        const parsedData = parseData(response.data);
        for (const commit of parsedData) {
          const author = commit.commit.author.name;
          commits.push({
            sha: commit.sha,
            message: commit.commit.message,
            author: author,
            date: new Date(commit.commit.author.date),
            url: commit.html_url,
            repository_full_name: `${owner}/${repoName}`
          });
          authorCommitCounts.set(author, (authorCommitCounts.get(author) || 0) + 1);
        }
        logger.log(`${commits.length} commits gotten`);
        logger.log(`Page ${params.page} of ${pagesLeft}`);
        params.page += 1;
        success = true;
      } catch (error: any) {
        // retries++;
        logger.error(`Error fetching commits (attempt ${retries}/${maxRetries}):`, error.message);
        if (retries === maxRetries) {
          logger.warn('Max retries reached. Saving current commits and stopping.');
          pagesRemaining = false;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }
    }
  }
  return { commits, authorCommitCounts };
}
