export interface AttachmentLink {
  title: string;
  url: string;
}

export interface DailyLog {
  id: string;
  studentId: string;
  logDate: string;
  weekNumber: number;
  workModality: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  supervisorName: string | null;
  tasksDone: string;
  problemsAndSolutions: string | null;
  learnings: string;
  hoursWorked: number;
  attachmentUrl: string | null;
  isBackdated: boolean;
  mentorApproved: boolean;
  mentorRating: number | null;
  mentorFeedback: string | null;
  createdAt: string;
}

export interface GroupedWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  approvedHours: number;
  mentorApproved: boolean;
  hasBackdated: boolean;
  mentorRating: number | null;
  mentorFeedback: string | null;
  days: DailyLog[];
}

export function parsePinPoints(text: string | null | undefined): string[] {
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
  } catch {
    // fallback
  }
  return text
    .split('\n')
    .map((line) => line.replace(/^[•\-\*\d+\.\s]+/, '').trim())
    .filter((line) => line.length > 0);
}

export function parseAttachmentLinks(attachmentUrl: string | null | undefined): AttachmentLink[] {
  if (!attachmentUrl) return [];
  try {
    const parsed = JSON.parse(attachmentUrl);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'string' && item.trim()) return { title: 'Artifact Link', url: item.trim() };
          if (typeof item === 'object' && item?.url) return { title: item.title?.trim() || 'Artifact Link', url: item.url.trim() };
          return null;
        })
        .filter(Boolean) as AttachmentLink[];
    }
  } catch {
    // fallback
  }

  return attachmentUrl
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('http://') || line.startsWith('https://'))
    .map((url) => ({ title: 'Artifact Link', url }));
}
