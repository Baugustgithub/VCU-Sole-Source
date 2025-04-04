document.addEventListener('DOMContentLoaded', function () {
  let currentStep = 1;
  const totalSteps = 5;

  const progressIndicator = document.getElementById('progress-indicator');
  const stepTitle = document.getElementById('step-title');
  const stepCounter = document.getElementById('step-counter');
  const stepContent = document.getElementById('step-content');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  // Update progress bar and step content
  function updateStep() {
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressIndicator.style.width = `${progressPercentage}%`;

    stepTitle.textContent = `Step ${currentStep}: ${getStepTitle(currentStep)}`;
    stepCounter.textContent = `Step ${currentStep} of ${totalSteps}`;
    stepContent.innerHTML = getStepContent(currentStep);

    // Update button visibility
    prevButton.classList.toggle('invisible', currentStep === 1);
    nextButton.textContent = currentStep === totalSteps ? 'Submit' : 'Next';
    nextButton.disabled = true; // Disable until a selection is made
  }

  // Get step title based on the current step
  function getStepTitle(step) {
    switch (step) {
      case 1: return 'Procurement Amount';
      case 2: return 'Justification';
      case 3: return 'Market Research';
      case 4: return 'Vendor Information';
      case 5: return 'Review and Submit';
      default: return '';
    }
  }

  // Get step content based on the current step
  function getStepContent(step) {
    switch (step) {
      case 1:
        return `
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
      case 2:
        return `<p class="text-gray-700">Provide justification for the sole source procurement.</p>`;
      case 3:
        return `<p class="text-gray-700">Describe the market research conducted.</p>`;
      case 4:
        return `<p class="text-gray-700">Enter vendor information.</p>`;
      case 5:
        return `<p class="text-gray-700">Review your responses and submit the form.</p>`;
      default:
        return '';
    }
  }

  // Handle "Next" button click
  nextButton.addEventListener('click', function () {
    if (currentStep < totalSteps) {
      currentStep++;
      updateStep();
    } else {
      alert('Form submitted successfully!');
      // Add form submission logic here
    }
  });

  // Handle "Previous" button click
  prevButton.addEventListener('click', function () {
    if (currentStep > 1) {
      currentStep--;
      updateStep();
    }
  });

  // Handle "Start Over" button click
  window.handleStartOver = function () {
    currentStep = 1; // Reset to the first step
    updateStep(); // Update the UI
    console.log('Form has been reset to the first step.');
  };

  // Handle selection in step 1
  window.handleAmountSelection = function (element) {
    document.querySelectorAll('.form-check').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    nextButton.disabled = false; // Enable "Next" button after selection
  };

  // Initialize the first step
  updateStep();
});