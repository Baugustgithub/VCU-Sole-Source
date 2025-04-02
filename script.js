// Use strict mode for better error catching and code quality
'use strict';

// Initialize jsPDF and FileSaver from libraries
const { jsPDF } = window.jspdf;

// Form data object to store all responses
let formData = {
  amount: null,
  single_source: null,
  justification: [],
  alternatives_researched: null,
  alternatives_reason_options: [],
  price_reasonable: []
};

// Current step tracker (1-based index)
let currentStep = 1;
const totalSteps = 5;

// Mapping for value display in results
const valueMappings = {
  less_than_10k: "Less than $10,000",
  "10k_to_200k": "$10,000 to $200,000",
  above_200k: "$200,000 and above",
  yes: "Yes",
  no: "No",
  unsure: "Unsure",
  exclusive_distribution: "Exclusive distribution",
  compatible_accessory: "Integral part or accessory compatible with existing equipment",
  maintenance: "Maintenance service for existing equipment",
  software_maintenance: "Upgrade or maintenance for existing software",
  research_continuity: "Used in research and required for continuity of results",
  patent: "Copyrighted or patented and only available from the recommended source",
  training: "Considerable re-orientation and training would be required",
  grant: "Vendor specifically named in a grant and/or grant proposal",
  // Legitimate reasons
  specified_in_grant: "Specified in grant/funding",
  continuation_existing: "Continuation of existing project",
  exclusive_rights: "Vendor has exclusive rights",
  market_expertise: "Market expertise",
  // Neutral options
  early_planning: "Still in early planning",
  gathering_requirements: "Currently gathering requirements",
  // Poor planning reasons
  timing_constraints: "Time limitations",
  previous_vendor_familiarity: "Familiarity with vendor",
  convenience: "Convenience",
  historical: "Historical/past pricing",
  similar: "Prices charged for similar items",
  other_customers: "Prices paid by other customers",
  public_price: "A public price list or public catalog",
  negotiated: "I have negotiated with the vendor or secured educational discounts",
  none: "None of the above"
};

// Step data with titles, descriptions, and content creator functions
const steps = [
  {
    title: "Step 1: Procurement Amount",
    description: "What is the estimated dollar amount of your procurement?",
    createContent: createStepOneContent
  },
  {
    title: "Step 2: Single Source Status",
    description: "Is this product or service available from only one source?",
    createContent: createStepTwoContent
  },
  {
    title: "Step 3: Justification",
    description: "Select all the reasons that apply to this procurement:",
    createContent: createStepThreeContent
  },
  {
    title: "Step 4: Alternatives Research",
    description: "Have you researched alternative products or services?",
    createContent: createStepFourContent
  },
  {
    title: "Step 5: Price Reasonableness",
    description: "How have you determined that the price is reasonable?",
    createContent: createStepFiveContent
  }
];

// Helper function to update the progress indicator
function updateProgressIndicator() {
  const percentComplete = (currentStep / totalSteps) * 100;
  document.getElementById('progress-indicator').style.width = `${percentComplete}%`;
  document.getElementById('step-counter').textContent = `Step ${currentStep} of ${totalSteps}`;
  document.getElementById('step-title').textContent = steps[currentStep - 1].title;
}

