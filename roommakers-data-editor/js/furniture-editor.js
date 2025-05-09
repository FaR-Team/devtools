class FurnitureEditor {
    constructor() {
        this.furnitureData = [];
        this.selectedFurnitureIndex = -1;
        this.roomTags = [
            'None', 'Kitchen', 'Bedroom', 'Bathroom', 'LivingRoom', 
            'DiningRoom', 'Office', 'Lab', 'Gym'
        ];
        
        this.initEventListeners();
        this.populateRoomTags();
    }
    
    initEventListeners() {
        document.getElementById('furniture-search').addEventListener('input', (e) => {
            this.filterFurnitureList(e.target.value);
        });
        
        document.getElementById('add-furniture').addEventListener('click', () => {
            this.createNewFurniture();
        });
        
        document.getElementById('import-furniture').addEventListener('click', () => {
            this.showImportModal('furniture');
        });
        
        document.getElementById('export-furniture').addEventListener('click', () => {
            this.exportFurnitureData();
        });
        
        document.getElementById('save-furniture').addEventListener('click', () => {
            this.saveFurnitureChanges();
        });
        
        document.getElementById('furniture-combo').addEventListener('change', (e) => {
            document.getElementById('combo-section').style.display = e.target.checked ? 'block' : 'none';
        });
    }
    
    populateRoomTags() {
        const tagSelect = document.getElementById('furniture-tag');
        tagSelect.innerHTML = '';
        
        this.roomTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);
        });
    }
    
    loadFurnitureData(data) {
        console.log("Loading furniture data:", data);
        this.furnitureData = data;
        this.renderFurnitureList();
        this.updateComboTriggerOptions();
    }
    
    renderFurnitureList() {
        const listElement = document.getElementById('furniture-list');
        listElement.innerHTML = '';
        
        this.furnitureData.forEach((furniture, index) => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            if (index === this.selectedFurnitureIndex) {
                item.classList.add('active');
            }
            
            item.textContent = furniture.Name;
            item.addEventListener('click', () => {
                this.selectFurniture(index);
            });
            
            listElement.appendChild(item);
        });
    }
    
    filterFurnitureList(searchTerm) {
        const listItems = document.querySelectorAll('#furniture-list li');
        searchTerm = searchTerm.toLowerCase();
        
        listItems.forEach((item, index) => {
            const furnitureName = this.furnitureData[index].Name.toLowerCase();
            if (furnitureName.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    selectFurniture(index) {
        this.selectedFurnitureIndex = index;
        this.renderFurnitureList();
        this.populateFurnitureDetails();
        
        console.log("Selected furniture index:", index);
    }
    
    populateFurnitureDetails() {
        if (this.selectedFurnitureIndex === -1) {
            document.getElementById('furniture-details').style.display = 'none';
            return;
        }
        
        document.getElementById('furniture-details').style.display = 'block';
        const furniture = this.furnitureData[this.selectedFurnitureIndex];
        console.log("Populating details for:", furniture.Name);
        
        document.getElementById('furniture-details-title').textContent = `Editing: ${furniture.Name}`;
        document.getElementById('furniture-name').value = furniture.Name || '';
        document.getElementById('furniture-es-name').value = furniture.es_Name || '';
        document.getElementById('furniture-price').value = furniture.Price || 0;
        document.getElementById('furniture-size-x').value = furniture.SizeX || 1;
        document.getElementById('furniture-size-y').value = furniture.SizeY || 1;
        document.getElementById('furniture-type').value = furniture.TypeOfSize || 'one_one';
        document.getElementById('furniture-tag').value = furniture.FurnitureTag || 'None';
        document.getElementById('furniture-bonus').value = furniture.TagMatchBonusPoints || 0;
        document.getElementById('furniture-wall').checked = furniture.WallObject === 'True';
        document.getElementById('furniture-labeler').checked = furniture.IsLabeler === 'True';
        
        const hasCombo = furniture.HasComboSprite === 'True';
        document.getElementById('furniture-combo').checked = hasCombo;
        document.getElementById('combo-section').style.display = hasCombo ? 'block' : 'none';
        
        if (hasCombo) {
            this.updateComboTriggerOptions();
            document.getElementById('furniture-combo-trigger').value = furniture.ComboTriggerFurniturePath || '';
        }
        
        this.populateCompatibleFurniture();
    }
    
    updateComboTriggerOptions() {
        const comboSelect = document.getElementById('furniture-combo-trigger');
        comboSelect.innerHTML = '<option value="">Select combo trigger...</option>';
        
        this.furnitureData.forEach(furniture => {
            if (furniture.AssetPath) {
                const option = document.createElement('option');
                option.value = furniture.AssetPath;
                option.textContent = furniture.Name;
                comboSelect.appendChild(option);
            }
        });
    }
    
    parseCompatibles(compatiblesString) {
        console.log("Parsing compatibles string:", compatiblesString);
        if (!compatiblesString || compatiblesString.trim() === '') {
            return [];
        }
        
        const result = compatiblesString.split(';')
            .map(path => path.trim())
            .filter(path => path !== '');
        
        console.log("Parsed compatibles:", result);
        return result;
    }

    populateCompatibleFurniture() {
        const container = document.getElementById('compatibles-container');
        container.innerHTML = '';
        
        if (this.selectedFurnitureIndex === -1) return;
        
        const currentFurniture = this.furnitureData[this.selectedFurnitureIndex];
        console.log("Current furniture:", currentFurniture);
        console.log("Compatibles field:", currentFurniture.Compatibles);
        
        const compatibles = this.parseCompatibles(currentFurniture.Compatibles || '');
        
        console.log(`Loading compatibles for ${currentFurniture.Name}:`, compatibles);
        
        this.furnitureData.forEach((furniture, index) => {
            if (index === this.selectedFurnitureIndex) return;
            
            const div = document.createElement('div');
            div.className = 'form-check compatible-item';
            
            const input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'checkbox';
            input.id = `compatible-${index}`;
            input.dataset.path = furniture.AssetPath;
            input.dataset.index = index;
            
            const isCompatible = compatibles.includes(furniture.AssetPath);
            input.checked = isCompatible;
            
            console.log(`Checking if ${furniture.AssetPath} is compatible:`, isCompatible);
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `compatible-${index}`;
            label.textContent = furniture.Name;
            
            div.appendChild(input);
            div.appendChild(label);
            container.appendChild(div);
        });
    }
    
    createNewFurniture() {
        const newFurniture = {
            AssetPath: '',
            Name: 'New Furniture',
            es_Name: '',
            Price: '0',
            SizeX: '1',
            SizeY: '1',
            TypeOfSize: 'one_one',
            PrefabPath: '',
            FurnitureTag: 'None',
            TagMatchBonusPoints: '0',
            WallObject: 'False',
            IsLabeler: 'False',
            HasComboSprite: 'False',
            ComboTriggerFurniturePath: '',
            Compatibles: ''
        };
        
        this.furnitureData.push(newFurniture);
        this.selectedFurnitureIndex = this.furnitureData.length - 1;
        this.renderFurnitureList();
        this.populateFurnitureDetails();
    }
    
    loadFurnitureItem(item) {
        document.getElementById('furniture-name').value = item.Name || '';
        document.getElementById('furniture-es-name').value = item.es_Name || '';
        document.getElementById('furniture-price').value = item.Price || '0';
        document.getElementById('furniture-size-x').value = item.SizeX || '1';
        document.getElementById('furniture-size-y').value = item.SizeY || '1';
        document.getElementById('furniture-type').value = item.TypeOfSize || 'one_one';
        document.getElementById('furniture-tag').value = item.FurnitureTag || 'None';
        document.getElementById('furniture-bonus').value = item.TagMatchBonusPoints || '0';
        
        document.getElementById('furniture-wall').checked = (item.IsWallObject || '').toLowerCase() === 'true';
        document.getElementById('furniture-labeler').checked = (item.IsLabeler || '').toLowerCase() === 'true';
        document.getElementById('furniture-combo').checked = (item.HasComboSprite || '').toLowerCase() === 'true';
        
        const comboSection = document.getElementById('combo-section');
        if (document.getElementById('furniture-combo').checked) {
            comboSection.style.display = 'block';
            document.getElementById('furniture-combo-trigger').value = item.ComboTriggerFurniturePath || '';
        } else {
            comboSection.style.display = 'none';
        }
        
        this.updateCompatibleFurnitureCheckboxes();
        
        const checkboxes = document.querySelectorAll('#compatibles-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        if (item.CompatibleFurniturePaths && Array.isArray(item.CompatibleFurniturePaths)) {
            item.CompatibleFurniturePaths.forEach(path => {
                const checkbox = document.querySelector(`#compatibles-container input[data-path="${path}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        } else if (typeof item.CompatibleFurniturePaths === 'string' && item.CompatibleFurniturePaths) {
            const paths = item.CompatibleFurniturePaths.split(';').map(p => p.trim());
            paths.forEach(path => {
                const checkbox = document.querySelector(`#compatibles-container input[data-path="${path}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        this.currentFurnitureItem = item;
    }

    updateCompatibleFurnitureCheckboxes() {
        const container = document.getElementById('compatibles-container');
        container.innerHTML = '';
        
        this.furnitureData.forEach(furniture => {
            if (furniture.AssetPath === this.currentFurnitureItem?.AssetPath) {
                return;
            }
            
            const div = document.createElement('div');
            div.className = 'form-check';
            
            const input = document.createElement('input');
            input.className = 'form-check-input compatible-furniture';
            input.type = 'checkbox';
            input.id = `compatible-${furniture.AssetPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
            input.setAttribute('data-path', furniture.AssetPath);
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = input.id;
            label.textContent = furniture.Name;
            
            div.appendChild(input);
            div.appendChild(label);
            container.appendChild(div);
        });
    }
    
    saveFurnitureChanges() {
        if (!this.currentFurnitureItem) return;
        
        const updatedItem = { ...this.currentFurnitureItem };
        updatedItem.Name = document.getElementById('furniture-name').value;
        updatedItem.es_Name = document.getElementById('furniture-es-name').value;
        updatedItem.Price = document.getElementById('furniture-price').value;
        updatedItem.SizeX = document.getElementById('furniture-size-x').value;
        updatedItem.SizeY = document.getElementById('furniture-size-y').value;
        updatedItem.TypeOfSize = document.getElementById('furniture-type').value;
        updatedItem.FurnitureTag = document.getElementById('furniture-tag').value;
        updatedItem.TagMatchBonusPoints = document.getElementById('furniture-bonus').value;
        updatedItem.IsWallObject = document.getElementById('furniture-wall').checked ? 'True' : 'False';
        updatedItem.IsLabeler = document.getElementById('furniture-labeler').checked ? 'True' : 'False';
        updatedItem.HasComboSprite = document.getElementById('furniture-combo').checked ? 'True' : 'False';
        
        if (document.getElementById('furniture-combo').checked) {
            updatedItem.ComboTriggerFurniturePath = document.getElementById('furniture-combo-trigger').value;
        } else {
            updatedItem.ComboTriggerFurniturePath = '';
        }
        
        const compatiblePaths = [];
        document.querySelectorAll('#compatibles-container input[type="checkbox"]:checked').forEach(checkbox => {
            compatiblePaths.push(checkbox.getAttribute('data-path'));
        });
        
        updatedItem.CompatibleFurniturePaths = compatiblePaths;
        
        const index = this.furnitureData.findIndex(item => item.AssetPath === updatedItem.AssetPath);
        if (index !== -1) {
            this.furnitureData[index] = updatedItem;
        }
        
        this.updateFurnitureList();
        
        alert('Furniture updated successfully!');
    }
    
    showImportModal(type) {
        const modal = new bootstrap.Modal(document.getElementById('import-modal'));
        document.getElementById('import-modal-title').textContent = 'Import Furniture Data';
        
        const confirmButton = document.getElementById('confirm-import');
        confirmButton.onclick = () => {
            const fileInput = document.getElementById('csv-file');
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const csvContent = e.target.result;
                    const parsedData = CSVHandler.parseCSV(csvContent);
                    
                    if (parsedData.furnitureData && parsedData.furnitureData.length > 0) {
                        this.loadFurnitureData(parsedData.furnitureData);
                        modal.hide();
                    } else {
                        alert('No valid furniture data found in the CSV file.');
                    }
                };
                
                reader.readAsText(file);
            } else {
                alert('Please select a file to import.');
            }
        };
        
        modal.show();
    }
    
    exportFurnitureData() {
        const headers = Object.keys(this.furnitureData[0]);
        
        let csvContent = headers.join(',') + '\n';
        
        this.furnitureData.forEach(item => {
            const values = headers.map(header => {
                let value = item[header];
                
                if (header === 'CompatibleFurniturePaths') {
                    if (Array.isArray(value)) {
                        value = value.join(';');
                    }
                    if (value && (value.includes(',') || value.includes(';'))) {
                        value = `"${value}"`;
                    }
                } else if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`;
                }
                
                return value || '';
            });
            
            csvContent += values.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'FurnitureData.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    updateFurnitureList() {
        const listContainer = document.getElementById('furniture-list');
        listContainer.innerHTML = '';
        
        document.getElementById('furniture-count').textContent = this.furnitureData.length;
        
        const searchTerm = document.getElementById('furniture-search').value.toLowerCase();
        const filteredFurniture = this.furnitureData.filter(item => 
            item.Name.toLowerCase().includes(searchTerm) || 
            (item.es_Name && item.es_Name.toLowerCase().includes(searchTerm))
        );
        
        filteredFurniture.forEach(item => {
            const listItem = document.createElement('a');
            listItem.href = '#';
            listItem.className = 'list-group-item list-group-item-action';
            if (this.currentFurnitureItem && this.currentFurnitureItem.AssetPath === item.AssetPath) {
                listItem.classList.add('active');
            }
            
            const itemContent = document.createElement('div');
            itemContent.className = 'furniture-item';
            
            const itemInfo = document.createElement('div');
            itemInfo.innerHTML = `
                <div>${item.Name}</div>
                <small class="text-muted">${item.FurnitureTag || 'No tag'}</small>
            `;
            
            const itemActions = document.createElement('div');
            itemActions.className = 'furniture-item-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDeleteConfirmation(item);
            });
            
            itemActions.appendChild(deleteBtn);
            
            itemContent.appendChild(itemInfo);
            itemContent.appendChild(itemActions);
            
            listItem.appendChild(itemContent);
            
            listItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadFurnitureItem(item);
                
                document.querySelectorAll('#furniture-list .list-group-item').forEach(el => {
                    el.classList.remove('active');
                });
                listItem.classList.add('active');
            });
            
            listContainer.appendChild(listItem);
        });
    }

    showDeleteConfirmation(item) {
        document.getElementById('delete-item-name').textContent = item.Name;
        
        const confirmButton = document.getElementById('confirm-delete');
        confirmButton.onclick = () => {
            this.deleteFurniture(item);
            const modal = bootstrap.Modal.getInstance(document.getElementById('delete-modal'));
            modal.hide();
        };
        
        const modal = new bootstrap.Modal(document.getElementById('delete-modal'));
        modal.show();
    }

    deleteFurniture(item) {
        const index = this.furnitureData.findIndex(furniture => furniture.AssetPath === item.AssetPath);
        if (index !== -1) {
            this.furnitureData.splice(index, 1);
            
            if (this.currentFurnitureItem && this.currentFurnitureItem.AssetPath === item.AssetPath) {
                this.currentFurnitureItem = null;
                this.clearFurnitureForm();
            }
            
            this.updateFurnitureList();
            
            this.updateComboTriggerOptions();
        }
    }

    clearFurnitureForm() {
        document.getElementById('furniture-form').reset();
        document.getElementById('furniture-details-title').textContent = 'Furniture Details';
        document.getElementById('furniture-tag-badge').textContent = 'None';
        document.getElementById('combo-section').style.display = 'none';
    }

    loadFurnitureItem(item) {
        document.getElementById('furniture-name').value = item.Name || '';
        document.getElementById('furniture-es-name').value = item.es_Name || '';
        document.getElementById('furniture-price').value = item.Price || '0';
        document.getElementById('furniture-size-x').value = item.SizeX || '1';
        document.getElementById('furniture-size-y').value = item.SizeY || '1';
        document.getElementById('furniture-type').value = item.TypeOfSize || 'one_one';
        document.getElementById('furniture-tag').value = item.FurnitureTag || 'None';
        document.getElementById('furniture-bonus').value = item.TagMatchBonusPoints || '0';
        
        document.getElementById('furniture-wall').checked = (item.IsWallObject || '').toLowerCase() === 'true';
        document.getElementById('furniture-labeler').checked = (item.IsLabeler || '').toLowerCase() === 'true';
        document.getElementById('furniture-combo').checked = (item.HasComboSprite || '').toLowerCase() === 'true';
        
        const comboSection = document.getElementById('combo-section');
        if (document.getElementById('furniture-combo').checked) {
            comboSection.style.display = 'block';
            document.getElementById('furniture-combo-trigger').value = item.ComboTriggerFurniturePath || '';
        } else {
            comboSection.style.display = 'none';
        }
        
        document.getElementById('furniture-details-title').textContent = item.Name;
        document.getElementById('furniture-tag-badge').textContent = item.FurnitureTag || 'None';
        
        this.updateCompatibleFurnitureCheckboxes();
        
        const checkboxes = document.querySelectorAll('#compatibles-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        if (item.CompatibleFurniturePaths && Array.isArray(item.CompatibleFurniturePaths)) {
            item.CompatibleFurniturePaths.forEach(path => {
                const checkbox = document.querySelector(`#compatibles-container input[data-path="${path}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        } else if (typeof item.CompatibleFurniturePaths === 'string' && item.CompatibleFurniturePaths) {
            const paths = item.CompatibleFurniturePaths.split(';').map(p => p.trim());
            paths.forEach(path => {
                const checkbox = document.querySelector(`#compatibles-container input[data-path="${path}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        this.currentFurnitureItem = item;
    }
}