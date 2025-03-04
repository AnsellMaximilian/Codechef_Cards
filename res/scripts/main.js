let rootNode = document.getElementById('root');
let users = new Set();
let loadingFinished = false;

let menuRoot = document.getElementById('menu-bar');
const alertBackdrop = document.getElementById('backdrop');

window.onload = () => {
    users = new Set(JSON.parse(localStorage.getItem('usernames')));
    if (users.size === 0 ) {toggleMenu();}
    for (let user of users){
            getDetails(user);
    }
    loadingFinished = true;
}

function addUser() {
    let username = document.getElementById('username').value;
    document.getElementById('username').value = '';
    if (username === '') return;
    getDetails(username);
    toggleMenu();
}
// Trigger add using Enter key
window.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.querySelector("#menu-content button").click();
    }
});


function deleteUser() {
    const card = this.parentElement.parentElement;
    const username = card.getElementsByClassName('username')[0].innerHTML.slice(1,-1);
    users.delete(username);
    storeData(users);
    this.parentElement.parentElement.remove();
    if (users.size === 0 ) {toggleMenu();}
}

function storeData(data) {
    localStorage.setItem('usernames',JSON.stringify(Array.from(data)));
}

function getDetails(username){
    username = username.toLowerCase();
    if (users.has(username) && loadingFinished) {
        showAlert(`Username "${username}" already exists.`);
        return;
    }
    fetch(`https://competitive-coding-api.herokuapp.com/api/codechef/${username}`)
    .then( function (result) { return result.json() } )
    .then(
        function (data) {
            // console.log(data);
            if(data.status === 'Failed' && data.details === 'Invalid username'){
                showAlert(`"${username}" is an invalid username.`);
                return;
            }
            const information = {
                name: data.user_details.name,
                username: data.user_details.username,
                rating: data.rating,
                highestRating: data.highest_rating,
                stars: data.stars,
                countryRank: data.country_rank,
                globalRank: data.global_rank,
                fullySolved: data.fully_solved.count,
                partiallySolved: data.partially_solved.count,
            }
            createCard(information);
            users.add(username);
            storeData(users);
        }
    )
    .catch((error) => console.error("Cannot Fetch Data From API, ",error))
}

function createCard({name, username, rating, highestRating, stars, countryRank, globalRank, fullySolved, partiallySolved}){

    const root = document.createElement("div");
    root.classList.add("card");

    const div_name = document.createElement("div"); 
    div_name.classList.add("card-header");

    const e_name = document.createElement("p");
    e_name.innerHTML = name;
    e_name.classList.add("name");

    const e_username = document.createElement("p");
    e_username.innerHTML = `(${username.split(':').slice(-1)[0]})`;
    e_username.classList.add("username");
    
    div_name.appendChild(e_name);
    div_name.appendChild(e_username);

    const e_rating = document.createElement("p");
    e_rating.innerHTML = `Rating: ${rating} (${stars})`;
    e_rating.classList.add("rating");

    const div_others = document.createElement("div"); 
    div_others.classList.add("others");
    
    const e_highestRating = document.createElement("p");
    e_highestRating.innerHTML = `Highest Rating: ${highestRating}`;
    
    const e_globalRank = document.createElement("p");
    e_globalRank.innerHTML = `Global Rank: ${globalRank}`;

    const e_countryRank = document.createElement("p");
    e_countryRank.innerHTML = `Country Rank: ${countryRank}`;

    const e_fullySolved = document.createElement("p");
    e_fullySolved.innerHTML = `Problems Fully Solved: ${fullySolved}`;

    const e_partiallySolved = document.createElement("p");
    e_partiallySolved.innerHTML = `Problems Partially Solved: ${partiallySolved}`;

    const e_delete = document.createElement("button");
    e_delete.innerHTML = 'Delete';
    e_delete.classList.add('delete-button')
    e_delete.addEventListener('click', deleteUser);

    div_others.appendChild(e_highestRating);
    div_others.appendChild(e_globalRank);
    div_others.appendChild(e_countryRank);
    div_others.appendChild(e_fullySolved);
    div_others.appendChild(e_partiallySolved);
    div_others.appendChild(e_delete);


    root.appendChild(div_name);
    root.appendChild(e_rating);
    root.appendChild(div_others);
    
    // Sorting happens here
    for (let currentNode of rootNode.childNodes){
        const ratingElement = currentNode.querySelector(".rating");
        const currentNodeRating = parseInt(ratingElement.innerHTML.split(" ")[1]);
        if (rating >= currentNodeRating){
            rootNode.insertBefore(root,currentNode);
            return;
        }
    }
    // If we get here, all other nodes have lower values or it is the first node
    rootNode.appendChild(root);
}


function toggleMenu()
{
    const toggle_icon = menuRoot.children[0].getElementsByTagName('i')[0];
    const menu_content = menuRoot.children[1];
    if(toggle_icon.classList.contains('fa-chevron-up')) {
        toggle_icon.classList.remove('fa-chevron-up');
        toggle_icon.classList.add('fa-chevron-down');
    } else {
        toggle_icon.classList.remove('fa-chevron-down');
        toggle_icon.classList.add('fa-chevron-up');   
    }
    menu_content.classList.toggle('hide');
}

function showAlert(message){
    alertBackdrop.classList.toggle('hide');
    alertBackdrop.querySelector('#alert-message').textContent = message;
}

function closeAlert(){
    alertBackdrop.classList.toggle('hide');
}