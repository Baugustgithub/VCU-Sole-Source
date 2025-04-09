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
        <label class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <span class="ml-3">Less than $10,000</span>
        </label>
      </div>
      <div class="form-check" data-value="10k_to_200k" onclick="handleAmountSelection(this)">
        <label class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <span class="ml-3">$10,000 to $200,000</span>
        </label>
      </div>
      <div class="form-check" data-value="above_200k" onclick="handleAmountSelection(this)">
        <label class="flex items-start">
          <input type="radio" name="amount" class="mt-1 h-4 w-4 text-yellow-500 border-gray-300">
          <span class="ml-3">$200,000 and above</span>
        </label>
      </div>
    </div>
  `;

  if (formData.amount) {
    const selected = document.querySelector(`[data-value="${formData.amount}"]`);
    if (selected) {
      selected.classList.add('selected');
      const radio = selected.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
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
        <label class="flex items-start"><input type="radio" name="single_source"><span class="ml-3">Yes</span></label>
      </div>
      <div class="form-check" data-value="no" onclick="handleSingleSourceSelection(this)">
        <label class="flex items-start"><input type="radio" name="single_source"><span class="ml-3">No</span></label>
      </div>
      <div class="form-check" data-value="unsure" onclick="handleSingleSourceSelection(this)">
        <label class="flex items-start"><input type="radio" name="single_source"><span class="ml-3">I'm not sure</span></label>
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

  const validReasons = [
    "This vendor holds exclusive proprietary rights or patents",
    "This vendor is the only supplier known to meet the exact technical specifications required for this procurement.",
    "This vendor is the only known source with the required certifications",
    "This vendor possesses unique expertise or experience for this specific need",
    "This vendor is the only known authorized distributor for this product or service",
    "No known substitutes available",
    "Only known source compliant with specific regulatory or safety standards required",
    "Only supplier identified as capable of meeting all operational requirements without modification or risk"
  ];

  const invalidReasons = [
    "We’ve used this vendor before and had a good experience",
    "It’s more convenient to use this vendor",
    "They gave us the best price",
    "We’re under a tight deadline",
    "I’ve worked with them before",
    "I don’t have time to look for alternatives",
    "I already started work with them"
  ];

  const unsureReasons = [
    "Not sure yet and is still gathering information to determine if other suppliers exist.",
    "Unfamiliar with the procurement process and cannot confirm details at this time.",
    "Lacking sufficient data to verify details",
    "Unfamiliar with the market",
    "Uncertain about the specific requirements"
  ];

  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700">Select justification(s):</p>

    <p class="text-sm text-green-800 font-medium mb-2">✔ Potentially Valid Justifications</p>
    <div class="space-y-3 mb-4">
      ${validReasons.map(reason => `
        <div class="form-check" data-value="${reason}" onclick="handleJustificationSelection(this)">
          <label class="flex items-start">
            <input type="checkbox" class="mt-1 h-4 w-4 text-green-600 border-gray-300">
            <span class="ml-3 text-sm text-gray-900">${reason}</span>
          </label>
        </div>`).join('')}
    </div>

    <p class="text-sm text-red-700 font-medium mb-2">✘ Not Valid Justifications</p>
    <div class="space-y-3 mb-4">
      ${invalidReasons.map(reason => `
        <div class="form-check" data-value="${reason}" onclick="handleJustificationSelection(this)">
          <label class="flex items-start">
            <input type="checkbox" class="mt-1 h-4 w-4 text-red-500 border-gray-300">
            <span class="ml-3 text-sm text-gray-900">${reason}</span>
          </label>
        </div>`).join('')}
    </div>

    <p class="text-sm text-gray-700 font-medium mb-2">❓ Not Sure</p>
    <div class="space-y-3">
      ${unsureReasons.map(reason => `
        <div class="form-check" data-value="${reason}" onclick="handleJustificationSelection(this)">
          <label class="flex items-start">
            <input type="checkbox" class="mt-1 h-4 w-4 text-gray-500 border-gray-300">
            <span class="ml-3 text-sm text-gray-900">${reason}</span>
          </label>
        </div>`).join('')}
    </div>
  `;

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

  const reasonsContainer = document.getElementById('alternatives-reasons-container');
  if (formData.alternatives_researched === "no") {
    reasonsContainer.style.display = "block";
  } else {
    reasonsContainer.style.display = "none";
    formData.alternatives_reason_options = [];
  }

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