// Event handlers for selection options
function handleAmountSelection(element) {
  // Clear previous selections
  document.querySelectorAll('[data-value]').forEach(el => {
    el.classList.remove('selected');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  // Set new selection
  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  
  // Update form data
  formData.amount = element.dataset.value;
  
  // Enable next button
  document.getElementById('next-button').disabled = false;
}

function handleSingleSourceSelection(element) {
  // Clear previous selections
  document.querySelectorAll('[data-value]').forEach(el => {
    el.classList.remove('selected');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  // Set new selection
  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  
  // Update form data
  formData.single_source = element.dataset.value;
  
  // Enable next button
  document.getElementById('next-button').disabled = false;
}

function handleJustificationSelection(element) {
  element.classList.toggle('selected');
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  
  const value = element.dataset.value;
  
  // Update the form data
  if (checkbox.checked) {
    if (!formData.justification.includes(value)) {
      formData.justification.push(value);
    }
  } else {
    formData.justification = formData.justification.filter(item => item !== value);
  }
  
  // Enable next button if at least one option is selected
  document.getElementById('next-button').disabled = formData.justification.length === 0;
}

function handleAlternativesSelection(element) {
  // Clear previous selections
  document.querySelectorAll('[data-value]').forEach(el => {
    el.classList.remove('selected');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });
  
  // Set new selection
  element.classList.add('selected');
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  
  // Update form data
  formData.alternatives_researched = element.dataset.value;
  
  // Show/hide additional options based on selection
  const additionalOptions = document.getElementById('alternatives-additional-options');
  if (additionalOptions) {
    additionalOptions.style.display = formData.alternatives_researched === 'no' ? 'block' : 'none';
  }
  
  // Reset alternatives reasons if "yes" is selected
  if (formData.alternatives_researched === 'yes') {
    formData.alternatives_reason_options = [];
    document.querySelectorAll('[name="alternatives_reason_options"]').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.closest('.form-check').classList.remove('selected');
    });
  }
  
  // Enable next button
  document.getElementById('next-button').disabled = false;
}

function handleAlternativesReasonSelection(element) {
  element.classList.toggle('selected');
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  
  const value = element.dataset.value;
  
  // Update the form data
  if (checkbox.checked) {
    if (!formData.alternatives_reason_options.includes(value)) {
      formData.alternatives_reason_options.push(value);
    }
  } else {
    formData.alternatives_reason_options = formData.alternatives_reason_options.filter(item => item !== value);
  }
}

function handlePriceSelection(element) {
  element.classList.toggle('selected');
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  
  const value = element.dataset.value;
  
  // Update the form data
  if (checkbox.checked) {
    if (!formData.price_reasonable.includes(value)) {
      formData.price_reasonable.push(value);
    }
  } else {
    formData.price_reasonable = formData.price_reasonable.filter(item => item !== value);
  }
  
  // Enable next button if at least one option is selected
  document.getElementById('next-button').disabled = formData.price_reasonable.length === 0;
}

// Content creator functions for each step
function createStepOneContent() {
  // Step 1 content is already in the HTML
  
  // Reset next button state based on selection
  document.getElementById('next-button').textContent = 'Next';
  document.getElementById('next-button').disabled = !formData.amount;
  
  // Update any pre-selected options
  if (formData.amount) {
    const selectedElement = document.querySelector(`[data-value="${formData.amount}"]`);
    if (selectedElement) {
      selectedElement.classList.add('selected');
      const radio = selectedElement.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
  }
}

function createStepTwoContent() {
  const stepContent = document.getElementById('step-content');
  
  // Clear previous content
  stepContent.innerHTML = '';
  
  // Add description
  const description = document.createElement('p');
  description.className = 'mb-4 text-gray-700';
  description.textContent = steps[1].description;
  stepContent.appendChild(description);
  
  // Create options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'space-y-3';
  
  // Yes option
  const yesOption = document.createElement('div');
  yesOption.className = 'form-check' + (formData.single_source === 'yes' ? ' selected' : '');
  yesOption.dataset.value = 'yes';
  yesOption.onclick = function() { handleSingleSourceSelection(this); };
  yesOption.innerHTML = `
    <div class="flex items-start">
      <input type="radio" name="single_source" id="single_source_yes" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300" ${formData.single_source === 'yes' ? 'checked' : ''}>
      <label for="single_source_yes" class="ml-3 cursor-pointer">
        <span class="block text-sm font-medium text-gray-900">Yes</span>
        <span class="block text-sm text-gray-500">Only one supplier can provide this product or service</span>
      </label>
    </div>
  `;
  optionsContainer.appendChild(yesOption);
  
  // No option
  const noOption = document.createElement('div');
  noOption.className = 'form-check' + (formData.single_source === 'no' ? ' selected' : '');
  noOption.dataset.value = 'no';
  noOption.onclick = function() { handleSingleSourceSelection(this); };
  noOption.innerHTML = `
    <div class="flex items-start">
      <input type="radio" name="single_source" id="single_source_no" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300" ${formData.single_source === 'no' ? 'checked' : ''}>
      <label for="single_source_no" class="ml-3 cursor-pointer">
        <span class="block text-sm font-medium text-gray-900">No</span>
        <span class="block text-sm text-gray-500">Multiple suppliers can provide this product or service</span>
      </label>
    </div>
  `;
  optionsContainer.appendChild(noOption);
  
  // Unsure option
  const unsureOption = document.createElement('div');
  unsureOption.className = 'form-check' + (formData.single_source === 'unsure' ? ' selected' : '');
  unsureOption.dataset.value = 'unsure';
  unsureOption.onclick = function() { handleSingleSourceSelection(this); };
  unsureOption.innerHTML = `
    <div class="flex items-start">
      <input type="radio" name="single_source" id="single_source_unsure" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300" ${formData.single_source === 'unsure' ? 'checked' : ''}>
      <label for="single_source_unsure" class="ml-3 cursor-pointer">
        <span class="block text-sm font-medium text-gray-900">I'm not sure</span>
        <span class="block text-sm text-gray-500">More research needed to determine available sources</span>
      </label>
    </div>
  `;
  optionsContainer.appendChild(unsureOption);
  
  // Add options to content
  stepContent.appendChild(optionsContainer);
  
  // Reset next button state based on selection
  document.getElementById('next-button').disabled = !formData.single_source;
}

function createStepThreeContent() {
  const stepContent = document.getElementById('step-content');
  
  // Clear previous content
  stepContent.innerHTML = '';
  
  // Add description
  const description = document.createElement('p');
  description.className = 'mb-4 text-gray-700';
  description.textContent = steps[2].description;
  stepContent.appendChild(description);
  
  // Create options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'space-y-3';
  
  // Justification options
  const justificationOptions = [
    {
      value: 'exclusive_distribution',
      label: 'Exclusive distribution',
      description: 'The recommended source has exclusive distribution rights for this item'
    },
    {
      value: 'compatible_accessory',
      label: 'Compatible accessory',
      description: 'This is an integral part or accessory that is compatible with existing equipment'
    },
    {
      value: 'maintenance',
      label: 'Maintenance service',
      description: 'This is for maintenance service of existing equipment'
    },
    {
      value: 'software_maintenance',
      label: 'Software maintenance',
      description: 'This is for upgrade or maintenance for existing software'
    },
    {
      value: 'research_continuity',
      label: 'Research continuity',
      description: 'This is used in research and required for continuity of results'
    },
    {
      value: 'patent',
      label: 'Patent/Copyright',
      description: 'This is copyrighted or patented and only available from the recommended source'
    },
    {
      value: 'training',
      label: 'Training requirements',
      description: 'Considerable re-orientation and training would be required'
    },
    {
      value: 'grant',
      label: 'Grant specified',
      description: 'Vendor specifically named in a grant and/or grant proposal'
    },
  ];
  
  // Create option elements
  justificationOptions.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = 'form-check' + (formData.justification.includes(option.value) ? ' selected' : '');
    optionElement.dataset.value = option.value;
    optionElement.onclick = function() { handleJustificationSelection(this); };
    
    optionElement.innerHTML = `
      <div class="flex items-start">
        <input type="checkbox" name="justification" id="justification_${option.value}" 
               class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 rounded border-gray-300" 
               ${formData.justification.includes(option.value) ? 'checked' : ''}>
        <label for="justification_${option.value}" class="ml-3 cursor-pointer">
          <span class="block text-sm font-medium text-gray-900">${option.label}</span>
          <span class="block text-sm text-gray-500">${option.description}</span>
        </label>
      </div>
    `;
    
    optionsContainer.appendChild(optionElement);
  });
  
  // Add options to content
  stepContent.appendChild(optionsContainer);
  
  // Reset next button state based on selection
  document.getElementById('next-button').disabled = formData.justification.length === 0;
}

function createStepFourContent() {
  const stepContent = document.getElementById('step-content');
  
  // Clear previous content
  stepContent.innerHTML = '';
  
  // Add description
  const description = document.createElement('p');
  description.className = 'mb-4 text-gray-700';
  description.textContent = steps[3].description;
  stepContent.appendChild(description);
  
  // Create options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'space-y-3';
  
  // Yes option
  const yesOption = document.createElement('div');
  yesOption.className = 'form-check' + (formData.alternatives_researched === 'yes' ? ' selected' : '');
  yesOption.dataset.value = 'yes';
  yesOption.onclick = function() { handleAlternativesSelection(this); };
  yesOption.innerHTML = `
    <div class="flex items-start">
      <input type="radio" name="alternatives_researched" id="alternatives_researched_yes" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300" ${formData.alternatives_researched === 'yes' ? 'checked' : ''}>
      <label for="alternatives_researched_yes" class="ml-3 cursor-pointer">
        <span class="block text-sm font-medium text-gray-900">Yes</span>
        <span class="block text-sm text-gray-500">I have researched other options but this is the only one that meets our needs</span>
      </label>
    </div>
  `;
  optionsContainer.appendChild(yesOption);
  
  // No option
  const noOption = document.createElement('div');
  noOption.className = 'form-check' + (formData.alternatives_researched === 'no' ? ' selected' : '');
  noOption.dataset.value = 'no';
  noOption.onclick = function() { handleAlternativesSelection(this); };
  noOption.innerHTML = `
    <div class="flex items-start">
      <input type="radio" name="alternatives_researched" id="alternatives_researched_no" class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300" ${formData.alternatives_researched === 'no' ? 'checked' : ''}>
      <label for="alternatives_researched_no" class="ml-3 cursor-pointer">
        <span class="block text-sm font-medium text-gray-900">No</span>
        <span class="block text-sm text-gray-500">I have not researched alternatives</span>
      </label>
    </div>
  `;
  optionsContainer.appendChild(noOption);
  
  // Add options to content
  stepContent.appendChild(optionsContainer);
  
  // Create additional options for "No" selection
  const additionalOptions = document.createElement('div');
  additionalOptions.id = 'alternatives-additional-options';
  additionalOptions.className = 'mt-4 pt-4 border-t border-gray-200 space-y-3';
  additionalOptions.style.display = formData.alternatives_researched === 'no' ? 'block' : 'none';
  
  // Add header for additional options
  const additionalHeader = document.createElement('p');
  additionalHeader.className = 'text-sm font-medium text-gray-700 mb-3';
  additionalHeader.textContent = 'Why have alternatives not been researched? (Select all that apply)';
  additionalOptions.appendChild(additionalHeader);
  
  // Define reasons categories and options
  const reasonCategories = [
    {
      title: 'Strong justifications for sole source:',
      options: [
        { value: 'specified_in_grant', label: 'Specified in grant/funding' },
        { value: 'continuation_existing', label: 'Continuation of existing project' },
        { value: 'exclusive_rights', label: 'Vendor has exclusive rights' },
        { value: 'market_expertise', label: 'Market expertise' }
      ]
    },
    {
      title: 'Requires additional information:',
      options: [
        { value: 'early_planning', label: 'Still in early planning' },
        { value: 'gathering_requirements', label: 'Currently gathering requirements' }
      ]
    },
    {
      title: 'May require additional justification:',
      options: [
        { value: 'timing_constraints', label: 'Time limitations' },
        { value: 'previous_vendor_familiarity', label: 'Familiarity with vendor' },
        { value: 'convenience', label: 'Convenience' }
      ]
    }
  ];
  
  // Create option elements for each category
  reasonCategories.forEach(category => {
    const categoryHeader = document.createElement('p');
    categoryHeader.className = 'text-sm font-semibold text-gray-800 mt-3 mb-2';
    categoryHeader.textContent = category.title;
    additionalOptions.appendChild(categoryHeader);
    
    const categoryOptionsContainer = document.createElement('div');
    categoryOptionsContainer.className = 'pl-2 space-y-2';
    
    category.options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'form-check' + (formData.alternatives_reason_options.includes(option.value) ? ' selected' : '');
      optionElement.dataset.value = option.value;
      optionElement.onclick = function() { handleAlternativesReasonSelection(this); };
      
      optionElement.innerHTML = `
        <div class="flex items-start">
          <input type="checkbox" name="alternatives_reason_options" id="reason_${option.value}" 
                 class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 rounded border-gray-300" 
                 ${formData.alternatives_reason_options.includes(option.value) ? 'checked' : ''}>
          <label for="reason_${option.value}" class="ml-3 cursor-pointer">
            <span class="block text-sm font-medium text-gray-900">${option.label}</span>
          </label>
        </div>
      `;
      
      categoryOptionsContainer.appendChild(optionElement);
    });
    
    additionalOptions.appendChild(categoryOptionsContainer);
  });
  
  // Add additional options to content
  stepContent.appendChild(additionalOptions);
  
  // Reset next button state based on selection
  document.getElementById('next-button').disabled = !formData.alternatives_researched;
}

