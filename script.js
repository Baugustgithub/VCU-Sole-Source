'use strict';

const { jsPDF } = window.jspdf;

let formData = {
  amount: null,
  single_source: null,
  justification: [],
  alternatives_researched: null,
  alternatives_reason_options: [],
  price_reasonable: []
};

let currentStep = 1;
const totalSteps = 5;

function updateProgressIndicator() {
  const percentComplete = (currentStep / totalSteps) * 100;
  document.getElementById('progress-indicator').style.width = `${percentComplete}%`;
  document.getElementById('step-counter').textContent = `Step ${currentStep} of ${totalSteps}`;
  document.getElementById('step-title').textContent = steps[currentStep - 1].title;
}

function handleAmountSelection(element) {
  document.querySelectorAll('[data-value]').forEach(el => {
    el.classList.remove('selected');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  formData.amount = element.dataset.value;

  document.getElementById('next-button').disabled = false;
}

function createStepOneContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700">What is the estimated dollar amount of your procurement?</p>
    <div class="space-y-3">
      <div class="form-check" data-value="less_than_10k" onclick="handleAmountSelection(this)">
        <div class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <label class="ml-3">
            <span class="block text-sm font-medium text-gray-900">Less than $10,000</span>
            <span class="block text-sm text-gray-500">Delegated authority threshold</span>
          </label>
        </div>
      </div>
      <div class="form-check" data-value="10k_to_200k" onclick="handleAmountSelection(this)">
        <div class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <label class="ml-3">
            <span class="block text-sm font-medium text-gray-900">$10,000 to $200,000</span>
            <span class="block text-sm text-gray-500">Standard sole source documentation required</span>
          </label>
        </div>
      </div>
      <div class="form-check" data-value="above_200k" onclick="handleAmountSelection(this)">
        <div class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <label class="ml-3">
            <span class="block text-sm font-medium text-gray-900">$200,000 and above</span>
            <span class="block text-sm text-gray-500">Additional approval required</span>
          </label>
        </div>
      </div>
    </div>
  `;

  if (formData.amount) {
    document.querySelector(`[data-value="${formData.amount}"]`).classList.add('selected');
  }

  document.getElementById('next-button').disabled = !formData.amount;
}
function handleSingleSourceSelection(element) {
  document.querySelectorAll('[data-value]').forEach(el => {
    el.classList.remove('selected');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  formData.single_source = element.dataset.value;

  document.getElementById('next-button').disabled = false;
}

function createStepTwoContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700">Is this product or service available from only one source?</p>
    <div class="space-y-3">
      <div class="form-check" data-value="yes" onclick="handleSingleSourceSelection(this)">
        <label class="flex items-start">
          <input type="radio" name="single_source">
          <span class="ml-3">Yes</span>
        </label>
      </div>
      <div class="form-check" data-value="no" onclick="handleSingleSourceSelection(this)">
        <label class="flex items-start">
          <input type="radio" name="single_source">
          <span class="ml-3">No</span>
        </label>
      </div>
      <div class="form-check" data-value="unsure" onclick="handleSingleSourceSelection(this)">
        <label class="flex items-start">
          <input type="radio" name="single_source">
          <span class="ml-3">I'm not sure</span>
        </label>
      </div>
    </div>
  `;
  document.getElementById('next-button').disabled = !formData.single_source;
}

function handleJustificationSelection(element) {
  element.classList.toggle('selected');
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;

  const value = element.dataset.value;

  if (checkbox.checked) {
    if (!formData.justification.includes(value)) {
      formData.justification.push(value);
    }
  } else {
    formData.justification = formData.justification.filter(item => item !== value);
  }

  document.getElementById('next-button').disabled = formData.justification.length === 0;
}

function createStepThreeContent() {
  const stepContent = document.getElementById('step-content');
  const reasons = [
    "Vendor is the original equipment manufacturer",
    "Parts or service must be compatible with existing equipment",
    "Vendor holds proprietary rights or patents",
    "Only vendor who can meet technical specs or timeline",
    "Only vendor with required certifications"
  ];

  stepContent.innerHTML = `<p class="mb-4 text-gray-700">Select justification(s):</p><div class="space-y-3">` +
    reasons.map(reason => `
      <div class="form-check" data-value="${reason}" onclick="handleJustificationSelection(this)">
        <label class="flex items-start">
          <input type="checkbox" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <span class="ml-3 text-sm text-gray-900">${reason}</span>
        </label>
      </div>`).join('') +
    `</div>`;
  document.getElementById('next-button').disabled = formData.justification.length === 0;
}

function handleAlternativesSelection(element) {
  document.querySelectorAll('[data-value]').forEach(el => {
    el.classList.remove('selected');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  formData.alternatives_researched = element.dataset.value;

  document.getElementById('next-button').disabled = false;
}

function handleReasonOptionSelection(element) {
  element.classList.toggle('selected');
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;

  const value = element.dataset.value;

  if (checkbox.checked) {
    if (!formData.alternatives_reason_options.includes(value)) {
      formData.alternatives_reason_options.push(value);
    }
  } else {
    formData.alternatives_reason_options = formData.alternatives_reason_options.filter(item => item !== value);
  }
}

function createStepFourContent() {
  const stepContent = document.getElementById('step-content');
  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700">Have you researched alternative products or services?</p>
    <div class="space-y-3">
      <div class="form-check" data-value="yes" onclick="handleAlternativesSelection(this)">
        <label class="flex items-start"><input type="radio" name="alternatives"><span class="ml-3">Yes</span></label>
      </div>
      <div class="form-check" data-value="no" onclick="handleAlternativesSelection(this)">
        <label class="flex items-start"><input type="radio" name="alternatives"><span class="ml-3">No</span></label>
      </div>
    </div>
    <div class="mt-4" id="alternatives-reasons-container" style="display:none;">
      <p class="mb-2 text-sm text-gray-700">Why not?</p>
      <div class="space-y-2">
        <div class="form-check" data-value="Time constraints" onclick="handleReasonOptionSelection(this)">
          <label class="flex items-start"><input type="checkbox"><span class="ml-3">Time constraints</span></label>
        </div>
        <div class="form-check" data-value="Specialized product" onclick="handleReasonOptionSelection(this)">
          <label class="flex items-start"><input type="checkbox"><span class="ml-3">Specialized product</span></label>
        </div>
      </div>
    </div>
  `;

  if (formData.alternatives_researched === "no") {
    document.getElementById("alternatives-reasons-container").style.display = "block";
  }

  document.getElementById('next-button').disabled = !formData.alternatives_researched;
}

function handlePriceSelection(element) {
  element.classList.toggle('selected');
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;

  const value = element.dataset.value;

  if (checkbox.checked) {
    if (!formData.price_reasonable.includes(value)) {
      formData.price_reasonable.push(value);
    }
  } else {
    formData.price_reasonable = formData.price_reasonable.filter(item => item !== value);
  }

  document.getElementById('next-button').disabled = formData.price_reasonable.length === 0;
}

function createStepFiveContent() {
  const stepContent = document.getElementById('step-content');
  const methods = [
    "Comparison to market pricing",
    "Historical pricing analysis",
    "Price list/catalog validation",
    "Exclusive license or patent verification",
    "Written justification from department"
  ];

  stepContent.innerHTML = `<p class="mb-4 text-gray-700">Select methods used to determine price reasonableness:</p><div class="space-y-3">` +
    methods.map(method => `
      <div class="form-check" data-value="${method}" onclick="handlePriceSelection(this)">
        <label class="flex items-start">
          <input type="checkbox" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <span class="ml-3 text-sm text-gray-900">${method}</span>
        </label>
      </div>`).join('') +
    `</div>`;

  document.getElementById('next-button').textContent = 'Submit';
  document.getElementById('next-button').disabled = formData.price_reasonable.length === 0;
}

function handleNext() {
  if (currentStep === totalSteps) {
    submitForm();
    return;
  }
  currentStep++;
  updateProgressIndicator();
  document.getElementById('prev-button').classList.remove('invisible');
  steps[currentStep - 1].createContent();
}

function handlePrevious() {
  if (currentStep > 1) {
    currentStep--;
    updateProgressIndicator();
    if (currentStep === 1) {
      document.getElementById('prev-button').classList.add('invisible');
    }
    steps[currentStep - 1].createContent();
  }
}

function submitForm() {
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = `
    <div class="p-6 fade-in">
      <h2 class="text-xl font-semibold mb-4">Sole Source Determination Results</h2>
      <div class="bg-green-50 border border-green-200 p-4 mb-6 rounded-md">
        <h3 class="text-lg font-medium text-green-800 mb-2">Likely Sole Source</h3>
        <p class="text-green-700">Based on your responses, your procurement may qualify as a sole source. Please complete the documentation form and consult Procurement Services as needed.</p>
      </div>
      <div class="flex space-x-4 mt-6">
        <button id="start-over" class="btn-secondary px-4 py-2 rounded-md">Start Over</button>
        <button id="download-pdf" class="btn-primary px-4 py-2 rounded-md">Download PDF</button>
      </div>
    </div>
  `;

  document.getElementById('start-over').addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('download-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Sole Source Procurement Summary', 20, 20);

    doc.setFontSize(12);
    let y = 35;

    function addSection(title, value) {
      doc.setFont(undefined, 'bold');
      doc.text(`${title}:`, 20, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(value || 'N/A', 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 4;
    }

    addSection('Procurement Amount', formData.amount);
    addSection('Single Source Status', formData.single_source);
    addSection('Justifications', formData.justification.join(', '));
    addSection('Alternatives Researched', formData.alternatives_researched);
    addSection('Reasons for No Alternatives', formData.alternatives_reason_options.join(', '));
    addSection('Price Reasonableness', formData.price_reasonable.join(', '));

    doc.save('sole-source-summary.pdf');
  });
}

function resetForm() {
  formData = {
    amount: null,
    single_source: null,
    justification: [],
    alternatives_researched: null,
    alternatives_reason_options: [],
    price_reasonable: []
  };
  currentStep = 1;
  updateProgressIndicator();

  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = `
    <div class="progress-bar">
      <div class="progress-bar-indicator" id="progress-indicator" style="width: 20%"></div>
    </div>
    <div class="p-6">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-xl font-semibold" id="step-title">Step 1: Procurement Amount</h2>
        <div class="text-sm text-gray-500" id="step-counter">Step 1 of 5</div>
      </div>
      <div id="step-content" class="mb-6 fade-in"></div>
      <div class="flex justify-between mt-8">
        <button id="prev-button" class="btn-secondary px-4 py-2 rounded-md invisible" onclick="handlePrevious()">Previous</button>
        <button id="next-button" class="btn-primary px-4 py-2 rounded-md" onclick="handleNext()" disabled>Next</button>
      </div>
    </div>
  `;

  createStepOneContent();
}

const steps = [
  { title: "Step 1: Procurement Amount", createContent: createStepOneContent },
  { title: "Step 2: Single Source Status", createContent: createStepTwoContent },
  { title: "Step 3: Justification", createContent: createStepThreeContent },
  { title: "Step 4: Alternatives Research", createContent: createStepFourContent },
  { title: "Step 5: Price Reasonableness", createContent: createStepFiveContent }
];

document.addEventListener('DOMContentLoaded', function () {
  updateProgressIndicator();
  createStepOneContent();
});
