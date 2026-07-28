import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import i18next from 'i18next';
import {
  buildOrcidArticleDetailNavigation,
  canReuseOrcidResult,
  isValidOrcid,
  normalizeArticlePageResponse,
  normalizeCursorArticleResponse,
  normalizeOrcid,
  normalizeScanJobResponse,
  normalizeScanResponse,
} from '../src/features/orcid/utils/orcid.js';

const tests = [];
const enLocale = JSON.parse(
  readFileSync(new URL('../src/shared/i18n/locales/en.json', import.meta.url), 'utf8'),
);
const viLocale = JSON.parse(
  readFileSync(new URL('../src/shared/i18n/locales/vi.json', import.meta.url), 'utf8'),
);

const test = (name, fn) => {
  tests.push({ name, fn });
};

test('normalizes compact and URL-form ORCID identifiers', () => {
  assert.equal(normalizeOrcid('0000000218250097'), '0000-0002-1825-0097');
  assert.equal(
    normalizeOrcid('https://orcid.org/0000-0002-1825-0097/'),
    '0000-0002-1825-0097',
  );
});

test('validates ORCID MOD 11-2 checksum', () => {
  assert.equal(isValidOrcid('0000-0002-1825-0097'), true);
  assert.equal(isValidOrcid('0000-0002-1694-233X'), true);
  assert.equal(isValidOrcid('0000-0002-1825-0098'), false);
  assert.equal(isValidOrcid('not-an-orcid'), false);
});

test('reuses the visible result when the same ORCID is submitted again', () => {
  assert.equal(canReuseOrcidResult({
    submittedOrcid: '0000-0002-1825-0097',
    currentOrcid: 'https://orcid.org/0000-0002-1825-0097',
    authorId: '42',
  }), true);
  assert.equal(canReuseOrcidResult({
    submittedOrcid: '0000-0002-1694-233X',
    currentOrcid: '0000-0002-1825-0097',
    authorId: '42',
  }), false);
  assert.equal(canReuseOrcidResult({
    submittedOrcid: '0000-0002-1825-0097',
    currentOrcid: '0000-0002-1825-0097',
    authorId: '42',
    isScanning: true,
  }), false);
});

