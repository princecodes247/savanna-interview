import 'dotenv/config';
import * as express from "express";
import { PORT } from '../config';
import { logger } from '../core/utils';
import commitRoutes from "./routes/commit.route";
import repositoryRoutes from "./routes/repository.route";

// create and setup express app
const app = express()
app.use(express.json())


// Routes
app.use('/api/commits', commitRoutes);
app.use('/api/repositories', repositoryRoutes);

// start express server
app.listen(PORT, () => logger.log('Server is running on port 3000'))