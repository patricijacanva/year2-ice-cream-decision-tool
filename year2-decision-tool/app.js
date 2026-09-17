const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
let machines = [{ name: 'Machine 1', capacity: 72000, maintenance: 1800, depreciation: 4375, life: 7 }];
const winterCheck = { openingCash:100000, machinePurchase:35000, milk:3, sold:60000, market:3000, rent:17000, maintenance:1800, depreciation:4375, transportRate:.1, salary:10000 };
const options = {
  A: { name:'Option A', production:60000, milk:3, request:60000, actual:60000, investment:3000, premise:'Enter Year 2 premise', rent:17000, capacity:72000, maintenance:1800, depreciation:4375, transportRate:.10, machinePurchase:0, loan:30000, principal:0, interest:3000 },
  B: { name:'Option B', production:40000, milk:2, request:40000, actual:40000, investment:1500, premise:'Enter Year 2 premise', rent:17000, capacity:72000, maintenance:1800, depreciation:4375, transportRate:.10, machinePurchase:0, loan:0, principal:0, interest:0 }
};
const fields = [
  ['production','Planned production','units'], ['milk','Milk purchase','tons'], ['request','Sales request','units, 10,000 blocks'], ['actual','Possible actual sales allocation','units'], ['investment','Market investment','Sh'], ['premise','Premise or premises','estimate'], ['rent','Rent','Sh'], ['capacity','Machine capacity used','units'], ['maintenance','Maintenance','Sh'], ['depreciation','Depreciation','Sh'], ['transportRate','Transport / sold unit','Sh'], ['machinePurchase','Machine purchases','Sh'], ['loan','Borrowing received','Sh'], ['principal','Loan principal repaid','Sh'], ['interest','Loan interest','Sh']
];
const n = value => Number(value) || 0;
const input = id => n(document.getElementById(id).value);
const position = key => n(document.querySelector(`[data-position="${key}"]`).value);

function optionCalculation(o) {
  const milkCost = o.milk * input('milk-cost');
  const revenue = o.actual * input('sale-price');
  const grossProfit = revenue - milkCost - o.maintenance - o.depreciation;
  const transport = o.actual * o.transportRate;
  const bonus = Math.max(0, grossProfit) * .05;
  const profitBeforeTax = grossProfit - transport - o.investment - bonus - input('salary') - o.rent - o.interest;
  const lossUsed = Math.min(Math.max(profitBeforeTax, 0), position('lossPool'));
  const taxableProfit = Math.max(0, profitBeforeTax - lossUsed);
  const tax = taxableProfit * .10;
  const netProfit = profitBeforeTax - tax;
  const advanceCash = position('cash') + o.loan - o.machinePurchase - milkCost - o.investment;
  const closingCash = advanceCash + revenue - o.rent - o.maintenance - transport - input('salary') - bonus - o.principal - o.interest - tax;
  return { milkCost, revenue, grossProfit, transport, bonus, profitBeforeTax, lossUsed, taxableProfit, tax, netProfit, advanceCash, closingCash };
}

function winterCalculation() {
  const revenue = winterCheck.sold * input('sale-price');
  const milkCost = winterCheck.milk * input('milk-cost');
  const grossProfit = revenue - milkCost - winterCheck.maintenance - winterCheck.depreciation;
  const transport = winterCheck.sold * winterCheck.transportRate;
  const bonus = Math.max(0, grossProfit) * .05;
  const profitBeforeTax = grossProfit - transport - winterCheck.market - bonus - winterCheck.salary - winterCheck.rent;
  const tax = Math.max(0, profitBeforeTax) * .10;
  const netProfit = profitBeforeTax - tax;
  const closingCash = winterCheck.openingCash + revenue - winterCheck.machinePurchase - milkCost - winterCheck.market - winterCheck.rent - winterCheck.maintenance - transport - winterCheck.salary - bonus - tax;
  return { netProfit, closingCash };
}

function optionHtml(key) {
  const o = options[key]; const r = optionCalculation(o);
  const controls = fields.map(([field,label,hint]) => `<label>${label}<input data-option="${key}" data-field="${field}" ${field === 'premise' ? 'type="text"' : 'type="number"'} value="${o[field]}" /><small>${hint}</small></label>`).join('');
  const warning = [o.production > Math.min(o.capacity, o.milk * 20000) ? 'Production exceeds machine or milk capacity.' : '', o.actual > o.production ? 'Actual sales exceed production.' : '', o.request % 10000 !== 0 ? 'Sales request must be in 10,000-unit blocks.' : '', r.advanceCash < 0 ? 'Cash becomes negative before the market.' : '', r.closingCash < 0 ? 'Closing cash is negative.' : ''].filter(Boolean);
  const downsideSales = Math.floor(o.actual * .8); const downside = optionCalculation({ ...o, actual:downsideSales });
  return `<article class="option"><div class="option-head"><div><span class="tag">${key}</span><h2>${o.name}</h2></div><button class="secondary" data-copy="${key}">Copy as Year 1 check</button></div><div class="grid inputs-grid">${controls}</div><h3 class="subheading">Projected profit and loss</h3><div class="metrics"><div class="metric"><span>Revenue</span><strong>${money.format(r.revenue)}</strong></div><div class="metric"><span>Gross profit</span><strong>${money.format(r.grossProfit)}</strong></div><div class="metric"><span>Interest</span><strong>${money.format(o.interest)}</strong></div><div class="metric"><span>Tax after loss pool</span><strong>${money.format(r.tax)}</strong></div><div class="metric"><span>Net profit</span><strong>${money.format(r.netProfit)}</strong></div><div class="metric"><span>Tax loss remaining</span><strong>${money.format(Math.max(0, position('lossPool') - r.lossUsed) + Math.max(0, -r.profitBeforeTax))}</strong></div></div><h3 class="subheading">Projected cash flow</h3><div class="metrics"><div class="metric"><span>Cash after advance payments</span><strong>${money.format(r.advanceCash)}</strong></div><div class="metric"><span>Closing cash</span><strong>${money.format(r.closingCash)}</strong></div><div class="metric"><span>If sales are 20% lower (${number.format(downsideSales)} units)</span><strong>${money.format(downside.closingCash)}</strong></div><div class="metric"><span>Market forecast</span><strong>${number.format(input('forecast'))} units</strong></div></div><div class="warning ${warning.length ? 'bad' : 'good'}">${warning.length ? warning.join(' ') : 'Plan passes the production, request, and cash checks using these estimates.'}</div></article>`;
}