function createStepFiveContent() {
  const stepContent = document.getElementById('step-content');
  
  // Clear previous content
  stepContent.innerHTML = '';
  
  // Add description
  const description = document.createElement('p');
  description.className = 'mb-4 text-gray-700';
  description.textContent = steps[4].description;
  stepContent.appendChild(description);
  
  // Create options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'space-y-3';
  
  // Price reasonableness options
  const priceOptions = [
    {
      value: 'historical',
      label: 'Historical/past pricing',
      description: 'Comparison with previously paid prices'
    },
    {
      value: 'similar',
      label: 'Similar items pricing',
      description: 'Prices charged for similar items'
    },
    {
      value: 'other_customers',
      label: 'Other customers pricing',
      description: 'Prices paid by other customers'
    },
    {
      value: 'public_price',
      label: 'Public price list',
      description: 'A public price list or catalog'
    },
    {
      value: 'negotiated',
      label: 'Negotiated pricing',
      description: 'I have negotiated with the vendor or secured educational discounts'
    },
    {
      value: 'none',
      label: 'None of the above',
      description: 'I have not assessed price reasonableness'
    }
  ];
  
  // Create option elements
  priceOptions.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = 'form-check' + (formData.price_reasonable.includes(option.value) ? ' selected' : '');
    optionElement.dataset.value = option.value;
    optionElement.onclick = function() { handlePriceSelection(this); };
    
    optionElement.innerHTML = `
      <div class="flex items-start">
        <input type="checkbox" name="price_reasonable" id="price_${option.value}" 
               class="mt-1 h-4 w-4 text-yellow-500 focus:ring-yellow-500 rounded border-gray-300" 
               ${formData.price_reasonable.includes(option.value) ? 'checked' : ''}>
        <label for="price_${option.value}" class="ml-3 cursor-pointer">
          <span class="block text-sm font-medium text-gray-900">${option.label}</span>
          <span class="block text-sm text-gray-500">${option.description}</span>
        </label>
      </div>
    `;
    
    optionsContainer.appendChild(optionElement);
  });
  
  // Add options to content
  stepContent.appendChild(optionsContainer);
  
  // Change next button to Submit
  document.getElementById('next-button').textContent = 'Submit';
  
  // Reset next button state based on selection
  document.getElementById('next-button').disabled = formData.price_reasonable.length === 0;
}

