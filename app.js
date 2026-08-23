let answer = ''

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

loadData('./voices.json').then((data) => {
    const brawlerSelectElement = document.getElementById('brawlerSelect')
    const brawlerNames = Object.keys(data)
    brawlerNames.forEach(name => {
        const imgElement = document.createElement('img')
        imgElement.src = `./assets/${name}/icon.webp`
        imgElement.onclick = () => {
            changeAnswer(name)
        }
        brawlerSelectElement.appendChild(imgElement)
    })
})





