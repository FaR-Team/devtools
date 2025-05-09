document.addEventListener('DOMContentLoaded', () => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const furnitureEditor = new FurnitureEditor();
    
    const probabilityEditor = new ProbabilityEditor();
    
    fetch('csv/FurnitureData.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvContent => {
            console.log("Furniture CSV loaded successfully");
            const parsedData = CSVHandler.parseCSV(csvContent);
            if (parsedData.furnitureData && parsedData.furnitureData.length > 0) {
                console.log(`Loaded ${parsedData.furnitureData.length} furniture items`);
                furnitureEditor.loadFurnitureData(parsedData.furnitureData);
                
                probabilityEditor.furnitureData = parsedData.furnitureData;
                
                loadProbabilityData();
            } else {
                console.error('No valid furniture data found in the CSV file.');
            }
        })
        .catch(error => {
            console.error('Error loading furniture data:', error);
        });
    
    function loadProbabilityData() {
        fetch('csv/SpawnProbabilityConfig.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvContent => {
                console.log("Probability CSV loaded successfully");
                const parsedData = CSVHandler.parseProbabilityCSV(csvContent);
                if (parsedData) {
                    console.log("Parsed probability data:", parsedData);
                    probabilityEditor.loadProbabilityData(parsedData);
                } else {
                    console.error('No valid probability data found in the CSV file.');
                }
            })
            .catch(error => {
                console.error('Error loading probability data:', error);
            });
    }
    
    document.getElementById('furniture-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showTab('furniture');
    });
    
    document.getElementById('probability-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showTab('probability');
    });
    
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
    
    showTab('furniture');
});