// Handle "Next" button click
function handleNext() {
  // Special case for final step - submit form
  if (currentStep === totalSteps) {
    submitForm();
    return;
  }
  
  // Move to next step
  currentStep++;
  
  // Update UI
  updateProgressIndicator();
  
  // Show previous button if not on first step
  document.getElementById('prev-button').classList.remove('invisible');
  
  // Load content for current step
  steps[currentStep - 1].createContent();
  
  // Add fade-in animation
  const stepContent = document.getElementById('step-content');
  stepContent.classList.remove('fade-in');
  void stepContent.offsetWidth; // Force reflow
  stepContent.classList.add('fade-in');
}

// Handle "Previous" button click
function handlePrevious() {
  // Move to previous step
  if (currentStep > 1) {
    currentStep--;
    
    // Update UI
    updateProgressIndicator();
    
    // Hide previous button if on first step
    if (currentStep === 1) {
      document.getElementById('prev-button').classList.add('invisible');
    }
    
    // Load content for current step
    steps[currentStep - 1].createContent();
    
    // Change button text back to "Next" if not on last step
    if (currentStep < totalSteps) {
      document.getElementById('next-button').textContent = 'Next';
    }
    
    // Add fade-in animation
    const stepContent = document.getElementById('step-content');
    stepContent.classList.remove('fade-in');
    void stepContent.offsetWidth; // Force reflow
    stepContent.classList.add('fade-in');
  }
}

