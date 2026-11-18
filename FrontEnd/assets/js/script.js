const worksApiPath = 'http://localhost:5678/api/works/';
const categoriesApiPath = 'http://localhost:5678/api/categories/';

const categoriesTag = document.getElementById('categories');
const galleryTag = document.getElementById('gallery');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const editionBanner = document.getElementById('edition-banner');
const editionBtn = document.getElementById('edition-btn');

const dialogTag = document.getElementById('dialog');
const galleryEdit = document.getElementById('gallery-edit');


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

document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('[aria-haspopup="dialog"]');

    const open = function (dialog) {
        dialog.setAttribute('aria-hidden', false);
    };

    const close = function (dialog) {
        dialog.setAttribute('aria-hidden', true);
    };

    triggers.forEach((trigger) => {
        const dialog = document.getElementById(trigger.getAttribute('aria-controls'));
        const dismissTriggers = dialog.querySelectorAll('[data-dismiss]');

        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            open(dialog);
        });

        dismissTriggers.forEach((dismissTrigger) => {
            const dismissDialog = document.getElementById(dismissTrigger.dataset.dismiss);
            dismissTrigger.addEventListener('click', (event) => {
                event.preventDefault();
                close(dismissDialog);
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === dialog) {
                close(dialog);
            }
        });
    });
})

// Admin

function setAdminActions() {
    editionBtn.addEventListener('click', () => {
        displayEditableWorks(allWorks);
    });
}

function displayEditableWorks(works) {
    galleryEdit.replaceChildren();

    works.forEach(element => {
        const figure = document.createElement('figure');
        figure.setAttribute('photo-id', element.id);
        const removeIcon = document.createElement('span');
        removeIcon.className = 'image-gallery-remove';
        removeIcon.setAttribute('photo-id', element.id);
        const icon = document.createElement('img');
        icon.className = 'icon-img';
        icon.src = './assets/icons/trash-can.svg';
        icon.alt = 'Supprimer la photo';
        removeIcon.appendChild(icon);
        const image = document.createElement('img');
        image.src = element.imageUrl;
        image.alt = element.title;
        figure.append(removeIcon, image);
        galleryEdit.appendChild(figure);
    });

    document.querySelectorAll('.image-gallery-remove').forEach((imageGallery) => {
        imageGallery.addEventListener('click', () => {
            const imageId = imageGallery.getAttribute('photo-id');
            removeWork(imageId);
        });
    });
}

async function removeWork(imageId) {
    const apiPath = worksApiPath + imageId;
    try {
        const response = await fetch(apiPath, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Impossible de supprimer l\'élément sélectionné.');
        } else {
            const index = allWorks.findIndex(item => item.id === Number(imageId));
            if (index !== -1) {
                allWorks.splice(index, 1);
            }
            displayWorks(allWorks);
            displayEditableWorks(allWorks);
        }
    } catch (error) {
        console.error(error);
        document.getElementById('gallery-form').textContent = error.message;
    }
}



// Initialisation
async function init() {
    try {
        await getWorks();
        if (sessionStorage.getItem('token') !== null) {
            loginBtn.parentNode.setAttribute('hidden', true);
            logoutBtn.removeAttribute('hidden');
            editionBanner.removeAttribute('hidden');
            editionBtn.removeAttribute('hidden');
            setAdminActions();
        } else {
            await getCategories();
        }
    } catch (error) {
        console.error(error);
        galleryTag.textContent = error.message;
    }
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        window.location.reload();
    });
}

init();
