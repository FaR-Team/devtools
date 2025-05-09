const colorInputs = ['darkest', 'dark', 'light', 'lightest'];
let extractedColors = [];
let paletteLibrary = [];

function loadLibrary() {
    const savedLibrary = localStorage.getItem('paletteLibrary');
    if (savedLibrary) {
        paletteLibrary = JSON.parse(savedLibrary);
        renderLibrary();
    }
}

function saveLibrary() {
    localStorage.setItem('paletteLibrary', JSON.stringify(paletteLibrary));
}

function renderLibrary() {
    const libraryElement = document.getElementById('paletteLibrary');
    const emptyLibrary = document.getElementById('emptyLibrary');
    const searchTerm = document.getElementById('searchLibrary').value.toLowerCase();
    
    const filteredPalettes = paletteLibrary.filter(palette => 
        palette.name.toLowerCase().includes(searchTerm)
    );
    
    libraryElement.innerHTML = '';
    
    if (filteredPalettes.length === 0) {
        libraryElement.appendChild(emptyLibrary);
        return;
    }
    
    const gridContainer = document.createElement('div');
    gridContainer.className = 'palette-grid';
    libraryElement.appendChild(gridContainer);
    
    filteredPalettes.forEach((palette, index) => {
        const paletteItem = document.createElement('div');
        paletteItem.className = 'library-item';
        paletteItem.dataset.index = index;
        paletteItem.innerHTML = `
            <div class="library-item-name" title="${palette.name}">${palette.name}</div>
            <div class="palette-preview-container">
                <div class="palette-preview-row" style="background-color: ${stripAlphaChannel(palette.darkestHex)}"></div>
                <div class="palette-preview-row" style="background-color: ${stripAlphaChannel(palette.darkHex)}"></div>
                <div class="palette-preview-row" style="background-color: ${stripAlphaChannel(palette.lightHex)}"></div>
                <div class="palette-preview-row" style="background-color: ${stripAlphaChannel(palette.lightestHex)}"></div>
            </div>
            <div class="library-item-actions">
                <button class="load-palette-btn btn btn-sm btn-primary" data-index="${index}" title="Load Palette"><i class="fas fa-upload"></i></button>
                <button class="delete-palette-btn btn btn-sm btn-danger" data-index="${index}" title="Delete Palette"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        gridContainer.appendChild(paletteItem);
        
        paletteItem.querySelector('.load-palette-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            loadPaletteFromLibrary(index);
        });
        
        paletteItem.querySelector('.delete-palette-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deletePaletteFromLibrary(index);
        });
        
        paletteItem.addEventListener('click', () => {
            loadPaletteFromLibrary(index);
        });
    });
}

function loadPaletteFromLibrary(index) {
    const palette = paletteLibrary[index];
    
    document.getElementById('paletteName').value = palette.name;
    
    document.getElementById('darkestHex').value = stripAlphaChannel(palette.darkestHex);
    document.getElementById('darkestColor').value = stripAlphaChannel(palette.darkestHex);
    document.getElementById('darkestPreview').style.backgroundColor = stripAlphaChannel(palette.darkestHex);
    document.getElementById('darkestRow').style.backgroundColor = stripAlphaChannel(palette.darkestHex);
    
    document.getElementById('darkHex').value = stripAlphaChannel(palette.darkHex);
    document.getElementById('darkColor').value = stripAlphaChannel(palette.darkHex);
    document.getElementById('darkPreview').style.backgroundColor = stripAlphaChannel(palette.darkHex);
    document.getElementById('darkRow').style.backgroundColor = stripAlphaChannel(palette.darkHex);
    
    document.getElementById('lightHex').value = stripAlphaChannel(palette.lightHex);
    document.getElementById('lightColor').value = stripAlphaChannel(palette.lightHex);
    document.getElementById('lightPreview').style.backgroundColor = stripAlphaChannel(palette.lightHex);
    document.getElementById('lightRow').style.backgroundColor = stripAlphaChannel(palette.lightHex);
    
    document.getElementById('lightestHex').value = stripAlphaChannel(palette.lightestHex);
    document.getElementById('lightestColor').value = stripAlphaChannel(palette.lightestHex);
    document.getElementById('lightestPreview').style.backgroundColor = stripAlphaChannel(palette.lightestHex);
    document.getElementById('lightestRow').style.backgroundColor = stripAlphaChannel(palette.lightestHex);
    
    document.querySelector('.nav-link[data-tab="editor"]').click();
}

function stripAlphaChannel(hexColor) {
    if (hexColor && hexColor.length === 9) {
        return hexColor.substring(0, 7);
    }
    return hexColor;
}

function deletePaletteFromLibrary(index) {
    if (confirm(`Are you sure you want to delete the palette "${paletteLibrary[index].name}"?`)) {
        paletteLibrary.splice(index, 1);
        saveLibrary();
        renderLibrary();
    }
}

function addToLibrary() {
    const paletteName = document.getElementById('paletteName').value || 'NewPalette';
    
    const existingIndex = paletteLibrary.findIndex(p => p.name === paletteName);
    
    const paletteData = {
        name: paletteName,
        darkestHex: document.getElementById('darkestHex').value,
        darkHex: document.getElementById('darkHex').value,
        lightHex: document.getElementById('lightHex').value,
        lightestHex: document.getElementById('lightestHex').value
    };
    
    if (existingIndex >= 0) {
        if (confirm(`A palette named "${paletteName}" already exists. Do you want to replace it?`)) {
            paletteLibrary[existingIndex] = paletteData;
        } else {
            return;
        }
    } else {
        paletteLibrary.push(paletteData);
    }
    
    saveLibrary();
    renderLibrary();
    
    alert(`Palette "${paletteName}" has been added to your library.`);
}

document.querySelectorAll('.nav-link[data-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        const tabName = tab.dataset.tab;
        
        const tabContent = document.getElementById(`${tabName}-tab`);
        
        if (tabContent) {
            document.querySelectorAll('.nav-link[data-tab]').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            
            tabContent.classList.add('active');
        }
    });
});

colorInputs.forEach(type => {
    const colorInput = document.getElementById(`${type}Color`);
    const hexInput = document.getElementById(`${type}Hex`);
    const preview = document.getElementById(`${type}Preview`);
    const previewRow = document.getElementById(`${type}Row`);
    
    colorInput.addEventListener('input', () => {
        hexInput.value = colorInput.value;
        preview.style.backgroundColor = colorInput.value;
        previewRow.style.backgroundColor = colorInput.value;
    });
    
    hexInput.addEventListener('input', () => {
        if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
            colorInput.value = hexInput.value;
            preview.style.backgroundColor = hexInput.value;
            previewRow.style.backgroundColor = hexInput.value;
        }
    });
    
    preview.style.backgroundColor = colorInput.value;
    previewRow.style.backgroundColor = colorInput.value;
});

document.getElementById('imageInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            processImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function processImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const errorElement = document.getElementById('imageError');
    const applyBtn = document.getElementById('applyImageBtn');
    
    if ((img.width === 4 && img.height === 1) || (img.width === 1 && img.height === 4)) {
        errorElement.style.display = 'none';
        applyBtn.style.display = 'block';
        
        extractedColors = [];
        
        if (img.width === 4) {
            for (let x = 0; x < 4; x++) {
                const pixelData = ctx.getImageData(x, 0, 1, 1).data;
                const color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
                extractedColors.push(color);
                document.getElementById(`pixel${x}`).style.backgroundColor = color;
            }
        } else {
            for (let y = 0; y < 4; y++) {
                const pixelData = ctx.getImageData(0, y, 1, 1).data;
                const color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
                extractedColors.push(color);
                document.getElementById(`pixel${y}`).style.backgroundColor = color;
            }
        }
    } else {
        errorElement.textContent = 'Image must be exactly 4x1 or 1x4 pixels.';
        errorElement.style.display = 'block';
        applyBtn.style.display = 'none';
        
        for (let i = 0; i < 4; i++) {
            document.getElementById(`pixel${i}`).style.backgroundColor = 'transparent';
        }
    }
}

document.getElementById('applyImageBtn').addEventListener('click', () => {
    if (extractedColors.length === 4) {
        const types = ['darkest', 'dark', 'light', 'lightest'];
        
        types.forEach((type, index) => {
            const color = extractedColors[index];
            document.getElementById(`${type}Color`).value = color;
            document.getElementById(`${type}Hex`).value = color;
            document.getElementById(`${type}Preview`).style.backgroundColor = color;
            document.getElementById(`${type}Row`).style.backgroundColor = color;
        });
        
        document.querySelector('.nav-link[data-tab="editor"]').click();
    }
});

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

document.getElementById('saveBtn').addEventListener('click', () => {
    const paletteName = document.getElementById('paletteName').value || 'NewPalette';
    
    const paletteData = {
        name: paletteName,
        darkestHex: document.getElementById('darkestHex').value,
        darkHex: document.getElementById('darkHex').value,
        lightHex: document.getElementById('lightHex').value,
        lightestHex: document.getElementById('lightestHex').value
    };
    
    const jsonData = JSON.stringify(paletteData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paletteName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('loadBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const paletteData = JSON.parse(e.target.result);
            
            document.getElementById('paletteName').value = paletteData.name || 'NewPalette';
            
            if (paletteData.darkestHex) {
                document.getElementById('darkestHex').value = paletteData.darkestHex;
                document.getElementById('darkestColor').value = paletteData.darkestHex;
                document.getElementById('darkestPreview').style.backgroundColor = paletteData.darkestHex;
                document.getElementById('darkestRow').style.backgroundColor = paletteData.darkestHex;
            }
            
            if (paletteData.darkHex) {
                document.getElementById('darkHex').value = paletteData.darkHex;
                document.getElementById('darkColor').value = paletteData.darkHex;
                document.getElementById('darkPreview').style.backgroundColor = paletteData.darkHex;
                document.getElementById('darkRow').style.backgroundColor = paletteData.darkHex;
            }
            
            if (paletteData.lightHex) {
                document.getElementById('lightHex').value = paletteData.lightHex;
                document.getElementById('lightColor').value = paletteData.lightHex;
                document.getElementById('lightPreview').style.backgroundColor = paletteData.lightHex;
                document.getElementById('lightRow').style.backgroundColor = paletteData.lightHex;
            }
            
            if (paletteData.lightestHex) {
                document.getElementById('lightestHex').value = paletteData.lightestHex;
                document.getElementById('lightestColor').value = paletteData.lightestHex;
                document.getElementById('lightestPreview').style.backgroundColor = paletteData.lightestHex;
                document.getElementById('lightestRow').style.backgroundColor = paletteData.lightestHex;
            }
        } catch (error) {
            alert('Error loading palette: ' + error.message);
        }
    };
    reader.readAsText(file);
});

document.getElementById('addToLibraryBtn').addEventListener('click', addToLibrary);

document.getElementById('searchLibrary').addEventListener('input', renderLibrary);

loadLibrary();

function exportAllPalettes() {
    if (paletteLibrary.length === 0) {
        alert("Your palette library is empty. Add some palettes first.");
        return;
    }

    const zip = new JSZip();

    paletteLibrary.forEach(palette => {
        const jsonData = JSON.stringify(palette, null, 2);
        zip.file(`${palette.name}.json`, jsonData);
    });

    zip.generateAsync({type: "blob"}).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "RoomMakers_Palettes.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function exportAllPalettes() {
    if (paletteLibrary.length === 0) {
        alert("Your palette library is empty. Add some palettes first.");
        return;
    }

    const zip = new JSZip();

    paletteLibrary.forEach(palette => {
        const jsonData = JSON.stringify(palette, null, 2);
        zip.file(`${palette.name}.json`, jsonData);
    });

    zip.generateAsync({type: "blob"}).then(function(content) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "RoomMakers_Palettes.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function importAllPalettes(files) {
    if (files.length === 0) return;
    
    let importCount = 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name.endsWith('.json')) continue;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const paletteData = JSON.parse(e.target.result);
                
                const existingIndex = paletteLibrary.findIndex(p => p.name === paletteData.name);
                
                if (existingIndex >= 0) {
                    paletteLibrary[existingIndex] = paletteData;
                } else {
                    paletteLibrary.push(paletteData);
                }
                
                importCount++;
                
                if (i === files.length - 1) {
                    saveLibrary();
                    renderLibrary();
                    alert(`Imported ${importCount} palettes to your library.`);
                }
            } catch (error) {
                console.error(`Error importing ${file.name}: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
}

document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('saveBtn').click();
    }
    
    // Ctrl+O to load
    if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        document.getElementById('loadBtn').click();
    }
    
    // Ctrl+L to add to library
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        addToLibrary();
    }
    
    // Ctrl+R to randomize
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        randomizePalette();
    }
    
    // Ctrl+E to export library
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportAllPalettes();
    }
});

