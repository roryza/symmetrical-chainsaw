class IdbCurrencyConverter {
    constructor(fromDropdown, toDropdown) {

        this.fromDropdownRef = fromDropdown;
        this.toDropdownRef = toDropdown;

        this.baseApiUrl = 'https://free.currencyconverterapi.com/api/v5/';
        this.idbName = 'currency-converter'
        this.dbPromise = this.openDatabase();
    }

    openDatabase() {
        if (!navigator.serviceWorker)
            return Promise.resolve();

        return idb.open(this.idbName, 1, upgradeDb => {
            switch (upgradeDb.oldVersion) {
                case 0:
                    upgradeDb.createObjectStore('currencies', {
                        keyPath: 'id'
                    });
                    upgradeDb.createObjectStore('rates');
            }
        });
    }

    getCurrencies() {
        // try load from database
        this.dbPromise.then(db => db.transaction('currencies').objectStore('currencies').getAll()).then(currencies => {
                if (currencies.length === 0)
                    // fetch some if we dont have any
                    this.queryForCurrencies();
                else {
                    // use currencies stored locally to populate dropdowns
                    this.populateCurrencyDropdowns(currencies, this.fromDropdownRef);
                    this.populateCurrencyDropdowns(currencies, this.toDropdownRef);
                }
            })
            .catch(reason => {
                console.log(reason);
                // fetch them if we have no db/serviceworker
                this.queryForCurrencies();
            })
    }

    queryForCurrencies() {
        fetch(`${this.baseApiUrl}currencies`)
            .then(response => response.json())
            .then(json => {
                let currencies = Object.entries(json.results).map(entry => entry[1]).sort((a, b) => a.id.localeCompare(b.id));
                // store for later
                this.dbPromise.then(db => {
                    let store = db.transaction('currencies', 'readwrite').objectStore('currencies');
                    currencies.map(currency => store.put(currency));
                });

                this.populateCurrencyDropdowns(currencies, this.fromDropdownRef);
                this.populateCurrencyDropdowns(currencies, this.toDropdownRef);
            })
            .catch(x => {
                console.log('failed to fetch currencies', x);
            });
    }

    populateCurrencyDropdowns(currencies, elementRef) {
        for (let i = 0; i < elementRef.options.length; i++) {
            elementRef.options.remove(i);
        }

        currencies.map(currency => {
            let newSelect = document.createElement('option');
            newSelect.innerHTML = `<option value="${currency.id}">${currency.id} | ${currency.currencyName} (${currency.currencySymbol || currency.id})</option>`;
            newSelect.value = currency.id;
            elementRef.add(newSelect);
        });
    }

    convertCurrency(amount, resultElement) {
        const fromCurrency = this.fromDropdownRef.options[this.fromDropdownRef.selectedIndex].value;
        const toCurrency = this.toDropdownRef.options[this.toDropdownRef.selectedIndex].value;

        this.getRate(fromCurrency, toCurrency, amount, resultElement);
    };

    getRate(fromCurrency, toCurrency, amount, resultElement) {
        const pair = `${fromCurrency}_${toCurrency}`;

        return this.dbPromise.then(db => {
            db.transaction('rates').objectStore('rates').get(pair).then( val => {
                if (val === undefined)
                    this.queryForRate(fromCurrency, toCurrency).then(rate => {
                        resultElement.value = parseFloat(amount) * rate;
                    });
                else
                    resultElement.value = parseFloat(amount) * val.rate;
            });
        });
    }

    queryForRate(fromCurrency, toCurrency) {
        const pair = `${fromCurrency}_${toCurrency}`;
        const swappedPair = `${toCurrency}_${fromCurrency}`;
        const apiUrl = `${this.baseApiUrl}convert?q=${pair}&compact=ultra`;

        return fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const value = parseFloat(data[pair]);
                console.log(`Successfully fetched for ${pair}: `, value);
                const swappedValue = parseFloat(1) / value;

                if (value != undefined)
                {
                    // store for later
                    this.dbPromise.then(db => {
                        let store = db.transaction('rates', 'readwrite').objectStore('rates');
                        store.put({rate: value, timestamp: Date.now()}, pair);
                        store.put({rate: swappedValue, timestamp: Date.now()}, swappedPair); // infer the swapped rate and store that as well, half as many api requests :)
                    });

                    return value;
                }
                else {
                    console.log(new Error("Invalid result received"));
                    return 0;
                }
            })
            .catch(err => {
                console.log('Request failed', err)
                return 0;
            });
    }


}