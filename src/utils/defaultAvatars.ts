/**
 * CAMPUS 6.0 — ১৮টা Built-in Avatar (user-imported)
 * Files: public/avatars/avatar-1.png ... avatar-18.png
 * কোনো external/fallback avatar নেই
 */

export interface DefaultAvatar {
  id: string;
  url: string;
  label: string;
}

export const DEFAULT_AVATARS: DefaultAvatar[] = Array.from({ length: 18 }, (_, i) => ({
  id: `av${i + 1}`,
  url: `/avatars/avatar-${i + 1}.png`,
  label: `#${i + 1}`,
}));

export const getAvatarById = (id: string): DefaultAvatar | undefined =>
  DEFAULT_AVATARS.find((a) => a.id === id);

export const getAvatarUrl = (id: string): string =>
  getAvatarById(id)?.url || DEFAULT_AVATARS[0].url;