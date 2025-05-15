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
        
        const formFields = [
            'furniture-name', 'furniture-es-name', 'furniture-price',
            'furniture-size-x', 'furniture-size-y', 'furniture-type',
            'furniture-tag', 'furniture-bonus', 'furniture-wall',
            'furniture-combo', 'furniture-combo-trigger',
            'furniture-requires-base', 'furniture-base-object'
        ];
        
        formFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                const eventType = element.type === 'checkbox' ? 'change' : 'input';
                element.addEventListener(eventType, () => {
                    this.autoSaveChanges();
                });
            }
        });
        
        document.getElementById('compatibles-container').addEventListener('change', (e) => {
            if (e.target.classList.contains('form-check-input')) {
                this.autoSaveChanges();
            }
        });

        document.getElementById('furniture-requires-base').addEventListener('change', (e) => {
            document.getElementById('base-object-section').style.display = e.target.checked ? 'block' : 'none';
        });
    }
    
    autoSaveChanges() {
        // Only save if a furniture item is selected
        if (this.selectedFurnitureIndex !== -1) {
            this.saveCurrentFurnitureChanges();
            console.log('Auto-saved changes');
        }
    }

    updateBaseObjectOptions() {
        const baseObjectSelect = document.getElementById('furniture-base-object');
        baseObjectSelect.innerHTML = '<option value="">Select base object...</option>';
        
        this.furnitureData.forEach(furniture => {
            // All furniture can potentially be a base
            const option = document.createElement('option');
            option.value = furniture.AssetPath;
            option.textContent = furniture.Name;
            baseObjectSelect.appendChild(option);
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
        this.updateBaseObjectOptions();
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
        // Save current furniture changes if any
        if (this.selectedFurnitureIndex !== -1) {
            this.saveCurrentFurnitureChanges();
        }
        
        this.selectedFurnitureIndex = index;
        this.renderFurnitureList();
        this.populateFurnitureDetails();
        
        console.log("Selected furniture index:", index);
    }
    
    saveCurrentFurnitureChanges() {
        if (this.selectedFurnitureIndex === -1) return;
        
        const furniture = this.furnitureData[this.selectedFurnitureIndex];
        
        // Update furniture object with form values
        furniture.Name = document.getElementById('furniture-name').value;
        furniture.es_Name = document.getElementById('furniture-es-name').value;
        furniture.Price = document.getElementById('furniture-price').value;
        furniture.SizeX = document.getElementById('furniture-size-x').value;
        furniture.SizeY = document.getElementById('furniture-size-y').value;
        furniture.TypeOfSize = document.getElementById('furniture-type').value;
        furniture.FurnitureTag = document.getElementById('furniture-tag').value;
        furniture.TagMatchBonusPoints = document.getElementById('furniture-bonus').value;
        furniture.IsWallObject = document.getElementById('furniture-wall').checked ? "True" : "False";
        furniture.HasComboSprite = document.getElementById('furniture-combo').checked ? "True" : "False";
        furniture.RequiresBase = document.getElementById('furniture-requires-base').checked ? "True" : "False";
        
        if (furniture.HasComboSprite === "True") {
            furniture.ComboTriggerFurniturePath = document.getElementById('furniture-combo-trigger').value;
        } else {
            furniture.ComboTriggerFurniturePath = '';
        }

        if (furniture.RequiresBase === "True") {
            furniture.RequiredBasePath = document.getElementById('furniture-base-object').value;
        } else {
            furniture.RequiredBasePath = '';
        }
        
        // Get compatibles from the UI
        const compatiblesContainer = document.getElementById('compatibles-container');
        const checkboxes = compatiblesContainer.querySelectorAll('input[type="checkbox"]');
        furniture.Compatibles = '';
        
        const compatiblePaths = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                compatiblePaths.push(checkbox.dataset.path);
            }
        });
        
        if (compatiblePaths.length > 0) {
            furniture.Compatibles = compatiblePaths.join(';');
        }
        
        // Save to local storage
        localStorage.setItem('furnitureData', JSON.stringify(this.furnitureData));
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
        
        const hasCombo = furniture.HasComboSprite === 'True';
        document.getElementById('furniture-combo').checked = hasCombo;
        document.getElementById('combo-section').style.display = hasCombo ? 'block' : 'none';
        
        if (hasCombo) {
            this.updateComboTriggerOptions();
            document.getElementById('furniture-combo-trigger').value = furniture.ComboTriggerFurniturePath || '';
        }

        const requiresBase = furniture.RequiresBase === 'True';
        document.getElementById('furniture-requires-base').checked = requiresBase;
        document.getElementById('base-object-section').style.display = requiresBase ? 'block' : 'none';
        
        if (requiresBase) {
            this.updateBaseObjectOptions();
            document.getElementById('furniture-base-object').value = furniture.RequiredBasePath || '';
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

        compatiblesString = String(compatiblesString || '');
        
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
        
        // Ensure Compatibles is a string
        const compatiblesString = String(currentFurniture.Compatibles || '');
        console.log("Compatibles field:", compatiblesString);
        
        // Parse compatibles string to array
        const compatibles = compatiblesString.split(';')
            .map(path => path.trim())
            .filter(path => path !== '');
        
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
            HasComboSprite: 'False',
            ComboTriggerFurniturePath: '',
            Compatibles: '',
            RequiresBase: 'False',
            RequiredBasePath: ''
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
        this.saveCurrentFurnitureChanges();
        
        // Show success message
        alert('Furniture data saved successfully!');
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

    importFurnitureData(csvContent) {
        try {
            // Parse CSV content to array of objects
            const parsedData = this.parseCSV(csvContent);
            
            if (parsedData && parsedData.length > 0) {
                this.furnitureData = parsedData;
                this.renderFurnitureList();
                this.updateComboTriggerOptions();
                
                // Save to localStorage
                localStorage.setItem('furnitureData', JSON.stringify(this.furnitureData));
                
                alert(`Successfully imported ${parsedData.length} furniture items.`);
            } else {
                alert('No valid furniture data found in the CSV file.');
            }
        } catch (error) {
            console.error('Error importing furniture data:', error);
            alert('Error importing furniture data. Please check the console for details.');
        }
    }

    parseCSV(csvContent) {
        // Split by lines and get headers
        const lines = csvContent.split('\n');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Parse each line into an object
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) continue; // Skip invalid lines
            
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            
            result.push(obj);
        }
        
        return result;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    toggleCsvPreview() {
        const previewContainer = document.getElementById('csv-preview-container');
        if (previewContainer.style.display === 'none') {
            // Generate Excel-style preview
            this.generateExcelStylePreview();
            previewContainer.style.display = 'block';
            document.getElementById('toggle-csv-preview').innerHTML = '<i class="fas fa-times me-1"></i> Hide CSV Preview';
        } else {
            previewContainer.style.display = 'none';
            document.getElementById('toggle-csv-preview').innerHTML = '<i class="fas fa-table me-1"></i> Show CSV Preview';
        }
    }

    generateExcelStylePreview() {
        const previewContent = document.getElementById('csv-preview-content');
        previewContent.innerHTML = '';
        
        if (this.furnitureData.length === 0) {
            previewContent.innerHTML = '<div class="alert alert-info">No furniture data available.</div>';
            return;
        }
        
        // Add Excel controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'excel-controls p-2 bg-light border-bottom';
        
        // Add search box
        const searchDiv = document.createElement('div');
        searchDiv.className = 'excel-search';
        searchDiv.innerHTML = `
            <input type="text" class="form-control form-control-sm" id="excel-search-input" placeholder="Search in table...">
            <span class="search-icon"><i class="fas fa-search"></i></span>
        `;
        controlsDiv.appendChild(searchDiv);
        
        // Add view options
        const viewOptionsDiv = document.createElement('div');
        viewOptionsDiv.className = 'btn-group btn-group-sm';
        viewOptionsDiv.innerHTML = `
            <button class="btn btn-outline-secondary" id="expand-all-cells">
                <i class="fas fa-expand-arrows-alt me-1"></i> Expand All
            </button>
            <button class="btn btn-outline-secondary" id="collapse-all-cells">
                <i class="fas fa-compress-arrows-alt me-1"></i> Collapse All
            </button>
        `;
        controlsDiv.appendChild(viewOptionsDiv);
        
        previewContent.appendChild(controlsDiv);
        
        // Create a scrollable container for the table
        const tableContainer = document.createElement('div');
        tableContainer.style.overflow = 'auto';
        tableContainer.style.height = 'calc(100% - 50px)'; // Adjust for the controls height
        previewContent.appendChild(tableContainer);
        
        // Get all possible headers from all furniture items
        const allHeaders = new Set();
        this.furnitureData.forEach(item => {
            Object.keys(item).forEach(key => allHeaders.add(key));
        });
        
        const headers = Array.from(allHeaders);
        
        // Create table element
        const table = document.createElement('table');
        table.className = 'table table-sm table-bordered table-striped excel-preview';
        
        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            
            // Add resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            th.appendChild(resizeHandle);
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body with data rows
        const tbody = document.createElement('tbody');
        
        this.furnitureData.forEach((item, rowIndex) => {
            const row = document.createElement('tr');
            
            headers.forEach(header => {
                const cell = document.createElement('td');
                const value = item[header] || '';
                cell.textContent = value;
                
                // Add title attribute for tooltip on hover
                if (value.length > 30) {
                    cell.setAttribute('title', value);
                    cell.setAttribute('data-full-text', value);
                    
                    // Add click handler to expand/collapse
                    cell.addEventListener('click', function() {
                        this.classList.toggle('expanded');
                    });
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        // Initialize column resizing
        this.initColumnResizing(table);
        
        // Initialize search functionality
        this.initExcelSearch();
        
        // Initialize expand/collapse buttons
        document.getElementById('expand-all-cells').addEventListener('click', () => {
            document.querySelectorAll('.excel-preview td').forEach(cell => {
                if (cell.getAttribute('data-full-text')) {
                    cell.classList.add('expanded');
                }
            });
        });
        
        document.getElementById('collapse-all-cells').addEventListener('click', () => {
            document.querySelectorAll('.excel-preview td').forEach(cell => {
                cell.classList.remove('expanded');
            });
        });
    }

    initColumnResizing(table) {
        const cols = table.querySelectorAll('th');
        
        [].forEach.call(cols, function(col) {
            // Add event listener for mousedown on the resize handle
            const resizeHandle = col.querySelector('.resize-handle');
            resizeHandle.addEventListener('mousedown', function(e) {
                e.preventDefault();
                
                const startX = e.pageX;
                const startWidth = col.offsetWidth;
                
                // Add mousemove event listener to the document
                document.addEventListener('mousemove', onMouseMove);
                
                // Add mouseup event listener to the document
                document.addEventListener('mouseup', onMouseUp);
                
                function onMouseMove(e) {
                    const width = startWidth + (e.pageX - startX);
                    col.style.width = width + 'px';
                    col.style.minWidth = width + 'px';
                }
                
                function onMouseUp() {
                    // Remove event listeners
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
            });
        });
    }

    initExcelSearch() {
        const searchInput = document.getElementById('excel-search-input');
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cells = document.querySelectorAll('.excel-preview td');
            
            cells.forEach(cell => {
                // Remove any existing highlights
                const text = cell.getAttribute('data-full-text') || cell.textContent;
                cell.textContent = text;
                
                if (searchTerm && text.toLowerCase().includes(searchTerm)) {
                    // Highlight the cell
                    cell.classList.add('highlight-match');
                    
                    // Expand the cell if it contains the search term
                    if (cell.getAttribute('data-full-text')) {
                        cell.classList.add('expanded');
                    }
                } else {
                    cell.classList.remove('highlight-match');
                }
            });
        });
    }
}