const imageDropZone = document.getElementById('image-import-tab');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    imageDropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    imageDropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    imageDropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    imageDropZone.classList.add('highlight');
}

function unhighlight() {
    imageDropZone.classList.remove('highlight');
}

imageDropZone.addEventListener('drop', handleImageDrop, false);

function handleImageDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        document.getElementById('imageInput').files = files;
        const event = new Event('change');
        document.getElementById('imageInput').dispatchEvent(event);
    }
}

const libraryDropZone = document.getElementById('paletteLibrary');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    libraryDropZone.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    libraryDropZone.addEventListener(eventName, () => {
        libraryDropZone.classList.add('highlight');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    libraryDropZone.addEventListener(eventName, () => {
        libraryDropZone.classList.remove('highlight');
    }, false);
});

libraryDropZone.addEventListener('drop', handleLibraryDrop, false);

function handleLibraryDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    importAllPalettes(files);
}

document.addEventListener('contextmenu', function(e) {
    const libraryPanel = document.querySelector('.library-panel');
    if (libraryPanel.contains(e.target)) {
        e.preventDefault();
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.position = 'absolute';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.style.backgroundColor = 'white';
        contextMenu.style.border = '1px solid #ccc';
        contextMenu.style.borderRadius = '5px';
        contextMenu.style.padding = '5px 0';
        contextMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        contextMenu.style.zIndex = '1000';
        
        const exportAllItem = document.createElement('div');
        exportAllItem.textContent = 'Export All Palettes';
        exportAllItem.style.padding = '8px 15px';
        exportAllItem.style.cursor = 'pointer';
        exportAllItem.addEventListener('mouseover', () => {
            exportAllItem.style.backgroundColor = '#f0f0f0';
        });
        exportAllItem.addEventListener('mouseout', () => {
            exportAllItem.style.backgroundColor = 'transparent';
        });
        exportAllItem.addEventListener('click', () => {
            document.body.removeChild(contextMenu);
            exportAllPalettes();
        });
        
        const importItem = document.createElement('div');
        importItem.textContent = 'Import Palettes';
        importItem.style.padding = '8px 15px';
        importItem.style.cursor = 'pointer';
        importItem.addEventListener('mouseover', () => {
            importItem.style.backgroundColor = '#f0f0f0';
        });
        importItem.addEventListener('mouseout', () => {
            importItem.style.backgroundColor = 'transparent';
        });
        importItem.addEventListener('click', () => {
            document.body.removeChild(contextMenu);
            
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.json';
            input.addEventListener('change', (e) => {
                importAllPalettes(e.target.files);
            });
            input.click();
        });
        
        contextMenu.appendChild(exportAllItem);
        contextMenu.appendChild(importItem);
        
        document.body.appendChild(contextMenu);
        
        document.addEventListener('click', function closeMenu() {
            if (document.body.contains(contextMenu)) {
                document.body.removeChild(contextMenu);
            }
            document.removeEventListener('click', closeMenu);
        });
    }
});

