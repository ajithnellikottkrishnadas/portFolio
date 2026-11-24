import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useMedia';

/** Phones and small tablets only. Desktop (900px and wider) never matches this query. */
export const MOBILE_QUERY = '(max-width: 899px)';

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

export { usePrefersReducedMotion };
