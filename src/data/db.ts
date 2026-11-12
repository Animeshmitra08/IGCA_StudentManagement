import batchesSeed from '@/data/batches.json';
import contentSeed from '@/data/content.json';
import coursesSeed from '@/data/courses.json';
import modulesSeed from '@/data/modules.json';
import studentsSeed from '@/data/students.json';
import usersSeed from '@/data/users.json';

import type { Batch, ContentItem, Course, CourseModule, Student, User } from '@/src/types';

/**
 * In-memory stand-in for the backend. The JSON files under /data are the seed;
 * everything written at runtime lives here and resets when the app reloads.
 * Swapping this for a real API only requires rewriting src/services/api.ts.
 */
interface Database {
  users: User[];
  students: Student[];
  courses: Course[];
  modules: CourseModule[];
  content: ContentItem[];
  batches: Batch[];
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const db: Database = {
  users: clone(usersSeed) as User[],
  students: clone(studentsSeed) as Student[],
  courses: clone(coursesSeed) as Course[],
  modules: clone(modulesSeed) as CourseModule[],
  content: clone(contentSeed) as ContentItem[],
  batches: clone(batchesSeed) as Batch[],
};

/** Restores every table to its seeded state (used by the "Reset demo data" action). */
export function resetDb() {
  db.users = clone(usersSeed) as User[];
  db.students = clone(studentsSeed) as Student[];
  db.courses = clone(coursesSeed) as Course[];
  db.modules = clone(modulesSeed) as CourseModule[];
  db.content = clone(contentSeed) as ContentItem[];
  db.batches = clone(batchesSeed) as Batch[];
}

export function nextId(prefix: string, existing: { id: string }[]) {
  const n = existing.length + 1;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
