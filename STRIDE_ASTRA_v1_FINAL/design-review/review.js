let screen = 'today';
let swapped = false;
const directions = ['fieldnotes', 'tempo'];
function refresh() {
  for (const direction of directions) {
    const theme = direction === 'fieldnotes' ? (swapped ? 'dark' : 'light') : (swapped ? 'light' : 'dark');
    document.getElementById(direction).src = `/app?direction=${direction}&screen=${screen}&theme=${theme}&embed=1`;
  }
  document.querySelector('.review-modes a').href = `/app?direction=${document.body.dataset.mobileDirection || 'fieldnotes'}&screen=${screen}`;
}
document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => {
  screen = button.dataset.screen;
  document.querySelectorAll('[data-screen]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  refresh();
}));
document.getElementById('theme').addEventListener('click', () => { swapped = !swapped; refresh(); });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => {
  document.body.dataset.mobileDirection = button.dataset.direction;
  document.querySelectorAll('[data-direction]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  document.querySelector('.review-modes a').href = `/app?direction=${button.dataset.direction}&screen=${screen}`;
}));
