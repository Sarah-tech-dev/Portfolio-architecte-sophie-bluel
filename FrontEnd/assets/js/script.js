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

// Gestion de l'affichage des catégories
async function getCategories() {
    const categories = await getData(categoriesApiPath);

    removeSelectedCategory();

    const categoryName = document.createElement('li');
    categoryName.innerText = 'Tous';
    categoryName.classList.add('selected');
    categoryName.setAttribute('category-id', 0);
    categoriesTag.appendChild(categoryName);

    categoryName.addEventListener('click', () => {
        removeSelectedCategory();
        categoryName.classList.add('selected');
        displayWorksByCategory();
    });
    categories.forEach(element => {
        const categoryName = document.createElement('li');
        categoryName.innerText = element.name;
        categoryName.setAttribute('category-id', element.id);
        categoriesTag.appendChild(categoryName);
        categoryName.addEventListener('click', () => {
            removeSelectedCategory();
            categoryName.classList.add('selected');
            displayWorksByCategory(element.id);
        });
    });
}

function displayWorksByCategory(id) {
    const works = id > 0 ? allWorks.filter(element => element.categoryId === id) : allWorks;
    displayWorks(works);
}

function removeSelectedCategory() {
    categoriesTag.querySelectorAll('.selected').forEach(element => {
        element.classList.remove('selected');
    });
}

// Initialisation
async function init() {
    try {
        await getWorks();
        await getCategories();
    } catch (error) {
        console.error(error);
        galleryTag.textContent = error.message;
    }
}

init();