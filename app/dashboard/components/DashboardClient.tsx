'use client';

import Active from "./Active";
import Entry from "./Entry";
import TodoList from "./TodoList";

export default function DashboardClient() {
  return (
    <div className="space-y-8">
      <Active />
      <Entry />
      <TodoList />
    </div>
  );
}
