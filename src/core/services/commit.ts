
import { count, eq, sql } from 'drizzle-orm';
import { authorCommitCounts, commits, db, NewCommit } from '../database/schema';
import { logger } from '../utils';

export async function getAllCommitsInRepo(repoFullName: string, page: number = 1, limit: number = 100) {
	try {
		const offset = (page - 1) * limit;
		const commitsData = await db.select()
			.from(commits)
			.where(eq(commits.repository_full_name, repoFullName))
			.limit(limit)
			.offset(offset);

		return { commits: commitsData, page, limit };
	} catch (error: any) {
		logger.error('Error retrieving commits from the database:', error.message);
		throw error;
	}
}

export async function clearAllCommits(repoFullName: string) {
	try {
		await db.delete(commits)
			.where(eq(commits.repository_full_name, repoFullName))

	} catch (error: any) {
		logger.error('Error clearing commits from the database:', error.message);
		throw error;
	}
}

export async function updateCommitsInRepo(newCommits: NewCommit[]) {
	try {
		await db.insert(commits).values(newCommits).onConflictDoNothing({
			target: commits.sha,
		})
			.execute();
		return newCommits;
	} catch (error: any) {
		logger.error('Error updating commits in the database:', error.message);
		throw error;
	}
}

export async function getAuthorsByCommitCount(repoFullName: string, page: number = 1, limit: number = 10) {
	try {
		const offset = (page - 1) * limit;
		const authors = await db
			.select({
				author: commits.author,
				commitCount: count(commits.id).as('commit_count')
			})
			.from(commits)
			.where(eq(commits.repository_full_name, repoFullName))
			.groupBy(commits.author)
			.orderBy(sql`commit_count DESC`)
			.limit(limit)
			.offset(offset);

		return { authors, page, limit };
	} catch (error: any) {
		logger.error('Error retrieving authors by commit count:', error.message);
		throw error;
	}
}


export async function updateCommitCounts(repoFullName: string, authorCommits: Map<string, number>) {
	try {
		const updates = Array.from(authorCommits.entries()).map(([author, count]) => ({
			author,
			commit_count: count,
			repository_full_name: repoFullName
		}));

		await db
			.insert(authorCommitCounts)
			.values(updates)
			.onConflictDoUpdate({
				target: [authorCommitCounts.author, authorCommitCounts.repository_full_name], set: {
					commit_count: sql`${authorCommitCounts.commit_count} + excluded.commit_count`
				}
			})
			.execute();

		logger.log(`Updated commit counts for ${updates.length} authors in ${repoFullName}`);
	} catch (error: any) {
		logger.error('Error updating author commit counts:', error.message);
		throw error;
	}
}
