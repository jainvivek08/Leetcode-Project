/**
 * Generates a clean base slug from a title string.
 * Rules:
 * - Lowercase
 * - Replace non-alphanumerics with '-'
 * - Collapse consecutive dashes
 * - Trim leading/trailing dashes
 * - Max 80 chars (trimmed cleanly)
 * - Fallback: 'problem'
 * - Never a 24-char hex string (to avoid colliding with MongoDB ObjectId routes). If so, prefix 'p-'.
 */
function slugifyBase(title) {
  if (!title || typeof title !== 'string') {
    return 'problem';
  }

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    slug = 'problem';
  }

  if (slug.length > 80) {
    slug = slug.substring(0, 80).replace(/-+$/, '');
  }

  // Prevent collision with MongoDB 24-character hexadecimal ObjectId
  if (/^[0-9a-f]{24}$/.test(slug)) {
    slug = `p-${slug}`.substring(0, 80).replace(/-+$/, '');
  }

  return slug;
}

/**
 * Generates a unique slug by checking against existing problems in the database.
 * If candidate collides, appends -2, -3, etc.
 *
 * @param {string} title
 * @param {import('mongoose').Model} ProblemModel
 * @param {string|mongoose.Types.ObjectId} [excludeId]
 * @returns {Promise<string>}
 */
async function generateUniqueSlug(title, ProblemModel, excludeId = null) {
  const baseSlug = slugifyBase(title);
  let candidateSlug = baseSlug;
  let counter = 2;

  while (true) {
    const query = { slug: candidateSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await ProblemModel.findOne(query).select('_id').lean();
    if (!existing) {
      return candidateSlug;
    }

    const suffix = `-${counter}`;
    const maxBaseLen = 80 - suffix.length;
    const truncatedBase = baseSlug.length > maxBaseLen
      ? baseSlug.substring(0, maxBaseLen).replace(/-+$/, '')
      : baseSlug;

    candidateSlug = `${truncatedBase}${suffix}`;
    counter++;
  }
}

module.exports = {
  slugifyBase,
  generateUniqueSlug,
};
