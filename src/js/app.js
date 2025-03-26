let cards = [];
let filteredCards = [];
let currentCardIndex = 0;
let subCategoriesData = {};
let kataData = {};

// Fetch the JSON data
fetch('src/data/waza.json')
    .then(response => response.json())
    .then(data => {
        // Populate the main category dropdown menu
        const categorySelect = document.getElementById('categorySelect');
        data.waza.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category;
            option.textContent = `${category.category} (${category.subcategories.reduce((sum, sub) => sum + sub.techniques.length, 0)})`;
            categorySelect.appendChild(option);

            // Store sub-categories data for later use
            subCategoriesData[category.category] = category.subcategories;

            // Collect kata data
            category.subcategories.forEach(sub => {
                sub.techniques.forEach(technique => {
                    if (technique.kata) {
                        kataData[technique.kata.name] = technique.kata;
                    }
                });
            });
        });

        // Populate the kata dropdown menu
        const kataSelect = document.getElementById('kataSelect');
        Object.keys(kataData).forEach(kataName => {
            const option = document.createElement('option');
            option.value = kataName;
            option.textContent = kataName;
            kataSelect.appendChild(option);
        });

        // Flatten the nested structure into a single array of cards
        cards = data.waza.flatMap(category =>
            category.subcategories.flatMap(sub =>
                sub.techniques.map(technique => ({
                    ...technique,
                    category: category.category,
                    subcategory: sub.name
                }))
            )
        );

        // Initially load all cards
        filteredCards = [...cards];
        updateCardDisplay();
    })
    .catch(error => console.error('Error loading cards:', error));

function updateSubCategories() {
    const categorySelect = document.getElementById('categorySelect');
    const subCategorySelect = document.getElementById('subCategorySelect');
    const selectedCategory = categorySelect.value;

    // Clear previous sub-categories
    subCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';

    if (selectedCategory) {
        const subCategories = subCategoriesData[selectedCategory];
        subCategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.name;
            option.textContent = `${sub.name} (${sub.techniques.length})`;
            subCategorySelect.appendChild(option);
        });
    }

    // Reset filtered cards and update display
    filterCards();
}

function filterCards() {
    const selectedCategory = document.getElementById('categorySelect').value;
    const selectedSubCategory = document.getElementById('subCategorySelect').value;
    const selectedKata = document.getElementById('kataSelect').value;
    const selectedBelt = document.getElementById('beltSelect').value;

    filteredCards = [...cards];

    if (selectedCategory) {
        filteredCards = filteredCards.filter(card =>
            card.category === selectedCategory
        );
    }

    if (selectedSubCategory) {
        filteredCards = filteredCards.filter(card =>
            card.subcategory === selectedSubCategory
        );
    }

    if (selectedKata) {
        filteredCards = filteredCards.filter(card =>
            card.kata && card.kata.name === selectedKata
        );
    }

    if (selectedBelt) {
        filteredCards = filteredCards.filter(card =>
            card.belts[selectedBelt]
        );
    }

    currentCardIndex = 0;
    updateCardDisplay();
}

function updateCardDisplay() {
    const cardTitleElement = document.getElementById('cardTitle');
    const kataInfoElement = document.getElementById('kataInfo');
    const descriptionElement = document.getElementById('description');
    const cardNumberElement = document.getElementById('cardNumber');
    const beltStripeElement = document.getElementById('beltStripe');
    const nextButton = document.getElementById('nextButton');
    const previousButton = document.getElementById('previousButton');

    if (filteredCards.length === 0) {
        cardTitleElement.textContent = 'No cards match the selected filters';
        kataInfoElement.textContent = '';
        descriptionElement.textContent = '';
        cardNumberElement.textContent = '';
        beltStripeElement.className = 'belt-stripe';
        nextButton.disabled = true;
        previousButton.disabled = true;
    } else {
        const card = filteredCards[currentCardIndex];
        cardTitleElement.textContent = `${card.name} (${card.name_jp})`;

        if (card.kata) {
            kataInfoElement.textContent = `${card.kata.name} (${card.kata.series}-${card.kata.number})`;
        } else {
            kataInfoElement.textContent = 'Not part of a kata';
        }

        descriptionElement.textContent = card.description;
        cardNumberElement.textContent = `Card ${currentCardIndex + 1} of ${filteredCards.length}`;

        // Determine the lowest belt color
        const belts = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'];
        const lowestBelt = belts.find(belt => card.belts[belt]);
        beltStripeElement.className = `belt-stripe belt-${lowestBelt}`;

        previousButton.disabled = currentCardIndex === 0;

        if (currentCardIndex === filteredCards.length - 1) {
            nextButton.textContent = 'Start Over';
        } else {
            nextButton.textContent = 'Next Card';
        }
        nextButton.disabled = false;
    }
}

function nextCard() {
    if (currentCardIndex < filteredCards.length - 1) {
        currentCardIndex++;
    } else {
        currentCardIndex = 0; // Start over
    }
    updateCardDisplay();
}

function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        updateCardDisplay();
    }
}
