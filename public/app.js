// The only client-side script on the site: copy-to-clipboard for the install
// line. Everything else is server-rendered HTML.
document.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy');
  if (!button) return;
  const target = document.querySelector(button.dataset.copy);
  if (!target) return;
  try {
    await navigator.clipboard.writeText(target.textContent.trim());
  } catch {
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return; // selected for a manual copy; no false "copied" claim
  }
  const label = button.textContent;
  button.textContent = 'copied';
  button.dataset.done = '1';
  setTimeout(() => {
    button.textContent = label;
    delete button.dataset.done;
  }, 1600);
});
