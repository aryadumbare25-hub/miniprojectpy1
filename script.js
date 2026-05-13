let transactions = JSON.parse(localStorage.getItem('financeTransactions') || '[]');
let budget = Number(localStorage.getItem('monthlyBudget') || 0);
let barChart, pieChart;

const typeEl = document.getElementById('type');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const dateEl = document.getElementById('date');
const noteEl = document.getElementById('note');
const budgetInput = document.getElementById('budgetInput');
const filterTypeEl = document.getElementById('filterType');
const filterCategoryEl = document.getElementById('filterCategory');

budgetInput.value = budget || '';
dateEl.value = new Date().toISOString().split('T')[0];
document.getElementById('dateBadge').textContent = new Date().toLocaleDateString();

function saveAll(){ localStorage.setItem('financeTransactions', JSON.stringify(transactions)); }
function money(n){ return '₹ ' + n.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function activeData(){
  return transactions.filter(t => (filterTypeEl.value === 'all' || t.type === filterTypeEl.value) && (filterCategoryEl.value === 'all' || t.category === filterCategoryEl.value));
}
function addTransaction(){
  const amount = parseFloat(amountEl.value);
  if (isNaN(amount) || amount <= 0) return alert('Enter a valid amount');
  if (!dateEl.value) return alert('Select a date');
  transactions.push({id: Date.now(), type: typeEl.value, amount, category: categoryEl.value, date: dateEl.value, note: noteEl.value.trim()});
  saveAll(); amountEl.value=''; noteEl.value=''; dateEl.value=new Date().toISOString().split('T')[0]; renderAll();
}
function quickAdd(type, category){ typeEl.value = type; categoryEl.value = category; amountEl.focus(); }
function deleteTransaction(id){ transactions = transactions.filter(t => t.id !== id); saveAll(); renderAll(); }
function setBudget(){ budget = Number(budgetInput.value || 0); localStorage.setItem('monthlyBudget', budget); renderAll(); }

function updateStats(data){
  const income = data.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = data.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const balance = income - expense;
  const savings = balance;

  document.getElementById('incomeTotal').textContent = money(income);
  document.getElementById('expenseTotal').textContent = money(expense);
  document.getElementById('balanceTotal').textContent = money(balance);
  document.getElementById('savingsTotal').textContent = money(savings);
  document.getElementById('budgetText').textContent = budget ? `Monthly budget: ${money(budget)}` : 'No budget set';

  const percent = budget ? Math.min((expense / budget) * 100, 100) : 0;
  document.getElementById('budgetBar').style.width = percent + '%';
  document.getElementById('budgetStatus').textContent = budget ? `Spent ${money(expense)} of ${money(budget)} (${percent.toFixed(0)}%)` : 'Set a budget to see progress';
}

function renderTable(data){
  const body = document.getElementById('tableBody');
  if (!data.length){ body.innerHTML = '<tr><td colspan="6">No transactions found.</td></tr>'; return; }
  body.innerHTML = data.slice().reverse().map(t => `<tr><td>${t.type}</td><td>${t.date}</td><td>${t.category}</td><td>${money(t.amount)}</td><td>${t.note || '-'}</td><td><button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button></td></tr>`).join('');
}

function renderCharts(data){
  const income = data.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = data.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const catTotals = {};
  data.filter(t=>t.type==='expense').forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + t.amount);
  const labels = Object.keys(catTotals);
  const values = Object.values(catTotals);

  document.getElementById('topCategory').textContent = labels.length ? labels[values.indexOf(Math.max(...values))] : '-';

  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();

  barChart = new Chart(document.getElementById('barChart'), {
    type:'bar',
    data:{ labels:['Income','Expense'], datasets:[{data:[income, expense], backgroundColor:['#22c55e','#ef4444'], borderRadius:12}]},
    options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}}}
  });

  pieChart = new Chart(document.getElementById('pieChart'), {
    type:'doughnut',
    data:{ labels, datasets:[{data:values, backgroundColor:['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#14b8a6','#f97316','#eab308']}]},
    options:{ plugins:{legend:{position:'bottom'}}}
  });
}

function renderAll(){
  const data = activeData();
  updateStats(data);
  renderTable(data);
  renderCharts(data);
}

document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(btn.dataset.section).classList.add('active');
}));

renderAll();
