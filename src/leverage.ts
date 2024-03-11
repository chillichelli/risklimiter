import {client} from "./entities/Client";
import {Manager} from "./entities/Manager";
import { LEVERAGE } from "./constants";

const main = async () => {
    const manager = await Manager.init(client);

    for (let i = 0; i < manager.instruments.length; i++) {
        const instrument = manager.instruments[i];
        await client.setLeverage({
            category: "linear",
            symbol: instrument.symbol,
            buyLeverage: LEVERAGE,
            sellLeverage: LEVERAGE
        });
    }

}

void main();
