// Vercel Function: aggregates PostHog event data for the custom dashboard.
// Auth: Authorization: Bearer <DASHBOARD_PASSWORD>

const MAX_PAGES_PER_EVENT = 15;
const PAGE_LIMIT = 100;

async function fetchEvents(host, projectId, apiKey, eventName, after) {
  const all = [];
  let url =
    `${host}/api/projects/${projectId}/events/?event=${encodeURIComponent(eventName)}` +
    `&after=${encodeURIComponent(after)}&orderBy=${encodeURIComponent(JSON.stringify(['-timestamp']))}` +
    `&limit=${PAGE_LIMIT}`;

  let page = 0;
  while (url && page < MAX_PAGES_PER_EVENT) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!r.ok) break;
    const data = await r.json();
    all.push(...(data.results || []));
    url = data.next;
    page++;
  }
  return all;
}

function dayKey(ts) {
  return String(ts).slice(0, 10);
}

function pathFromEvent(ev) {
  const p = ev.properties || {};
  if (p.$pathname) return p.$pathname;
  if (p.$current_url) {
    try {
      return new URL(p.$current_url).pathname || '/';
    } catch {
      return p.$current_url;
    }
  }
  return '(unknown)';
}

function labelForClick(ev) {
  const el = (ev.elements && ev.elements[0]) || {};
  const tag = el.tag_name || 'element';
  const text = (el.text || '').trim().replace(/\s+/g, ' ');
  if (text) return text.length > 44 ? `${text.slice(0, 41)}…` : text;
  const href =
    (el.attributes && (el.attributes.attr__href || el.attributes['attr__href'])) ||
    el.attr_href;
  if (href) return `<${tag}> -> ${href}`;
  return `<${tag}>`;
}

function topN(counts, n) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const auth = req.headers.authorization || '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected || provided !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const host =
    process.env.POSTHOG_HOST ||
    process.env.PUBLIC_POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;

  if (!host || !projectId || !apiKey) {
    res.status(500).json({ error: 'Analytics not configured' });
    return;
  }

  const daysParam = parseInt(req.query.days, 10);
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 90) : 30;
  const after = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [pageviews, pageleaves, autocaptures] = await Promise.all([
      fetchEvents(host, projectId, apiKey, '$pageview', after),
      fetchEvents(host, projectId, apiKey, '$pageleave', after),
      fetchEvents(host, projectId, apiKey, '$autocapture', after),
    ]);

    const uniqueVisitors = new Set(pageviews.map((e) => e.distinct_id)).size;
    const uniqueSessions = new Set(
      pageviews.map((e) => e.properties && e.properties.$session_id).filter(Boolean)
    ).size;

    // Daily pageview series, zero-filled across the full range.
    const byDay = {};
    for (const ev of pageviews) {
      const k = dayKey(ev.timestamp);
      byDay[k] = (byDay[k] || 0) + 1;
    }
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const k = d.toISOString().slice(0, 10);
      series.push({ date: k, count: byDay[k] || 0 });
    }

    const pageCounts = {};
    for (const ev of pageviews) {
      const p = pathFromEvent(ev);
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }

    const referrerCounts = {};
    for (const ev of pageviews) {
      const p = ev.properties || {};
      let ref = p.$referring_domain;
      if (!ref || ref === '$direct') ref = 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    }

    const deviceCounts = {};
    for (const ev of pageviews) {
      const d = (ev.properties && ev.properties.$device_type) || 'Unknown';
      deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    }

    const clickCounts = {};
    for (const ev of autocaptures) {
      const label = labelForClick(ev);
      clickCounts[label] = (clickCounts[label] || 0) + 1;
    }

    let durationSum = 0;
    let durationCount = 0;
    for (const ev of pageleaves) {
      const dur = ev.properties && ev.properties.$prev_pageview_duration;
      if (typeof dur === 'number' && dur >= 0) {
        durationSum += dur;
        durationCount++;
      }
    }
    const avgTimeOnPageSeconds = durationCount ? Math.round(durationSum / durationCount / 1000) : 0;

    res.status(200).json({
      range_days: days,
      totals: {
        pageviews: pageviews.length,
        unique_visitors: uniqueVisitors,
        sessions: uniqueSessions,
        clicks_tracked: autocaptures.length,
        avg_time_on_page_seconds: avgTimeOnPageSeconds,
      },
      pageviews_by_day: series,
      top_pages: topN(pageCounts, 8),
      top_referrers: topN(referrerCounts, 8),
      top_clicks: topN(clickCounts, 8),
      device_breakdown: topN(deviceCounts, 6),
    });
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch analytics', detail: err.message });
  }
};