// Determine form result
function determineResult() {
  // Purchases under $10k are under delegated authority
  if (formData.amount === 'less_than_10k') {
    return "delegated_authority";
  }
  
  // If single source is "no", likely not a sole source
  if (formData.single_source === 'no') {
    return "not_sole_source";
  }
  
  // If alternatives were researched and single source is "yes", likely a sole source
  if (formData.alternatives_researched === 'yes' && formData.single_source === 'yes') {
    return "likely_sole_source";
  }
  
  // Check for strong justifications if alternatives not researched
  if (formData.alternatives_researched === 'no') {
    const strongJustifications = formData.alternatives_reason_options.filter(reason => 
      ["specified_in_grant", "continuation_existing", "exclusive_rights", "market_expertise"].includes(reason)
    );
    
    // If has strong justifications and single source is "yes" or "unsure", may qualify
    if (strongJustifications.length > 0 && (formData.single_source === 'yes' || formData.single_source === 'unsure')) {
      return "may_qualify";
    }
  }
  
  // Default case - not likely a sole source
  return "not_sole_source";
}

// Submit form and display results
function submitForm() {
  const result = determineResult();
  const formContainer = document.getElementById('form-container');
  
  // Clear form content
  formContainer.innerHTML = '';
  
  // Create results UI
  const resultsContent = document.createElement('div');
  resultsContent.className = 'p-6 fade-in';
  
  // Add header
  const header = document.createElement('h2');
  header.className = 'text-xl font-semibold mb-4';
  header.textContent = 'Sole Source Determination Results';
  resultsContent.appendChild(header);
  
  // Add determination result
  const determination = document.createElement('div');
  determination.className = 'mb-6 p-4 rounded-md';
  
  // Set style and content based on result
  if (result === "delegated_authority") {
    determination.className += ' bg-blue-50 border border-blue-200';
    determination.innerHTML = `
      <h3 class="text-lg font-medium text-blue-800 mb-2">Delegated Authority</h3>
      <p class="text-blue-700">Purchases under $10,000 fall within delegated authority and are not subject to sole source requirements.</p>
    `;
  } else if (result === "likely_sole_source") {
    determination.className += ' bg-green-50 border border-green-200';
    determination.innerHTML = `
      <h3 class="text-lg font-medium text-green-800 mb-2">Likely Sole Source</h3>
      <p class="text-green-700">Based on your responses, your procurement may qualify as a sole source.</p>
      <p class="text-green-700 mt-2">Please complete the required documentation for your procurement amount.</p>
    `;
  } else if (result === "may_qualify") {
    determination.className += ' bg-yellow-50 border border-yellow-200';
    determination.innerHTML = `
      <h3 class="text-lg font-medium text-yellow-800 mb-2">May Qualify</h3>
      <p class="text-yellow-700">Your procurement may qualify as a sole source based on your justifications, but additional information may be needed.</p>
      <p class="text-yellow-700 mt-2">Consider researching alternatives or providing more detailed justification in your documentation.</p>
    `;
  } else {
    determination.className += ' bg-red-50 border border-red-200';
    determination.innerHTML = `
      <h3 class="text-lg font-medium text-red-800 mb-2">Not Likely a Sole Source</h3>
      <p class="text-red-700">Based on your responses, your procurement may not qualify as a sole source.</p>
      <p class="text-red-700 mt-2">Consider using a competitive procurement method.</p>
    `;
  }
  
  resultsContent.appendChild(determination);
  
  // Add next steps section based on amount
  const nextStepsSection = document.createElement('div');
  nextStepsSection.className = 'mb-6';
  nextStepsSection.innerHTML = `
    <h3 class="text-lg font-medium text-gray-900 mb-3">Next Steps</h3>
    <div class="border-l-4 border-gray-300 pl-4">
  `;
  
  if (formData.amount === "less_than_10k") {
    nextStepsSection.innerHTML += `
      <p class="text-gray-700 mb-2">• The sole source procurement process is not applicable at this threshold</p>
      <p class="text-gray-700 mb-2">• You can proceed with your purchase without sole source documentation</p>
      <p class="text-gray-700 mb-2">• Always follow procurement policies and procedures</p>
    `;
  } else if (formData.amount === "10k_to_200k") {
    nextStepsSection.innerHTML += `
      <p class="text-gray-700 mb-2">• Complete the Sole Source Documentation Form</p>
      <p class="text-gray-700 mb-2">• Include detailed written justification addressing all criteria</p>
      <p class="text-gray-700 mb-2">• Attach the form to your RealSource requisition as an internal attachment</p>
      <p class="text-gray-700 mb-2">• Include any additional supporting documentation</p>
      <p class="text-gray-700 mb-2">• The final determination will be made by Procurement Services</p>
    `;
  } else if (formData.amount === "above_200k") {
    nextStepsSection.innerHTML += `
      <p class="text-gray-700 mb-2">• Complete the Sole Source Documentation Form</p>
      <p class="text-gray-700 mb-2">• Include detailed written justification addressing all criteria</p>
      <p class="text-gray-700 mb-2">• Obtain approval from the Associate Director of Procurement Services</p>
      <p class="text-gray-700 mb-2">• Attach the form to your RealSource requisition as an internal attachment</p>
      <p class="text-gray-700 mb-2">• Include any additional supporting documentation</p>
      <p class="text-gray-700 mb-2">• Additional scrutiny is applied to sole source procurements of this amount</p>
    `;
  }
  
  nextStepsSection.innerHTML += `</div>`;
  resultsContent.appendChild(nextStepsSection);
  
  // Add resources section
  const resources = document.createElement('div');
  resources.className = 'mb-6';
  resources.innerHTML = `
    <h3 class="text-lg font-medium text-gray-900 mb-3">Additional Resources</h3>
    <div class="border border-gray-200 rounded-md bg-white p-4">
      <ul class="space-y-2 text-gray-700 list-disc pl-6">
        <li>
          <a href="https://procurement.vcu.edu/media/procurement/docs/word/Sole_Source_Documentation.docx" 
             class="text-blue-600 hover:text-blue-800 hover:underline"
             target="_blank">
            Download Sole Source Documentation Form
          </a>
        </li>
        <li>
          Contact Purchasing:
          <ul class="pl-4 mt-1 space-y-1">
            <li>Email: <a href="mailto:purchasing@vcu.edu" class="text-blue-600 hover:text-blue-800 hover:underline">purchasing@vcu.edu</a></li>
            <li>
              <a href="https://vcu-amc.ivanticloud.com/Default.aspx?Scope=ObjectWorkspace&CommandId=Search&ObjectType=ServiceReq%23#1729080190081" 
                 class="text-blue-600 hover:text-blue-800 hover:underline"
                 target="_blank">
                Submit a support ticket
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `;
  resultsContent.appendChild(resources);
  
  // Add disclaimer
  const disclaimer = document.createElement('div');
  disclaimer.className = 'bg-gray-50 border border-gray-200 rounded-md p-4 mb-6';
  disclaimer.innerHTML = `
    <p class="text-gray-700 text-sm">
      <strong>Important:</strong> This tool provides guidance only. Procurement Services makes the final determination on sole source requests.
    </p>
  `;
  resultsContent.appendChild(disclaimer);
  
  // Add download buttons
  const downloadButtons = document.createElement('div');
  downloadButtons.className = 'flex flex-col sm:flex-row gap-3';
  downloadButtons.innerHTML = `
    <button id="download-pdf" class="btn-primary px-4 py-2 rounded-md flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download as PDF
    </button>
    <button id="download-text" class="btn-secondary px-4 py-2 rounded-md flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      Download as Text
    </button>
    <button type="button" onclick="location.reload()" class="btn-secondary px-4 py-2 rounded-md flex items-center justify-center">
  <!-- optional: SVG icon here -->
  Start Over
</button>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Start Over
    </button>
  `;
  resultsContent.appendChild(downloadButtons);
  
  // Add to form container
  formContainer.appendChild(resultsContent);
  
  // Add event listeners to buttons
  document.getElementById('download-pdf').addEventListener('click', function() {
    downloadAsPDF(formData, result);
  });
  
  document.getElementById('download-text').addEventListener('click', function() {
    downloadAsText(formData, result);
  });
  
// After appending resultsContent to formContainer
formContainer.appendChild(resultsContent);

// Defer attachment to ensure DOM is updated
setTimeout(() => {
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'start-over') {
    window.location.reload();
  }
});



