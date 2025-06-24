class RoomMakersDataEditor {
    constructor() {
        this.furnitureEditor = new FurnitureEditor();
        this.probabilityEditor = new ProbabilityEditor();
        
        this.initEventListeners();
        
        this.createDefaultFurnitureData();
        this.createDefaultProbabilityData();
    }
    
    initEventListeners() {
        document.getElementById('furniture-tab').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTab('furniture');
        });
        
        document.getElementById('probability-tab').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTab('probability');
        });
    }
    
    showTab(tabName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        document.querySelectorAll('.editor-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`${tabName}-editor`).style.display = 'block';
    }
    
    createDefaultFurnitureData() {
        const defaultFurniture = [
            {
                AssetPath: 'Assets/Furniture/Bed.asset',
                Name: 'Bed',
                es_Name: 'Cama',
                Description: 'A comfortable bed for sleeping',
                es_Description: 'Una cama cómoda para dormir',
                Price: '100',
                SizeX: '2',
                SizeY: '1',
                TypeOfSize: 'two_one',
                PrefabPath: 'Assets/Prefabs/Furniture/Bed.prefab',
                FurnitureTag: 'Bedroom',
                TagMatchBonusPoints: '50',
                IsLabeler: 'True',
                HasComboSprite: 'False',
                ComboTriggerFurniturePath: '',
                IsStackReceiver: 'False',
                IsStackable: 'False',
                MaxStackLevel: '1'
            },
            {
                AssetPath: 'Assets/Furniture/Table.asset',
                Name: 'Table',
                es_Name: 'Mesa',
                Description: 'A sturdy wooden table',
                es_Description: 'Una mesa de madera resistente',
                Price: '75',
                SizeX: '2',
                SizeY: '2',
                TypeOfSize: 'two_two',
                PrefabPath: 'Assets/Prefabs/Furniture/Table.prefab',
                FurnitureTag: 'DiningRoom',
                TagMatchBonusPoints: '30',
                IsLabeler: 'False',
                HasComboSprite: 'False',
                ComboTriggerFurniturePath: '',
                IsStackReceiver: 'True',
                IsStackable: 'False',
                MaxStackLevel: '3'
            }
        ];
        
        this.furnitureEditor.loadFurnitureData(defaultFurniture);
    }
    
    createDefaultProbabilityData() {
        const defaultProbabilityData = {
            configName: 'SpawnProbabilityConfig',
            defaultTagProbability: 10,
            tagProbabilities: [
                { tag: 'Kitchen', spawnProbability: 15 },
                { tag: 'Bathroom', spawnProbability: 12 },
                { tag: 'Bedroom', spawnProbability: 20 },
                { tag: 'LivingRoom', spawnProbability: 18 },
                { tag: 'DiningRoom', spawnProbability: 15 }
            ],
            furnitureSpecificProbabilities: [
                { 
                    furniturePath: 'Assets/Furniture/Bed.asset',
                    spawnProbability: 25
                }
            ]
        };
        
        this.probabilityEditor.loadProbabilityData(defaultProbabilityData);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new RoomMakersDataEditor();
});
