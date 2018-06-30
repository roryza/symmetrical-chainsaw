"use strict";

window.onload = function () {
	fetch("https://free.currencyconverterapi.com/api/v5/currencies").then(function (response) {
		return response.json();
	}).then(function (json) {
		var currencies = Object.entries(json.results).map(function (entry) {
			return entry[1];
		}).sort(function (a, b) {
			return a.id.localeCompare(b.id);
		});
		populateCurrencies(currencies, "fromDropdown");
		populateCurrencies(currencies, "toDropdown");
	});
};

window.populateCurrencies = function (currencies, elementId) {
	var selectHTML = "";
	var elementRef = document.getElementById(elementId);
	var currentlySelectedValue = elementRef.value;

	var select = elementRef.options.length;

	for (var i = 0; i < select; i++) {
		elementRef.options.remove(i);
	}

	currencies.map(function (currency) {
		var newSelect = document.createElement('option');
		newSelect.innerHTML = "<option value=\"" + currency.id + "\">" + currency.id + " | " + currency.currencyName + " (" + (currency.currencySymbol || currency.id) + ")</option>";
		newSelect.value = currency.id;
		elementRef.add(newSelect);
	});
};

window.convert = function (e) {
	e.preventDefault();
	e.stopPropagation();
	var fromDropdown = document.getElementById("fromDropdown");
	var toDropdown = document.getElementById("toDropdown");
	var amount = document.getElementById("amount").value;
	var resultElement = document.getElementById("result");
	convertCurrency(fromDropdown.options[fromDropdown.selectedIndex].value, toDropdown.options[toDropdown.selectedIndex].value, amount, resultElement);
};

window.convertCurrency = function (fromCurrency, toCurrency, amount, resultElement) {
	var apiUrl = "https://free.currencyconverterapi.com/api/v5/convert?q=" + fromCurrency + "_" + toCurrency + "&compact=y";

	fetch(apiUrl).then(function (response) {
		return response.json();
	}).then(function (data) {
		var value = data[fromCurrency + "_" + toCurrency].val;

		if (value != undefined) resultElement.value = parseFloat(value) * parseFloat(amount);else console.log(new Error("Invalid result received"));
	}).catch(function (err) {
		console.log('Request failed', err);
	});
};

window.registerServiceWorker = function () {
	if (!navigator.serviceWorker) {
		console.log('SW not supported');
		return;
	}

	navigator.serviceWorker.register('/serviceworker.js').then(function (reg) {
		if (!navigator.serviceWorker.controller) return;

		if (reg.waiting) {
			console.log('reg.waiting');
			reg.waiting.postMessage({ action: 'skipWaiting' });
			return;
		}

		if (reg.installing) {
			console.log('reg.installing');
			reg.installing.addEventListener('statechange', function (x) {
				if (reg.installing.state == 'installed') reg.installing.postMessage({ action: 'skipWaiting' });
			});
			return;
		}

		reg.addEventListener('updatefound', function (x) {
			console.log('updatefound');
			reg.installing.addEventListener('statechange', function (worker) {
				if (worker.state == 'installed') worker.postMessage({ action: 'skipWaiting' });
			});
		});
	});

	// Ensure refresh is only called once.
	// This works around a bug in "force update on reload".
	var refreshing = false;
	navigator.serviceWorker.addEventListener('controllerchange', function (x) {
		if (refreshing) return;
		window.location.reload();
		refreshing = true;
	});
};