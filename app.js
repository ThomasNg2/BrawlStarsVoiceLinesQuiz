const LAST_BRAWLERS_LIMIT = 3

let guess = ''
let rarityData = {}
let voiceData = {}
let lastBrawlers = []
let brawlerNames = []
let remainingBrawlerNames = []
let usedUpVoicesLines = []
let guessedBrawlers = []
let answer = ''
let testLines = ['brawler_assets/test/Frank vo 03.ogg', 'brawler_assets/test/Frank vo 04.ogg', 'brawler_assets/test/Frank vo 05.ogg', 'brawler_assets/test/Frank vo 06.ogg']

let audioElements = []
let audioPlayers = []
let selectedContainer
let selectedBrawlerElement
let pastBrawlersListElement

let brawlerSelectAudio


// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

function changeGuess(newGuess) {
    if (guess === newGuess) return
    guess = newGuess
    selectedContainer.style.visibility = 'visible'
    selectedBrawlerElement.src = `./brawler_assets/${newGuess}/icon.webp`
    selectedBrawlerElement.classList = ''
    selectedBrawlerElement.classList.add('brawlerportrait')
    selectedBrawlerElement.classList.add(getRarity(newGuess))
}

function clearGuess() {
    guess = ''
    selectedContainer.style.visibility = 'hidden'
}

function checkAnswer() {
    if (guess === answer) window.alert("yippee")
    else {
        const newLine = getRandomVoiceLine(answer)
        if (newLine === null) {
            window.alert("your ded")
            setTimeout(() => {
                startNewRound()
            }, 3_000);
        } else loadNextVoiceLine(newLine)

    }
}

function startNewRound() {
    answer = rollBrawler()
    console.log(answer)
}

function loadNextVoiceLine(voiceline) {
    
}


async function loadData(path) {
    const response = await fetch(path)

    if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
    }

    return await response.json()
}

function getRarity(brawler) {
    for (rarity of Object.keys(rarityData)){
        if (rarityData[rarity].includes(brawler)) return rarity
    }
}

function getBrawlerRemainingLines(brawler){
    return voiceData[brawler].filter(voiceline => !usedUpVoicesLines.includes(voiceline))
}

function rollBrawler() {
    lastBrawlers.push(answer)
    if (lastBrawlers.length > LAST_BRAWLERS_LIMIT) lastBrawlers.shift()
    if (getBrawlerRemainingLines(answer).length === 0) remainingBrawlerNames.splice(remainingBrawlerNames.indexOf(answer), 1)
    if (remainingBrawlerNames.length === 0) {
        usedUpVoicesLines = []
        remainingBrawlerNames = [...brawlerNames]
        return
    }
    let randomList = [...remainingBrawlerNames]
    for (brawler in lastBrawlers) randomList.splice(randomList.indexOf(brawler), 1)
    return randomList[0]
}

function getRandomVoiceLine(brawler) {
    const lines = getBrawlerRemainingLines(brawler)
    if (lines.length === 0) return null
    const shuffledLines = shuffle(lines)
    const chosenLine = shuffledLines[0]
    usedUpVoicesLines.push(chosenLine)
    return chosenLine
}

function initVoicelinePlayers() {
    for (let i = 1;i <= 4;++i){
        const voicelinePlayer = document.getElementById(`voicelineplayer${i}`)
        const voicelineAudio = document.getElementById(`voiceline${i}`)
        audioElements.push(voicelineAudio)
        audioPlayers.push(voicelinePlayer)
        voicelinePlayer.addEventListener("click", (_event) => {
            playAudio(voicelineAudio)
        })
    }
}

function makeBrawlerPortrait(brawler, withCallback) {
    const imgElement = document.createElement('img')
    if (withCallback) imgElement.id = brawler
    imgElement.src = `./brawler_assets/${brawler}/icon.webp`
    imgElement.classList.add('brawlerportrait')
    const imgContainerElement = document.createElement('li')
    imgContainerElement.classList.add('imageContainer')
    imgContainerElement.classList.add(getRarity(brawler))
    imgContainerElement.appendChild(imgElement)
    if (withCallback) {
        imgElement.onclick = () => {
            changeGuess(brawler)
            playAudio(brawlerSelectAudio)
        }
        imgContainerElement.classList.add('clickable')
    }
    return imgContainerElement
}

function addToPastBrawlersList(brawler) {
    const li = document.createElement('li')
    li.appendChild(makeBrawlerPortrait(brawler, false))
    pastBrawlersListElement.appendChild(li)
    if (pastBrawlersListElement.children.length > LAST_BRAWLERS_LIMIT) pastBrawlersListElement.removeChild(pastBrawlersListElement.getElementsByTagName('li')[0])
}

function playAudio(audio) {
    audio.currentTime = 0
    audio.play()
}

loadData('./voices.json').then((_voiceData) => {
    voiceData = _voiceData

    const brawlerSelectElement = document.getElementById('brawlerSelect')
    selectedContainer = document.getElementById('selectedcontainer')
    selectedBrawlerElement = document.getElementById('selected')
    pastBrawlersListElement = document.getElementById('pastbrawlerslist')
    brawlerSelectAudio = document.getElementById('brawlerselectaudio')

    initVoicelinePlayers()
    brawlerNames = Object.keys(voiceData)
    remainingBrawlerNames = [...brawlerNames]

    loadData('./rarities.json').then((_rarityData) => {
        rarityData = _rarityData
        brawlerNames.forEach(name => {
            brawlerSelectElement.appendChild(makeBrawlerPortrait(name, true))
        })
    })
})





