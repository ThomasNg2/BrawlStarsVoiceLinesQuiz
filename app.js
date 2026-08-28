let answer = ''
let rarityData

function changeAnswer(newAnswer) {
    answer = newAnswer
    console.log(answer)
}

function checkAnswer() {

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

loadData('./voices.json').then((voiceData) => {
    const brawlerSelectElement = document.getElementById('brawlerSelect')
    const brawlerNames = Object.keys(voiceData)

    loadData('./rarities.json').then((_rarityData) => {
        rarityData = _rarityData
        brawlerNames.forEach(name => {
        const imgElement = document.createElement('img')
        imgElement.src = `./assets/${name}/icon.webp`
        imgElement.onclick = () => {
            changeAnswer(name)
        }
        const imgDivElement = document.createElement('div')
        imgDivElement.classList.add('imageContainer')
        imgDivElement.classList.add(getRarity(name))
        brawlerSelectElement.appendChild(imgDivElement)
        imgDivElement.appendChild(imgElement)
    })
    })
})





