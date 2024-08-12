import { Request, Response } from 'express';
import { getRepository } from '../../core/services/repository';

export async function fetchRepositoryDetails(req: Request, res: Response) {
  const { repoName, owner } = req.params;
  try {
    const repository = await getRepository(owner, repoName);
    res.json(repository);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
