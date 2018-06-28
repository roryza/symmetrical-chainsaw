//import idb from 'idb';

window.onload = () =>
{
	fetch("https://free.currencyconverterapi.com/api/v5/currencies")
	.then(response => response.json())
	.then(json => {
		let currencies = Object.entries(json.results).map(entry => entry[1]).sort((a,b) => a.id.localeCompare(b.id));
		populateCurrencies(currencies, "fromDropdown");
		populateCurrencies(currencies, "toDropdown");
	});
}

window.populateCurrencies = (currencies, elementId) => {
    let selectHTML = "";
	const elementRef = document.getElementById(elementId);
	const currentlySelectedValue = elementRef.value;

	let select = elementRef.options.length;

	for (let i = 0; i < select; i++) {
		elementRef.options.remove(i);
	}

	currencies.map(currency => {
		let newSelect = document.createElement('option');
		newSelect.innerHTML = `<option value="${currency.id}">${currency.id} | ${currency.currencyName} (${currency.currencySymbol || currency.id})</option>`;
		elementRef.add(newSelect);
	});
}