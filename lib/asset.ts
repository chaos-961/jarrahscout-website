/** Static export is served from a sub-path on Pages, so plain <img> and other
    hand-written URLs need the prefix that next/link and next/font get for free. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const asset = (path: string) => `${BASE_PATH}${path}`;
