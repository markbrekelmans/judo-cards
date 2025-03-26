let cards = [];
let currentCardIndex = 0;

// Fetch the JSON data
fetch('../data/waza.json')
    .then(response => response.json())
    .then(data => {
        // Flatten the nested structure into a single array of cards
        data.waza.forEach(waza => {
            waza['nage-waza'].forEach(nageWaza => {
                nageWaza['te-waza'].forEach(teWaza => {
                    cards.push(teWaza);
                });
            });
        });
        loadCard();
    })
    .catch(error => console.error('Error loading cards:', error));

function loadCard() {
    const nameElement = document.getElementById('name');
    const nameJpElement = document.getElementById('name_jp');
    const descriptionElement = document.getElementById('description');

    if (cards.length > 0) {
        const card = cards[currentCardIndex];
        nameElement.textContent = `Name: ${card.name}`;
        nameJpElement.textContent = `Japanese Name: ${card.name_jp}`;
        descriptionElement.textContent = `Description: ${card.description}`;
    }
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    loadCard();
}
