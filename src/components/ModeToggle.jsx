import React from 'react'
import styles from './ModeToggle.module.css'

export default function ModeToggle({ mode, onModeChange }) {
  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.option} ${mode === 'ai' ? styles.active : ''}`}
        onClick={() => onModeChange('ai')}
      >
        <span className={styles.icon}>✨</span>
        AI Writes
      </button>
      <button
        className={`${styles.option} ${mode === 'studio' ? styles.active : ''}`}
        onClick={() => onModeChange('studio')}
      >
        <span className={styles.icon}>✍️</span>
        Writer's Studio
      </button>
    </div>
  )
}
