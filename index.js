const inputEl = document.getElementById("searchInput")

async function formSubmit() {
    const query = inputEl.value
    inputEl.value = ""
    const responsesEl = document.getElementById("responses")

    try {
        // used code from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch?utm_medium=firefox-desktop&utm_source=firefox-suggest&utm_campaign=firefox-mdn-web-docs-suggestion-experiment&utm_content=treatment
        const res = await fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${query}`)
        const info = await res.json()
        let places = info.results

        console.log(info);

        document.getElementById("response-super-title").innerHTML = `
            <h2>Places</h2>
            <p>Click a location to search identification(s)</p>
        `

        responsesEl.innerHTML = ""

        places.forEach((place) => {
            responsesEl.innerHTML += `
                <div class="response-card" id="${place.id}">
                    <h2 class="response-title">${place.name}</h2>
                    <p class="subtext">${place.location}</p>
                    <div id="button-container-${place.id}" class="button-container">
                    </div>
                </div>
            `
        })
        
        document.querySelectorAll(".response-card").forEach((node) => {
            node.addEventListener("click", generateResponseOnClick(node.id, 1))
        })
        
    } catch (error) {
        console.log(error)
        responsesEl.innerHTML = `
            <div class="response-card error">
                ${error}
            </div>
        `
    }
}

function generateResponseOnClick(placeId, page) {
    return async () => {
        const responsesEl = document.getElementById("responses")
        try {
            console.log(page);
            const res = await fetch(`https://api.inaturalist.org/v1/identifications?place_id=${placeId}&page=${page}`)
            const info = await res.json()
            const identifications = info.results
            console.log(info)

            document.getElementById("response-super-title").innerHTML = `
                <h2>Identifications</h2>
                <p>pg. ${info.page}, Total results: ${info.total_results}</p>
                <div id="page-change-container">
                    <label> Page Number
                        <input id="page-input" type="number" value="${info.page}"></input>
                    </label>
                    <button type="button" id="page-button">Change Page</button>
                </div>
            `
            
            document.getElementById("page-button").addEventListener(
                "click", 
                () => {
                    generateResponseOnClick(
                        placeId, 
                        document.getElementById("page-input").value
                    )()
                }
            )

            responsesEl.innerHTML = ""

            identifications.forEach((identification) => {
                let nameTemplate = ""
                identification.observation.identifications.forEach((item) => {
                    nameTemplate += `${item.taxon.name}, `
                })
                nameTemplate = nameTemplate.substring(0, nameTemplate.length-2)

                let template = `
                <div class="response-card">
                    <h4 class="response-title">${nameTemplate}</h4>
                    <div class="response-img-container">
                `
                
                identification.observation.photos.forEach((photo) => {
                    template += `
                        <img src=${photo.url} alt="photo from identification">
                    `
                })

                template += `
                    </div>
                </div>
                `

                responsesEl.innerHTML += template
            })
        } catch (error) {
            console.log(error)
            responsesEl.innerHTML = `
                <div class="response-card error">
                    ${error}
                </div>
            `
        }
    }
}
