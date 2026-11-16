(() => {
  'use strict';
  window.SITE_DRAFT_KEY = 'sunghee-portfolio-draft-v3';
  const legacyKeys = ['sunghee-portfolio-draft-v2', 'sunghee-portfolio-draft-v1'];
  const removedPublicationIds = new Set(['review', 'gced']);
  const removedTalkIds = new Set(['review-aqia']);
  const currentCv = window.SITE_CONTENT?.profile?.cvUrl || 'assets/Sung-Hee-Lim-CV-website-v2.pdf';
  const currentReportProject = window.SITE_CONTENT?.projects?.find(project => project.id === 'global-ai');
  window.sanitizePortfolioContent = content => {
    if (!content || typeof content !== 'object') return content;
    const removedPublications = (content.publications || []).filter(item => removedPublicationIds.has(item.id));
    const removedTitles = new Set(removedPublications.map(item => item.title));
    const hadRemovedContent = removedTitles.size > 0 || (content.talks || []).some(item => removedTalkIds.has(item.id));
    if (Array.isArray(content.publications)) content.publications = content.publications.filter(item => !removedPublicationIds.has(item.id));
    if (Array.isArray(content.talks)) content.talks = content.talks.filter(item => !removedTalkIds.has(item.id) && !removedTitles.has(item.title));
    if (Array.isArray(content.projects) && currentReportProject) {
      content.projects = content.projects.map(project => {
        if (project.id === 'global-ai' && (hadRemovedContent || (project.relatedPublications || []).some(id => removedPublicationIds.has(id)))) return JSON.parse(JSON.stringify(currentReportProject));
        return project;
      });
    }
    const validPublications = new Set((content.publications || []).map(item => item.id));
    const validTalks = new Set((content.talks || []).map(item => item.id));
    for (const item of [...(content.projects || []), ...(content.publications || [])]) {
      if (Array.isArray(item.relatedPublications)) item.relatedPublications = item.relatedPublications.filter(id => validPublications.has(id));
      if (Array.isArray(item.relatedTalks)) item.relatedTalks = item.relatedTalks.filter(id => validTalks.has(id));
    }
    const oldCvPaths = ['assets/Sung-Hee-Lim-CV.pdf', 'assets/Sung-Hee-Lim-CV-website.pdf'];
    if (content.profile && (hadRemovedContent || oldCvPaths.includes(content.profile.cvUrl))) content.profile.cvUrl = currentCv;
    return content;
  };
  window.SITE_CONTENT = window.sanitizePortfolioContent(window.SITE_CONTENT);
  try {
    if (!localStorage.getItem(window.SITE_DRAFT_KEY)) {
      const legacy = legacyKeys.map(key => localStorage.getItem(key)).find(Boolean);
      if (legacy) {
        const draft = window.sanitizePortfolioContent(JSON.parse(legacy));
        if (draft && draft.profile) {
          draft.profile.cvUrl = currentCv;
          localStorage.setItem(window.SITE_DRAFT_KEY, JSON.stringify(draft));
        }
      }
    }
    legacyKeys.forEach(key => localStorage.removeItem(key));
  } catch { /* If storage is unavailable, use the current published content. */ }
})();
