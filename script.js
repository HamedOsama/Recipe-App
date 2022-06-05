fetchMeals();
getRandomMeal();
const meals = document.getElementById('meals');
const favMeals = document.getElementById('fav-meals');
const searchBar = document.getElementById('search-bar');
const searchBtn = document.getElementById('search');
const mealPopUp = document.getElementById('meal-popup');

async function getRandomMeal(){
    const res=  await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const resData = await (res.json());
    const randomMeal = resData.meals[0];
    addMeal(randomMeal , true)
}
async function getMealBySearch(name){
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+name)
    const resData = await (res.json());
    const meals = resData.meals;
    return meals;
}
async function getMealByID(id){
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id)
    const data = await res.json()
    const meal = data.meals[0]
    return meal
}
function addMeal(mealData , random = false){
    random ? meals.innerHTML = "" : '';
    const meal = document.createElement('div')
    meal.classList.add('meal')
    meal.innerHTML = `
    <div class="meal-header">
    ${random ? `<span class="random">Random Recipe</span><i class="fa-solid fa-rotate-right" id="refresh"></i>` : ''}
        <img src="${mealData.strMealThumb}" alt="">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button id="favorite" class="fav-btn "><i class="fa fa-heart"></i></button>
    </div>    
    `
    meal.getElementsByTagName('img')[0].addEventListener('click',()=>{
        showMeal(mealData)
    })
    meals.appendChild(meal)
    addToFav(mealData,meal);
    const refresh = document.getElementById("refresh");
    if(refresh)
    refresh.addEventListener("click",getRandomMeal)
}
function addToFav(mealData,meal){
    const favBtn = meal.querySelector('#favorite');
    favBtn.addEventListener('click',()=>{
        if(!favBtn.classList.contains('active')){
            favBtn.classList.add('active')
            addMealToLS(mealData.idMeal)
            addMealToFav(mealData)
        }else{
            favBtn.classList.remove('active')
            removeMealFromLS(mealData.idMeal)
            favMeals.removeChild(document.getElementById('li'+mealData.idMeal))
        }
    })
}
function addMealToLS(mealId){
    const mealIds = getMealFromLS();
    localStorage.setItem('mealIds',JSON
    .stringify([...mealIds,mealId]))
}
function removeMealFromLS(mealId){
    const mealIds = getMealFromLS();
    localStorage.setItem('mealIds',JSON
    .stringify(mealIds.filter(id=>id !== mealId)))
}
function getMealFromLS(){
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))
    return mealIds === null ? [] : mealIds;
}
async function fetchMeals(){
    const mealIds = getMealFromLS();
    const meals = []
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i]
        const meal = await getMealByID(mealId)
        meals.push(meal);
        addMealToFav(meal);
    }
}
function addMealToFav(mealData){
    const meal = document.createElement('li')
    meal.id = 'li'+mealData.idMeal
    meal.innerHTML = `
    <img id="fav-${mealData.idMeal}" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>${mealData.strMeal}</p>
    <button class="clear" id="b${mealData.idMeal}"><i class="fas fa-xmark"></i></button>
    `
    favMeals.appendChild(meal)
    removerMealFromFav(mealData)
    meal.querySelector(`#fav-${mealData.idMeal}`).addEventListener('click',()=>{
        showMeal(mealData)
    })
}
function removerMealFromFav(mealData){
    const btn = document.querySelector(`#li${mealData.idMeal} #b${mealData.idMeal}`)
        btn.addEventListener('click',()=>{
            removeMealFromLS(mealData.idMeal)
            favMeals.removeChild(document.getElementById('li'+mealData.idMeal))
        })
}
async function showMeal(mealData){
    let i = 1;
    let list = '';
    while(mealData[`strIngredient${i}`] != '' && i <= 20){
        list += `<li>${i}- ${mealData[`strMeasure${i}`]} ${mealData[`strIngredient${i}`]}</li>`
        i++
    }
    mealPopUp.innerHTML = 
    `
    <div class="meal-info" id="meal-info">
    <button class="close" id="close-meal"><i class="fas fa-xmark"></i></button>
    <div class="">
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="">
    </div>
    <div class="">
        <p>${mealData.strInstructions}</p>
        <ul>
        ${list}
        </ul>
    </div>
</div>
    `
    mealPopUp.classList.add('active')
    closePopUp();
}
searchBtn.addEventListener('click',async()=>{
    meals.innerHTML = ''
    const search = searchBar.value ;
    const searchMeal = await getMealBySearch(search) ;
    searchMeal.forEach(meal => {
        addMeal(meal)
    });
})

function closePopUp(){
    const mealCloseBtn = document.getElementById('close-meal');
    mealCloseBtn.addEventListener('click',()=>{
        mealPopUp.classList.remove('active')
    })
}