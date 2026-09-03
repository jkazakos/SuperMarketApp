export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: number;
}

export const getFullName = (profile: Partial<UserProfile> | null): string => {
  if (!profile) return '';
  return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
};
