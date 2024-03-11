import { Manager } from "./entities/Manager";
import { client } from "./entities/Client";
import { RISK_LIMIT_VALUE } from "./constants";

const main = async () => {
  const manager = await Manager.init(client);

  const riskLimits = await Promise.all(manager.symbols.map(symbol => client.getRiskLimit({
    category: 'linear',
    symbol,
  })))

  let i = 0;
  const loop = () => {
    setTimeout(function() {
      const symbol = manager.symbols[i];
      const riskLimit = riskLimits.find(el => el.result.list[0].symbol === symbol)
      if (riskLimit) {
        const resp = riskLimit.result.list
        const id = resp.find(el => +el.riskLimitValue === RISK_LIMIT_VALUE)?.id
        if (id) {
          client.setRiskLimit({ category: 'linear', symbol, riskId: id, positionIdx: 2 }).then((resp) => {
            if (resp.retCode === 10001) {
              client.setRiskLimit({ category: 'linear', symbol, riskId: id, positionIdx: 1 }).then((resp) => {
                if (resp.retCode === 10001) {
                  client.setRiskLimit({ category: 'linear', symbol, riskId: id, positionIdx: 0 }).then((resp) => {
                    console.log(resp, symbol)
                  })
                }
                else {
                  console.log(resp, symbol)
                }
              })
            } else {
              console.log(resp, symbol)
            }
          })
        }
      }

      console.log(i);

      i++;
      if (i < manager.symbols.length) {
        loop();
      }
    }, 100)
  }

  loop();
}

void main();
