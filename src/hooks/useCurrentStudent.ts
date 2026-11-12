import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';

/** Resolves the Student record behind the signed-in STUDENT account. */
export function useCurrentStudent() {
  const { user } = useAuth();
  const { studentById, courseById, batchById } = useData();

  const student = studentById(user?.studentId);
  const course = courseById(student?.courseId);
  const batch = batchById(student?.batchId);

  /** Content is gated until the enrolment is ALLOCATED or ACTIVE. */
  const hasCourseAccess = student?.status === 'ACTIVE' || student?.status === 'ALLOCATED';

  return { user, student, course, batch, hasCourseAccess };
}
