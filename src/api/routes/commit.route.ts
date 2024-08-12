import { Router } from 'express';
import { getCommitsByRepositoryName, getTopCommitAuthors } from '../controllers/commit.controller';


const commitRoutes = Router();

commitRoutes.get('/:owner/:repoName', getCommitsByRepositoryName);
commitRoutes.get('/:owner/:repoName/top-authors', getTopCommitAuthors);

export default commitRoutes;
