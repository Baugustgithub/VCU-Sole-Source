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

  if (formData.alternatives_researched === "no") {
    formData.alternatives_reason_options = []; // clear old data
  }

  createStepFourContent(); // re-render to show/hide reasons
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

  const validReasons = [
    "The complexity of the technical requirements makes alternatives impractical without significant redesign or risk.",
    "A subject matter expert for this market advised that no viable alternatives exist.",
    "The product or service is a niche solution with no known competitors based on industry knowledge.",
    "Regulatory or contractual obligations mandate the use of this specific vendor, limiting research scope.",
    "The technology is so cutting-edge that alternative options are not yet available in the market."
  ];

  const invalidReasons = [
    "The urgency of the requirement left no time to research alternative products or services.",
    "Lack of resources to conduct a thorough alternatives search at this time.",
    "Preferred vendor",
    "No one knew how to research alternatives",
    "We’ve used this vendor before and didn’t see a need to look elsewhere."
  ];

  stepContent.innerHTML = `
    <p class="mb-4 text-gray-700">Have you researched alternative products or services?</p>
    <div class="space-y-3 mb-4">
      <div class="form-check" data-value="yes" onclick="handleAlternativesSelection(this)">
        <label class="flex items-start"><input type="radio" name="alternatives"><span class="ml-3">Yes</span></label>
      </div>
      <div class="form-check" data-value="no" onclick="handleAlternativesSelection(this)">
        <label class="flex items-start"><input type="radio" name="alternatives"><span class="ml-3">No</span></label>
      </div>
    </div>
    ${formData.alternatives_researched === "no" ? `
      <p class="text-sm text-green-800 font-medium mb-2">✔ Potentially Valid Justifications</p>
      <div class="space-y-2 mb-4">
        ${validReasons.map(reason => `
          <div class="form-check" data-value="${reason}" onclick="handleReasonOptionSelection(this)">
            <label class="flex items-start">
              <input type="checkbox">
              <span class="ml-3 text-sm text-gray-900">${reason}</span>
            </label>
          </div>`).join('')}
      </div>

      <p class="text-sm text-red-700 font-medium mb-2">✘ Not Valid Justifications</p>
      <div class="space-y-2 mb-4">
        ${invalidReasons.map(reason => `
          <div class="form-check" data-value="${reason}" onclick="handleReasonOptionSelection(this)">
            <label class="flex items-start">
              <input type="checkbox">
              <span class="ml-3 text-sm text-gray-900">${reason}</span>
            </label>
          </div>`).join('')}
      </div>
    ` : ''}
  `;

  document.getElementById('next-button').disabled = !formData.alternatives_researched;
}

// The rest of the script (Step 5, evaluateResult, submitForm, PDF, nav, etc.)
