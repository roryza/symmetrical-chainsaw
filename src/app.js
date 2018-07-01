window.onload = () => {
		window.icc = new IdbCurrencyConverter(
			document.getElementById('fromDropdown'),
			document.getElementById('toDropdown')
		);
		icc.getCurrencies();
}

window.convert = (e) => {
	e.preventDefault();
	e.stopPropagation();
	let amount = document.getElementById('amount').value;
	let resultElement = document.getElementById('result');
	icc.convertCurrency(amount, resultElement);
}

window.registerServiceWorker = () => {
	if (!navigator.serviceWorker) {
		console.log('SW not supported');
		return;
	}

	navigator.serviceWorker.register('./serviceworker.js').then(reg => {
		if (!navigator.serviceWorker.controller)
			return;

		if (reg.waiting) {
			console.log('reg.waiting');
			reg.waiting.postMessage({
				action: 'skipWaiting'
			});
			return;
		}

		if (reg.installing) {
			console.log('reg.installing');
			reg.installing.addEventListener('statechange', x => {
				if (reg.installing.state == 'installed')
					reg.installing.postMessage({
						action: 'skipWaiting'
					});
			});
			return;
		}

		reg.addEventListener('updatefound', x => {
			console.log('updatefound');
			reg.installing.addEventListener('statechange', worker => {
				if (worker.state == 'installed')
					worker.postMessage({
						action: 'skipWaiting'
					});
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