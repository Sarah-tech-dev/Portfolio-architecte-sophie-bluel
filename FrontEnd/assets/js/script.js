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

const dialog2Tag  = document.getElementById('dialog2');
const previousTag = document.getElementById('previous');
const addWorkTag = document.getElementById('add-work');

const workForm = document.getElementById('work-form');
const previewContainer = document.getElementById('preview-container');
const preview = document.getElementById('preview');
const pictureInput = document.getElementById('picture');
const pictureLabel = document.getElementById('picture-container');
const pictureTitle = document.getElementById('picture-title');
const categoriesList = document.getElementById('categories-list');
const workFormSubmitBtn = document.getElementById('work-form-submit-btn');

const successMessage = document.querySelector('.success-message');
const errorMessage = document.querySelectorAll('.error-message');

let allWorks = [];
let pictureUrl = null;

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
        displayWorksByCategory(0);
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

// Gestion des modales

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
                clearForm();
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === dialog) {
                close(dialog);
                clearForm();
            }
        });
    });
})

previousTag.addEventListener('click', () => {
    clearForm();
    dialog2Tag.setAttribute('aria-hidden', true);
    dialogTag.setAttribute('aria-hidden', false);
})

// Admin - remove works

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
        document.getElementById('gallery-form').textContent = error.message;
    }
}

// Admin - add works

addWorkTag.addEventListener('click', () => {
    dialogTag.setAttribute('aria-hidden', true);
})

pictureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        if (pictureUrl) {
            URL.revokeObjectURL(pictureUrl);
        }
        pictureUrl = URL.createObjectURL(file);
        preview.src = pictureUrl;
        previewContainer.hidden = false;
        pictureLabel.style.display = 'none';
    }
})

function updateSubmitButton() {
    successMessage.hidden = true;

    if (pictureInput.files.length === 0) {
        workFormSubmitBtn.disabled = true;
    } else if (pictureTitle.value.trim() === '') {
        workFormSubmitBtn.disabled = true;
    } else if (categoriesList.value === '') {
        workFormSubmitBtn.disabled = true;
    } else {
        workFormSubmitBtn.disabled = false;
    }
}

workForm.addEventListener('input', updateSubmitButton)

workForm.addEventListener('change', updateSubmitButton)

workForm.addEventListener('submit', async (event) => {
    workFormSubmitBtn.disabled = true;
    event.preventDefault();

    const errors = checkForm(workForm);
    const hasErrors = Object.values(errors).some(
        fieldErrors => fieldErrors.length > 0
    );

    if (hasErrors) {
        displayErrors(errors);

        return;
    }

    const formData = new FormData(workForm);
    formData.append("userId", sessionStorage.getItem('userId'));

    try {
        const response = await fetch(worksApiPath, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('La photo n\'a pas pu être ajoutée.');
        }

        const data = await response.json();
        clearForm();
        allWorks.push(data);
        displayWorks(allWorks);
        displayEditableWorks(allWorks);

        successMessage.hidden = false;

    } catch (error) {
        insertErrors(error, workFormSubmitBtn.nextElementSibling);
    }
})

function checkForm(form) {
    const errors = {
        image: [],
        title: [],
        category: []
    };
    const picture = form.elements.namedItem('picture');
    const title = form.elements.namedItem('picture-title');
    const category = form.elements.namedItem('categories-list');
    const file = picture.files[0];
    const allowedTypes = ["image/png", "image/jpeg"];
    const maxSize = 4 * 1024 * 1024;
    const maxCharacters = 500;

    if (!file) {
        errors.image.push('Aucune image sélectionnée.');
    } else {
        if (!allowedTypes.includes(file.type)) {
            errors.image.push('Format de l\'image invalide : PNG ou JPG uniquement.');
        }
        if (file.size >= maxSize) {
            errors.image.push('L\'image ne doit pas dépasser 4 Mo.');
        }
    }
    if (title.value.trim().length === 0) {
        errors.title.push('Le champ est obligatoire.');
    }
    if (title.value.trim().length > maxCharacters) {
        errors.title.push(`Maximum ${maxCharacters} caractères.`);
    }
    if (category.value.length === 0) {
        errors.category.push('Le champ est obligatoire.');
    }

    return errors;
}

function displayErrors(errors) {
    insertErrors(errors.image, pictureInput.nextElementSibling);
    insertErrors(errors.title, pictureTitle.nextElementSibling);
    insertErrors(errors.category, categoriesList.nextElementSibling);
}

function insertErrors(errors, errorElementTag) {
    errorElementTag.replaceChildren();
    if (Array.isArray(errors)) {
        errors.forEach(error => {
            const p = document.createElement('p');
            p.textContent = error;
            errorElementTag.append(p);
        });
    } else {
        errorElementTag.textContent = errors.message;
    }
}

function clearForm() {
    if (pictureUrl) {
        URL.revokeObjectURL(pictureUrl);
        pictureUrl = null;
    }
    preview.removeAttribute('src');
    workForm.reset();
    previewContainer.hidden = true;
    workFormSubmitBtn.disabled = true;
    pictureLabel.style.display = 'flex';
    successMessage.hidden = true;
    errorMessage.forEach(item => {
        item.replaceChildren();
    });
}

// Initialisation

async function getAdminCategories() {
    const categories = await getData(categoriesApiPath);
    categories.forEach(element => {
        const option = document.createElement('option');
        option.innerText = element.name;
        option.setAttribute('value', element.id);
        categoriesList.appendChild(option);
    });
}

async function init() {
    try {
        await getWorks();
        if (sessionStorage.getItem('token') !== null) {
            loginBtn.parentNode.setAttribute('hidden', true);
            logoutBtn.removeAttribute('hidden');
            editionBanner.removeAttribute('hidden');
            editionBtn.removeAttribute('hidden');
            setAdminActions();
            await getAdminCategories();
        } else {
            await getCategories();
        }
    } catch (error) {
        galleryTag.textContent = error.message;
    }
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        window.location.reload();
    });
}

init();
