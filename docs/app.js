'use strict';

window.onload = function () {
	window.icc = new IdbCurrencyConverter(document.getElementById('fromDropdown'), document.getElementById('toDropdown'));
	icc.getCurrencies();
};

window.convert = function (e) {
	e.preventDefault();
	e.stopPropagation();
	var amount = document.getElementById('amount').value;
	var resultElement = document.getElementById('result');
	icc.convertCurrency(amount, resultElement);
};

window.registerServiceWorker = function () {
	if (!navigator.serviceWorker) {
		console.log('SW not supported');
		return;
	}

	navigator.serviceWorker.register('./serviceworker.js').then(function (reg) {
		if (!navigator.serviceWorker.controller) return;

		if (reg.waiting) {
			console.log('reg.waiting');
			reg.waiting.postMessage({
				action: 'skipWaiting'
			});
			return;
		}

		if (reg.installing) {
			console.log('reg.installing');
			reg.installing.addEventListener('statechange', function () {
				if (reg.installing.state === 'installed') reg.installing.postMessage({
					action: 'skipWaiting'
				});
			});
			return;
		}

		reg.addEventListener('updatefound', function () {
			console.log('updatefound');
			reg.installing.addEventListener('statechange', function (worker) {
				if (worker.state === 'installed') worker.postMessage({
					action: 'skipWaiting'
				});
			});
		});
	});

	// Ensure refresh is only called once.
	// This works around a bug in "force update on reload".
	var refreshing = false;
	navigator.serviceWorker.addEventListener('controllerchange', function () {
		if (refreshing) return;
		window.location.reload();
		refreshing = true;
	});
};