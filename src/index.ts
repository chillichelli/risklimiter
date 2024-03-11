import { Manager } from "./entities/Manager";
import { client } from "./entities/Client";

const main = async () => {
  const manager = await Manager.init(client);

  const riskLimits = await Promise.all(manager.symbols.map(symbol => client.getRiskLimit({
    category: 'linear',
    symbol,
  })))

  for(let i = 0; i < manager.symbols.length; i++) {
    const symbol = manager.symbols[i];
    const riskLimit = riskLimits.find(el => el.result.list[0].symbol === symbol)
    if (riskLimit) {
      const resp = riskLimit.result.list
      const id = resp.find(el => +el.riskLimitValue === 400000)?.id
      if (id) {
        const resp = await client.setRiskLimit({ category: 'linear', symbol, riskId: id, positionIdx: 2 })
        console.log(resp, symbol)
      }
    }
  }
}

void main();
