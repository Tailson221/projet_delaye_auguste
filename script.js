document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const signupForm = document.getElementById('signup-form');
    const signupSection = document.getElementById('signup-section');
    const recapSection = document.getElementById('recap-section');
    const formErrorsAlert = document.getElementById('form-errors');

    // Champs du formulaire
    const fields = {
        login: document.getElementById('login'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        nom: document.getElementById('nom'),
        prenom: document.getElementById('prenom'),
        dateNaissance: document.getElementById('dateNaissance'),
        email: document.getElementById('email'),
        telephone: document.getElementById('telephone'),
        adresse: document.getElementById('adresse')
    };

    // Boutons
    const togglePwdBtn = document.getElementById('toggle-pwd-btn');
    const btnEdit = document.getElementById('btn-edit');
    const btnReset = document.getElementById('btn-reset');

    // Toggle Afficher / Masquer Mot de passe
    if (togglePwdBtn) {
        togglePwdBtn.addEventListener('click', () => {
            const isPassword = fields.password.type === 'password';
            fields.password.type = isPassword ? 'text' : 'password';
            fields.confirmPassword.type = isPassword ? 'text' : 'password';
            
            // Mise à jour de l'icône de l'œil
            togglePwdBtn.innerHTML = isPassword ? 
                `<svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>` :
                `<svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        });
    }

    // Validation des champs en temps réel lors du changement d'input
    Object.keys(fields).forEach(key => {
        const input = fields[key];
        if (!input) return;

        input.addEventListener('input', () => {
            // Filtrage strict sur le champ téléphone : suppression immédiate des lettres et caractères non autorisés
            if (key === 'telephone') {
                input.value = input.value.replace(/[^\d\s+\-.]/g, '');
            }

            validateField(key);
            clearGlobalError();
        });

        input.addEventListener('blur', () => {
            validateField(key);
        });
    });

    // Écouteur de soumission du formulaire
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        const errorMessages = [];

        // Validation de tous les champs
        Object.keys(fields).forEach(key => {
            const fieldValid = validateField(key);
            if (!fieldValid) {
                isValid = false;
            }
        });

        if (!isValid) {
            showGlobalError('Veuillez corriger les erreurs dans le formulaire avant de valider.');
            return;
        }

        // Si tout est valide, afficher la page récapitulative
        showRecapSection();
    });

    // Fonction de validation individuelle
    function validateField(fieldName) {
        const input = fields[fieldName];
        const errorSpan = document.getElementById(`error-${fieldName}`);
        const parentGroup = input.closest('.input-group');
        let errorText = '';

        const value = input.value.trim();

        // 1. Validation Générale : Requis
        if (!value) {
            errorText = 'Ce champ est obligatoire.';
        } else {
            // 2. Validations Spécifiques par champ
            switch (fieldName) {
                case 'login':
                    if (value.length < 3) {
                        errorText = 'Le login doit contenir au moins 3 caractères.';
                    }
                    break;

                case 'password':
                    if (value.length < 6) {
                        errorText = 'Le mot de passe doit contenir au moins 6 caractères.';
                    }
                    // Si confirmPassword contient une valeur, on valide aussi confirmPassword
                    if (fields.confirmPassword.value) {
                        validateField('confirmPassword');
                    }
                    break;

                case 'confirmPassword':
                    if (value !== fields.password.value) {
                        errorText = 'Les mots de passe ne correspondent pas.';
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        errorText = 'Veuillez saisir une adresse email valide.';
                    }
                    break;

                case 'telephone':
                    if (/[a-zA-Z]/.test(value)) {
                        errorText = 'Le numéro de téléphone ne peut pas contenir de lettres.';
                    } else {
                        const digitsOnly = value.replace(/\D/g, '');
                        const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]*\d{2}){4}$/;
                        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                            errorText = 'Veuillez saisir un numéro de téléphone valide (au moins 10 chiffres).';
                        } else if (!phoneRegex.test(value) && digitsOnly.length === 10 && !value.startsWith('0') && !value.startsWith('+')) {
                            errorText = 'Le numéro de téléphone doit commencer par 0 ou +33.';
                        }
                    }
                    break;

                case 'dateNaissance':
                    const birthDate = new Date(value);
                    const today = new Date();
                    if (isNaN(birthDate.getTime())) {
                        errorText = 'Veuillez sélectionner une date valide.';
                    } else if (birthDate >= today) {
                        errorText = 'La date de naissance doit être dans le passé.';
                    }
                    break;

                default:
                    break;
            }
        }

        // Mettre à jour l'affichage de l'erreur
        if (errorText) {
            if (errorSpan) errorSpan.textContent = errorText;
            if (parentGroup) {
                parentGroup.classList.add('invalid');
                parentGroup.classList.remove('valid');
            }
            return false;
        } else {
            if (errorSpan) errorSpan.textContent = '';
            if (parentGroup) {
                parentGroup.classList.remove('invalid');
                parentGroup.classList.add('valid');
            }
            return true;
        }
    }

    // Gestion de l'alerte globale
    function showGlobalError(msg) {
        formErrorsAlert.textContent = msg;
        formErrorsAlert.classList.remove('hidden');
    }

    function clearGlobalError() {
        formErrorsAlert.textContent = '';
        formErrorsAlert.classList.add('hidden');
    }

    // Affichage de la page récapitulative
    function showRecapSection() {
        // Injection des valeurs saisies
        document.getElementById('recap-login').textContent = fields.login.value.trim();
        document.getElementById('recap-nom').textContent = fields.nom.value.trim();
        document.getElementById('recap-prenom').textContent = fields.prenom.value.trim();
        document.getElementById('recap-email').textContent = fields.email.value.trim();
        document.getElementById('recap-telephone').textContent = fields.telephone.value.trim();
        document.getElementById('recap-adresse').textContent = fields.adresse.value.trim();

        // Formatage lisible de la date de naissance
        if (fields.dateNaissance.value) {
            const dateObj = new Date(fields.dateNaissance.value);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('recap-dateNaissance').textContent = dateObj.toLocaleDateString('fr-FR', options);
        }

        // Bascule des vues avec transition
        signupSection.classList.add('hidden');
        recapSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Action : Modifier les informations
    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            recapSection.classList.add('hidden');
            signupSection.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Action : Recommencer une nouvelle inscription
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            signupForm.reset();
            // Nettoyage des états visuels des champs
            Object.keys(fields).forEach(key => {
                const parentGroup = fields[key].closest('.input-group');
                const errorSpan = document.getElementById(`error-${key}`);
                if (parentGroup) {
                    parentGroup.classList.remove('valid', 'invalid');
                }
                if (errorSpan) {
                    errorSpan.textContent = '';
                }
            });
            clearGlobalError();
            recapSection.classList.add('hidden');
            signupSection.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
