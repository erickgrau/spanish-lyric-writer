import React, { useState } from 'react'
import { SECTION_LABELS } from '../lib/constants'
import styles from './SectionCard.module.css'

export default function SectionCard({
  section,
  editable = false,
  onLyricsChange,
  onPolish,
  onTranslate,
  onRemove,
  polishing = false,
  translating = false,
}) {
  const label = SECTION_LABELS[section.type] || section.type
  const [showChanges, setShowChanges] = useState(false)

  return (
    <div className={`${styles.card} ${editable ? styles.editable : ''}`}>
      <div className={styles.header}>
        <span className={styles.tag}>{label}</span>
        <div className={styles.headerRight}>
          {section.rhyme_note && (
            <span className={styles.rhymeNote}>{section.rhyme_note}</span>
          )}
          {editable && onRemove && (
            <button className={styles.removeBtn} onClick={onRemove} title="Remove section">
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.lyrics}>
        {editable ? (
          <textarea
            className={styles.lyricsInput}
            value={section.lyrics}
            onChange={(e) => onLyricsChange?.(e.target.value)}
            placeholder="Write your lyrics here..."
            rows={8}
          />
        ) : (
          section.lyrics.split('\n').map((line, i) => (
            <p key={i} className={styles.line}>{line}</p>
          ))
        )}
      </div>

      {editable && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={onPolish}
            disabled={polishing || translating || !section.lyrics.trim()}
          >
            {polishing ? 'Polishing...' : '✨ Polish with AI'}
          </button>
          <button
            className={styles.actionBtn}
            onClick={onTranslate}
            disabled={polishing || translating || !section.lyrics.trim()}
          >
            {translating ? 'Translating...' : '🌐 Translate'}
          </button>
        </div>
      )}

      {section.changes && editable && (
        <div className={styles.changesBlock}>
          <button
            className={styles.changesToggle}
            onClick={() => setShowChanges((v) => !v)}
          >
            {showChanges ? '▾' : '▸'} AI Changes
          </button>
          {showChanges && <p className={styles.changesText}>{section.changes}</p>}
        </div>
      )}

      {section.translation && (
        <div className={styles.translation}>
          <span className={styles.transLabel}>Translation</span>
          <p>{section.translation}</p>
        </div>
      )}
    </div>
  )
}
