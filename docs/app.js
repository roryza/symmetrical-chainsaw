"use strict";

//import idb from 'idb';

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
		elementRef.add(newSelect);
	});
};