function loadDefaultPalettes() {
    fetch('./palettes/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Palettes directory not found');
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');
            
            const jsonFiles = Array.from(links)
                .map(link => link.href)
                .filter(href => href.endsWith('.json'))
                .map(href => href.split('/').pop());
            
            if (jsonFiles.length === 0) {
                throw new Error('No palette files found');
            }
            
            const savedLibrary = localStorage.getItem('paletteLibrary');
            const existingPalettes = savedLibrary ? JSON.parse(savedLibrary) : [];
            
            if (existingPalettes.length === 0) {
                loadPaletteFiles(jsonFiles, []);
            } else {
                if (confirm(`You already have ${existingPalettes.length} palettes in your library. Would you like to add the palettes from the game? Click Cancel to keep only your existing palettes.`)) {
                    loadPaletteFiles(jsonFiles, existingPalettes);
                }
            }
        })
        .catch(error => {
            console.error('Error loading default palettes:', error);
        });
}

function loadPaletteFiles(fileNames, existingPalettes) {
    const existingNames = existingPalettes.map(p => p.name);
    let loadedCount = 0;
    let newPalettes = [...existingPalettes];
    
    fileNames.forEach(fileName => {
        fetch(`palettes/${fileName}`)
            .then(response => response.json())
            .then(palette => {
                if (!existingNames.includes(palette.name)) {
                    newPalettes.push(palette);
                    loadedCount++;
                }
                
                if (loadedCount === fileNames.length) {
                    paletteLibrary = newPalettes;
                    saveLibrary();
                    renderLibrary();
                    console.log(`Loaded ${loadedCount} new palettes from files.`);
                }
            })
            .catch(error => {
                console.error(`Error loading palette ${fileName}:`, error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    colorInputs.forEach(type => {
        const colorInput = document.getElementById(`${type}Color`);
        const hexInput = document.getElementById(`${type}Hex`);
        const preview = document.getElementById(`${type}Preview`);
        const previewRow = document.getElementById(`${type}Row`);
        
        colorInput.addEventListener('input', () => {
            hexInput.value = colorInput.value;
            preview.style.backgroundColor = colorInput.value;
            previewRow.style.backgroundColor = colorInput.value;
        });
        
        hexInput.addEventListener('input', () => {
            if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
                colorInput.value = hexInput.value;
                preview.style.backgroundColor = hexInput.value;
                previewRow.style.backgroundColor = hexInput.value;
            }
        });
        
        preview.style.backgroundColor = colorInput.value;
        previewRow.style.backgroundColor = colorInput.value;
    });
    
    document.getElementById('saveBtn').addEventListener('click', savePalette);
    document.getElementById('loadBtn').addEventListener('click', loadPalette);
    document.getElementById('addToLibraryBtn').addEventListener('click', addToLibrary);
    document.getElementById('randomizeBtn').addEventListener('click', randomizePalette);
    document.getElementById('exportLibraryBtn').addEventListener('click', exportAllPalettes);
    document.getElementById('searchLibrary').addEventListener('input', renderLibrary);
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    document.getElementById('applyImageBtn').addEventListener('click', applyExtractedColors);
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    document.querySelectorAll('.nav-link[data-tab]').forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });
    
    loadLibrary();
    loadDefaultPalettes();
});

function savePalette() {
    const paletteName = document.getElementById('paletteName').value || 'NewPalette';
    
    const paletteData = {
        name: paletteName,
        darkestHex: document.getElementById('darkestHex').value,
        darkHex: document.getElementById('darkHex').value,
        lightHex: document.getElementById('lightHex').value,
        lightestHex: document.getElementById('lightestHex').value
    };
    
    const jsonData = JSON.stringify(paletteData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paletteName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadPalette() {
    document.getElementById('fileInput').click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const paletteData = JSON.parse(e.target.result);
            
            document.getElementById('paletteName').value = paletteData.name || 'NewPalette';
            
            if (paletteData.darkestHex) {
                document.getElementById('darkestHex').value = paletteData.darkestHex;
                document.getElementById('darkestColor').value = paletteData.darkestHex;
                document.getElementById('darkestPreview').style.backgroundColor = paletteData.darkestHex;
                document.getElementById('darkestRow').style.backgroundColor = paletteData.darkestHex;
            }
            
            if (paletteData.darkHex) {
                document.getElementById('darkHex').value = paletteData.darkHex;
                document.getElementById('darkColor').value = paletteData.darkHex;
                document.getElementById('darkPreview').style.backgroundColor = paletteData.darkHex;
                document.getElementById('darkRow').style.backgroundColor = paletteData.darkHex;
            }
            
            if (paletteData.lightHex) {
                document.getElementById('lightHex').value = paletteData.lightHex;
                document.getElementById('lightColor').value = paletteData.lightHex;
                document.getElementById('lightPreview').style.backgroundColor = paletteData.lightHex;
                document.getElementById('lightRow').style.backgroundColor = paletteData.lightHex;
            }
            
            if (paletteData.lightestHex) {
                document.getElementById('lightestHex').value = paletteData.lightestHex;
                document.getElementById('lightestColor').value = paletteData.lightestHex;
                document.getElementById('lightestPreview').style.backgroundColor = paletteData.lightestHex;
                document.getElementById('lightestRow').style.backgroundColor = paletteData.lightestHex;
            }
        } catch (error) {
            alert('Error loading palette: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            processImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleTabClick(e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link[data-tab]').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    e.target.classList.add('active');
    
    const tabName = e.target.dataset.tab;
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function applyExtractedColors() {
    if (extractedColors.length === 4) {
        const types = ['darkest', 'dark', 'light', 'lightest'];
        
        types.forEach((type, index) => {
            const color = extractedColors[index];
            document.getElementById(`${type}Color`).value = color;
            document.getElementById(`${type}Hex`).value = color;
            document.getElementById(`${type}Preview`).style.backgroundColor = color;
            document.getElementById(`${type}Row`).style.backgroundColor = color;
        });
        
        document.querySelector('.nav-link[data-tab="editor"]').click();
    }
}

function generateRandomColor(brightness) {
    let r, g, b;
    
    const hue = Math.random();
    const saturation = 0.5 + Math.random() * 0.5;
    
    function hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    [r, g, b] = hslToRgb(hue, saturation, brightness);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function randomizePalette() {
    const darkestColor = generateRandomColor(0.05 + Math.random() * 0.1); // 0.05-0.15
    const darkColor = generateRandomColor(0.25 + Math.random() * 0.15);   // 0.25-0.40
    const lightColor = generateRandomColor(0.55 + Math.random() * 0.15);  // 0.55-0.70
    const lightestColor = generateRandomColor(0.85 + Math.random() * 0.15); // 0.85-1.0
    
    // Apply colors to the palette
    document.getElementById('darkestColor').value = darkestColor;
    document.getElementById('darkestHex').value = darkestColor;
    document.getElementById('darkestPreview').style.backgroundColor = darkestColor;
    document.getElementById('darkestRow').style.backgroundColor = darkestColor;
    
    document.getElementById('darkColor').value = darkColor;
    document.getElementById('darkHex').value = darkColor;
    document.getElementById('darkPreview').style.backgroundColor = darkColor;
    document.getElementById('darkRow').style.backgroundColor = darkColor;
    
    document.getElementById('lightColor').value = lightColor;
    document.getElementById('lightHex').value = lightColor;
    document.getElementById('lightPreview').style.backgroundColor = lightColor;
    document.getElementById('lightRow').style.backgroundColor = lightColor;
    
    document.getElementById('lightestColor').value = lightestColor;
    document.getElementById('lightestHex').value = lightestColor;
    document.getElementById('lightestPreview').style.backgroundColor = lightestColor;
    document.getElementById('lightestRow').style.backgroundColor = lightestColor;
    
    const currentName = document.getElementById('paletteName').value;
    if (currentName === 'NewPalette') {
        const adjectives = ['Vibrant', 'Calm', 'Bold', 'Soft', 'Deep', 'Bright', 'Muted', 'Rich', 'Pastel', 'Dark'];
        const nouns = ['Sunset', 'Ocean', 'Forest', 'Sky', 'Desert', 'Mountain', 'Meadow', 'Dawn', 'Dusk', 'Dream'];
        const randomName = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                            ' ' + 
                            nouns[Math.floor(Math.random() * nouns.length)];
        document.getElementById('paletteName').value = randomName;
    }
}