import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { WeekView } from '../components/Calendar/WeekView';
import { TaskList } from '../components/Tasks/TaskList';

export function Dashboard() {
  return (
    <MainLayout>
      <div className="flex h-full">
        <div className="flex-1 overflow-auto">
          <WeekView />
        </div>
        <TaskList />
      </div>
    </MainLayout>
  );
}
