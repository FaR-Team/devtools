document.addEventListener('DOMContentLoaded', () => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const furnitureEditor = new FurnitureEditor();
    
    const probabilityEditor = new ProbabilityEditor();
    
    // Load data from localStorage if available
    const savedFurnitureData = localStorage.getItem('furnitureData');
    if (savedFurnitureData) {
        furnitureEditor.loadFurnitureData(JSON.parse(savedFurnitureData));
    } else {
        // Load default data or empty array
        furnitureEditor.loadFurnitureData([]);
    }
    
    const savedProbabilityData = localStorage.getItem('probabilityData');
    if (savedProbabilityData) {
        probabilityEditor.loadProbabilityData(JSON.parse(savedProbabilityData));
    } else {
        // Load default probability data
        probabilityEditor.loadProbabilityData({
            configName: 'SpawnProbabilityConfig',
            defaultTagProbability: 10,
            tagProbabilities: [],
            furnitureSpecificProbabilities: []
        });
    }

    function loadDefaultFurnitureData() {
        fetch('../csv/furnitureData.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(csvContent => {
                furnitureEditor.importFurnitureData(csvContent);
            })
            .catch(error => {
                console.error('Error loading default furniture data:', error);
                // If CSV loading fails, initialize with empty array
                furnitureEditor.loadFurnitureData([]);
            });
    }
    
    document.getElementById('furniture-tab').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('furniture-tab').classList.add('active');
        document.getElementById('probability-tab').classList.remove('active');
        document.getElementById('furniture-editor').style.display = 'block';
        document.getElementById('probability-editor').style.display = 'none';
    });
    
    document.getElementById('probability-tab').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('probability-tab').classList.add('active');
        document.getElementById('furniture-tab').classList.remove('active');
        document.getElementById('furniture-editor').style.display = 'none';
        document.getElementById('probability-editor').style.display = 'block';
    });
    
    document.getElementById('add-furniture').addEventListener('click', () => {
        furnitureEditor.addNewFurniture();
    });
    
    document.getElementById('import-furniture').addEventListener('click', () => {
        showImportModal('furniture');
    });
    
    document.getElementById('export-furniture').addEventListener('click', () => {
        furnitureEditor.exportFurnitureData();
    });
    
    document.getElementById('furniture-search').addEventListener('input', () => {
        furnitureEditor.updateFurnitureList();
    });
    
    document.getElementById('save-furniture').addEventListener('click', () => {
        furnitureEditor.saveFurnitureChanges();
    });
    
    document.getElementById('cancel-furniture').addEventListener('click', () => {
        if (furnitureEditor.currentFurnitureItem) {
            furnitureEditor.loadFurnitureItem(furnitureEditor.currentFurnitureItem);
        } else {
            furnitureEditor.clearFurnitureForm();
        }
    });
    
    document.getElementById('furniture-combo').addEventListener('change', (e) => {
        const comboSection = document.getElementById('combo-section');
        comboSection.style.display = e.target.checked ? 'block' : 'none';
    });
    
    document.getElementById('import-probability').addEventListener('click', () => {
        showImportModal('probability');
    });
    
    document.getElementById('export-probability').addEventListener('click', () => {
        probabilityEditor.exportProbabilityData();
    });
    
    document.getElementById('save-probabilities').addEventListener('click', () => {
        probabilityEditor.saveProbabilityChanges();
    });
    
    document.getElementById('default-tag-probability').addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('default-tag-probability-value').textContent = `${value}%`;
        probabilityEditor.updateDefaultProbability(value);
    });
    
    document.getElementById('add-furniture-probability').addEventListener('change', (e) => {
        const selectedFurniture = e.target.value;
        if (selectedFurniture) {
            probabilityEditor.addFurnitureProbability(selectedFurniture);
            e.target.value = '';
        }
    });
    
    document.getElementById('confirm-import').addEventListener('click', () => {
        const fileInput = document.getElementById('csv-file');
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvContent = e.target.result;
                const importType = document.getElementById('import-modal-title').dataset.importType;
                
                if (importType === 'furniture') {
                    furnitureEditor.importFurnitureData(csvContent);
                } else if (importType === 'probability') {
                    probabilityEditor.importProbabilityData(csvContent);
                }
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('import-modal'));
                modal.hide();
            };
            reader.readAsText(file);
        }
    });
    
    function showImportModal(type) {
        const modalTitle = document.getElementById('import-modal-title');
        modalTitle.textContent = `Import ${type === 'furniture' ? 'Furniture' : 'Probability'} CSV`;
        modalTitle.dataset.importType = type;
        
        document.getElementById('csv-file').value = '';
        
        const modal = new bootstrap.Modal(document.getElementById('import-modal'));
        modal.show();
    }

    function showTab(tabName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        document.querySelectorAll('.editor-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${tabName}-editor`).style.display = 'block';
    }
    
    document.getElementById('toggle-csv-preview').addEventListener('click', () => {
        furnitureEditor.toggleCsvPreview();
    });

    document.getElementById('close-csv-preview').addEventListener('click', () => {
        document.getElementById('csv-preview-container').style.display = 'none';
        document.getElementById('toggle-csv-preview').innerHTML = '<i class="fas fa-table"></i>';
    });

    document.getElementById('download-csv').addEventListener('click', () => {
        furnitureEditor.exportFurnitureData();
    });
    
    showTab('furniture');
});