let categories = [];
let subcategories = [];
let sets = [];
let cards = [];
let currentCardIndex = 0;
let filteredCards = [];

let categoryCount = {};
let subcategoryCount = {};
let setCount = {};

fetch('src/data/cards.json')
    .then(response => response.json())
    .then(data => {
        categories = data.categories;
        subcategories = data.subcategories;
        sets = data.sets;
        cards = data.cards;

        // load all cards
        filteredCards = [...cards];

        // count cards
        countCards();

        // populate categories
        const categorySelect = document.getElementById('categorySelect');

        categories.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = `${element.name} (${categoryCount[element.id]})`;
            categorySelect.appendChild(option);
        });

        // populate sets
        const setSelect = document.getElementById('setSelect');

        sets.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = `${element.name} (${setCount[element.id]})`;
            setSelect.appendChild(option);
        });

        // display cards
        displayCards();
    })
    .catch(error => console.error('Error reading card data:', error));

function updateSubCategories() {
    const categorySelect = document.getElementById('categorySelect');
    const subCategorySelect = document.getElementById('subCategorySelect');
    const selectedCategory = categorySelect.value;

    // Clear previous sub-categories
    subCategorySelect.innerHTML = '<option value="">Subcategorie</option>';

    if(selectedCategory) {
        subcategories.forEach(element => {
            if(element.category == selectedCategory) {
                const option = document.createElement('option');
                option.value = element.id;
                option.textContent = element.name + ` (${subcategoryCount[element.id]})`;
                subCategorySelect.appendChild(option);
            }
        });
    }

    filterCards(); //gets called in this function, which gets called when category select changes.
}

function filterCards() {
    const selectedCategory = parseInt(document.getElementById('categorySelect').value,10);
    const selectedSubCategory = parseInt(document.getElementById('subCategorySelect').value,10);
    const selectedSet = parseInt(document.getElementById('setSelect').value,10);

    filteredCards = [...cards];

    if(selectedCategory) {
        filteredCards = filteredCards.filter(card => {
            return card.subcategories.some(subcatId => {
                const subcategory = subcategories.find(subcat => subcat.id === subcatId);
                return subcategory && subcategory.category === selectedCategory;
            });
        });
    }

    if(selectedSubCategory) {
        filteredCards = filteredCards.filter(card => {
            return card.subcategories.some(subcat => subcat === selectedSubCategory);
        });
    }

    if(selectedSet) {
        filteredCards = filteredCards.filter(card => {
            return card.sets.some(set => set === selectedSet);
        });
    }

    currentCardIndex = 0;
    displayCards();
}

function firstCard() {
    currentCardIndex = 0;
    displayCards();
}

function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayCards();
    }
}

function nextCard() {
    if (currentCardIndex < filteredCards.length - 1) {
        currentCardIndex++;
        displayCards();
    }
}

function lastCard() {
    currentCardIndex = filteredCards.length - 1;
    displayCards();
}

function countCards() {
    // Iterate through each card
    filteredCards.forEach(card => {
        // Count cards per category
        card.subcategories.forEach(subcatId => {
            const subcategory = subcategories.find(subcat => subcat.id === subcatId);
            if (subcategory) {
                const categoryId = subcategory.category;
                if (!categoryCount[categoryId]) {
                    categoryCount[categoryId] = 0;
                }
                categoryCount[categoryId]++;

                // Count cards per subcategory
                if (!subcategoryCount[subcatId]) {
                    subcategoryCount[subcatId] = 0;
                }
                subcategoryCount[subcatId]++;
            }
        });

        // Count cards per set
        card.sets.forEach(setId => {
            if (!setCount[setId]) {
                setCount[setId] = 0;
            }
            setCount[setId]++;
        });
    });
}

function displayCards() {
    const cardTitleElement = document.getElementById('cardTitle');
    const cardColorElement = document.getElementById('cardColor').firstChild;
    const cardContentElement = document.getElementById('cardContent');
    const cardNumberElement = document.getElementById('cardNumber');
    const firstButton = document.getElementById('firstButton');
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');
    const lastButton = document.getElementById('lastButton');

    if(filteredCards.length == 0) {
        cardTitleElement.textContent = 'Geen data gevonden op basis van deze selectie';
        cardContentElement.innerHTML = '';
        cardNumberElement.textContent = '';

        firstButton.disabled = true;
        previousButton.disabled = true;
        nextButton.disabled = true;
        lastButton.disabled = true;
    } else {
        const card = filteredCards[currentCardIndex];
        cardTitleElement.textContent = card.title;
        if(card.color === null || card.color.length == 0) {
            cardColorElement.className = 'hidden';
        } else {
            cardColorElement.className = `bi bi-circle-fill ${card.color}`;
        }
        cardContentElement.innerHTML = marked.parse(card.content);
        cardNumberElement.textContent = `${currentCardIndex + 1} van ${filteredCards.length}`;

        firstButton.disabled = (currentCardIndex === 0);
        previousButton.disabled = (currentCardIndex === 0);
        nextButton.disabled = (currentCardIndex === filteredCards.length-1);
        lastButton.disabled = (currentCardIndex === filteredCards.length-1);
    }
}