test('normalizes a scan response without mixing scan summary into article pagination', () => {
  const result = normalizeScanResponse({
    success: true,
    code: 'ORCID_SCAN_PARTIAL',
    data: {
      author: {
        author_id: 42,
        display_name: 'Example Author',
        orcid: 'https://orcid.org/0000-0002-1825-0097',
      },
      articles: [
        {
          article_id: 7,
          title: 'Example Article',
          journal: 'Example Journal',
          year: 2024,
          cited_by_count: 9,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 65,
        total_pages: 4,
      },
      summary: {
        discovered: 100,
        created: 12,
        already_existed: 88,
      },
      source_status: {
        orcid: { status: 'success', count: 6 },
        crossref: { status: 'partial', count: 100 },
      },
    },
  });

  assert.equal(result.author.author_id, 42);
  assert.equal(result.author.orcid, '0000-0002-1825-0097');
  assert.equal(result.articles[0].journal_name, 'Example Journal');
  assert.equal(result.articles[0].publication_year, 2024);
  assert.equal(result.pagination.total, 65);
  assert.equal(result.summary.discovered, 100);
  assert.equal(result.summary.created, 12);
  assert.equal(result.isPartial, true);
});

test('normalizes paginated DB article response to the same article model', () => {
  const result = normalizeArticlePageResponse({
    data: {
      items: [
        {
          id: 99,
          display_name: 'Stored Article',
          container_title: 'Stored Journal',
          publication_year: 2023,
          citations: 3,
        },
      ],
      pagination: {
        page: 2,
        limit: 20,
        total_items: 42,
        pages: 3,
      },
    },
  });

  assert.equal(result.articles[0].article_id, 99);
  assert.equal(result.articles[0].title, 'Stored Article');
  assert.equal(result.articles[0].journal_name, 'Stored Journal');
  assert.equal(result.pagination.page, 2);
  assert.equal(result.pagination.total, 42);
  assert.equal(result.pagination.total_pages, 3);
});

test('normalizes asynchronous scan job progress and terminal metadata', () => {
  const running = normalizeScanJobResponse({
    success: true,
    code: 'ORCID_SCAN_RUNNING',
    data: {
      job_id: '22222222-2222-4222-8222-222222222222',
      orcid: 'https://orcid.org/0000-0002-1825-0097',
      status: 'running',
      stage: 'persisting',
      progress: 74,
      poll_after_ms: 1500,
      counts: { available_publications: 125 },
    },
  });
  assert.equal(running.status, 'running');
  assert.equal(running.progress, 74);
  assert.equal(running.isTerminal, false);
  assert.equal(running.available_publications, 125);

  const completed = normalizeScanJobResponse({
    success: true,
    code: 'ORCID_SCAN_COMPLETED',
    data: {
      job_id: running.job_id,
      status: 'completed',
      progress: 100,
      author_id: 36611,
      summary: { discovered: 275, created: 200 },
    },
  });
  assert.equal(completed.isTerminal, true);
  assert.equal(completed.isFailed, false);
  assert.equal(completed.author_id, '36611');
  assert.equal(completed.summary.discovered, 275);
});

test('normalizes progressively committed publications and an opaque cursor', () => {
  const result = normalizeCursorArticleResponse({
    data: {
      articles: [{
        article_id: 24736,
        title: 'Progressive article',
        journal_name: 'Progressive Journal',
      }],
      pagination: {
        cursor: '9007199254740993',
        next_cursor: '9007199254741001',
        limit: 20,
        total_available: 45,
        has_next: true,
      },
    },
  });

  assert.equal(result.articles[0].article_id, 24736);
  assert.equal(result.pagination.cursor, '9007199254740993');
  assert.equal(result.pagination.next_cursor, '9007199254741001');
  assert.equal(result.pagination.total_available, 45);
  assert.equal(result.pagination.has_next, true);
});

test('accepts a scan response whose article collection owns its pagination', () => {
  const result = normalizeScanResponse({
    data: {
      author: {
        id: 11,
        name: 'Nested Collection Author',
        last_known_institution: { display_name: 'Research Institute' },
      },
      articles: {
        items: [
          {
            id: 22,
            title: 'Nested Article',
            journal: { display_name: 'Nested Journal' },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 21,
          total_pages: 2,
        },
      },
    },
  });

  assert.equal(result.author.institution, 'Research Institute');
  assert.equal(result.articles[0].journal_name, 'Nested Journal');
  assert.equal(result.pagination.total, 21);
  assert.equal(result.pagination.total_pages, 2);
});

test('builds the canonical trending article route with an encoded scan return path', () => {
  const navigation = buildOrcidArticleDetailNavigation(
    321,
    '/scan-orcid',
    '?orcid=0000-0002-1825-0097&author_id=42&page=3',
  );

  assert.equal(
    navigation.to,
    '/trending/articles/321?returnTo=%2Fscan-orcid%3Forcid%3D0000-0002-1825-0097%26author_id%3D42%26page%3D3',
  );
  assert.equal(
    new URLSearchParams(navigation.to.split('?')[1]).get('returnTo'),
    '/scan-orcid?orcid=0000-0002-1825-0097&author_id=42&page=3',
  );
});

test('falls back to a safe scan return path when called outside the scan page', () => {
  const navigation = buildOrcidArticleDetailNavigation(
    'article/id',
    'https://malicious.example',
    '?returnTo=https://malicious.example',
  );

  assert.equal(
    navigation.to,
    '/trending/articles/article%2Fid?returnTo=%2Fscan-orcid',
  );
  assert.equal(navigation.returnTo, '/scan-orcid');
});

test('provides approved ORCID copy with accessible helper/example and plural counts', async () => {
  const translations = i18next.createInstance();
  await translations.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: enLocale },
      vi: { translation: viLocale },
    },
    interpolation: { escapeValue: false },
  });

  const approvedEnglishCopy = {
    navLabel: 'Scan ORCID',
    title: 'Discover publications by ORCID',
    description: 'Quickly find an author’s publications and add them to ResearchPulse using an ORCID iD.',
    formTitle: 'Find an author’s publications',
    formDescription: 'Discover up to 100 journal articles linked to an ORCID iD.',
    formPreservationNotice: 'Your existing ResearchPulse records will be preserved.',
    inputHelp: 'Enter an ORCID iD or ORCID profile URL.',
    inputExample: 'Example: 0000-0002-1825-0097',
    submit: 'Find publications',
    progressDescription: 'ResearchPulse is checking ORCID. This may take a few seconds.',
    matchedAuthor: 'Author found',
    viewAuthor: 'View profile',
    articlesTitle: 'Author’s publications',
    articlesDescription: 'Browse all publications currently available for this author on ResearchPulse.',
  };

  Object.entries(approvedEnglishCopy).forEach(([key, value]) => {
    assert.equal(translations.t(`orcidScan.${key}`), value);
  });
  assert.equal(translations.t('orcidScan.articleCount', { count: 1 }), '1 publication');
  assert.equal(translations.t('orcidScan.articleCount', { count: 5 }), '5 publications');
  assert.equal(translations.t('orcidScan.citations', { count: 0 }), '0 citations');
  assert.equal(translations.t('orcidScan.citations', { count: 1 }), '1 citation');

  await translations.changeLanguage('vi');
  assert.equal(
    translations.t('orcidScan.inputHelp'),
    'Nhập ORCID iD hoặc URL hồ sơ ORCID.',
  );
  assert.equal(
    translations.t('orcidScan.inputExample'),
    'Ví dụ: 0000-0002-1825-0097',
  );
  assert.equal(
    translations.t('orcidScan.progressDescription'),
    'ResearchPulse đang kiểm tra ORCID. Quá trình này có thể mất vài giây.',
  );
  assert.equal(translations.t('orcidScan.articleCount', { count: 1 }), '1 công trình');
  assert.equal(translations.t('orcidScan.citations', { count: 0 }), '0 trích dẫn');
});

for (const { name, fn } of tests) {
  await fn();
  console.log(`✓ ${name}`);
}

console.log(`\n${tests.length} ORCID scan utility tests passed.`);
