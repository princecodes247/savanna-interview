import { and, eq } from 'drizzle-orm';
import { db, repositories } from '../database/schema';
import { logger } from '../utils';
import { fetchRepositoryDetails } from './github';


interface RepoData {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  open_issues_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
}

function createRepository(data: RepoData, owner: string) {
  return {
    name: data.name,
    full_name: `${owner}/${data.name}`,
    owner,
    description: data.description,
    url: data.html_url,
    language: data.language,
    forks_count: data.forks_count,
    stars_count: data.stargazers_count,
    open_issues_count: data.open_issues_count,
    watchers_count: data.watchers_count,
    last_fetch_date: new Date(),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  };
}

export async function getRepository(owner: string, repoName: string) {
  try {
    const repository = await db.query.repositories.findFirst({
      where: and(eq(repositories.name, repoName), eq(repositories.owner, owner))
    });
    logger.log({ repository })
    if (!repository) {
      const data = await fetchRepositoryDetails(owner, repoName)
      const newRepo = createRepository(data, owner)
      const res = await db.insert(repositories).values(newRepo).execute();
      logger.log({ newRepo, res })
      return newRepo
    }
    return repository;
  } catch (error: any) {
    logger.error('Error retrieving repository from the database:', error.message);
    throw error;
  }
}
