'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IdbCurrencyConverter = function () {
    function IdbCurrencyConverter(fromDropdown, toDropdown) {
        _classCallCheck(this, IdbCurrencyConverter);

        this.fromDropdownRef = fromDropdown;
        this.toDropdownRef = toDropdown;

        this.baseApiUrl = 'https://free.currencyconverterapi.com/api/v5/';
        this.idbName = 'currency-converter';
        this.dbPromise = this.openDatabase();
    }

    _createClass(IdbCurrencyConverter, [{
        key: 'openDatabase',
        value: function openDatabase() {
            if (!navigator.serviceWorker) return Promise.resolve();

            return idb.open(this.idbName, 1, function (upgradeDb) {
                switch (upgradeDb.oldVersion) {
                    case 0:
                        upgradeDb.createObjectStore('currencies', {
                            keyPath: 'id'
                        });
                        upgradeDb.createObjectStore('rates');
                }
            });
        }
    }, {
        key: 'getCurrencies',
        value: function getCurrencies() {
            var _this = this;

            // try load from database
            this.dbPromise.then(function (db) {
                return db.transaction('currencies').objectStore('currencies').getAll();
            }).then(function (currencies) {
                if (currencies.length === 0)
                    // fetch some if we dont have any
                    _this.queryForCurrencies();else {
                    // use currencies stored locally to populate dropdowns
                    _this.populateCurrencyDropdowns(currencies, _this.fromDropdownRef, 'USD');
                    _this.populateCurrencyDropdowns(currencies, _this.toDropdownRef, 'ZAR');
                }
            }).catch(function (reason) {
                console.log(reason);
                // fetch them if we have no db/serviceworker
                _this.queryForCurrencies();
            });
        }
    }, {
        key: 'queryForCurrencies',
        value: function queryForCurrencies() {
            var _this2 = this;

            fetch(this.baseApiUrl + 'currencies').then(function (response) {
                return response.json();
            }).then(function (json) {
                var currencies = Object.entries(json.results).map(function (entry) {
                    return entry[1];
                }).sort(function (a, b) {
                    return a.id.localeCompare(b.id);
                });
                // store for later
                _this2.dbPromise.then(function (db) {
                    var store = db.transaction('currencies', 'readwrite').objectStore('currencies');
                    currencies.map(function (currency) {
                        return store.put(currency);
                    });
                });

                _this2.populateCurrencyDropdowns(currencies, _this2.fromDropdownRef, 'USD');
                _this2.populateCurrencyDropdowns(currencies, _this2.toDropdownRef, 'ZAR');
            }).catch(function (x) {
                console.log('failed to fetch currencies', x);
            });
        }
    }, {
        key: 'populateCurrencyDropdowns',
        value: function populateCurrencyDropdowns(currencies, elementRef, defaultSelection) {
            for (var i = 0; i < elementRef.options.length; i++) {
                elementRef.options.remove(i);
            }

            var coolCurrencies = ['USD', 'ZAR', 'UGX', 'KSH', 'NGN'];
            currencies.map(function (currency) {
                var newSelect = document.createElement('option');

                newSelect.innerHTML = currency.id + ' | ' + currency.currencyName + ' (' + (currency.currencySymbol || currency.id) + ')';
                newSelect.value = currency.id;

                if (currency.id === defaultSelection) newSelect.selected = true;

                if (coolCurrencies.includes(currency.id)) newSelect.className = 'coolcurrency';

                elementRef.add(newSelect);
            });
        }
    }, {
        key: 'convertCurrency',
        value: function convertCurrency(amount, resultElement) {
            var fromCurrency = this.fromDropdownRef.options[this.fromDropdownRef.selectedIndex].value;
            var toCurrency = this.toDropdownRef.options[this.toDropdownRef.selectedIndex].value;

            this.getRate(fromCurrency, toCurrency, amount, resultElement);
        }
    }, {
        key: 'getRate',
        value: function getRate(fromCurrency, toCurrency, amount, resultElement) {
            var _this3 = this;

            var pair = fromCurrency + '_' + toCurrency;

            return this.dbPromise.then(function (db) {
                db.transaction('rates').objectStore('rates').get(pair).then(function (val) {
                    if (val === undefined) _this3.queryForRate(fromCurrency, toCurrency).then(function (rate) {
                        resultElement.value = Number(parseFloat(amount) * rate).toFixed(2);
                    });else resultElement.value = Number(parseFloat(amount) * val.rate).toFixed(2);
                });
            });
        }
    }, {
        key: 'queryForRate',
        value: function queryForRate(fromCurrency, toCurrency) {
            var _this4 = this;

            var pair = fromCurrency + '_' + toCurrency;
            var swappedPair = toCurrency + '_' + fromCurrency;
            var apiUrl = this.baseApiUrl + 'convert?q=' + pair + '&compact=ultra';

            return fetch(apiUrl).then(function (response) {
                return response.json();
            }).then(function (data) {
                var value = parseFloat(data[pair]);
                console.log('Successfully fetched for ' + pair + ': ', value);
                var swappedValue = parseFloat(1) / value;

                if (value != undefined) {
                    // store for later
                    _this4.dbPromise.then(function (db) {
                        var store = db.transaction('rates', 'readwrite').objectStore('rates');
                        store.put({ rate: value, timestamp: Date.now() }, pair);
                        store.put({ rate: swappedValue, timestamp: Date.now() }, swappedPair); // infer the swapped rate and store that as well, half as many api requests :)
                    });

                    return value;
                } else {
                    console.log(new Error("Invalid result received"));
                    return 0;
                }
            }).catch(function (err) {
                console.log('Request failed', err);
                return 0;
            });
        }
    }]);

    return IdbCurrencyConverter;
}();