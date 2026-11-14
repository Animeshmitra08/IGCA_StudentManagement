import React from 'react';
import { BentoRow, FactTile, type TileTone } from './Bento';
import { daysBetween, formatDate } from '@/src/utils/format';
import type { Batch } from '@/src/types';

/** Tile tone for a batch: running is the accent, upcoming is "in progress", done is neutral. */
export function batchTone(status: Batch['status']): TileTone {
  return status === 'RUNNING' ? 'primary' : status === 'UPCOMING' ? 'info' : 'neutral';
}

/**
 * A batch's schedule as bento rows. Returns the rows themselves (not a component), so
 * they join the surrounding <Bento> and enter one after another:
 *
 *   <Bento>
 *     <RingHero ... />
 *     {scheduleTiles(batch)}
 *   </Bento>
 */
export function scheduleTiles(batch: Batch, options: { allocatedOn?: string | null } = {}) {
  const rows = [
    <BentoRow key="days">
      <FactTile span={3} icon="calendar-week" label="Days" value={batch.days} />
      <FactTile span={2} icon="map-marker-outline" label="Room" value={batch.room} />
    </BentoRow>,
    <BentoRow key="dates">
      <FactTile icon="calendar-start" label="Starts" value={formatDate(batch.startDate)} />
      <FactTile icon="calendar-end" label="Ends" value={formatDate(batch.endDate)} />
    </BentoRow>,
    <BentoRow key="time">
      <FactTile span={3} icon="clock-outline" label="Time" value={`${batch.startTime} - ${batch.endTime}`} />
      <FactTile
        span={2}
        icon="timer-sand"
        label="Length"
        value={`${daysBetween(batch.startDate, batch.endDate)} days`}
      />
    </BentoRow>,
  ];

  if (options.allocatedOn !== undefined) {
    rows.push(
      <FactTile
        key="allocated"
        icon="calendar-check-outline"
        label="Allocated on"
        value={options.allocatedOn ? formatDate(options.allocatedOn) : null}
      />,
    );
  }

  return rows;
}