function evaluateResult() {
  if (formData.amount === "less_than_10k") {
    return {
      title: "Not a Sole Source – Delegated Authority",
      message: "Procurements under $10,000 fall within your department’s delegated authority and do not require sole source documentation."
    };
  }

  let score = 0;
  if (formData.amount === "above_200k") score -= 1;
  if (formData.single_source === "yes") score += 3;
  else if (formData.single_source === "no") score -= 3;
  else if (formData.single_source === "unsure") score -= 1;

  const validJustifications = [
    "This vendor holds exclusive proprietary rights or patents",
    "This vendor is the only supplier known to meet the exact technical specifications required for this procurement.",
    "This vendor is the only known source with the required certifications",
    "This vendor possesses unique expertise or experience for this specific need",
    "This vendor is the only known authorized distributor for this product or service",
    "No known substitutes available",
    "Only known source compliant with specific regulatory or safety standards required",
    "Only supplier identified as capable of meeting all operational requirements without modification or risk"
  ];

  const unsureFlags = [
    "Not sure yet and is still gathering information to determine if other suppliers exist.",
    "Unfamiliar with the procurement process and cannot confirm details at this time.",
    "Lacking sufficient data to verify details",
    "Unfamiliar with the market",
    "Uncertain about the specific requirements"
  ];

  const hasValid = formData.justification.some(j => validJustifications.includes(j));
  const hasInvalid = formData.justification.some(j => !validJustifications.includes(j) && !unsureFlags.includes(j));
  const hasUnsure = formData.justification.some(j => unsureFlags.includes(j));

  if (hasValid && !hasInvalid && !hasUnsure) score += 2;
  else if (hasValid && hasInvalid) score += 1;
  else if (!hasValid && hasInvalid) score -= 2;
  if (hasUnsure) score -= 1;

  if (formData.alternatives_researched === "yes") score += 2;
  else if (formData.alternatives_researched === "no" && formData.alternatives_reason_options.length > 0) score += 1;

  if (formData.price_reasonable.length >= 2) score += 2;

  if (score >= 7) {
    return {
      title: "Likely Sole Source",
      message: "Based on your responses, your procurement may qualify as a sole source. Please complete the documentation form and consult Procurement Services as needed."
    };
  } else if (score >= 4) {
    return {
      title: "Needs Further Review",
      message: "Some responses indicate potential qualification, but additional review by Procurement Services is recommended."
    };
  } else if (score >= 1) {
    return {
      title: "Inconclusive – Additional Information Needed",
      message: "Your responses do not provide enough clarity to determine sole source eligibility. Please consult with Procurement Services to discuss the specifics of your procurement."
    };
  } else {
    return {
      title: "Not Likely Sole Source",
      message: "Based on your responses, this procurement may not meet sole source criteria. Please explore competitive options or consult Procurement Services."
    };
  }
}

function submitForm() {
  const result = evaluateResult();
  const formContainer = document.getElementById('form-container');
  formContainer.innerHTML = `
    <div class="p-6 fade-in">
      <h2 class="text-xl font-semibold mb-4">Sole Source Determination Results</h2>
      <div class="bg-green-50 border border-green-200 p-4 mb-6 rounded-md">
        <h3 class="text-lg font-medium text-green-800 mb-2">${result.title}</h3>
        <p class="text-green-700">${result.message}</p>
      </div>
      <div class="flex space-x-4 mt-6">
        <button id="start-over" class="btn-secondary px-4 py-2 rounded-md">Start Over</button>
        <button id="download-pdf" class="btn-primary px-4 py-2 rounded-md">Download PDF</button>
      </div>
    </div>
  `;

  document.getElementById('start-over').addEventListener('click', () => window.location.reload());

  document.getElementById('download-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Sole Source Procurement Summary', 20, 20);

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
    doc.setFont(undefined, 'bold');
    doc.text(`Result: ${result.title}`, 20, y + 4);
    y += 10;
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(result.message, 170);
    doc.text(lines, 20, y);

    doc.save('sole-source-summary.pdf');
  });
}

function handleNext() {
  if (currentStep === 1 && formData.amount === "less_than_10k") {
    submitForm();
    return;
  }
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
