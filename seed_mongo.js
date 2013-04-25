
var DB_NAME = "weasley";

function printCollectionNames() {
    collections = db.getCollectionNames();
    printjson(collections);
}

function addElementsToCollection(collectionName, elements) {
    elements.forEach(function(elem, index, arr) {
        db[collectionName].insert(elem);
    });
}

var conn = new Mongo();
var db = conn.getDB(DB_NAME);

print("Dropping existing database.");
db.dropDatabase();

print("Creating new database.");
db = conn.getDB(DB_NAME);


// Adding CHWs
print("Adding CHWs");
var chws = [
    { name: "Mina" },
    { name: "Puja" },
    { name: "Nam Nam" }
];
addElementsToCollection("chws", chws);

// Adding addresses
print("Adding Addresses");
var adds = [
    { street: 'Saltlake', block: 'A' },
    { street: 'Howrah', block: 'B' },
    { street: 'GC Avenue', block: 'C' }
];
addElementsToCollection("addresses", adds);

// Adding areas
print("Adding Areas");
var areas = [ { name: 'A1' }, { name: 'A2' }, { name: 'A3' } ];
addElementsToCollection("areas", areas);

print("Adding Interaction Types");
var interactionTypes = [
    {
        name: "registration",
        interactionFields: [
            {name: 'reg_date', label: 'Date of registration', ui_type: 'datetime', var_type: 'datetime', options_json: '', validation_regex: ''},
            {name: 'weight', label: 'Current Weight', ui_type: 'text', var_type: 'float', options_json: '', validation_regex: '\d+'},
            {name: 'height', label: 'Current Height', ui_type: 'text', var_type: 'float', options_json: '', validation_regex: ''},
            {name: 'edd', label: 'Estimated Date of Delivery', ui_type: 'datetime', var_type: 'datetime', options_json: '', validation_regex: ''},
            {name: 'preg_risks', label: 'Pregnancy Risks', ui_type: 'multiselect', var_type: 'csv', options_json: '[\'Below 18\', \'Above 40\', \'Under Weight\']', validation_regex: ''},
            {name: 'committment', label: 'Committment Type', ui_type: 'combo', var_type: 'string', options_json: '[\'First Trimester\', \'Second Trimester\', \'Third Trimester\']', validation_regex: ''},
            {name: 'dss', label: 'Enrolled in DSS', ui_type: 'radio', var_type: 'boolean', options_json: '[\'Yes\', \'No\']', validation_regex: ''}
        ]
    },
    { name: "ses" },
    {
        name: "anc_visit",
        interactionFields: [
            {name: 'delivery_institution', label: 'Have you registered at an institution for delivery?', ui_type: 'radio', var_type: 'string', options_json: '[\'Yes\', \'No\', \'Going to\']', validation_regex: ''},
            {name: 'delivery_institution_name', label: 'Name of institution', ui_type: 'text', var_type: 'string', options_json: '', validation_regex: ''},
            {name: 'time_in', label: 'Time in', ui_type: 'datetime', var_type: 'datetime', options_json: '', validation_regex: ''},
            {name: 'time_out', label: 'Time out', ui_type: 'datetime', var_type: 'datetime', options_json: '', validation_regex: ''},
            {name: 'health_issues', label: 'Do you have any health issues?', ui_type: 'multiselect', var_type: 'string', options_json: '[\'High Fever\', \'Dizziness\']', validation_regex: ''},
            {name: 'foetal_movement', label: 'Decreased Foetal Movement?', ui_type: 'radio', var_type: 'boolean', options_json: '', validation_regex: ''}
        ]
    },
    { name: "anc_checkup" },
    { name: "pnc_checkup" },
    { name: "pnc1_visit" },
    { name: "pnc2_visit" }
]
addElementsToCollection("interactionTypes", interactionTypes);

var firstNames = [ 'Puja', 'Namrita', 'Pulkit', 'Varun', 'Angshu', 'Vivek', 'Vinkesh', 'Sushmita', 'Shruti', 'Sneha', 'Dipali' ];
var lastNames = [ 'Bhuwalka', 'Vinod', 'Arabatti', 'Ford', 'Sarkar', 'Bhatt', 'Rao', 'Singh', 'Banka', 'Kundu', 'Yadav' ];

