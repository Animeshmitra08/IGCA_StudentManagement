import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/src/services/api';
import type {
  Batch,
  ContentItem,
  Course,
  CourseModule,
  DashboardStats,
  Student,
} from '@/src/types';

interface DataValue {
  loading: boolean;
  refreshing: boolean;
  /** Set when the first load failed and there is nothing to show. */
  error: string | null;
  courses: Course[];
  modules: CourseModule[];
  content: ContentItem[];
  batches: Batch[];
  students: Student[];
  stats: DashboardStats | null;

  refresh: () => Promise<void>;

  /* selectors */
  courseById: (id?: string | null) => Course | undefined;
  batchById: (id?: string | null) => Batch | undefined;
  studentById: (id?: string | null) => Student | undefined;
  modulesOf: (courseId?: string | null) => CourseModule[];
  contentOf: (moduleId: string) => ContentItem[];
  courseContent: (courseId?: string | null) => ContentItem[];
  batchesOf: (courseId?: string | null) => Batch[];
  studentsOfBatch: (batchId: string) => Student[];
  studentsOfCourse: (courseId: string) => Student[];
  seatsTaken: (batchId: string) => number;

  /* actions */
  approve: (studentId: string, reviewer?: string) => Promise<void>;
  reject: (studentId: string, reason: string, reviewer?: string) => Promise<void>;
  allocateBatch: (studentId: string, batchId: string) => Promise<void>;
  activate: (studentId: string) => Promise<void>;
  toggleComplete: (studentId: string, contentId: string) => Promise<void>;
  createBatch: (input: Omit<Batch, 'id'>) => Promise<void>;
  resetData: () => Promise<void>;
}

const DataContext = createContext<DataValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const load = useCallback(async () => {
    const [c, b, s, st] = await Promise.all([
      api.getCourses(),
      api.getBatches(),
      api.getStudents(),
      api.getStats(),
    ]);
    const allModules = (await Promise.all(c.map((course) => api.getModules(course.id)))).flat();
    const allContent = (await Promise.all(c.map((course) => api.getCourseContent(course.id)))).flat();

    setCourses(c);
    setBatches(b);
    setStudents(s);
    setStats(st);
    setModules(allModules);
    setContent(allContent);
    setLoaded(true);
    setError(null);
  }, []);

  const describe = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

  useEffect(() => {
    // Every setState in load() runs after an await, so none of it is synchronous.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
      .catch((e) => setError(describe(e)))
      .finally(() => setLoading(false));
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setError(describe(e));
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      await action();
      await load();
    },
    [load],
  );

  const value = useMemo<DataValue>(() => {
    const sortedContent = [...content].sort((a, b) => a.order - b.order);

    return {
      loading,
      refreshing,
      // Once data has loaded, a failed refresh keeps the last good data on screen.
      error: loaded ? null : error,
      courses,
      modules,
      content: sortedContent,
      batches,
      students,
      stats,
      refresh,

      courseById: (id) => courses.find((c) => c.id === id),
      batchById: (id) => batches.find((b) => b.id === id),
      studentById: (id) => students.find((s) => s.id === id),
      modulesOf: (courseId) =>
        modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order),
      contentOf: (moduleId) =>
        sortedContent.filter((c) => c.moduleId === moduleId),
      courseContent: (courseId) => sortedContent.filter((c) => c.courseId === courseId),
      batchesOf: (courseId) => batches.filter((b) => b.courseId === courseId),
      studentsOfBatch: (batchId) => students.filter((s) => s.batchId === batchId),
      studentsOfCourse: (courseId) => students.filter((s) => s.courseId === courseId),
      seatsTaken: (batchId) => students.filter((s) => s.batchId === batchId).length,

      approve: (studentId, reviewer) => run(() => api.approve(studentId, reviewer)),
      reject: (studentId, reason, reviewer) => run(() => api.reject(studentId, reason, reviewer)),
      allocateBatch: (studentId, batchId) => run(() => api.allocateBatch(studentId, batchId)),
      activate: (studentId) => run(() => api.activate(studentId)),
      toggleComplete: (studentId, contentId) =>
        run(() => api.toggleContentComplete(studentId, contentId)),
      createBatch: (input) => run(() => api.createBatch(input)),
      resetData: () => run(() => api.reset()),
    };
  }, [loading, refreshing, error, loaded, courses, modules, content, batches, students, stats, refresh, run]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
