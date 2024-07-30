function attachEvents() {
    const endpoints = {
        getAllLocations: 'http://localhost:3030/jsonstore/forecaster/locations',
        getTodayData: 'http://localhost:3030/jsonstore/forecaster/today/',
        getUpcomming: 'http://localhost:3030/jsonstore/forecaster/upcoming/'
    };

    document.getElementById('submit').addEventListener('click', getWeather);

    const locationRef = document.getElementById('location');
    const forecastRef = document.getElementById('forecast');
    const currentRef = document.getElementById('current');
    const upcomingRef = document.getElementById('upcoming');

    async function getWeather(e) {
        try {
            //allLocations = [{code: 'ny', name: 'New York'},{},{}]
            const allLocations = await getAllLocations();
            const userLocation = locationRef.value;
            forecastRef.style.display = 'block';
            //exactLocationData = {code: 'ny', name: 'New York'}
            const exactLocationData = allLocations.find(x => x.name === userLocation);
            //dataForToday = {forecast: {condition: 'Sunny', high: '19', low: '8'}, name: "New York, USA"}
            const dataForToday = await getDataForToday(exactLocationData.code);
            fillTodayData(dataForToday);
            //dataForNextDays = {forecast: [{'condition': 'Partly sunny','high': 17, 'low': 6}, {'condition': 'Overcast','high': 9, 'low': 3}, {...} ]}
            const dataForNextDays = await getDataForNextdays(exactLocationData.code)

            const todayDiv = fillTodayData(dataForToday);
            const nextDaysDiv = fillUpcommingData(dataForNextDays);
            clear();
            currentRef.appendChild(todayDiv);
            upcomingRef.appendChild(nextDaysDiv);
        } catch (error) {
            clear();
            const divContainer = document.createElement('div');
            divContainer.classList.add('forecasts');
            divContainer.textContent = 'Error';
            currentRef.appendChild(divContainer);
        }

        function fillTodayData(data) {

            const degreesIcon = findIcon('Degrees');
            const tempString = `${data.forecast.low}${degreesIcon}/${data.forecast.high}${degreesIcon}`

            const divContainer = document.createElement('div');
            divContainer.classList.add = 'forecasts';
            const symbolSpan = generateSpan(['condition', 'symbol'], findIcon(data.forecast.condition), true);
            const spanContainer = generateSpan(['condition']);
            const spanName = generateSpan(['forecast-data'], data.name);
            const tempSpan = generateSpan(['forecast-data'], tempString, true);
            const conditionSpan = generateSpan(['forecast-data'], data.forecast.condition);

            divContainer.appendChild(symbolSpan);
            divContainer.appendChild(spanContainer);
            spanContainer.appendChild(spanName);
            spanContainer.appendChild(tempSpan);
            spanContainer.appendChild(conditionSpan);

            return divContainer;
        };

        function fillUpcommingData(data) {
            const divContainer = document.createElement('div');
            divContainer.classList.add('forecast-info');
            const degreesIcon = findIcon('Degrees')

            data.forecast.forEach(dataForOneDay => {
                const { condition, high, low } = dataForOneDay;
                const text = `${low}${degreesIcon}/${high}${degreesIcon}`;
                const spanContainer = generateSpan(['upcoming']);
                const iconSpan = generateSpan(['symbol'], findIcon(condition), true);
                const tempSpan = generateSpan(['forecast-data'], text, true);
                const conditionSpan = generateSpan(['forecast-data'], condition, false);

                spanContainer.appendChild(iconSpan);
                spanContainer.appendChild(tempSpan);
                spanContainer.appendChild(conditionSpan);
                divContainer.appendChild(spanContainer);
            });
            return divContainer;
        };

        async function getAllLocations() {
            const response = await fetch(endpoints.getAllLocations);
            return response.json();
        }

        async function getDataForToday(code) {
            const respose = await fetch(`${endpoints.getTodayData}${code}`);
            return respose.json();
        }

        async function getDataForNextdays(code) {
            const respose = await fetch(`${endpoints.getUpcomming}${code}`);
            return respose.json();
        }

        function generateSpan(classList, text, hasIcon) {
            const span = document.createElement('span');
            classList.forEach((cl) => span.classList.add(cl));
            hasIcon ? span.innerHTML = text : span.textContent = text;
            return span;
        };

        function clear() {
            Array.from(upcomingRef.children).forEach((x, i) => {
                if (i !== 0) {
                    return x.remove()
                }
            });

            Array.from(currentRef.children).forEach((x, i) => {
                if (i !== 0) {
                    return x.remove()
                }
            });

            locationRef.value = '';
        };

        function findIcon(iconName) {
            const iconEnum = {
                'Sunny': '&#x2600',// ☀
                'Partly sunny': '&#x26C5', // ⛅
                'Overcast': '&#x2601', // ☁
                'Rain': '&#x2614',// ☂
                'Degrees': '&#176'   // °
            };

            return iconEnum[iconName];
        };

    }
}

attachEvents();