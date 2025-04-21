let expenses = [];

document.getElementById("expense-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const place = document.getElementById("place").value;
  const date = document.getElementById("date").value;
  const amount = parseFloat(document.getElementById("amount").value);
  let category = document.getElementById("category").value;
  const custom = document.getElementById("custom-category").value;

  if (category === "custom") category = custom;

  const expense = { place, date, amount, category };
  expenses.push(expense);
  this.reset();
  document.getElementById("custom-category").style.display = "none";
  updateExpenses();
});

function updateExpenses() {
  const list = document.getElementById("expense-list");
  const totalDiv = document.getElementById("total");
  const filterDate = document.getElementById("filter-date").value;
  const filterCat = document.getElementById("filter-category").value;

  list.innerHTML = "";
  let total = 0;
  let chartData = {};

  expenses.forEach((exp, index) => {
    if ((filterDate && exp.date !== filterDate) || (filterCat && exp.category !== filterCat)) return;

    total += exp.amount;
    chartData[exp.category] = (chartData[exp.category] || 0) + exp.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${exp.place} - ₹${exp.amount} (${exp.category}) on ${exp.date}</span>
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    list.appendChild(li);
  });

  totalDiv.textContent = `Total: ₹${total}`;
  renderChart(chartData);
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  updateExpenses();
}

function checkCustomCategory(select) {
  const customInput = document.getElementById("custom-category");
  customInput.style.display = select.value === "custom" ? "inline-block" : "none";
}

function renderChart(data) {
  const ctx = document.getElementById("expense-chart").getContext("2d");
  if (window.chartInstance) window.chartInstance.destroy();
  window.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Expenses',
        data: Object.values(data),
        backgroundColor: ['#f39c12', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c'],
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: 'white' }
        }
      }
    }
  });
}

document.getElementById("filter-date").addEventListener("change", updateExpenses);
document.getElementById("filter-category").addEventListener("change", updateExpenses);
