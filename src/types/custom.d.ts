/**
 * custom.d.ts
 * Description: TypeScript module declarations for Swiper CSS imports. 
 * These declarations allow importing Swiper CSS files without TypeScript compilation errors.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added module declarations for Swiper CSS to ensure TypeScript compatibility.
 */

/**
 * Module declaration for base Swiper CSS.
 * Input: N/A
 * Output: Allows `import "swiper/css";` without type errors.
 */
declare module 'swiper/css';

/**
 * Module declaration for Swiper Navigation CSS.
 * Input: N/A
 * Output: Allows `import "swiper/css/navigation";` without type errors.
 */
declare module 'swiper/css/navigation';

/**
 * Module declaration for Swiper Pagination CSS.
 * Input: N/A
 * Output: Allows `import "swiper/css/pagination";` without type errors.
 */
declare module 'swiper/css/pagination';