const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
menuButton.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
});
mobileMenu.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
});

const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const monthSelect = document.querySelector('#monthSelect');
const yearSelect = document.querySelector('#yearSelect');
const calendarDays = document.querySelector('#calendarDays');
let visibleDate = new Date(2026, 2, 1);

months.forEach((month, index) => monthSelect.add(new Option(month, index)));
for (let year = 2024; year <= 2030; year += 1) yearSelect.add(new Option(year, year));

function renderCalendar() {
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  monthSelect.value = String(month);
  yearSelect.value = String(year);
  calendarDays.replaceChildren();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const previousTotal = new Date(year, month, 0).getDate();
  for (let i = offset - 1; i >= 0; i -= 1) addDay(previousTotal - i, 'muted');
  for (let day = 1; day <= total; day += 1) addDay(day, year === 2026 && month === 2 && day === 27 ? 'selected' : '');
  const used = offset + total;
  for (let day = 1; day <= (used <= 35 ? 35 : 42) - used; day += 1) addDay(day, 'muted');
}
function addDay(day, className) {
  const span = document.createElement('span');
  span.textContent = day;
  if (className) span.className = className;
  calendarDays.append(span);
}
function shiftMonth(amount) { visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + amount, 1); renderCalendar(); }
document.querySelector('#prevMonth').addEventListener('click', () => shiftMonth(-1));
document.querySelector('#nextMonth').addEventListener('click', () => shiftMonth(1));
monthSelect.addEventListener('change', () => { visibleDate = new Date(Number(yearSelect.value), Number(monthSelect.value), 1); renderCalendar(); });
yearSelect.addEventListener('change', () => { visibleDate = new Date(Number(yearSelect.value), Number(monthSelect.value), 1); renderCalendar(); });
renderCalendar();
