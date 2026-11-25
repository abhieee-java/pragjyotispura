const form = document.querySelector('form')
const status = document.querySelector('#status')
const button = form.querySelector('button')
form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const email = new FormData(form).get('email')
  button.disabled = true
  status.textContent = 'Joining…'
  try {
    const response = await fetch('/api/join', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email})
    })
    const result = await response.json()
    status.textContent = result.message
    if (response.ok) form.reset()
  } catch {
    status.textContent = 'Could not save your signup. Please try again.'
  } finally {
    button.disabled = false
  }
})
