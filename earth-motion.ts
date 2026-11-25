const video = document.querySelector<HTMLVideoElement>('.earth video')
const planet = video?.closest('.planet')
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

if (video && planet) {
  const updatePlayback = () => {
    if (reducedMotion.matches) {
      video.pause()
      planet.classList.remove('is-playing')
      return
    }
    if (document.hidden) {
      video.pause()
      return
    }
    if (!video.getAttribute('src')) video.src = '/earth-rotation.mp4'
    video.muted = true
    void video.play().catch(() => planet.classList.remove('is-playing'))
  }

  video.addEventListener('playing', () => planet.classList.add('is-playing'))
  video.addEventListener('error', () => planet.classList.remove('is-playing'))
  reducedMotion.addEventListener('change', updatePlayback)
  document.addEventListener('visibilitychange', updatePlayback)
  updatePlayback()
}
