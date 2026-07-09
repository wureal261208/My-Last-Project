function ReaderControls({
  chapterPage,
  chapterProgressValue,
  currentChapter,
  fontScale,
  guestChapterLimit,
  isFinished,
  isGuest,
  onChangeFontScale,
  onMarkChapterDone,
  onReaderTheme,
  progressValue,
  readerTheme,
}) {
  return (
    <div className="reader-controls">
      <label>
        Theme
        <select value={readerTheme} onChange={(event) => onReaderTheme(event.target.value)}>
          <option value="sepia">Sepia</option>
          <option value="focus">Focus</option>
          <option value="night">Night</option>
        </select>
      </label>
      <label>
        Font size
        <div className="reader-font-controls">
          <button disabled={fontScale <= 15} onClick={() => onChangeFontScale(-1)} type="button">A-</button>
          <span>{fontScale}px</span>
          <button disabled={fontScale >= 24} onClick={() => onChangeFontScale(1)} type="button">A+</button>
        </div>
      </label>
      <div className="reader-page-meter">
        <span>{currentChapter.label}</span>
        <progress max="100" value={chapterProgressValue} />
        <small>Showing this chapter only</small>
        <button disabled={isFinished} onClick={onMarkChapterDone} type="button">
          Next chapter
        </button>
        {isGuest && <small>Guest preview: first {guestChapterLimit} chapters</small>}
        <small>Book progress: {progressValue}%</small>
        {isFinished && <small className="finished-status">Finished</small>}
      </div>
    </div>
  )
}

export default ReaderControls
