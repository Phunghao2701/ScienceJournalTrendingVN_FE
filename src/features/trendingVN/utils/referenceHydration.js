const toNonNegativeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const getArticleReferenceSignalCount = (...sources) => sources.reduce(
  (highestCount, source) => {
    if (!source || typeof source !== 'object') return highestCount;

    const rawReferencesCount = Array.isArray(source.references)
      ? source.references.length
      : 0;
    const declaredCount = Math.max(
      toNonNegativeNumber(source.reference_count),
      toNonNegativeNumber(source.references_count),
      toNonNegativeNumber(source.available_references_count),
    );

    return Math.max(highestCount, rawReferencesCount, declaredCount);
  },
  0,
);

export const getAvailableReferenceDisplayCount = (
  detailedTotal,
  ...fallbackSources
) => {
  const normalizedDetailedTotal = toNonNegativeNumber(detailedTotal);
  if (normalizedDetailedTotal > 0) return normalizedDetailedTotal;
  return getArticleReferenceSignalCount(...fallbackSources);
};

export const shouldHydrateArticleReferences = ({
  isReferencesTabActive,
  isAuthenticated,
  isGetSuccess,
  hasGetError,
  detailedItemsCount,
  detailedTotal,
  articleReferenceSignalCount,
}) => (
  Boolean(isReferencesTabActive)
  && Boolean(isAuthenticated)
  && Boolean(isGetSuccess)
  && !hasGetError
  && toNonNegativeNumber(detailedItemsCount) === 0
  && toNonNegativeNumber(detailedTotal) === 0
  && toNonNegativeNumber(articleReferenceSignalCount) > 0
);

export const buildReferenceHydrationQueryKey = (articleId) => [
  'trendingVN',
  'articleReferencesHydration',
  String(articleId ?? ''),
];
