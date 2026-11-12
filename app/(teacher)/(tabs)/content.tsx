import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { AppHeader } from '@/src/components/AppHeader';
import { ContentRow } from '@/src/components/ContentRow';
import { Screen } from '@/src/components/Screen';
import { Card, EmptyState, Pill, SectionHeader } from '@/src/components/ui';
import { useAuth } from '@/src/context/AuthContext';
import { useData } from '@/src/context/DataContext';
import { radius, spacing } from '@/src/theme/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TeacherContent() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { courseById, modulesOf, contentOf, courseContent, refresh, refreshing } = useData();

  const myCourses = (user?.courseIds ?? []).map((id) => courseById(id)).filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <AppHeader title="Course Content" subtitle="Modules you teach" />

      <Screen refreshing={refreshing} onRefresh={refresh}>
        {myCourses.length === 0 && (
          <Card>
            <EmptyState icon="bookshelf" title="No courses assigned" />
          </Card>
        )}

        {myCourses.map((course) => {
          if (!course) return null;
          const modules = modulesOf(course.id);

          return (
            <View key={course.id}>
              <SectionHeader
                title={course.title}
                subtitle={`${modules.length} modules · ${courseContent(course.id).length} items`}
              />

              {modules.map((module) => {
                const items = contentOf(module.id);
                return (
                  <Card key={module.id} style={styles.moduleCard}>
                    <View style={styles.moduleHead}>
                      <View style={[styles.moduleIndex, { backgroundColor: course.color + '1F' }]}>
                        <Text style={{ fontWeight: '800', color: course.color }}>{module.order}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                          {module.title}
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.muted }} numberOfLines={2}>
                          {module.description}
                        </Text>
                      </View>
                      <Icon source={course.icon} size={18} color={course.color} />
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                      <Pill icon="play-box-outline" label={`${items.length} items`} />
                    </View>

                    {items.map((item) => (
                      <ContentRow key={item.id} item={item} />
                    ))}
                  </Card>
                );
              })}
            </View>
          );
        })}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  moduleCard: { marginBottom: spacing.md, paddingBottom: spacing.xs },
  moduleHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  moduleIndex: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
