// src/data/mockProgressData.js

export const mockData = {
  '7 Days': [
    { date: 'Mon', completedTasks: 5, missedTasks: 2 },
    { date: 'Tue', completedTasks: 6, missedTasks: 1 },
    { date: 'Wed', completedTasks: 4, missedTasks: 3 },
    { date: 'Thu', completedTasks: 7, missedTasks: 0 },
    { date: 'Fri', completedTasks: 3, missedTasks: 4 },
    { date: 'Sat', completedTasks: 6, missedTasks: 1 },
    { date: 'Sun', completedTasks: 5, missedTasks: 2 },
  ],
  '30 Days': [...Array(30)].map((_, i) => ({
    date: `Day ${i + 1}`,
    completedTasks: Math.floor(Math.random() * 8),
    missedTasks: Math.floor(Math.random() * 4),
  })),
  '2 Months': [...Array(60)].map((_, i) => ({
    date: `Day ${i + 1}`,
    completedTasks: Math.floor(Math.random() * 8),
    missedTasks: Math.floor(Math.random() * 4),
  })),
  '6 Months': [...Array(180)].map((_, i) => ({
    date: `Day ${i + 1}`,
    completedTasks: Math.floor(Math.random() * 8),
    missedTasks: Math.floor(Math.random() * 4),
  })),
  '1 Year': [...Array(365)].map((_, i) => ({
    date: `Day ${i + 1}`,
    completedTasks: Math.floor(Math.random() * 8),
    missedTasks: Math.floor(Math.random() * 4),
  })),
};

export const mockMissedTasks = [
  { name: 'Meditation', missedCount: 12 },
  { name: 'Exercise', missedCount: 9 },
  { name: 'Code Practice', missedCount: 7 },
];