// Format value to display in downloads
function getReadableLabel(key, value) {
  let label = '';
  
  switch (key) {
    case 'amount':
      label = 'Procurement Amount';
      break;
    case 'single_source':
      label = 'Available from only one source';
      break;
    case 'justification':
      if (Array.isArray(value)) {
        label = 'Justification Reasons';
        return `${label}: ${value.map(v => valueMappings[v] || v).join(', ')}`;
      }
      break;
    case 'alternatives_researched':
      label = 'Alternatives researched';
      break;
    case 'price_reasonable':
      if (Array.isArray(value)) {
        label = 'Price reasonableness determined by';
        return `${label}: ${value.map(v => valueMappings[v] || v).join(', ')}`;
      }
      break;
    default:
      label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  if (Array.isArray(value)) {
    return `${label}: ${value.join(', ')}`;
  }
  
  return `${label}: ${valueMappings[value] || value}`;
}

// Create a formatted text representation of the form data
function formatFormDataText(formData, result) {
  const lines = ["Sole Source Determination Results", "===========================", ""];
  
  // Add determination result
  if (result === "likely_sole_source") {
    lines.push("DETERMINATION: Your procurement may qualify as a sole source.");
  } else if (result === "delegated_authority") {
    lines.push("DETERMINATION: Purchases under $10,000 fall within delegated authority and are not subject to sole source requirements.");
  } else if (result === "may_qualify") {
    lines.push("DETERMINATION: Your procurement may qualify as a sole source, but additional information may be needed.");
  } else {
    lines.push("DETERMINATION: Your procurement may not qualify as a sole source. Consider using a competitive procurement method.");
  }
  
  lines.push("");
  lines.push("Your Responses:");
  lines.push("-------------");
  
  // Add all form fields except alternatives reasons (we'll add those separately)
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'alternatives_reason_options') {
      lines.push(getReadableLabel(key, value));
    }
  });
  
  // Handle alternatives reasons with categorization
  if (formData.alternatives_reason_options && formData.alternatives_reason_options.length > 0) {
    lines.push("\nReasons for not researching alternatives:");
    
    // Legitimate reasons
    const legitimateReasons = formData.alternatives_reason_options.filter(reason => 
      ["specified_in_grant", "continuation_existing", "exclusive_rights", "market_expertise"].includes(reason)
    );
    
    // Neutral reasons
    const neutralReasons = formData.alternatives_reason_options.filter(reason => 
      ["early_planning", "gathering_requirements"].includes(reason)
    );
    
    // Poor planning reasons
    const poorPlanningReasons = formData.alternatives_reason_options.filter(reason => 
      ["timing_constraints", "previous_vendor_familiarity", "convenience"].includes(reason)
    );
    
    // Add legitimate reasons with note
    if (legitimateReasons.length > 0) {
      lines.push("  Strong justifications for sole source:");
      legitimateReasons.forEach(reason => {
        lines.push(`  - ${valueMappings[reason] || reason}`);
      });
    }
    
    // Add neutral reasons with note
    if (neutralReasons.length > 0) {
      lines.push("  Reasons requiring more information:");
      neutralReasons.forEach(reason => {
        lines.push(`  - ${valueMappings[reason] || reason}`);
      });
    }
    
    // Add poor planning reasons with note
    if (poorPlanningReasons.length > 0) {
      lines.push("  Reasons that may need additional support:");
      poorPlanningReasons.forEach(reason => {
        lines.push(`  - ${valueMappings[reason] || reason}`);
      });
    }
  }
  
  lines.push("");
  lines.push("Next Steps:");
  lines.push("----------");
  
  // Add next steps based on amount
  if (formData.amount === "less_than_10k") {
    lines.push("- The sole source procurement process is not applicable at this threshold");
    lines.push("- You can proceed with your purchase without sole source documentation");
    lines.push("- Always follow procurement policies and procedures");
  } else if (formData.amount === "10k_to_200k") {
    lines.push("- Complete the Sole Source Documentation Form");
    lines.push("- Include detailed written justification addressing all criteria");
    lines.push("- Attach the form to your RealSource requisition as an internal attachment");
    lines.push("- Include any additional supporting documentation");
    lines.push("- The final determination will be made by Procurement Services");
  } else if (formData.amount === "above_200k") {
    lines.push("- Complete the Sole Source Documentation Form");
    lines.push("- Include detailed written justification addressing all criteria");
    lines.push("- Obtain approval from the Associate Director of Procurement Services");
    lines.push("- Attach the form to your RealSource requisition as an internal attachment");
    lines.push("- Include any additional supporting documentation");
    lines.push("- Additional scrutiny is applied to sole source procurements of this amount");
  }
  
  lines.push("");
  lines.push("Additional Resources:");
  lines.push("-----------------");
  lines.push("- Sole Source Documentation Form: https://procurement.vcu.edu/media/procurement/docs/word/Sole_Source_Documentation.docx");
  lines.push("- Contact Purchasing via email: purchasing@vcu.edu");
  lines.push("- Submit a support ticket: https://vcu-amc.ivanticloud.com/Default.aspx?Scope=ObjectWorkspace&CommandId=Search&ObjectType=ServiceReq%23#1729080190081");
  
  lines.push("");
  lines.push("Important: This tool provides guidance only. Procurement Services makes the final determination on sole source requests.");
  lines.push("");
  lines.push(`Report generated on: ${new Date().toLocaleString()}`);
  
  return lines.join("\n");
}

