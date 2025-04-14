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

        // populate categories
        const categorySelect = document.getElementById('categorySelect');

        categories.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = element.name;
            categorySelect.appendChild(option);
        });

        // populate sets
        const setSelect = document.getElementById('setSelect');

        sets.forEach(element => {
            const option = document.createElement('option');
            option.value = element.id;
            option.textContent = element.name;
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
                option.textContent = element.name;
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

function updateBreadcrumbs() {
    // Get the breadcrumb element
    const breadcrumbElement = document.getElementById('bc');
    if (!breadcrumbElement) {
        console.error('Breadcrumb element not found');
        return;
    }

    // Clear existing breadcrumbs
    breadcrumbElement.innerHTML = '<li class="breadcrumb-item">waza 技</li>';

    if(filteredCards.length !== 0) {
        // Get the current card and its subcategory ID
        const cardSubcategories = filteredCards[currentCardIndex].subcategories;
        const subcategoryId = cardSubcategories[0];

        // Find the subcategory and category
        const subcategory = subcategories.find(subcat => subcat.id === subcategoryId);
        if (!subcategory) {
            console.error('Subcategory not found');
            return;
        }

        const category = categories.find(cat => cat.id === subcategory.category);
        if (!category) {
            console.error('Category not found');
            return;
        }

        // Create and append the category breadcrumb item
        const categoryItem = document.createElement('li');
        categoryItem.innerText = category.name;
        categoryItem.className = 'breadcrumb-item';
        breadcrumbElement.appendChild(categoryItem);

        // Create and append the subcategory breadcrumb item
        const subcategoryItem = document.createElement('li');
        subcategoryItem.innerText = subcategory.name;
        subcategoryItem.className = 'breadcrumb-item active';
        breadcrumbElement.appendChild(subcategoryItem);
    }
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
        cardTitleElement.textContent = 'Geen kaarten gevonden';
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
        
        /**
         * CARD CONTENTS
         */

        // Parse the Markdown content to HTML
        let contentHTML = marked.parse(card.content);

        // Modify the HTML to add target="_blank" to external links
        contentHTML = contentHTML.replace(
            /<a href="(http[s]?:\/\/[^"]+)"/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer"'
        );

        // Create a temporary DOM element to hold the HTML content
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHTML;

        // Select all <ul> elements within the temporary DOM element
        let ulElements = tempDiv.querySelectorAll('ul');

        // Iterate over each <ul> element
        ulElements.forEach(ul => {
            // Add the 'list-group' class to the <ul> element
            ul.classList.add('list-group');
            ul.classList.add('list-group-flush');

            // Select all child <li> elements within the current <ul>
            let liElements = ul.querySelectorAll('li');

            // Iterate over each <li> element and add the 'list-group-item' class
            liElements.forEach(li => {
                li.classList.add('list-group-item');
            });
        });

        // Select all <a> elements within the temporary DOM element
        let aElements = tempDiv.querySelectorAll('a');

        // Iterate over each <a> element
        aElements.forEach(a => {
            // Add the target="_blank" and rel="noopener noreferrer" attributes
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        });

        // Get the modified HTML content back as a string
        let modifiedContentHTML = tempDiv.innerHTML;

        // Clean up the temporary DOM element
        tempDiv = null;

        // Finally, set the card contgents
        cardContentElement.innerHTML = modifiedContentHTML;

        /**
         * NAVIGATION FOOTER
         */
        cardNumberElement.textContent = `${currentCardIndex + 1} van ${filteredCards.length}`;

        firstButton.disabled = (currentCardIndex === 0);
        previousButton.disabled = (currentCardIndex === 0);
        nextButton.disabled = (currentCardIndex === filteredCards.length-1);
        lastButton.disabled = (currentCardIndex === filteredCards.length-1);
    }

    // Set the breadcrumb trail
    updateBreadcrumbs();

    // Call autoPlayYouTubeModal after the content is inserted
    autoPlayYouTubeModal();
}

// Function to get and auto play YouTube video from datatag
function autoPlayYouTubeModal() {
    // Use event delegation to handle clicks on dynamically generated elements
    $("body").off('click', '[data-bs-toggle="modal"]').on('click', '[data-bs-toggle="modal"]', function(event) {
        if ($(event.target).is('[data-bs-toggle="modal"]')) {
            // Get the target modal ID and video source URL
            var theModal = "#videoModal"; // Since there's only one modal
            var videoSRC = $(event.target).attr("data-video-src");

            // Check if the video source URL is available
            if (!videoSRC) {
                console.error('No video source URL found in data-video-src');
                return;
            }

            // Extract the video ID from the URL
            var videoID = extractVideoID(videoSRC);
            if (!videoID) {
                console.error('Invalid YouTube URL');
                return;
            }

            // Construct the embed URL with autoplay
            var videoSRCauto = `https://www.youtube.com/embed/${videoID}?autoplay=1&enablejsapi=1`;

            // Set the iframe source to the autoplay URL
            var iframe = $(theModal + ' iframe')[0];
            iframe.src = videoSRCauto;

            // Attach an event listener to stop the video when the modal is hidden
            $(theModal).off('hidden.bs.modal').on('hidden.bs.modal', function() {
                // Stop the video playback
                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                iframe.src = `https://www.youtube.com/embed/${videoID}`;
            });
        } else {
            console.log('Clicked element is not the trigger');
        }
    });
}

function extractVideoID(url) {
    // Extract the video ID from a YouTube URL (both watch and short formats)
    var match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}