function renderMachines() { document.querySelector('#machine-table tbody').innerHTML = machines.map((m,i) => `<tr><td><input data-machine="${i}" data-field="name" type="text" value="${m.name}" /></td><td><input data-machine="${i}" data-field="capacity" type="number" value="${m.capacity}" /></td><td><input data-machine="${i}" data-field="maintenance" type="number" value="${m.maintenance}" /></td><td><input data-machine="${i}" data-field="depreciation" type="number" value="${m.depreciation}" /></td><td><input data-machine="${i}" data-field="life" type="number" value="${m.life}" /></td><td><button class="remove" data-remove-machine="${i}">Remove</button></td></tr>`).join(''); }

function updateSummary() {
  const a = optionCalculation(options.A), b = optionCalculation(options.B);
  const betterProfit = a.netProfit >= b.netProfit ? 'Option A' : 'Option B';
  const betterCash = a.closingCash >= b.closingCash ? 'Option A' : 'Option B';
  document.getElementById('difference-summary').innerHTML = `<div class="difference"><strong>Sales and profit:</strong> ${betterProfit} has ${money.format(Math.abs(a.netProfit-b.netProfit))} higher projected net profit, mainly from its different sales allocation and operating costs.</div><div class="difference"><strong>Cash safety:</strong> ${betterCash} ends with ${money.format(Math.abs(a.closingCash-b.closingCash))} more cash. Check advance-payment cash before committing to production.</div><div class="difference"><strong>Cost drivers:</strong> Compare milk and spoilage, rent, transport, marketing, machine costs, and interest before choosing.</div>`;
  const selected = document.getElementById('recommendation').value; const r = optionCalculation(options[selected]);
  document.getElementById('recommendation-text').innerHTML = `<strong>Recommendation: ${selected === 'A' ? 'Option A' : 'Option B'}.</strong> Based on the current editable estimate, projected closing cash is ${money.format(r.closingCash)} and projected net profit is ${money.format(r.netProfit)}. <strong>Most important assumption:</strong> ${document.getElementById('assumption').value || 'Enter your key assumption.'} If the trainer allocates fewer sales, reduce “Possible actual sales allocation” and reassess cash before choosing.`;
  const winter = winterCalculation();
  document.getElementById('winter-model-profit').textContent = money.format(winter.netProfit);
  document.getElementById('winter-model-cash').textContent = money.format(winter.closingCash);
  document.getElementById('winter-profit-difference').textContent = money.format(winter.netProfit - 13620.375);
  document.getElementById('winter-cash-difference').textContent = money.format(winter.closingCash - 82995.375);
}

function render() { renderMachines(); document.getElementById('options').innerHTML = optionHtml('A') + optionHtml('B'); updateSummary(); }
document.addEventListener('input', (event) => { const target = event.target; if (target.dataset.option) { const { option, field } = target.dataset; options[option][field] = field === 'premise' ? target.value : n(target.value); } if (target.dataset.machine) { machines[target.dataset.machine][target.dataset.field] = target.dataset.field === 'name' ? target.value : n(target.value); } if (target.dataset.winter) winterCheck[target.dataset.winter] = n(target.value); render(); });
document.addEventListener('change', (event) => { if (event.target.matches('#recommendation')) updateSummary(); });
document.getElementById('add-machine').addEventListener('click', () => { machines.push({ name:'New machine', capacity:0, maintenance:0, depreciation:0, life:0 }); render(); });
document.addEventListener('click', (event) => { if (event.target.dataset.removeMachine !== undefined) { machines.splice(n(event.target.dataset.removeMachine), 1); render(); } if (event.target.dataset.copy) { const o = options[event.target.dataset.copy]; Object.assign(winterCheck, { openingCash:position('cash'), machinePurchase:o.machinePurchase, milk:o.milk, sold:o.actual, market:o.investment, rent:o.rent, maintenance:o.maintenance, depreciation:o.depreciation, transportRate:o.transportRate, salary:input('salary') }); render(); } });
render();
