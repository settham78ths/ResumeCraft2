// Czysty, prosty JavaScript dla CV Optimizer Pro
document.addEventListener('DOMContentLoaded', function() {
    // Elementy formularza
    const cvUploadForm = document.getElementById('cv-upload-form');
    const cvFileInput = document.getElementById('cv-file');
    const jobTitleInput = document.getElementById('job-title');
    const jobDescriptionInput = document.getElementById('job-description');
    const jobUrlInput = document.getElementById('job-url');
    const processButton = document.getElementById('process-button');
    const uploadSuccessAlert = document.getElementById('upload-success');
    const uploadErrorAlert = document.getElementById('upload-error');
    const errorMessageSpan = document.getElementById('error-message');
    const processingIndicator = document.getElementById('processing-indicator');

    // Elementy podglądu i edycji CV
    const cvPreview = document.getElementById('cv-preview');
    const cvEditor = document.getElementById('cv-editor');
    const cvTextEditor = document.getElementById('cv-text-editor');
    const cvTextDisplay = document.getElementById('cv-text-display');
    const editCvBtn = document.getElementById('edit-cv-btn');
    const saveCvBtn = document.getElementById('save-cv-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Elementy wyników
    const resultContainer = document.getElementById('result-container');
    const copyResultBtn = document.getElementById('copy-result-btn');
    const compareVersionsBtn = document.getElementById('compare-versions-btn');

    // Elementy automatycznego wyciągania informacji z linku
    const extractJobBtn = document.getElementById('extract-job-btn');
    const extractionStatus = document.getElementById('extraction-status');
    const extractionMessage = document.getElementById('extraction-message');

    // Przechowywanie tekstu CV
    let cvText = '';

    // Obsługa przesyłania CV
    if (cvUploadForm) {
        cvUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!cvFileInput || !cvFileInput.files[0]) {
                showError('Proszę wybrać plik PDF.');
                return;
            }

            const formData = new FormData();
            formData.append('cv_file', cvFileInput.files[0]);

            // Wyłącz przyciski
            if (processButton) processButton.disabled = true;
            if (cvFileInput) cvFileInput.disabled = true;

            // Ukryj poprzednie alerty
            hideAlerts();

            fetch('/upload-cv', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    cvText = data.cv_text;

                    // Pokaż podgląd CV
                    if (cvTextDisplay) {
                        cvTextDisplay.innerHTML = formatText(cvText);
                    }
                    if (cvPreview) {
                        cvPreview.style.display = 'block';
                    }

                    // Włącz przyciski
                    if (editCvBtn) editCvBtn.disabled = false;
                    if (processButton) processButton.disabled = false;

                    // Pokaż sukces
                    if (uploadSuccessAlert) uploadSuccessAlert.style.display = 'block';
                } else {
                    showError(data.message || 'Błąd podczas przesyłania CV');
                }
            })
            .catch(error => {
                hideLoading();
                console.error('Upload error:', error);
                showMessage('Upload failed. Please try again.', 'error');

                // Reset upload button
                const uploadBtn = document.querySelector('button[onclick="uploadCV()"]');
                if (uploadBtn) {
                    uploadBtn.disabled = false;
                    uploadBtn.textContent = 'Prześlij CV';
                }
            });
        });
    }

    // Obsługa przetwarzania CV
    if (processButton) {
        processButton.addEventListener('click', function() {
            const selectedOption = document.querySelector('input[name="optimization-option"]:checked');
            if (!selectedOption) {
                showError('Wybierz opcję optymalizacji.');
                return;
            }

            const jobTitle = jobTitleInput ? jobTitleInput.value.trim() : '';
            const jobDescription = jobDescriptionInput ? jobDescriptionInput.value.trim() : '';
            const jobUrl = jobUrlInput ? jobUrlInput.value.trim() : '';
            const selectedLanguage = document.querySelector('input[name="language"]:checked');
            const language = selectedLanguage ? selectedLanguage.value : 'pl';

            // Sprawdź wymagane pola
            const optionValue = selectedOption.value;
            if ((optionValue === 'optimize' || optionValue === 'cover_letter' || optionValue === 'feedback' || 
                 optionValue === 'ats_check' || optionValue === 'interview_questions' || optionValue === 'keyword_analysis') 
                && !jobDescription && !jobUrl) {
                showError('Dla tej opcji wymagany jest opis stanowiska lub link do oferty.');
                return;
            }

            // Przygotuj dane
            const requestData = {
                cv_text: cvText,
                job_title: jobTitle,
                job_description: jobDescription,
                job_url: jobUrl,
                selected_option: optionValue,
                language: language
            };

            // Pokaż wskaźnik ładowania
            if (processingIndicator) processingIndicator.style.display = 'block';
            if (processButton) processButton.disabled = true;
            hideAlerts();

            // Wyczyść poprzednie wyniki
            if (resultContainer) {
                resultContainer.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin me-2"></i>Przetwarzanie...</div>';
            }

            fetch('/process-cv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Pokaż wyniki
                    if (resultContainer) {
                        resultContainer.innerHTML = formatText(data.result);
                    }

                    // Aktualizuj opis pracy jeśli został wyciągnięty z URL
                    if (data.job_description && jobDescriptionInput) {
                        jobDescriptionInput.value = data.job_description;
                    }

                    // Włącz przyciski
                    if (copyResultBtn) copyResultBtn.disabled = false;
                    if ((optionValue === 'optimize') && compareVersionsBtn) {
                        compareVersionsBtn.disabled = false;
                    }
                } else {
                    showError(data.message || 'Błąd podczas przetwarzania CV');
                    if (resultContainer) {
                        resultContainer.innerHTML = '<p class="text-danger text-center">Przetwarzanie nie powiodło się.</p>';
                    }
                }
            })
            .catch(error => {
                hideLoading();
                console.error('Error processing CV:', error);
                showMessage('Processing failed. Please try again.', 'error');

                // Enable buttons again
                const processBtn = document.getElementById('processBtn');
                if (processBtn) {
                    processBtn.disabled = false;
                    processBtn.textContent = 'Przetwórz CV';
                }
            });
        });
    }

    // Obsługa edycji CV
    if (editCvBtn) {
        editCvBtn.addEventListener('click', function() {
            if (cvTextEditor) cvTextEditor.value = cvText;
            if (cvPreview) cvPreview.style.display = 'none';
            if (cvEditor) cvEditor.style.display = 'block';
            editCvBtn.disabled = true;
        });
    }

    if (saveCvBtn) {
        saveCvBtn.addEventListener('click', function() {
            if (cvTextEditor) cvText = cvTextEditor.value;
            if (cvTextDisplay) cvTextDisplay.innerHTML = formatText(cvText);
            if (cvEditor) cvEditor.style.display = 'none';
            if (cvPreview) cvPreview.style.display = 'block';
            if (editCvBtn) editCvBtn.disabled = false;
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            if (cvEditor) cvEditor.style.display = 'none';
            if (cvPreview) cvPreview.style.display = 'block';
            if (editCvBtn) editCvBtn.disabled = false;
        });
    }

    // Obsługa kopiowania wyniku
    if (copyResultBtn) {
        copyResultBtn.addEventListener('click', function() {
            if (!resultContainer) return;

            const textToCopy = resultContainer.innerText;
            navigator.clipboard.writeText(textToCopy).then(
                function() {
                    const originalText = copyResultBtn.innerHTML;
                    copyResultBtn.innerHTML = '<i class="fas fa-check me-2"></i>Skopiowano!';
                    setTimeout(function() {
                        copyResultBtn.innerHTML = originalText;
                    }, 2000);
                },
                function(err) {
                    console.error('Błąd kopiowania:', err);
                    showError('Nie udało się skopiować tekstu.');
                }
            );
        });
    }

    // Obsługa porównania wersji
    if (compareVersionsBtn) {
        compareVersionsBtn.addEventListener('click', function() {
            fetch('/compare-cv-versions')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.has_both_versions) {
                    if (resultContainer) {
                        resultContainer.innerHTML = `
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">Oryginalne CV</h6>
                                    <div class="border p-2 bg-light" style="max-height: 300px; overflow-y: auto;">
                                        ${formatText(data.original)}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-success">Zoptymalizowane CV</h6>
                                    <div class="border p-2 bg-light" style="max-height: 300px; overflow-y: auto;">
                                        ${formatText(data.optimized)}
                                    </div>
                                </div>
                            </div>
                            <div class="text-center mt-3">
                                <button class="btn btn-secondary btn-sm" onclick="location.reload()">
                                    Powrót do wyników
                                </button>
                            </div>
                        `;
                    }
                } else {
                    showError('Brak zoptymalizowanej wersji do porównania.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Nie udało się załadować porównania.');
            });
        });
    }

    // Obsługa automatycznego wyciągania informacji z linku
    if (extractJobBtn) {
        extractJobBtn.addEventListener('click', function() {
            const jobUrl = jobUrlInput ? jobUrlInput.value.trim() : '';

            if (!jobUrl) {
                showError('Proszę wkleić link do oferty pracy.');
                return;
            }

            // Sprawdź czy URL wygląda poprawnie
            if (!isValidUrl(jobUrl)) {
                showError('Proszę podać prawidłowy link do oferty pracy.');
                return;
            }

            // Pokaż status wyciągania
            if (extractionStatus) {
                extractionStatus.style.display = 'block';
                extractionStatus.className = 'alert alert-info';
                if (extractionMessage) {
                    extractionMessage.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Wyciąganie informacji z oferty...';
                }
            }

            // Wyłącz przycisk podczas przetwarzania
            extractJobBtn.disabled = true;
            extractJobBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Wyciąganie...';

            hideAlerts();

            // Wyślij zapytanie do serwera
            fetch('/extract-job-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_url: jobUrl
                })
            })
            .then(response => {
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', response.headers);

                if (!response.ok) {
                    console.error('❌ HTTP Error:', response.status, response.statusText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('📊 Response data:', data);
                if (data.success) {
                    // Wypełnij automatycznie pola
                    if (data.job_title && jobTitleInput) {
                        jobTitleInput.value = data.job_title;
                        // Dodaj efekt highlight
                        jobTitleInput.style.backgroundColor = '#d4edda';
                        setTimeout(() => {
                            jobTitleInput.style.backgroundColor = '';
                        }, 2000);
                    }

                    if (data.job_description && jobDescriptionInput) {
                        jobDescriptionInput.value = data.job_description;
                        // Dodaj efekt highlight
                        jobDescriptionInput.style.backgroundColor = '#d4edda';
                        setTimeout(() => {
                            jobDescriptionInput.style.backgroundColor = '';
                        }, 2000);
                    }

                    // Pokaż sukces
                    if (extractionStatus && extractionMessage) {
                        extractionStatus.className = 'alert alert-success';
                        extractionMessage.innerHTML = `<i class="fas fa-check-circle me-2"></i>${data.message}`;

                        // Ukryj status po 5 sekundach
                        setTimeout(() => {
                            extractionStatus.style.display = 'none';
                        }, 5000);
                    }

                    // Pokaż dodatkowe informacje o firmie
                    if (data.company) {
                        console.log(`Znaleziona firma: ${data.company}`);
                    }

                } else {
                    showError(data.message || 'Nie udało się wyciągnąć informacji z linku.');

                    if (extractionStatus && extractionMessage) {
                        extractionStatus.className = 'alert alert-danger';
                        extractionMessage.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${data.message}`;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Wystąpił błąd podczas wyciągania informacji z linku.');

                if (extractionStatus && extractionMessage) {
                    extractionStatus.className = 'alert alert-danger';
                    extractionMessage.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Wystąpił błąd podczas wyciągania informacji.';
                }
            })
            .finally(() => {
                // Przywróć przycisk
                extractJobBtn.disabled = false;
                extractJobBtn.innerHTML = '<i class="fas fa-magic"></i> Wyciągnij automatycznie';
            });
        });
    }

    // Funkcje pomocnicze
    function showError(message) {
        if (errorMessageSpan) errorMessageSpan.textContent = message;
        if (uploadErrorAlert) uploadErrorAlert.style.display = 'block';
    }

    function hideAlerts() {
        if (uploadSuccessAlert) uploadSuccessAlert.style.display = 'none';
        if (uploadErrorAlert) uploadErrorAlert.style.display = 'none';
    }

    function formatText(text) {
        if (!text) return '<p class="text-muted">Brak tekstu</p>';

        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
});

function loadNotifications() {
    // Load any pending notifications
    console.log('Loading notifications...');
}

function analyzeJobPosting() {
    const jobDescription = document.getElementById('job_description')?.value;
    const jobUrl = document.getElementById('job_url')?.value;

    if (!jobDescription && !jobUrl) {
        showMessage('Podaj opis stanowiska lub URL oferty pracy', 'error');
        return;
    }

    showLoading('Analizuję stanowisko...');

    fetch('/analyze-job-posting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_description: jobDescription,
            job_url: jobUrl,
            language: getCurrentLanguage()
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            displayJobAnalysis(data.analysis);
            if (data.raw_description && !jobDescription) {
                document.getElementById('job_description').value = data.raw_description;
            }
        } else {
            showMessage(data.message || 'Błąd podczas analizy stanowiska', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        showMessage('Wystąpił błąd podczas analizy', 'error');
    });
}

function displayJobAnalysis(analysis) {
    // Display job analysis results
    const analysisContainer = document.getElementById('jobAnalysisResults');
    if (analysisContainer && analysis) {
        analysisContainer.innerHTML = `
            <div class="analysis-results">
                <h3>Analiza stanowiska</h3>
                <pre>${JSON.stringify(analysis, null, 2)}</pre>
            </div>
        `;
        analysisContainer.style.display = 'block';
    }
}

function getCurrentLanguage() {
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        return langToggle.checked ? 'en' : 'pl';
    }
    return document.documentElement.lang || 'pl';
}

function showLoading(message = 'Processing...') {
    const loadingDiv = document.getElementById('loadingMessage');
    if (loadingDiv) {
        loadingDiv.textContent = message;
        loadingDiv.style.display = 'block';
    } else {
        // Create loading message if it doesn't exist
        const loading = document.createElement('div');
        loading.id = 'loadingMessage';
        loading.className = 'loading-message';
        loading.textContent = message;
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 9999;
        `;
        document.body.appendChild(loading);
    }
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingMessage');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}