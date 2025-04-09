'use strict';

const { jsPDF } = window.jspdf;

let formData = {
  amount: null
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
          <input type="radio" name="amount" id="amount_less_than_10k" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300">
          <label for="amount_less_than_10k" class="ml-3 cursor-pointer">
            <span class="block text-sm font-medium text-gray-900">Less than $10,000</span>
            <span class="block text-sm text-gray-500">Delegated authority threshold</span>
          </label>
        </div>
      </div>
      <div class="form-check" data-value="10k_to_200k" onclick="handleAmountSelection(this)">
        <div class="flex items-start">
          <input type="radio" name="amount" id="amount_10k_to_200k" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300">
          <label for="amount_10k_to_200k" class="ml-3 cursor-pointer">
            <span class="block text-sm font-medium text-gray-900">$10,000 to $200,000</span>
            <span class="block text-sm text-gray-500">Standard sole source documentation required</span>
          </label>
        </div>
      </div>
      <div class="form-check" data-value="above_200k" onclick="handleAmountSelection(this)">
        <div class="flex items-start">
          <input type="radio" name="amount" id="amount_above_200k" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300">
          <label for="amount_above_200k" class="ml-3 cursor-pointer">
            <span class="block text-sm font-medium text-gray-900">$200,000 and above</span>
            <span class="block text-sm text-gray-500">Additional approval required</span>
          </label>
        </div>
      </div>
    </div>
  `;

  if (formData.amount) {
    const selectedElement = document.querySelector(`[data-value="${formData.amount}"]`);
    if (selectedElement) {
      selectedElement.classList.add('selected');
      const radio = selectedElement.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
  }

  document.getElementById('next-button').textContent = 'Next';
  document.getElementById('next-button').disabled = !formData.amount;
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
  const stepContent = document.getElementById('step-content');
  stepContent.classList.remove('fade-in');
  void stepContent.offsetWidth;
  stepContent.classList.add('fade-in');
}

function handlePrevious() {
  if (currentStep > 1) {
    currentStep--;
    updateProgressIndicator();
    if (currentStep === 1) {
      document.getElementById('prev-button').classList.add('invisible');
    }
    steps[currentStep - 1].createContent();
    if (currentStep < totalSteps) {
      document.getElementById('next-button').textContent = 'Next';
    }
    const stepContent = document.getElementById('step-content');
    stepContent.classList.remove('fade-in');
    void stepContent.offsetWidth;
    stepContent.classList.add('fade-in');
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
      <button id="start-over" class="btn-secondary px-4 py-2 rounded-md mt-6">Start Over</button>
    </div>
  `;

  document.getElementById('start-over').addEventListener('click', function () {
    resetForm();
  });
}

function resetForm() {
  formData = { amount: null };
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
  {
    title: "Step 1: Procurement Amount",
    description: "What is the estimated dollar amount of your procurement?",
    createContent: createStepOneContent
  },
  {
    title: "Step 2: Single Source Status",
    description: "",
    createContent: function () {
      const stepContent = document.getElementById('step-content');
      stepContent.innerHTML = `<p class="text-gray-700">Coming soon...</p>`;
      document.getElementById('next-button').disabled = false;
    }
  },
  {
    title: "Step 3: Justification",
    description: "",
    createContent: function () {
      const stepContent = document.getElementById('step-content');
      stepContent.innerHTML = `<p class="text-gray-700">Coming soon...</p>`;
      document.getElementById('next-button').disabled = false;
    }
  },
  {
    title: "Step 4: Alternatives Research",
    description: "",
    createContent: function () {
      const stepContent = document.getElementById('step-content');
      stepContent.innerHTML = `<p class="text-gray-700">Coming soon...</p>`;
      document.getElementById('next-button').disabled = false;
    }
  },
  {
    title: "Step 5: Price Reasonableness",
    description: "",
    createContent: function () {
      const stepContent = document.getElementById('step-content');
      stepContent.innerHTML = `<p class="text-gray-700">Coming soon...</p>`;
      document.getElementById('next-button').textContent = 'Submit';
      document.getElementById('next-button').disabled = false;
    }
  }
];

document.addEventListener('DOMContentLoaded', function () {
  updateProgressIndicator();
  createStepOneContent();
});
