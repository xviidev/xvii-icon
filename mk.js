const fs = require('fs');

const categories = [
    'Graphic Design',
    'Web Development',
    'Mobile App Development',
    'Infrastructure and Hosting',
    'Security and Privacy',
    'Analytics and Data',
    'Programming Language',
    'Productivity and Collaboration',
    'Communication and Connectivity',
    'Lifestyle and Health',
    'Education and Learning',
    'Finance and Business',
    'Entertainment and Media',
    'Travel and Transportation',
    'Food and Beverage',
    'Sports and Physical Activities',
    'Science and Technology',
    'Others'
];

function createFolders(categories) {
    categories.forEach(category => {
        fs.mkdirSync(category, { recursive: true }, (err) => {
            if (err) throw err;
            console.log(`Folder '${category}' created successfully!`);
        });
    });
}

createFolders(categories);
