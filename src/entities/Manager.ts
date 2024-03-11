import {
  PositionV5,
  RestClientV5,
  LinearInverseInstrumentInfoV5,
  RiskLimitV5,
} from "bybit-api";

export class Manager {
  symbols: string[] = [];
  positions: PositionV5[] = [];
  positionSymbols: string[] = [];
  balance: number = 0;
  instruments: LinearInverseInstrumentInfoV5[] = [];
  riskLimits: RiskLimitV5[] = [];

  constructor(
    symbols: string[],
    positions: PositionV5[],
    balance: number,
    instruments: LinearInverseInstrumentInfoV5[],
    riskLimits: RiskLimitV5[]
  ) {
    this.symbols = symbols;
    this.positions = positions;
    this.positionSymbols = positions.map((el) => el.symbol);
    this.balance = balance + +(process.env.BALANCE || 0);
    this.instruments = instruments;
    this.riskLimits = riskLimits;
  }

  static async init(client: RestClientV5) {
    const [symbols, positions, balance, instruments, riskLimits] =
      await Promise.all([
        this.fetchInstruments(client),
        this.fetchPositions(client),
        this.fetchBalance(client),
        this.fetchInstrumentsInfo(client),
        this.fetchRiskLimits(client),
      ]);

    return new Manager(symbols, positions, balance, instruments, riskLimits);
  }

  static async fetchBalance(client: RestClientV5) {
    const balance = await client.getWalletBalance({ accountType: "UNIFIED" });
    if (balance && balance.retCode === 0) {
      return +balance.result.list[0].totalEquity;
    } else {
      throw new Error(`Could not fetch balance: ${balance.retMsg}`);
    }
  }

  static async fetchInstruments(client: RestClientV5) {
    const instruments = await client.getInstrumentsInfo({ category: "linear" });
    if (instruments && instruments.retCode === 0) {
      return instruments.result.list.map((el) => el.symbol);
    } else {
      throw new Error(`Could not fetch symbols: ${instruments.retMsg}`);
    }
  }

  static async fetchPositions(client: RestClientV5) {
    const positions = await client.getPositionInfo({
      category: "linear",
      settleCoin: "USDT",
      limit: 60,
    });

    if (positions && positions.retCode === 0) {
      return positions.result.list;
    } else {
      throw new Error(`Could not fetch positions: ${positions.retMsg}`);
    }
  }

  async updatePositions(client: RestClientV5) {
    const positions = await Manager.fetchPositions(client);
    this.positions = positions;
    this.positionSymbols = positions.map((el) => el.symbol);
  }

  static async fetchInstrumentsInfo(client: RestClientV5) {
    const info = await client.getInstrumentsInfo({
      category: "linear",
    });

    if (info && info.retCode === 0) {
      return info.result.list as LinearInverseInstrumentInfoV5[];
    } else {
      throw new Error(`Could not fetch instruments: ${info.retMsg}`);
    }
  }

  static async fetchRiskLimits(client: RestClientV5) {
    const riskLimits = await client.getRiskLimit({
      category: "linear",
    });

    if (riskLimits && riskLimits.retCode === 0) {
      return riskLimits.result.list;
    } else {
      throw new Error(`Could not get risk limits: ${riskLimits.retMsg}`);
    }
  }
}
