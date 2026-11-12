import React from 'react';

import { useDataGate } from '@/src/components/DataGate';
import { ModuleGroup } from '@/src/components/ModuleGroup';
import { Screen } from '@/src/components/Screen';
import { EmptyState, Group, SectionHeader } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import type { Course } from '@/src/types';

export default function TeacherContent() {
  const { user } = useAuth();
  const { courseById, modulesOf, contentOf, refresh, refreshing } = useData();
  const gate = useDataGate('list');
  if (gate) return gate;

  const myCourses = (user?.courseIds ?? [])
    .map((id) => courseById(id))
    .filter((c): c is Course => !!c);

  if (myCourses.length === 0) {
    return (
      <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
        <EmptyState
          icon="bookshelf"
          title="No courses assigned"
          body="Courses you teach and their modules appear here."
        />
      </Screen>
    );
  }

  return (
    <Screen tabbed refreshing={refreshing} onRefresh={refresh}>
      {myCourses.map((course, index) => {
        const modules = modulesOf(course.id);
        return (
          <React.Fragment key={course.id}>
            <SectionHeader title={course.title} first={index === 0} />
            {modules.length === 0 ? (
              <Group>
                <EmptyState fill={false} icon="folder-open-outline" title="No modules yet" />
              </Group>
            ) : (
              modules.map((module) => (
                <ModuleGroup key={module.id} module={module} items={contentOf(module.id)} />
              ))
            )}
          </React.Fragment>
        );
      })}
    </Screen>
  );
}
