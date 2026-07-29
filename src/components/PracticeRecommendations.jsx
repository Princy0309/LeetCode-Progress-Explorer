import React, { useMemo, useState } from 'react';
import { computeRecommendations, generateInsightSummary } from '../services/computeRecommendations';

// ── Tier badge ────────────────────────────────────────────────────────────────
const TIER_META = {
  fundamental:  { label: 'Core',         color: '#6c8cff' },
  intermediate: { label: 'Intermediate', color: '#ff9800' },
  advanced:     { label: 'Advanced',     color: '#ff5252' },
};

// ── Bucket config ─────────────────────────────────────────────────────────────
const BUCKETS = [
  {
    key:     'focusNow',
    icon:    '🎯',
    title:   'Focus Now',
    desc:    'Biggest gaps — high impact per problem solved',
    accent:  '#ff5252',
  },
  {
    key:     'improve',
    icon:    '📈',
    title:   'Keep Improving',
    desc:    'Partially covered — push these to proficiency',
    accent:  '#ff9800',
  },
  {
    key:     'almostDone',
    icon:    '✅',
    title:   'Almost There',
    desc:    'Strong already — a few more to master them',
    accent:  '#00e676',
  },
];

// ── Single tag pill ───────────────────────────────────────────────────────────
function TagCard({ tag }) {
  const tier   = TIER_META[tag.tier] ?? TIER_META.fundamental;
  const pct    = Math.round(tag.solvedRatio * 100);
  const filled = Math.round(tag.solvedRatio * 20); // out of 20 blocks

  return (
    <a
      href={tag.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rec-tag-card"
      style={{ '--tag-accent': tier.color }}
    >
      {/* Progress bar fill */}
      <div className="rec-tag-bar" style={{ width: `${pct}%` }} />

      <div className="rec-tag-inner">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="rec-tag-name">{tag.tagName}</span>
          <span className="rec-tag-tier-badge" style={{ color: tier.color, borderColor: tier.color }}>
            {tier.label}
          </span>
        </div>

        <div className="rec-tag-meta">
          <span>{tag.solved} / ~{tag.total} solved</span>
          <span className="rec-tag-pct">{pct}%</span>
        </div>

        {/* Mini block progress track */}
        <div className="rec-tag-track" aria-label={`${pct}% solved`}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="rec-tag-block"
              style={{
                backgroundColor: i < filled
                  ? tier.color
                  : 'rgba(128,128,128,0.15)',
              }}
            />
          ))}
        </div>
      </div>
    </a>
  );
}

// ── Bucket section ────────────────────────────────────────────────────────────
function BucketSection({ bucket, tags }) {
  const [expanded, setExpanded] = useState(true);
  if (!tags?.length) return null;

  return (
    <div className="rec-bucket">
      <button
        className="rec-bucket-header"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        style={{ '--bucket-accent': bucket.accent }}
      >
        <span className="rec-bucket-icon">{bucket.icon}</span>
        <span className="rec-bucket-title">{bucket.title}</span>
        <span className="rec-bucket-desc">{bucket.desc}</span>
        <span className="rec-bucket-count">{tags.length}</span>
        <span className="rec-bucket-chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="rec-tag-grid">
          {tags.map(tag => <TagCard key={tag.tagSlug} tag={tag} />)}
        </div>
      )}
    </div>
  );
}

// ── Skill level pill ──────────────────────────────────────────────────────────
const SKILL_META = {
  beginner:     { label: '🌱 Beginner',     color: '#00e676' },
  intermediate: { label: '⚡ Intermediate', color: '#ff9800' },
  advanced:     { label: '🔥 Advanced',     color: '#ff5252' },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function PracticeRecommendations({ tagStats, userData, username }) {
  const recommendations = useMemo(
    () => computeRecommendations(tagStats, userData),
    [tagStats, userData]
  );

  const summary = useMemo(
    () => generateInsightSummary(recommendations, username),
    [recommendations, username]
  );

  if (!recommendations?.all?.length) return null;

  const skill = SKILL_META[recommendations.skillLevel] ?? SKILL_META.beginner;

  // Parse bold markers in summary string (**text**)
  const renderSummary = (text) => {
    if (!text) return null;
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: 'var(--fire-orange)' }}>{part}</strong>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="card shadow-sm p-4 rec-card">

      {/* ── Header ── */}
      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
        <span className="rec-header-icon" aria-hidden="true">🤖</span>
        <h4 className="mb-0 fw-bold rec-title">AI Practice Recommendations</h4>
        <span
          className="rec-skill-badge ms-auto"
          style={{ color: skill.color, borderColor: skill.color }}
        >
          {skill.label}
        </span>
      </div>

      {/* ── Insight summary ── */}
      {summary && (
        <p className="rec-summary mb-4">{renderSummary(summary)}</p>
      )}

      {/* ── Buckets ── */}
      <div className="rec-buckets">
        {BUCKETS.map(b => (
          <BucketSection
            key={b.key}
            bucket={b}
            tags={recommendations[b.key]}
          />
        ))}
      </div>

      <p className="rec-footer mt-3 mb-0">
        Click any tag to open its problem list on LeetCode →
      </p>
    </div>
  );
}
