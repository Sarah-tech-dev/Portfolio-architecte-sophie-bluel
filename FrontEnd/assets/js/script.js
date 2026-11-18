const worksApiPath = 'http://localhost:5678/api/works/';
const categoriesApiPath = 'http://localhost:5678/api/categories/';

const categoriesTag = document.getElementById('categories');
const galleryTag = document.getElementById('gallery');

let allWorks = [];

// Affichage des projets
async function getWorks() {
    const works = await getData(worksApiPath);
    allWorks = works;
    displayWorks(works);
}

async function getData(apiPath) {
    const response = await fetch(apiPath);
    if (!response.ok) {
        throw new Error('Impossible de charger les projets.');
    }

    return await response.json();
}

function displayWorks(works) {
    galleryTag.replaceChildren();
    works.forEach(element => {
        const figure = document.createElement('figure');
        figure.setAttribute('photo-id', element.id);
        const image = document.createElement('img');
        image.src = element.imageUrl;
        image.alt = element.title;
        const caption = document.createElement('figcaption');
        caption.textContent = element.title;
        figure.append(image, caption);
        galleryTag.appendChild(figure);
    });
}

// Initialisation
async function init() {
    try {
        await getWorks();
    } catch (error) {
        console.error(error);
        galleryTag.textContent = error.message;
    }
}

init();