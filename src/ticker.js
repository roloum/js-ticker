;
//package ticker
const fetch = require("node-fetch");

const tickerURL = "https://api.uphold.com/v0/ticker";
const defaultCurrencyPair = "BTC-USD";
const oscillation = 0.01;

module.exports = {

    Ticker: class Ticker {
        #clock;
        #fetchInterval;
        #currencyPairs;
        #tickers;

        constructor(fetchInterval) {
            this.#clock = 0;

            if (!isNaN(parseInt(fetchInterval))) {
                this.#fetchInterval = fetchInterval;
            } else {
                this.#fetchInterval = 5;
            }

            this.#currencyPairs = [defaultCurrencyPair]
            this.#tickers = new Map().set(defaultCurrencyPair, {
                ask: 0,
                bid: 0,
            })
        }

        start () {
            console.log("fetchInterval", this.#fetchInterval)
            this.#clock = setInterval(
                this.#getTickers.bind(this),
                this.#fetchInterval * 1000,
            );
        }

        async #getTickers () {

            for (const currencyPair of this.#currencyPairs) {

                try {
                    const currencyPairURL = tickerURL + "/" + currencyPair;

                    const result = await fetch(currencyPairURL);
                    if (!result.ok) {
                        if (result.status === 429) {
                            //if too many requests wait until there is quota
                        } else if (result.status === 429) {
                            //if not found
                        } else {
                        }
                    }
                    const data = await result.json();

                    //@todo validate result object the proper fields

                    if (this.#shouldAlertPriceChange(this.#tickers.get(currencyPair), data)) {
                        console.log("%s - Change in asking price for %s is greater than %d%. Old: %d, new: %d",
                            new Date().toLocaleTimeString(),
                            currencyPair,
                            oscillation,
                            this.#tickers.get(currencyPair).ask,
                            data.ask,
                        );
                    }

                    this.#tickers.set(currencyPair, data);

                } catch (err) {
                    console.error(err);
                    this.stop();
                }
            }
        }

        #shouldAlertPriceChange (currentTicker, newTicker) {
            //if there is no previous record
            if (currentTicker.ask === 0) {
                return false;
            }

            const change = (currentTicker.ask - newTicker.ask) * 100 / currentTicker.ask;

            return Math.abs(change) >= oscillation;
        }

        stop () {
            clearInterval(this.#clock);
        }
    }
}
