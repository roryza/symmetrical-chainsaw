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

window.convert = () => {

}


window.registerServiceWorker = () => {
	if (!navigator.serviceWorker) 
	{
		console.log('SW not supported');
		return;
	}

	navigator.serviceWorker.register('/serviceworker.js').then(reg => {
	  if (!navigator.serviceWorker.controller)
		return;
  
	  if (reg.waiting) {
		console.log('reg.waiting');
		reg.waiting.postMessage({action: 'skipWaiting'});
		return;
	  }
  
	  if (reg.installing) {
		console.log('reg.installing');
		reg.installing.addEventListener('statechange', x => {
			if (reg.installing.state == 'installed')
				reg.installing.postMessage({action: 'skipWaiting'});
		  });
		return;
	  }
  
	  reg.addEventListener('updatefound', x => {
		console.log('updatefound');
		reg.installing.addEventListener('statechange', x => {
			if (reg.installing.state == 'installed')
				reg.installing.postMessage({action: 'skipWaiting'});
		  });
	  });

	});
  
	// Ensure refresh is only called once.
	// This works around a bug in "force update on reload".
	let refreshing = false;
	navigator.serviceWorker.addEventListener('controllerchange', x => {
	  if (refreshing) return;
	  window.location.reload();
	  refreshing = true;
	});
}