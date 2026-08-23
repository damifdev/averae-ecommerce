import results from '../ux-audit-results.json' with { type: 'json' };

for (const viewport of results) {
  const matching = viewport.searchFiltering.matchingSearch;
  const empty = viewport.searchFiltering.emptySearch;
  const matchingPasses = matching.value === 'linen' && matching.productCardCount > 0;
  const emptyPasses = empty.value === 'zzzz' && empty.productCardCount === 0;
  console.log(viewport.viewport, {
    matchingSearch: matchingPasses,
    matchingCount: matching.productCardCount,
    emptySearch: emptyPasses,
    emptyCount: empty.productCardCount,
  });
  if (!matchingPasses || !emptyPasses) process.exitCode = 1;
}
