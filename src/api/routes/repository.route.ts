import { Router } from 'express';
import { fetchRepositoryDetails } from '../controllers/repository.controller';

const repositoryRoutes = Router();

repositoryRoutes.get('/:owner/:repoName', fetchRepositoryDetails);

export default repositoryRoutes;
