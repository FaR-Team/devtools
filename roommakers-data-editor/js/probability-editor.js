class ProbabilityEditor {
    constructor() {
        this.probabilityData = {
            configName: 'SpawnProbabilityConfig',
            defaultTagProbability: 10,
            tagProbabilities: [],
            furnitureSpecificProbabilities: []
        };
        
        this.furnitureData = [];
        this.roomTags = [
            'None', 'Kitchen', 'Bathroom', 'Bedroom', 'LivingRoom', 
            'DiningRoom', 'Office', 'Outdoor', 'Hallway', 'Decoration'
        ];
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        const defaultSlider = document.getElementById('default-tag-probability');
        defaultSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('default-tag-probability-value').textContent = `${value}%`;
            this.probabilityData.defaultTagProbability = parseFloat(value);
        });
        
        document.getElementById('import-probability').addEventListener('click', () => {
            this.showImportModal('probability');
        });
        
        document.getElementById('export-probability').addEventListener('click', () => {
            this.exportProbabilityData();
        });
        
        document.getElementById('add-furniture-probability').addEventListener('change', (e) => {
            const selectedPath = e.target.value;
            if (selectedPath) {
                this.addFurnitureProbability(selectedPath);
                e.target.value = '';
            }
        });
        
        document.getElementById('save-probabilities').addEventListener('click', () => {
            this.saveProbabilityChanges();
        });
    }
    
    loadProbabilityData(data) {
        this.probabilityData = data;
        
        const defaultSlider = document.getElementById('default-tag-probability');
        if (defaultSlider) {
            defaultSlider.value = data.defaultTagProbability;
            document.getElementById('default-tag-probability-value').textContent = `${data.defaultTagProbability}%`;
        }
        
        this.renderTagProbabilities();
        
        this.renderFurnitureSpecificProbabilities();
        
        this.updateFurnitureDropdown();
    }
    
    setFurnitureData(furnitureData) {
        this.furnitureData = furnitureData;
        this.updateFurnitureDropdown();
    }
    
    updateFurnitureDropdown() {
        const dropdown = document.getElementById('add-furniture-probability');
        if (!dropdown) {
            console.error("Furniture probability dropdown not found");
            return;
        }
        
        dropdown.innerHTML = '<option value="">Add furniture override...</option>';
        
        if (!this.furnitureData || this.furnitureData.length === 0) {
            console.warn("No furniture data available for dropdown");
            return;
        }
        
        console.log(`Updating furniture dropdown with ${this.furnitureData.length} items`);
        
        this.furnitureData.forEach(furniture => {
            const exists = this.probabilityData.furnitureSpecificProbabilities.some(
                item => item.furniturePath === furniture.AssetPath
            );
            
            if (!exists && furniture.AssetPath) {
                const option = document.createElement('option');
                option.value = furniture.AssetPath;
                option.textContent = furniture.Name;
                dropdown.appendChild(option);
            }
        });
    }
    
    renderTagProbabilities() {
        const container = document.getElementById('tag-probabilities-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.probabilityData.tagProbabilities.forEach((tagProb, index) => {
            const row = document.createElement('div');
            row.className = 'mb-3';
            
            const label = document.createElement('label');
            label.className = 'form-label d-flex justify-content-between';
            label.innerHTML = `
                <span>${tagProb.tagName}</span>
                <span id="tag-prob-value-${index}">${tagProb.probability}%</span>
            `;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'form-range';
            slider.min = 0;
            slider.max = 100;
            slider.value = tagProb.probability;
            slider.dataset.index = index;
            
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById(`tag-prob-value-${index}`).textContent = `${value}%`;
                this.probabilityData.tagProbabilities[index].probability = parseFloat(value);
            });
            
            row.appendChild(label);
            row.appendChild(slider);
            container.appendChild(row);
        });
    }
    
    renderFurnitureSpecificProbabilities() {
        const container = document.getElementById('furniture-probabilities-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.probabilityData.furnitureSpecificProbabilities.forEach((furnitureProb, index) => {
            const row = document.createElement('div');
            row.className = 'card mb-2';
            
            let furnitureName = furnitureProb.furniturePath;
            const furniture = this.furnitureData.find(f => f.AssetPath === furnitureProb.furniturePath);
            if (furniture) {
                furnitureName = furniture.Name;
            }
            
            row.innerHTML = `
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">${furnitureName}</h6>
                        <button class="btn btn-sm btn-danger remove-furniture-prob" data-index="${index}">Remove</button>
                    </div>
                    <div class="d-flex align-items-center">
                        <input type="range" class="form-range me-2 furniture-prob-slider" 
                               min="0" max="100" value="${furnitureProb.probability}" data-index="${index}">
                        <span class="furniture-prob-value" id="furniture-prob-value-${index}">${furnitureProb.probability}%</span>
                    </div>
                </div>
            `;
            
            container.appendChild(row);
        });
        
        document.querySelectorAll('.furniture-prob-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const index = e.target.dataset.index;
                const value = e.target.value;
                document.getElementById(`furniture-prob-value-${index}`).textContent = `${value}%`;
                this.probabilityData.furnitureSpecificProbabilities[index].probability = parseFloat(value);
            });
        });
        
        document.querySelectorAll('.remove-furniture-prob').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                this.probabilityData.furnitureSpecificProbabilities.splice(index, 1);
                this.renderFurnitureSpecificProbabilities();
                this.updateFurnitureDropdown();
            });
        });
    }
    
    createProbabilitySlider(container, label, value, type, path = '') {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'probability-slider-container';
        
        const labelElement = document.createElement('label');
        labelElement.className = 'form-label';
        labelElement.textContent = label;
        labelElement.style.width = '120px';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'form-range';
        slider.min = 0;
        slider.max = 100;
        slider.value = value;
        slider.dataset.type = type;
        if (path) slider.dataset.path = path;
        
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'probability-value';
        valueDisplay.textContent = `${value}%`;
        
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = `${e.target.value}%`;
        });
        
        sliderContainer.appendChild(labelElement);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        
        if (type === 'furniture') {
            const removeButton = document.createElement('button');
            removeButton.className = 'btn btn-sm btn-danger remove-btn';
            removeButton.innerHTML = '×';
            removeButton.addEventListener('click', () => {
                this.removeFurnitureProbability(path);
                sliderContainer.remove();
                this.updateFurnitureDropdown();
            });
            
            sliderContainer.appendChild(removeButton);
        }
        
        container.appendChild(sliderContainer);
    }
    
    updateTagProbabilitiesUI() {
        const container = document.getElementById('tag-probabilities-container');
        container.innerHTML = '';
        
        this.roomTags.forEach(tag => {
            if (tag === 'None') return;
            
            const tagProb = this.probabilityData.tagProbabilities.find(p => p.tag === tag);
            const probability = tagProb ? tagProb.probability : this.probabilityData.defaultTagProbability;
            
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'mb-3';
            
            const labelRow = document.createElement('div');
            labelRow.className = 'd-flex justify-content-between align-items-center mb-2';
            
            const label = document.createElement('label');
            label.className = 'form-label mb-0';
            label.textContent = tag;
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'badge bg-primary';
            valueDisplay.textContent = `${probability}%`;
            valueDisplay.id = `tag-prob-value-${tag}`;
            
            labelRow.appendChild(label);
            labelRow.appendChild(valueDisplay);
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'form-range';
            slider.min = '0';
            slider.max = '100';
            slider.value = probability;
            slider.id = `tag-prob-${tag}`;
            
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById(`tag-prob-value-${tag}`).textContent = `${value}%`;
                
                const existingIndex = this.probabilityData.tagProbabilities.findIndex(p => p.tag === tag);
                if (existingIndex !== -1) {
                    this.probabilityData.tagProbabilities[existingIndex].probability = parseFloat(value);
                } else {
                    this.probabilityData.tagProbabilities.push({
                        tag: tag,
                        probability: parseFloat(value)
                    });
                }
            });
            
            sliderContainer.appendChild(labelRow);
            sliderContainer.appendChild(slider);
            container.appendChild(sliderContainer);
        });
    }

    updateFurnitureProbabilitiesUI() {
        const container = document.getElementById('furniture-probabilities-container');
        container.innerHTML = '';
        
        const dropdown = document.getElementById('add-furniture-probability');
        dropdown.innerHTML = '<option value="">Select furniture to override...</option>';
        
        const existingOverrides = this.probabilityData.furnitureSpecificProbabilities.map(f => f.furniturePath);
        
        this.furnitureData.forEach(furniture => {
            if (!existingOverrides.includes(furniture.AssetPath)) {
                const option = document.createElement('option');
                option.value = furniture.AssetPath;
                option.textContent = furniture.Name;
                dropdown.appendChild(option);
            }
        });
        
        this.probabilityData.furnitureSpecificProbabilities.forEach(item => {
            this.createFurnitureProbabilityItem(item);
        });
    }

    createFurnitureProbabilityItem(item) {
        const container = document.getElementById('furniture-probabilities-container');
        
        const furniture = this.furnitureData.find(f => f.AssetPath === item.furniturePath);
        const furnitureName = furniture ? furniture.Name : 'Unknown Furniture';
        
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.dataset.path = item.furniturePath;
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
        
        const headerTitle = document.createElement('h6');
        headerTitle.className = 'mb-0';
        headerTitle.textContent = furnitureName;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-sm btn-outline-danger';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.addEventListener('click', () => {
            const index = this.probabilityData.furnitureSpecificProbabilities.findIndex(
                f => f.furniturePath === item.furniturePath
            );
            if (index !== -1) {
                this.probabilityData.furnitureSpecificProbabilities.splice(index, 1);
            }
            
            card.remove();
            
            const option = document.createElement('option');
            option.value = item.furniturePath;
            option.textContent = furnitureName;
            document.getElementById('add-furniture-probability').appendChild(option);
        });
        
        cardHeader.appendChild(headerTitle);
        cardHeader.appendChild(removeButton);
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const labelRow = document.createElement('div');
        labelRow.className = 'd-flex justify-content-between align-items-center mb-2';
        
        const label = document.createElement('label');
        label.className = 'form-label mb-0';
        label.textContent = 'Spawn Probability';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'badge bg-primary';
        valueDisplay.textContent = `${item.probability}%`;
        valueDisplay.id = `furniture-prob-value-${item.furniturePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        labelRow.appendChild(label);
        labelRow.appendChild(valueDisplay);
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'form-range';
        slider.min = '0';
        slider.max = '100';
        slider.value = item.probability;
        slider.id = `furniture-prob-${item.furniturePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueDisplay.textContent = `${value}%`;
            
            const index = this.probabilityData.furnitureSpecificProbabilities.findIndex(
                f => f.furniturePath === item.furniturePath
            );
            if (index !== -1) {
                this.probabilityData.furnitureSpecificProbabilities[index].probability = parseFloat(value);
            }
        });
        
        cardBody.appendChild(labelRow);
        cardBody.appendChild(slider);
        
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        
        container.appendChild(card);
    }

    addFurnitureProbability(furniturePath) {
        if (!furniturePath) return;
        
        const newItem = {
            furniturePath: furniturePath,
            probability: this.probabilityData.defaultTagProbability
        };
        
        this.probabilityData.furnitureSpecificProbabilities.push(newItem);
        
        this.createFurnitureProbabilityItem(newItem);
        
        const dropdown = document.getElementById('add-furniture-probability');
        for (let i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].value === furniturePath) {
                dropdown.remove(i);
                break;
            }
        }
    }
    
    removeFurnitureProbability(path) {
        this.probabilityData.furnitureSpecificProbabilities = 
            this.probabilityData.furnitureSpecificProbabilities.filter(fp => fp.furniturePath !== path);
    }
    
    saveProbabilityChanges() {
        // Update tag probabilities from UI
        const tagContainer = document.getElementById('tag-probabilities-container');
        const tagSliders = tagContainer.querySelectorAll('.tag-probability-slider');
        
        this.probabilityData.tagProbabilities = [];
        tagSliders.forEach(slider => {
            const tag = slider.dataset.tag;
            const value = parseFloat(slider.value);
            this.probabilityData.tagProbabilities.push({
                tag: tag,
                probability: value
            });
        });
        
        // Update furniture specific probabilities from UI
        const furnitureContainer = document.getElementById('furniture-probabilities-container');
        const furnitureSliders = furnitureContainer.querySelectorAll('.furniture-probability-slider');
        
        this.probabilityData.furnitureSpecificProbabilities = [];
        furnitureSliders.forEach(slider => {
            const furniturePath = slider.dataset.furniture;
            const value = parseFloat(slider.value);
            this.probabilityData.furnitureSpecificProbabilities.push({
                furniturePath: furniturePath,
                probability: value
            });
        });
        
        // Save to local storage
        localStorage.setItem('probabilityData', JSON.stringify(this.probabilityData));
        
        // Show success message
        alert('Probability data saved successfully!');
    }
    
    showImportModal(type) {
        const modal = new bootstrap.Modal(document.getElementById('import-modal'));
        document.getElementById('import-modal-title').textContent = 'Import Probability Data';
        
        const confirmButton = document.getElementById('confirm-import');
        confirmButton.onclick = () => {
            const fileInput = document.getElementById('csv-file');
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const csvContent = e.target.result;
                    const parsedData = CSVHandler.parseCSV(csvContent);
                    
                    if (parsedData.defaultTagProbability !== undefined) {
                        this.loadProbabilityData(parsedData);
                        modal.hide();
                    } else {
                        alert('No valid probability data found in the CSV file.');
                    }
                };
                
                reader.readAsText(file);
            } else {
                alert('Please select a file to import.');
            }
        };
        
        modal.show();
    }
    
    exportProbabilityData() {
        const csvContent = CSVHandler.generateProbabilityCSV(this.probabilityData);
        CSVHandler.downloadCSV(csvContent, 'SpawnProbabilityConfig.csv');
    }

}
