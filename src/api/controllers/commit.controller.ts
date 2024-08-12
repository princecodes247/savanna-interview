import { Request, Response } from 'express';
import { getAllCommitsInRepo, getAuthorsByCommitCount } from '../../core/services/commit';

export async function getCommitsByRepositoryName(req: Request, res: Response) {
  const { repoName, owner } = req.params;


  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const commits = await getAllCommitsInRepo(`${owner}/${repoName}`, page, limit);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getTopCommitAuthors(req: Request, res: Response) {

  const { repoName, owner } = req.params;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const topAuthors = await getAuthorsByCommitCount(`${owner}/${repoName}`, page, limit);
    res.json(topAuthors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
