import { db, nextId, resetDb } from '@/src/data/db';
import type {
  Batch,
  ContentItem,
  Course,
  CourseModule,
  DashboardStats,
  RegistrationPayload,
  Student,
  User,
} from '@/src/types';

/** Fake network latency so loading states are exercised like a real API. */
const LATENCY = 350;

function respond<T>(factory: () => T, ms = LATENCY): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(JSON.parse(JSON.stringify(factory())));
      } catch (error) {
        reject(error);
      }
    }, ms);
  });
}

const today = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ auth */

export const api = {
  /** `identifier` is an email, or a student's registration (roll) number. */
  async login(identifier: string, password: string): Promise<User> {
    return respond(() => {
      const id = identifier.trim().toLowerCase();
      const rollOwner = db.students.find((s) => s.registrationNo.toLowerCase() === id);
      const user = db.users.find(
        (u) =>
          u.password === password &&
          (u.email.toLowerCase() === id || (!!rollOwner && u.studentId === rollOwner.id)),
      );
      if (!user) throw new Error('Invalid credentials. Check your email or roll number and password.');
      return user;
    }, 600);
  },

  /* -------------------------------------------------------------- courses */

  getCourses: () => respond<Course[]>(() => db.courses),

  getCourse: (courseId: string) =>
    respond<Course | undefined>(() => db.courses.find((c) => c.id === courseId)),

  getModules: (courseId: string) =>
    respond<CourseModule[]>(() =>
      db.modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order),
    ),

  getModuleContent: (moduleId: string) =>
    respond<ContentItem[]>(() =>
      db.content.filter((c) => c.moduleId === moduleId).sort((a, b) => a.order - b.order),
    ),

  getCourseContent: (courseId: string) =>
    respond<ContentItem[]>(() => db.content.filter((c) => c.courseId === courseId)),

  /* -------------------------------------------------------------- batches */

  getBatches: () => respond<Batch[]>(() => db.batches),

  getBatch: (batchId: string) =>
    respond<Batch | undefined>(() => db.batches.find((b) => b.id === batchId)),

  getBatchesByCourse: (courseId: string) =>
    respond<Batch[]>(() => db.batches.filter((b) => b.courseId === courseId)),

  createBatch: (input: Omit<Batch, 'id'>) =>
    respond<Batch>(() => {
      const batch: Batch = { ...input, id: nextId('BTH', db.batches) };
      db.batches.push(batch);
      return batch;
    }),

  /* ------------------------------------------------------------- students */

  getStudents: () => respond<Student[]>(() => db.students),

  getStudent: (studentId: string) =>
    respond<Student | undefined>(() => db.students.find((s) => s.id === studentId)),

  /** Registration entry point - always lands in PENDING_APPROVAL. */
  register: (payload: RegistrationPayload) =>
    respond<{ student: Student; user: User }>(() => {
      const exists = db.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
      if (exists) throw new Error('An account with this email already exists');

      const seq = db.students.length + 1;
      const student: Student = {
        id: nextId('STU', db.students),
        registrationNo: `REG-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`,
        status: 'PENDING_APPROVAL',
        fullName: payload.fullName,
        dob: payload.dob,
        gender: payload.gender,
        bloodGroup: payload.bloodGroup,
        email: payload.email,
        phone: payload.phone,
        altPhone: payload.altPhone,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        guardianName: payload.guardianName,
        guardianPhone: payload.guardianPhone,
        education: payload.education,
        courseId: payload.courseId,
        batchId: null,
        appliedOn: today(),
        reviewedOn: null,
        reviewedBy: null,
        allocatedOn: null,
        rejectionReason: null,
        documents: payload.documents,
        completedContentIds: [],
        avatarColor: '#4F46E5',
      };
      db.students.push(student);

      const user: User = {
        id: `USR-S${String(seq).padStart(2, '0')}`,
        role: 'STUDENT',
        studentId: student.id,
        name: student.fullName,
        email: student.email,
        password: payload.password,
        phone: student.phone,
        avatarColor: student.avatarColor,
      };
      db.users.push(user);

      return { student, user };
    }, 900),

  approve: (studentId: string, reviewer = 'Admin') =>
    respond<Student>(() => mutate(studentId, (s) => {
      s.status = 'APPROVED';
      s.reviewedOn = today();
      s.reviewedBy = reviewer;
      s.rejectionReason = null;
    })),

  reject: (studentId: string, reason: string, reviewer = 'Admin') =>
    respond<Student>(() => mutate(studentId, (s) => {
      s.status = 'REJECTED';
      s.reviewedOn = today();
      s.reviewedBy = reviewer;
      s.batchId = null;
      s.rejectionReason = reason;
    })),

  allocateBatch: (studentId: string, batchId: string) =>
    respond<Student>(() => {
      const batch = db.batches.find((b) => b.id === batchId);
      if (!batch) throw new Error('Batch not found');
      const filled = db.students.filter((s) => s.batchId === batchId).length;
      if (filled >= batch.capacity) throw new Error(`${batch.code} is already full`);

      return mutate(studentId, (s) => {
        s.batchId = batchId;
        s.allocatedOn = today();
        s.status = 'ALLOCATED';
      });
    }),

  activate: (studentId: string) =>
    respond<Student>(() => mutate(studentId, (s) => {
      if (!s.batchId) throw new Error('Allocate a batch before activating the student');
      s.status = 'ACTIVE';
    })),

  toggleContentComplete: (studentId: string, contentId: string) =>
    respond<Student>(() => mutate(studentId, (s) => {
      s.completedContentIds = s.completedContentIds.includes(contentId)
        ? s.completedContentIds.filter((id) => id !== contentId)
        : [...s.completedContentIds, contentId];
    }), 120),

  /* ------------------------------------------------------------ dashboard */

  getStats: () =>
    respond<DashboardStats>(() => {
      const by = (status: Student['status']) => db.students.filter((s) => s.status === status).length;
      return {
        students: {
          pending: by('PENDING_APPROVAL'),
          approved: by('APPROVED'),
          allocated: by('ALLOCATED'),
          active: by('ACTIVE'),
          rejected: by('REJECTED'),
          total: db.students.length,
        },
        courses: db.courses.length,
        batches: db.batches.length,
        content: db.content.length,
      };
    }),

  reset: () => respond<true>(() => {
    resetDb();
    return true;
  }),
};

function mutate(studentId: string, apply: (student: Student) => void): Student {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found');
  apply(student);
  return student;
}
