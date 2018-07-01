## Google ALC challenge

This is a PWA (Progressive Web App) written as part of the [Andela](https://andela.com/) Learning Community **#7DaysOfCodeChallenge**.

####Features:
- Allows the user to select two currencies, enter an amount and convert between them at the current exchange rate.
- Is "installable" by using the "Add to Homescreen" feature in Google Chrome as well as similar features in other browsers and Windows.
- Responsive design that fits well on mobile phones.
- All javascript written in ES6 (gulp/babel used to transform to ES5)
- Working copy hosted on [Github Pages](https://roryza.github.io/symmetrical-chainsaw/)
- Serviceworker with caching of pages for offline mode
- IndexDB for caching exchange rates from [CurrenctConverterAPI](https://free.currencyconverterapi.com/)

The code has been intentionally kept fairly minimal. The purpose is to show off everything written "from scratch" and thus no UI frameworks, app starter kits, etc have been used.

[NPM](https://www.npmjs.com/) is used for some development dependencies like [Gulp](https://gulpjs.com/) and [Babel](https://babeljs.io/) which are used to transform the ES6 code to ES6 so it can be understood by a wider set of browsers.

Jake Archibald's [idb library](https://github.com/jakearchibald/idb) has been used to wrap [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) with an interface supporting [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

[Express](https://expressjs.com/) is a simple web server used for testing during development, in order for the service worker to be enabled.

####Demo:
Simply go to **https://roryza.github.io/symmetrical-chainsaw/**

####Instructions:
#####Local:
Clone or download the repo.
Run `npm install` to restore all dependencies.
Run `npm install -g gulp` to make sure gulp exists on the path.
Run `npm start` which will copy some files, transform ES6 -> ES5 and start a small webserver.
Go to http://localhost:3080/ in your browser.

#####Hosted: 
Clone or download the repo.
Upload the "/docs" folder to a web host. (the built files are included in the repo for hosting on Github Pages)

**Note that the free version of the Currency Converter API supports a maximum of 100 requests per hour.** The app will typically only do 1 request for a list of currencies and then one request per currency pair per hour so this means you effectively can't do more than