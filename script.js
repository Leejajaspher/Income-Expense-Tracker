// Select elements
const entryForm = document.getElementById('entry-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeRadios = document.getElementsByName('type');
const entriesList = document.getElementById('entries-list');
const totalIncome = document.getElementById('total-income');
const totalExpense = document.getElementById('total-expense');
const netBalance = document.getElementById('net-balance');
const resetBtn = document.getElementById('reset-btn');
const filterRadios = document.getElementsByName('filter');

let entries = JSON.parse(localStorage.getItem('entries')) || [];
let isEditing = false;
let currentEditId = null;

// Generate unique ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Add or update entry
entryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const type = [...typeRadios].find(r => r.checked)?.value;

  if (!description || isNaN(amount) || !type) return alert('Please fill out all fields');

  if (isEditing) {
    entries = entries.map(entry =>
      entry.id === currentEditId ? { id: currentEditId, description, amount, type } : entry
    );
    isEditing = false;
    currentEditId = null;
  } else {
    const newEntry = {
      id: generateId(),
      description,
      amount,
      type
    };
    entries.push(newEntry);
  }

  updateLocalStorage();
  renderEntries();
  entryForm.reset();
});

// Reset input fields
resetBtn.addEventListener('click', () => {
  entryForm.reset();
  isEditing = false;
  currentEditId = null;
});

// Filter entries
filterRadios.forEach(radio => {
  radio.addEventListener('change', () => renderEntries());
});

// Render entries
function renderEntries() {
  entriesList.innerHTML = '';

  const selectedFilter = [...filterRadios].find(r => r.checked).value;
  const filteredEntries = selectedFilter === 'all'
    ? entries
    : entries.filter(e => e.type === selectedFilter);

  filteredEntries.forEach(entry => {
    const entryDiv = document.createElement('div');
    entryDiv.className = `entry ${entry.type}`;
    entryDiv.innerHTML = `
      <div class="details">
        <strong>${entry.description}</strong><br>
        ₹${entry.amount}
      </div>
      <div class="actions">
        <button onclick="editEntry('${entry.id}')">Edit</button>
        <button class="delete" onclick="deleteEntry('${entry.id}')">Delete</button>
      </div>
    `;
    entriesList.appendChild(entryDiv);
  });

  updateSummary();
}

// Edit entry
function editEntry(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  descriptionInput.value = entry.description;
  amountInput.value = entry.amount;
  [...typeRadios].forEach(r => {
    r.checked = r.value === entry.type;
  });

  isEditing = true;
  currentEditId = id;
}

// Delete entry
function deleteEntry(id) {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  entries = entries.filter(e => e.id !== id);
  updateLocalStorage();
  renderEntries();
}

// Update summary totals
function updateSummary() {
  const incomeTotal = entries
    .filter(e => e.type === 'income')
    .reduce((acc, cur) => acc + cur.amount, 0);
  const expenseTotal = entries
    .filter(e => e.type === 'expense')
    .reduce((acc, cur) => acc + cur.amount, 0);
  const balance = incomeTotal - expenseTotal;

  totalIncome.textContent = incomeTotal.toFixed(2);
  totalExpense.textContent = expenseTotal.toFixed(2);
  netBalance.textContent = balance.toFixed(2);
}

// Save to localStorage
function updateLocalStorage() {
  localStorage.setItem('entries', JSON.stringify(entries));
}

// Initial render
renderEntries();
