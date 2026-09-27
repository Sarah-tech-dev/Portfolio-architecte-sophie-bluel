const categoriesTag = document.getElementById('categories');
const galleryTag = document.getElementById('gallery');

const categoriesApiPath = 'http://localhost:5678/api/categories/';
const worksApiPath = 'http://localhost:5678/api/works/';

let worksRaw = [];

categoriesTag.innerHTML = '';
galleryTag.innerHTML = '';

async function init() {
    getCategories();
    getWorks();
};

async function getData(apiPath) {
    let response = await fetch(apiPath)

    return await response.json();
};

function removeSelectedCategory() {
    let container = document.querySelector('#categories');
    container.querySelectorAll('.selected').forEach(element => {
        element.classList.remove('selected');
	});
};

function displayWorksByCategory(id) {
    let works = id > 0 ? worksRaw.filter(element => element.category.id === id) : worksRaw;
    displayWorks(works);
};

function displayWorks(works) {
    works.forEach(element => {
        let figure = document.createElement('figure');
        let workItem = `
            <img src="${element.imageUrl}" alt="${element.title}" category-id="${element.categoryId}">
            <figcaption>${element.title}</figcaption>
        `;
        figure.innerHTML = workItem;
        galleryTag.appendChild(figure);
    });
};

async function getCategories() {
    let categories = await getData(categoriesApiPath);

    removeSelectedCategory();

    let categoryName = document.createElement('li');
    categoryName.innerText = 'Tous';
    categoryName.classList.add('selected');
    categoryName.setAttribute('category-id', 0);
    categoriesTag.appendChild(categoryName);

    categoryName.addEventListener('click', async () => {
        removeSelectedCategory();
        categoryName.classList.add('selected');
        galleryTag.innerHTML = '';
        displayWorksByCategory();
    })

    categories.forEach(element => {
        let categoryName = document.createElement('li');
        categoryName.innerText = element.name;
        categoryName.setAttribute('category-id', element.id);
        categoriesTag.appendChild(categoryName);
        categoryName.addEventListener('click', async () => {
            removeSelectedCategory();
            categoryName.classList.add('selected');
            galleryTag.innerHTML = '';
            displayWorksByCategory(element.id);
        })
    });
};

async function getWorks() {
    let works = await getData(worksApiPath);
    worksRaw = works;
    displayWorks(works);
};

init();