// Create patients (mothers)
for (var i = 1; i <= 1000; i++) {
    var reg_date = get_reg_date();
    var edd = get_edd(reg_date);

    // Create parent mother document. (lol!)
    var mother = db.mothers.insert({registered_at: reg_date, ck_id: i, name: get_name(), chw: get_chw(), address: get_address(), area: get_area()});

    // Registration Interaction
    var registration = {
        reg_date: { value: reg_date },
        weight: { value: get_weight() },
        height: { value: get_height() },
        edd: { value: edd },
        preg_risks: { value: get_preg_risks() },
        committment: { value: get_committment() },
        dss: { value: get_rand_boolean() }
    };
    db.mothers.update( { ck_id: i },  { $push: { registration: registration } } );

    // ANC Visit Interaction
    for (var j = 0; j < randomInInterval(0, 5); j++) {
        var anc_visit_date = get_anc_visit_date(reg_date, edd); var anc_out = anc_visit_date + get_rand_minutes();
        var anc_visit = {
            delivery_institution: { value: get_delivery_institution() },
            delivery_institution_name: { value: get_delivery_institution_name() },
            time_in: { value: anc_visit_date },
            time_out: { value: anc_out },
            health_issues: { value: get_health_issues() },
            foetal_movement: { value: get_rand_boolean() }
        };
        db.mothers.update( { ck_id: i }, { $push: { anc_visit: anc_visit } } );
    }

    if (i % 25 == 0) { print("Added " + i + "patients") };
}

function randomInInterval(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

function days(num_days) {
    return num_days * 24 * 60 * 60 * 1000;
}

function minutes(num_mins) {
    return num_mins * 60 * 1000;
}

function sample(arr) {
    return arr[randomInInterval(0, arr.length - 1)];
}

function daysBetween(startDate, endDate) {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((startDate - endDate)/(oneDay)));
}

function get_reg_date () {
    return new Date() - days(randomInInterval(1, 200))
}

function get_edd (reg_date) {
    return reg_date + days(randomInInterval(10, 250));
}

function get_anc_visit_date (reg_date, edd) {
    return reg_date + days(randomInInterval(0, daysBetween(reg_date, edd)));
}

function get_name () {
    return sample(firstNames) + ' ' + sample(lastNames);
}

function getRandomFromCollection(collectionName) {
    return sample(db[collectionName].find().toArray());
}

function get_chw () {
    return getRandomFromCollection('chws')['_id'];
}

function get_address () {
    return getRandomFromCollection('addresses')['_id'];
}

function get_area () {
    return getRandomFromCollection('areas')['_id'];
}

function get_weight () {
    return randomInInterval(30, 65);
}

function get_height () {
    return randomInInterval(100, 200);
}

//function if_for (name) {
    //InteractionField.find_by_name name
//}

function get_rand_boolean () {
    return (randomInInterval(0, 1) == 0) ? false : true;
}

function get_committment () {
    var arr = ['First Trimester', 'Second Trimester', 'Third Trimester'];
    return sample(arr);
}

function get_preg_risks () {
    var arr = ['Below 18', 'Above 40', 'Under Weight'];
    var num_elems = randomInInterval(0, 3);

    if (num_elems == 0) return null;
    if (num_elems == 3 || num_elems == 2) return arr.join(",");
    if (num_elems == 1) return sample(arr);
}

function get_health_issues () {
    arr = [ 'High Fever', 'Dizziness' ];
    num_elems = randomInInterval(0, 2);

    if (num_elems == 0) return null;
    if (num_elems == 2) return arr.join(",");
    if (num_elems == 1) return sample(arr);
}

function get_delivery_institution_name () {
    return sample([ 'Howrah Hospital', 'A K Clinic', 'Rao Clinic' ]);
}

function get_rand_minutes () {
    return minutes(randomInInterval(10, 100));
}

function get_delivery_institution () {
    return sample([ 'Yes', 'No', 'Going to' ]);
}

