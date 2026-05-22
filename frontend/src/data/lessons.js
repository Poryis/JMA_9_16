// JMA Lessons — Vimeo-hosted videos.
// Each lesson is locked until the previous one is fully watched.
// Watch-progress lives in localStorage via `useLessonsProgress`.

export const LESSONS = [
  { num: 1, vimeoId: '1194827150', title: 'Lesson 1', subtitle: 'Welcome to JMA!' },
  { num: 2, vimeoId: '1194828385', title: 'Lesson 2', subtitle: "Let's dive in" },
  { num: 3, vimeoId: '1194828386', title: 'Lesson 3', subtitle: 'Building blocks' },
  { num: 4, vimeoId: '1194830679', title: 'Lesson 4', subtitle: 'Mid-course magic' },
  { num: 5, vimeoId: '1194829196', title: 'Lesson 5', subtitle: 'Getting groovy' },
  { num: 6, vimeoId: '1194829198', title: 'Lesson 6', subtitle: 'Almost there!' },
  { num: 7, vimeoId: '1194829195', title: 'Lesson 7', subtitle: 'Graduation jam' },
];

export function getLesson(num) {
  return LESSONS.find((l) => l.num === Number(num)) || null;
}
