import React from 'react'
import { SECTION_LABELS } from '../lib/constants'
import styles from './SectionCard.module.css'

export default function SectionCard({ section }) {
  const label = SECTION_LABELS[section.type] || section.type

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>{label}</span>
        <span className={styles.rhymeNote}>{section.rhyme_note}</span>
      </div>
      <div className={styles.lyrics}>
        {section.lyrics.split('\n').map((line, i) => (
          <p key={i} className={styles.line}>{line}</p>
        ))}
      </div>
      {section.translation && (
        <div className={styles.translation}>
          <span className={styles.transLabel}>Translation</span>
          <p>{section.translation}</p>
        </div>
      )}
    </div>
  )
}
