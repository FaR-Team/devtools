class CSVHandler {
    static parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        const furnitureData = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = [];
            let currentValue = '';
            let inQuotes = false;
            
            for (let char of lines[i]) {
                if (char === '"' && (currentValue.length === 0 || currentValue[currentValue.length - 1] !== '\\')) {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue);
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue); 
            
            const item = {};
            for (let j = 0; j < headers.length; j++) {
                let value = values[j] || '';
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                
                if (headers[j] === 'CompatibleFurniturePaths' && value) {
                    item[headers[j]] = value.split(';').map(path => path.trim()).filter(path => path);
                } else {
                    item[headers[j]] = value;
                }
            }
            
            furnitureData.push(item);
        }
        
        return { furnitureData };
    }
    
    static parseCSVLine(line) {
        const values = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    currentValue += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        values.push(currentValue);
        
        return values;
    }
    
    static parseProbabilityCSV(csvContent) {
        const lines = csvContent.split('\n');
        const result = {
            configName: 'SpawnProbabilityConfig',
            defaultTagProbability: 10,
            tagProbabilities: [],
            furnitureSpecificProbabilities: []
        };
        
        let section = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line || line.startsWith('#')) {
                continue;
            }
            
            if (line.startsWith('ConfigName')) {
                section = 'config';
                continue;
            } else if (line.startsWith('TagName')) {
                section = 'tags';
                continue;
            } else if (line.startsWith('FurniturePath')) {
                section = 'furniture';
                continue;
            }
            
            const values = line.split(',');
            
            if (section === 'config' && values[0] === 'DefaultTagProbability') {
                result.defaultTagProbability = parseFloat(values[1]);
            } else if (section === 'tags') {
                result.tagProbabilities.push({
                    tagName: values[0],
                    probability: parseFloat(values[1])
                });
            } else if (section === 'furniture') {
                result.furnitureSpecificProbabilities.push({
                    furniturePath: values[0],
                    probability: parseFloat(values[1])
                });
            }
        }
        
        return result;
    }
    
    static generateFurnitureCSV(furnitureData) {
        if (!furnitureData || furnitureData.length === 0) {
            return '';
        }
        
        const headers = [
            'AssetPath', 'Name', 'es_Name', 'Price', 'SizeX', 'SizeY', 
            'TypeOfSize', 'PrefabPath', 'FurnitureTag', 'TagMatchBonusPoints', 
            'WallObject', 'HasComboSprite', 'ComboTriggerFurniturePath', 'Compatibles',
            'RequiresBase', 'RequiredBasePath'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        furnitureData.forEach(furniture => {
            const row = headers.map(header => {
                return furniture[header] !== undefined ? furniture[header] : '';
            }).join(',');
            
            csvContent += row + '\n';
        });
        
        return csvContent;
    }
    
    static generateProbabilityCSV(probabilityData) {
        let csvContent = '# SpawnProbabilityConfig\n';
        csvContent += `ConfigName,${probabilityData.configName}\n`;
        csvContent += `DefaultTagProbability,${probabilityData.defaultTagProbability}\n\n`;
        
        csvContent += '# Tag Probabilities\n';
        csvContent += 'TagName,Probability\n';
        probabilityData.tagProbabilities.forEach(tag => {
            csvContent += `${tag.tagName},${tag.probability}\n`;
        });
        
        csvContent += '\n# Furniture Specific Probabilities\n';
        csvContent += 'FurniturePath,Probability\n';
        probabilityData.furnitureSpecificProbabilities.forEach(furniture => {
            csvContent += `${furniture.furniturePath},${furniture.probability}\n`;
        });
        
        return csvContent;
    }
    
    static downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}