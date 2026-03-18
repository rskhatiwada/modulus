// src/utils/imageUrl.js
const CDN_BASE = "/assets/images/courses";

export function getQuestionImage(courseSlug, imageKey) {
    if (!imageKey) return null;
    return `${CDN_BASE}/${courseSlug}/${imageKey}.webp`;
}