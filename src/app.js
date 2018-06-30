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
		newSelect.value = currency.id;
		elementRef.add(newSelect);
	});
}

window.convert = (e) => {
	e.preventDefault();
	e.stopPropagation();
    let fromDropdown = document.getElementById("fromDropdown");
    let toDropdown = document.getElementById("toDropdown");
    let amount = document.getElementById("amount").value;
    let resultElement = document.getElementById("result");
	convertCurrency(fromDropdown.options[fromDropdown.selectedIndex].value, toDropdown.options[toDropdown.selectedIndex].value, amount, resultElement);
}

window.convertCurrency = (fromCurrency, toCurrency, amount, resultElement) => {
    let apiUrl = `https://free.currencyconverterapi.com/api/v5/convert?q=${fromCurrency}_${toCurrency}&compact=y`;

    fetch(apiUrl)
		.then((response) => response.json())
		.then((data) => {
			let value = data[`${fromCurrency}_${toCurrency}`].val;

            if (value != undefined)
                resultElement.value = parseFloat(value) * parseFloat(amount);
            else
                console.log(new Error("Invalid result received"));
        })
        .catch(err =>{
			console.log('Request failed', err)
		});
};

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
		reg.installing.addEventListener('statechange', worker => {
			if (worker.state == 'installed')
				worker.postMessage({action: 'skipWaiting'});
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