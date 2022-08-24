/* Global Variables */
const apiKey = "<key>&units=imperial";

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = (d.getMonth() + 1)+'.'+ d.getDate()+'.'+ d.getFullYear();

let zip = document.getElementById('zip');
let countryCode = document.getElementById('countryCode');
let feelings = document.getElementById('feelings');

const button = document.getElementById('generate');

/**
 * Entry Object
 */
let entry = {
    name: document.getElementById('name'),
    temp: document.getElementById('temp'),
    content: document.getElementById('content'),
    date: document.getElementById("date"),
    display: function (temp, feel, date){
        this.temp.innerHTML = Math.round(temp)+ ' degrees';
        this.content.innerHTML = feel;
        this.date.innerHTML = date;
    },
    setName: function (name){
        this.name.innerHTML = name;
    }
}


/**
 * @description Get Data From API
 * @param {String} url 
 * @return {Object} Data
 */
const getData = (url) => {
    return new Promise((resolve, reject)=>{
        fetch(url)
        .then(response => response.json())
        .then(data=>{
            resolve(data);
        }).catch(err => reject(err));
    })
}

/**
 * @description Post Data To API
 * @param {String} url 
 * @param {Object} data 
 */
const postData = (url, data) => {
    return new Promise((resolve, reject)=>{
        let init = {
            method: 'POST', 
            credentials: 'same-origin', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // body data type must match "Content-Type" header        
        };
        fetch(url, init).then(response => response.json()).then(data=>{
            resolve(data);
        }).catch(err => reject(err));
    });
}

button.addEventListener('click', generate);
function generate(e) {
    //  Get Zip Code Coordinates
    getData(`http://api.openweathermap.org/geo/1.0/zip?zip=${zip.value},${countryCode.value}&appid=${apiKey}`)
    .then(data => {
        if(!data.cod){
            entry.setName(data.name);
            return `https://api.openweathermap.org/data/2.5/weather?lat=${data.lat}&lon=${data.lon}&appid=${apiKey}`;
        }
        throw new Error('Zip Code Not Found')
    })
    //  Get Weather Data From API
    .then(getData)
    .then(data => {
        let newData = {
            temperature: data.main.temp,
            date: newDate,
            userInput: feelings.value
        }
        //  Post Data To Local Server
        return new Promise((resolve, reject)=>{
            postData(`/data`, newData)
            .then(data => resolve(data))
            .catch(err => reject(err));
        });
    })
    //  Update UI
    .then(updateUI)
    .catch(err => console.log(err));
}

/**
 * @description Update Entry UI
 * @param {Object} data 
 */
function updateUI(data){
    getData('/data').then(data => {
        if(!(isEmpty(data)))
            entry.display(data.temperature, data.userInput, data.date);
    }).catch(err => console.log(err));
}

/**
 * 
 * @param {Object} obj 
 * @returns {Boolean} true if obj is empty | false if Obj in not empty
 */
function isEmpty(obj){
    if(obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype)
        return true;
    
    return false;
}
