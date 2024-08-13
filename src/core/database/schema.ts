import { relations } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { Pool } from 'pg';
import { POSTGRES_URL } from '../../config';

// Setup PostgreSQL connection pool
export const pool = new Pool({
  connectionString: POSTGRES_URL
});


export const repositories = pgTable('repositories', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').unique(),
  name: text('name').notNull(),
  owner: text('owner').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  language: text('language'),
  forks_count: integer('forks_count').default(0),
  stars_count: integer('stars_count').default(0),
  open_issues_count: integer('open_issues_count').default(0),
  watchers_count: integer('watchers_count').default(0),
  last_fetch_date: timestamp('last_fetch_date').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const repositoriesRelations = relations(repositories, ({ many }) => ({
  commits: many(commits),
}));

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;


export const commits = pgTable('commits', {
  id: serial('id').primaryKey(),
  sha: text('sha').notNull(),
  message: text('message').notNull(),
  author: text('author').notNull(),
  date: timestamp('date').notNull(),
  url: text('url').notNull(),
  repository_full_name: text('repository_full_name').references(() => repositories.full_name).notNull(),
}, (table) => {
  return {
    commitUnique: uniqueIndex('commit_unique').on(table.sha),
  }
});

export const commitsRelations = relations(commits, ({ one }) => ({
  repository: one(repositories, {
    fields: [commits.repository_full_name],
    references: [repositories.full_name],
  }),
}));

export const authorCommitCounts = pgTable('author_commit_counts', {
  id: serial('id').primaryKey(),
  author: text('author').notNull(),
  commit_count: integer('commit_count').notNull(),
  repository_full_name: text('repository_full_name').references(() => repositories.full_name).notNull(),
}, (table) => {
  return {
    authorRepoUnique: uniqueIndex('author_repo_unique').on(table.author, table.repository_full_name),
  }
});

export const authorCommitCountsRelations = relations(authorCommitCounts, ({ one }) => ({
  repository: one(repositories, {
    fields: [authorCommitCounts.repository_full_name],
    references: [repositories.full_name],
  }),
}));

export type AuthorCommitCount = typeof authorCommitCounts.$inferSelect;
export type NewAuthorCommitCount = typeof authorCommitCounts.$inferInsert;


export type Commit = typeof commits.$inferSelect;
export type NewCommit = typeof commits.$inferInsert;

export const db = drizzle(pool,
  {
    schema: {
      authorCommitCounts,
      commits,
      repositories,
    }
  }
);
