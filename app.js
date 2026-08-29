const LAST_BRAWLERS_LIMIT = 5

let guess = ''
let rarityData = {}
let voiceData = {}
let lastBrawlers = []
let brawlerNames = []
let remainingBrawlerNames = []
let usedUpVoicesLines = []
let guessedBrawlers = []
let answer = ''
let currentAudioPlayer = 0

let brawlerSelectElement
let audioElements = []
let audioPlayers = []
let selectedContainer
let selectedBrawlerElement
let pastBrawlersListElement
let confirmButton
let brawlerToGuessCover
let brawlerToGuessImg
let correctWrongImg

let brawlerSelectAudio
let correctGuessAudio
let wrongGuessAudio
let allWrongAudio
let oneLeftAudio


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
    confirmButton.classList.remove('disabled')
}

function clearGuess() {
    guess = ''
    selectedContainer.style.visibility = 'hidden'
    confirmButton.classList.add('disabled')
}

function checkAnswer() {
    if (guess.length === 0) return
    guessedBrawlers.push(guess)
    document.getElementById(guess).parentNode.classList.add('disabled')
    if (guess === answer) {
        playAudio(correctGuessAudio)
        revealAnswer()
        confirmButton.classList.add('disabled')
        correctWrongImg.src = 'other_assets/correct.png'
        correctWrongImg.style.visibility = 'visible'
        setTimeout(() => {
            confirmButton.classList.remove('disabled')
            addToPastBrawlersList(answer)
            startNewRound()
        }, 3_000);
    } else {
        const newLine = getRandomVoiceLine(answer)
        if (newLine === null) {
            confirmButton.classList.add('disabled')
            playAudio(allWrongAudio)
            revealAnswer()
            correctWrongImg.src = 'other_assets/wrong.png'
            correctWrongImg.style.visibility = 'visible'
            setTimeout(() => {
                confirmButton.classList.remove('disabled')
                addToPastBrawlersList(answer)
                startNewRound()
            }, 3_000);
        } else {
            clearGuess()
            playAudio(wrongGuessAudio)
            loadNextVoiceLine(newLine)
        }

    }
}

function startNewRound() {
    clearGuess()
    guessedBrawlers.forEach(brawler => document.getElementById(brawler).parentNode.classList.remove('disabled'))
    guessedBrawlers = []
    correctWrongImg.style.visibility = 'hidden'
    answer = rollBrawler()
    currentAudioPlayer = 0
    for (let i = 1;i < 4;++i) audioPlayers[i].style.display = 'none'
    loadNextVoiceLine(getRandomVoiceLine(answer))
}

function loadNextVoiceLine(voiceline) {
    const targetAudioPlayer = audioPlayers[currentAudioPlayer]
    const targetAudio = audioElements[currentAudioPlayer]
    targetAudio.volume = 0.2
    if (currentAudioPlayer > 0){
        targetAudioPlayer.style.display = 'block'
    }
    targetAudio.src = `brawler_assets/${answer}/${voiceline}`
    currentAudioPlayer += 1
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
    if (answer !== '') {
        lastBrawlers.push(answer)
        if (lastBrawlers.length > LAST_BRAWLERS_LIMIT) lastBrawlers.shift()
        if (getBrawlerRemainingLines(answer).length === 0) remainingBrawlerNames.splice(remainingBrawlerNames.indexOf(answer), 1)
    }
    if (remainingBrawlerNames.length === 0) {
        usedUpVoicesLines = []
        remainingBrawlerNames = [...brawlerNames]
        return
    }
    let randomList = [...remainingBrawlerNames]
    shuffle(randomList)
    for (brawler of lastBrawlers) {
        randomList.splice(randomList.indexOf(brawler), 1)
    }
    return randomList[0]
}

function getRandomVoiceLine(brawler) {
    const lines = getBrawlerRemainingLines(brawler)
    if (lines.length === 0) return null
    if (lines.length === 1) playAudio(oneLeftAudio)
    shuffle(lines)
    const chosenLine = lines[0]
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
    imgElement.draggable = false
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

function revealAnswer() {
    brawlerToGuessCover.style.visibility = 'hidden'
    brawlerToGuessImg.style.visibility = 'visible'
    brawlerToGuessImg.src = `brawler_assets/${answer}/icon.webp`
    brawlerToGuessImg.classList = ''
    brawlerToGuessImg.classList.add('brawlerportraitbig')
    brawlerToGuessImg.classList.add(getRarity(answer))
    setTimeout(() => {
        brawlerToGuessCover.style.visibility = 'visible'
        brawlerToGuessImg.style.visibility = 'hidden'
    }, 3_000);
}

function search(searchInput) {
    if (searchInput === undefined || searchInput === null) searchInput = ''
    const brawlerListElements = brawlerSelectElement.childNodes
    if(searchInput.trim().length === 0) {
        brawlerListElements.forEach(node => { node.style.display = 'block' })
        return
    }
    brawlerListElements.forEach(node => {
        if(!node.children[0].id.toLowerCase().includes(searchInput.trim().toLowerCase())){
            node.style.display = 'none'
        } else {
            node.style.display = 'block'
        }
    })

}

loadData('./voices.json').then((_voiceData) => {
    voiceData = _voiceData

    brawlerSelectElement = document.getElementById('brawlerSelect')
    selectedContainer = document.getElementById('selectedcontainer')
    selectedBrawlerElement = document.getElementById('selected')
    pastBrawlersListElement = document.getElementById('pastbrawlerslist')
    confirmButton = document.getElementById('confirm')
    brawlerToGuessCover = document.getElementById('brawlertoguesscover')
    brawlerToGuessImg = document.getElementById('brawlertoguessimg')
    correctWrongImg = document.getElementById('correctwrong')

    brawlerSelectAudio = document.getElementById('brawlerselectaudio'); brawlerSelectAudio.volume = 0.4
    correctGuessAudio = document.getElementById('correctguessaudio')
    wrongGuessAudio = document.getElementById('wrongguessaudio'); wrongGuessAudio.volume = 0.1
    allWrongAudio = document.getElementById('allwrongaudio')
    oneLeftAudio = document.getElementById('oneleftaudio'); oneLeftAudio.volume = 0.2

    confirmButton.addEventListener('click', (_e) => checkAnswer())
    document.getElementById('search').addEventListener('input', e => {
        search(e.target.value)
    })

    initVoicelinePlayers()
    brawlerNames = Object.keys(voiceData)
    remainingBrawlerNames = [...brawlerNames]

    
    loadData('./rarities.json').then((_rarityData) => {
        rarityData = _rarityData
        brawlerNames.forEach(name => {
            brawlerSelectElement.appendChild(makeBrawlerPortrait(name, true))
        })
        
        startNewRound()
    })
})