// Download form data as PDF
function downloadAsPDF(formData, result) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = formatFormDataText(formData, result);
  
  const splitText = doc.splitTextToSize(text, 180);
  doc.setFontSize(12);
  doc.text(splitText, 15, 15);
  
  doc.save("sole-source-determination.pdf");
}

// Download form data as text file
function downloadAsText(formData, result) {
  const text = formatFormDataText(formData, result);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  window.saveAs(blob, "sole-source-determination.txt");
}

// Reset form to initial state
function resetForm() {
  // Reset form data
  formData = {
    amount: null,
    single_source: null,
    justification: [],
    alternatives_researched: null,
    alternatives_reason_options: [],
    price_reasonable: []
  };
  
  // Reset UI
  currentStep = 1;
  
  // Update progress indicator
  updateProgressIndicator();
  
  // Reset form container
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
      
      <div id="step-content" class="mb-6 fade-in">
      </div>
      
      <div class="flex justify-between mt-8">
        <button id="prev-button" 
                class="btn-secondary px-4 py-2 rounded-md invisible" 
                onclick="handlePrevious()">
          Previous
        </button>
        
        <button id="next-button" 
                class="btn-primary px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50" 
                onclick="handleNext()" 
                disabled>
          Next
        </button>
      </div>
    </div>
  `;
  
  // Load first step content
  createStepOneContent();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize application
  updateProgressIndicator();
});
