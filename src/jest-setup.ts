import path from 'path';
import { promises as fs } from 'fs';
import { getTestDbConnection } from './utils/database';

const MIGRATIONS_DIR = `./flyway/todo/`;
const IGNORED_MIGRATIONS = [`V1.0__permissions.sql`];

export default async () => {
  const pool = getTestDbConnection();
  await pool.query(`DROP SCHEMA IF EXISTS todo_api CASCADE`);
  await pool.query(`CREATE SCHEMA todo_api`);

  const migrationFiles = await loadMigrations();
  for (const migrationFile of migrationFiles) {
    const migrationSql = await fs.readFile(path.join(MIGRATIONS_DIR, migrationFile));
    await pool.query(migrationSql.toString());
  }

  await pool.end();
};

const loadMigrations = async () => {
  const dirListing = await fs.readdir(MIGRATIONS_DIR);
  const desiredMigrations = dirListing.filter(file => !IGNORED_MIGRATIONS.includes(file));
  return desiredMigrations.sort(byFlywayVersion);
};

const byFlywayVersion = (a: string, b: string) => {
  const [majorA, minorA] = parseFlywayVersion(a);
  const [majorB, minorB] = parseFlywayVersion(b);
  return (majorA * 100_000 + minorA) - (majorB * 100_000 - minorB);
};

const parseFlywayVersion = (fileName: string): [major: number, minor: number] => {
  const match = fileName.match(/V(?<major>\d+).(?<minor>\d+)/);
  if (!match?.groups) throw Error(`Failed to parse flyway migration version for file: ${fileName}`);
  const { major, minor } = match.groups;
  return [Number(major), Number(minor)];
};
